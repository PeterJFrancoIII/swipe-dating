# Swipe Dating — local-first staging platform
# Adult consent feature foundation. Not production-ready.

SHELL := /bin/bash
.PHONY: bootstrap doctor format lint feature-policy-check test test-unit test-integration test-protocol-vectors \
	test-mobile android-build test-e2e test-load test-chaos fuzz-smoke security sbom licenses \
	local-up local-down local-reset-test-data smoke-local local-services-up infra-fmt infra-validate infra-plan-staging \
	deploy-staging smoke-staging release-readiness production-preflight ios-build ios-open ios-gen ios-uniffi \
	sync sync-pull sync-push sync-status ramdisk-status ramdisk-up ramdisk-sync-back ramdisk-down

COMPOSE_FILE := infra/local/compose.yaml
STAGING_IDENTITY := infra/terraform/environments/staging/ACCOUNT_IDENTITY.md
SCRIPTS := scripts

## --- Toolchain & quality ---

bootstrap: ## Install local dev dependencies (Rust, hooks, optional tools)
	@command -v rustup >/dev/null 2>&1 || { echo "ERROR: rustup not found. Install from https://rustup.rs"; exit 1; }
	rustup show active-toolchain >/dev/null 2>&1 || rustup default stable
	rustup component add rustfmt clippy 2>/dev/null || true
	cargo fetch
	@echo "bootstrap: Rust workspace fetched. Required for full readiness: Xcode/xcodegen, JDK17+, Android SDK, Docker, Terraform."

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
	@printf "xcodegen:    "; command -v xcodegen >/dev/null && xcodegen --version || echo "MISSING (blocks iOS)"
	@printf "compose:     "; test -f $(COMPOSE_FILE) && echo "$(COMPOSE_FILE) present" || echo "MISSING"
	@printf "staging id:  "; grep -E '^status:' $(STAGING_IDENTITY) 2>/dev/null || echo "file missing"
	@echo "Latest audit: docs/audits/2026-07-21-adult-features-readiness-review.md"
	@echo "GitHub sync: make sync (docs/operations/github-sync.md)"
	@echo "RAM disk: make ramdisk-status (docs/operations/ramdisk.md)"

format: ## Run rustfmt on workspace
	cargo fmt --all

feature-policy-check: ## Enforce adult/consent/privacy source and governance invariants
	@bash $(SCRIPTS)/feature_policy_check.sh

lint: feature-policy-check ## Run policy, clippy, and format checks
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

test-mobile: ios-build android-build ## Build current iOS and Android staging targets

android-build: ## Build Android staging APK; no continue-on-error
	@test -f apps/android/gradlew || { echo "ERROR: Android Gradle wrapper missing"; exit 1; }
	@chmod +x apps/android/gradlew
	cd apps/android && ./gradlew :app:assembleDebug --no-daemon

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

sync-push: ## Push current branch to GitHub (mirrors main from primary feature branch only)
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
	@exit 1

test-load:
	@source "$$HOME/.cargo/env" && cargo test -p dating-rendezvous concurrent_discovery_load_smoke -- --nocapture

test-chaos:
	@echo "STUB: chaos tests not implemented (requires running staging cluster)."
	@exit 1

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
		echo "ERROR: terraform not installed — infra-fmt cannot verify"; \
		exit 1; \
	fi

infra-validate:
	@if command -v terraform >/dev/null 2>&1; then \
		cd infra/terraform/environments/staging && terraform init -backend=false && terraform validate; \
	else \
		echo "ERROR: terraform not installed — infra-validate cannot verify"; \
		exit 1; \
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
	@if [ -n "$$STAGING_BASE_URL" ]; then \
		curl -sf "$$STAGING_BASE_URL/healthz" && echo " health ok"; \
	else \
		echo "Set STAGING_BASE_URL to run smoke checks."; \
		exit 1; \
	fi

release-readiness: ## Full local release evidence; requires all mobile/toolchains
	@echo "=== Release readiness checklist (staging) ==="
	@$(MAKE) doctor
	@$(MAKE) feature-policy-check
	@$(MAKE) lint
	@$(MAKE) test-unit
	@$(MAKE) test-integration
	@$(MAKE) test-mobile
	@echo "Automated staging checks passed. Human safety/legal/privacy/security/store/market approvals remain required."

production-preflight:
	@$(SCRIPTS)/production_preflight.sh
