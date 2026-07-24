# Swipe Dating — local-first staging platform
# Phases 7–17 scaffold. Not production-ready.

SHELL := /bin/bash
.PHONY: bootstrap doctor format lint test test-unit test-integration test-protocol-vectors \
	test-mobile test-e2e test-load test-chaos fuzz-smoke security sbom licenses \
	local-up local-down local-reset-test-data smoke-local local-services-up infra-fmt infra-validate infra-plan-staging \
	deploy-staging smoke-staging release-readiness production-preflight ios-build ios-open ios-gen ios-uniffi \
	sync sync-pull sync-push sync-status \
	ramdisk-status ramdisk-up ramdisk-sync-back ramdisk-down \
	live-introductions-build live-introductions-test live-introductions-browser \
	live-introductions-netlify-validate live-introductions-deploy-preflight

COMPOSE_FILE := infra/local/compose.yaml
STAGING_IDENTITY := infra/terraform/environments/staging/ACCOUNT_IDENTITY.md
SCRIPTS := scripts
NETLIFY_CLI := npx --yes netlify-cli@23.13.0

## --- Toolchain & quality ---

bootstrap: ## Install local dev dependencies (Rust, hooks, optional tools)
	@command -v rustup >/dev/null 2>&1 || { echo "ERROR: rustup not found. Install from https://rustup.rs"; exit 1; }
	rustup show active-toolchain >/dev/null 2>&1 || rustup default stable
	rustup component add rustfmt clippy 2>/dev/null || true
	cargo fetch
	@echo "bootstrap: Rust workspace fetched. Optional: Docker, Terraform, Java/Android SDK (see make doctor)."

doctor: ## Report toolchain and environment health
	@echo "=== Swipe Dating doctor ==="
	@printf "rust:        "; command -v rustc >/dev/null && rustc --version || echo "MISSING"
	@printf "cargo:       "; command -v cargo >/dev/null && cargo --version || echo "MISSING"
	@printf "git remote:  "; git remote get-url origin 2>/dev/null || echo "MISSING"
	@printf "docker:      "; command -v docker >/dev/null && docker --version || echo "MISSING"
	@printf "docker up:   "; docker info >/dev/null 2>&1 && echo "ok" || echo "daemon not running or unavailable"
	@printf "terraform:   "; command -v terraform >/dev/null && terraform version -json 2>/dev/null | head -1 || echo "MISSING"
	@printf "java:        "; \
	if java -version >/dev/null 2>&1; then \
		java -version 2>&1 | head -1; \
	elif test -x /usr/libexec/java_home && /usr/libexec/java_home >/dev/null 2>&1; then \
		echo "installed ($$(/usr/libexec/java_home 2>/dev/null))"; \
	else \
		echo "MISSING (blocks Android)"; \
	fi
	@printf "compose:     "; test -f $(COMPOSE_FILE) && echo "$(COMPOSE_FILE) present" || echo "MISSING"
	@printf "staging id:  "; grep -E '^status:' $(STAGING_IDENTITY) 2>/dev/null || echo "file missing"
	@echo "See docs/execution/phase-scaffold-notes.md for known blockers."
	@echo "GitHub sync: make sync (docs/operations/github-sync.md)"

format: ## Run rustfmt on workspace
	cargo fmt --all

lint: ## Run clippy and format check
	cargo fmt --all -- --check
	cargo clippy --workspace --all-targets -- -D warnings

## --- Tests ---

test: test-unit ## Default test target

test-unit:
	cargo test --workspace

test-integration:
	@source "$$HOME/.cargo/env" && cargo test -p control-plane-integration

test-protocol-vectors:
	@source "$$HOME/.cargo/env" && cargo test -p dating-protocol --test golden_vectors -- --nocapture

## --- Live Introductions static prototype ---

live-introductions-build:
	python3 scripts/generate_live_introductions_prototype.py --output dist/live-introductions

live-introductions-test:
	python3 -m unittest tests.test_live_introductions_prototype

live-introductions-browser:
	@command -v uv >/dev/null 2>&1 || { echo "ERROR: uv is required. Install it from https://docs.astral.sh/uv/getting-started/installation/"; exit 1; }
	@uv run --project tools/live-introductions-browser --frozen python scripts/browser_acceptance_live_introductions.py $(if $(LIVE_INTRODUCTIONS_SCREENSHOT_DIR),--screenshot-dir "$(LIVE_INTRODUCTIONS_SCREENSHOT_DIR)")

