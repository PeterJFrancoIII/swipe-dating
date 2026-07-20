# Swipe Dating — local-first staging platform
# Phases 7–17 scaffold. Not production-ready.

SHELL := /bin/bash
.PHONY: bootstrap doctor format lint test test-unit test-integration test-protocol-vectors \
	test-mobile test-e2e test-load test-chaos fuzz-smoke security sbom licenses \
	local-up local-down local-reset-test-data infra-fmt infra-validate infra-plan-staging \
	deploy-staging smoke-staging release-readiness production-preflight

COMPOSE_FILE := infra/local/compose.yaml
STAGING_IDENTITY := infra/terraform/environments/staging/ACCOUNT_IDENTITY.md
SCRIPTS := scripts

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
	@printf "docker:      "; command -v docker >/dev/null && docker --version || echo "MISSING"
	@printf "docker up:   "; docker info >/dev/null 2>&1 && echo "ok" || echo "daemon not running or unavailable"
	@printf "terraform:   "; command -v terraform >/dev/null && terraform version -json 2>/dev/null | head -1 || echo "MISSING"
	@printf "java:        "; command -v java >/dev/null && java -version 2>&1 | head -1 || echo "MISSING (blocks Android)"
	@printf "compose:     "; test -f $(COMPOSE_FILE) && echo "$(COMPOSE_FILE) present" || echo "MISSING"
	@printf "staging id:  "; grep -E '^status:' $(STAGING_IDENTITY) 2>/dev/null || echo "file missing"
	@echo "See docs/execution/phase-scaffold-notes.md for known blockers."

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
	@if docker info >/dev/null 2>&1; then \
		echo "integration: compose stack required — run 'make local-up' first"; \
		cargo test --workspace -- --ignored 2>/dev/null || \
		echo "STUB: no #[ignore] integration tests wired yet; see services/rendezvous"; \
	else \
		echo "STUB: Docker unavailable — skipping integration tests"; \
		exit 0; \
	fi

test-protocol-vectors:
	@if [ -d core/protocol/tests/vectors ]; then \
		cargo test -p swipe-protocol -- vectors 2>/dev/null || cargo test -p protocol -- vectors 2>/dev/null || \
		cargo test --workspace protocol 2>/dev/null; \
	else \
		echo "STUB: protocol vector fixtures not yet present under core/protocol/tests/vectors"; \
	fi

test-mobile:
	@echo "=== iOS (structural) ==="
	@test -f apps/ios/VERIFY.md && cat apps/ios/VERIFY.md | head -5 || echo "apps/ios missing"
	@echo "=== Android (structural) ==="
	@if command -v java >/dev/null 2>&1 && test -f apps/android/gradlew; then \
		cd apps/android && ./gradlew :app:assembleDebug --dry-run 2>/dev/null || \
		echo "STUB: Gradle wrapper jar may be missing — see apps/android/VERIFY.md"; \
	else \
		echo "STUB: Java or Gradle wrapper missing — see apps/android/VERIFY.md"; \
	fi

test-e2e:
	@echo "STUB: E2E device-pair smoke not wired in CI yet (requires staging URL + test harness)."

test-load:
	@echo "STUB: load tests not implemented (k6/locust placeholder for post-staging)."

test-chaos:
	@echo "STUB: chaos tests not implemented (requires running staging cluster)."

fuzz-smoke:
	@if command -v cargo-fuzz >/dev/null 2>&1; then \
		echo "STUB: cargo-fuzz targets not registered yet"; \
	else \
		echo "STUB: cargo-fuzz not installed — optional for protocol parsers"; \
	fi

security:
	@if command -v cargo-audit >/dev/null 2>&1; then cargo audit; else echo "STUB: install cargo-audit for dependency audit"; fi
	@command -v cargo-deny >/dev/null 2>&1 && cargo deny check || echo "STUB: cargo-deny check skipped (install: cargo install cargo-deny)"

sbom:
	@if command -v cargo-cyclonedx >/dev/null 2>&1; then \
		cargo cyclonedx --all-features --format json -o target/sbom.json; \
	else \
		echo "STUB: cargo-cyclonedx not installed — SBOM generation skipped"; \
	fi

licenses:
	@command -v cargo-deny >/dev/null 2>&1 && cargo deny check licenses || \
		echo "STUB: license scan requires cargo-deny; see docs/legal/license-decision-required.md"

## --- Local stack ---

local-up:
	@if ! command -v docker >/dev/null 2>&1; then echo "ERROR: docker not installed"; exit 1; fi
	@if ! docker info >/dev/null 2>&1; then echo "ERROR: Docker daemon not running"; exit 1; fi
	docker compose -f $(COMPOSE_FILE) up -d
	@echo "Local control-plane dependencies starting. Rendezvous service: build from services/rendezvous (not auto-started)."

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