live-introductions-netlify-validate:
	@version="$$( $(NETLIFY_CLI) --version )"; \
		printf '%s\n' "$$version"; \
		grep -Fq 'netlify-cli/23.13.0' <<<"$$version"
	@set -euo pipefail; \
		default_dry="/tmp/live-introductions-netlify-default-dry.log"; \
		$(NETLIFY_CLI) build --dry --offline | tee "$$default_dry"; \
		grep -Fq 'Context' "$$default_dry"; \
		grep -Fq 'production' "$$default_dry"; \
		for context in production dev quality-review-custom deploy-preview branch-deploy; do \
			log="/tmp/live-introductions-netlify-$${context}-dry.log"; \
			$(NETLIFY_CLI) build --dry --offline --context "$$context" | tee "$$log"; \
			grep -Fq 'Config file' "$$log"; \
			grep -Fq "$$context" "$$log"; \
		done; \
		assert_blocked() { \
			local context="$$1"; \
			local marker="$$2"; \
			local resolution_only="$${3:-false}"; \
			set +e; \
			if [[ "$$resolution_only" == "true" ]]; then \
				output="$$( LIVE_INTRODUCTIONS_CONFIG_RESOLUTION_ONLY=1 $(NETLIFY_CLI) build --context "$$context" --offline 2>&1 )"; \
			else \
				output="$$( $(NETLIFY_CLI) build --context "$$context" --offline 2>&1 )"; \
			fi; \
			result=$$?; \
			set -e; \
			printf '%s\n' "$$output"; \
			test $$result -ne 0; \
			grep -Fq "$$marker" <<<"$$output"; \
			grep -Fq 'Resolved config' <<<"$$output"; \
			grep -Fq 'Content-Security-Policy' <<<"$$output"; \
			grep -Fq 'X-Frame-Options: DENY' <<<"$$output"; \
		}; \
		set +e; \
		default_output="$$( $(NETLIFY_CLI) build --offline 2>&1 )"; \
		default_result=$$?; \
		set -e; \
		printf '%s\n' "$$default_output"; \
		test $$default_result -ne 0; \
		grep -Fq 'PRODUCTION_BLOCKED' <<<"$$default_output"; \
		grep -Fq 'Resolved config' <<<"$$default_output"; \
		grep -Fq 'Content-Security-Policy' <<<"$$default_output"; \
		grep -Fq 'X-Frame-Options: DENY' <<<"$$default_output"; \
		assert_blocked production PRODUCTION_BLOCKED; \
		assert_blocked dev DEV_CONTEXT_BLOCKED; \
		assert_blocked quality-review-custom UNAPPROVED_CONTEXT_BLOCKED; \
		assert_blocked deploy-preview CONFIG_RESOLUTION_ONLY_BLOCKED true; \
		assert_blocked branch-deploy CONFIG_RESOLUTION_ONLY_BLOCKED true; \
		echo "Netlify configuration resolution: PASS (no generation executed)."

live-introductions-deploy-preflight:
	python3 scripts/verify_live_introductions_deploy_context.py --deployment-preflight

test-mobile: ios-build
	@echo "=== Android (optional; deferred while iPhone-first) ==="
	@if command -v java >/dev/null 2>&1 && test -f apps/android/gradlew; then \
		echo "Android wrapper present — run ./gradlew :app:assembleDebug when ready"; \
	else \
		echo "Android toolchain optional for current iPhone-first focus"; \
	fi

ios-gen:
	@command -v xcodegen >/dev/null 2>&1 || { echo "Install xcodegen: brew install xcodegen"; exit 1; }
	cd apps/ios && xcodegen generate

ios-uniffi: ## Build UniFFI staticlib for iOS Simulator and stage Native/
	@chmod +x scripts/build-ios-uniffi.sh
	./scripts/build-ios-uniffi.sh

ios-build: ios-uniffi ios-gen ## Build iPhone staging app (UniFFI linked) for Simulator
	cd apps/ios && xcodebuild -project SwipeDating.xcodeproj -scheme SwipeDating \
		-sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
		-configuration Debug build CODE_SIGNING_ALLOWED=NO

ios-open: ios-uniffi ios-gen ## Open the iPhone app in Xcode
	open apps/ios/SwipeDating.xcodeproj

## --- GitHub bidirectional sync ---

sync-status: ## Show ahead/behind vs origin
	@chmod +x scripts/git-sync.sh
	./scripts/git-sync.sh status

sync-pull: ## Fetch + rebase from GitHub
	@chmod +x scripts/git-sync.sh
	./scripts/git-sync.sh pull

sync-push: ## Push current branch to GitHub (mirrors main from feature branch)
	@chmod +x scripts/git-sync.sh
	./scripts/git-sync.sh push

sync: ## Bidirectional sync: pull --rebase then push
	@chmod +x scripts/git-sync.sh
	./scripts/git-sync.sh sync

## --- RAM disk (macOS) ---

ramdisk-status: ## Show RAM disk / memory headroom
	@chmod +x scripts/ramdisk.sh
	./scripts/ramdisk.sh status

ramdisk-up: ## Create RAM disk and mirror project into /Volumes/SwipeDatingRAM
	@chmod +x scripts/ramdisk.sh
	./scripts/ramdisk.sh up

ramdisk-sync-back: ## Copy RAM worktree back to persistent disk
	@chmod +x scripts/ramdisk.sh
	./scripts/ramdisk.sh sync-back

ramdisk-down: ## Sync back then destroy RAM disk
	@chmod +x scripts/ramdisk.sh
	./scripts/ramdisk.sh down

test-e2e:
	@echo "STUB: E2E device-pair smoke not wired in CI yet (requires staging URL + test harness)."

test-load:
	@source "$$HOME/.cargo/env" && cargo test -p dating-rendezvous concurrent_discovery_load_smoke -- --nocapture

test-chaos:
	@echo "STUB: chaos tests not implemented (requires running staging cluster)."

fuzz-smoke:
	@source "$$HOME/.cargo/env" && cargo test -p dating-protocol --test cbor_fuzz_smoke cbor_mutation_smoke -- --nocapture

security:
	@source "$$HOME/.cargo/env" && cargo audit
	@source "$$HOME/.cargo/env" && cargo deny check

sbom:
	@mkdir -p sbom
	@source "$$HOME/.cargo/env" && cargo cyclonedx --all-features --format json --license-accept-named UNLICENSED
	@find . -name '*.cdx.json' -not -path './sbom/*' -exec mv {} sbom/ \;
	@test -n "$$(ls -A sbom/*.cdx.json 2>/dev/null)"

licenses:
	@source "$$HOME/.cargo/env" && cargo deny check licenses

## --- Local stack ---

local-up:
	@if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then \
		docker compose -f $(COMPOSE_FILE) up -d; \
		echo "Local control-plane dependencies starting. Rendezvous service: build from services/rendezvous (not auto-started)."; \
	else \
		if ! command -v docker >/dev/null 2>&1; then \
			echo "NOTICE: docker not installed — using Docker-free local smoke path."; \
		else \
			echo "NOTICE: Docker daemon not running — using Docker-free local smoke path."; \
		fi; \
		$(MAKE) smoke-local; \
	fi

smoke-local: ## Build and smoke-test control-plane services without Docker
	@bash $(SCRIPTS)/local-smoke.sh

local-services-up: ## Start control-plane services on 8080–8085 and leave them running
	@bash $(SCRIPTS)/local-services-up.sh

local-down:
	@if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then \
		docker compose -f $(COMPOSE_FILE) down; \
	else \
		echo "Docker unavailable — nothing to stop"; \
	fi

local-reset-test-data:
	@if ! docker info >/dev/null 2>&1; then echo "ERROR: Docker required"; exit 1; fi
	docker compose -f $(COMPOSE_FILE) down -v
	docker compose -f $(COMPOSE_FILE) up -d
	@echo "Volumes reset. Apply migrations manually: psql or migration runner against localhost:5432."

## --- Infrastructure ---

infra-fmt:
	@if command -v terraform >/dev/null 2>&1; then \
		terraform fmt -recursive infra/terraform; \
	else \
		echo "STUB: terraform not installed — infra-fmt skipped"; \
	fi

infra-validate:
	@if command -v terraform >/dev/null 2>&1; then \
		cd infra/terraform/environments/staging && terraform init -backend=false && terraform validate; \
	else \
		echo "STUB: terraform not installed — infra-validate skipped"; \
	fi

infra-plan-staging:
	@if ! command -v terraform >/dev/null 2>&1; then \
		echo "ERROR: terraform required for plan"; exit 1; \
	fi
	@$(SCRIPTS)/verify_staging_account.sh
	cd infra/terraform/environments/staging && terraform init && terraform plan

deploy-staging:
	@$(SCRIPTS)/verify_staging_account.sh
	@if ! command -v terraform >/dev/null 2>&1; then \
		echo "ERROR: terraform required for deploy-staging"; exit 1; \
	fi
	@echo "deploy-staging: applying staging environment (human-verified account only)..."
	cd infra/terraform/environments/staging && terraform init && terraform apply

smoke-staging:
	@echo "STUB: smoke-staging requires deployed staging URL in .cursor/state or STAGING_BASE_URL env."
	@if [ -n "$$STAGING_BASE_URL" ]; then \
		curl -sf "$$STAGING_BASE_URL/health" && echo " health ok" || echo "health check failed"; \
	else \
		echo "Set STAGING_BASE_URL to run smoke checks."; \
		exit 1; \
	fi

release-readiness:
	@echo "=== Release readiness checklist (staging) ==="
	@$(MAKE) doctor
	@$(MAKE) lint
	@$(MAKE) test-unit
	@echo "Manual: staging smoke, safety docs human review, approvals still required for production."

production-preflight:
	@$(SCRIPTS)/production_preflight.sh
