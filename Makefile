SHELL := /bin/bash

.PHONY: setup test lint check simulate api mobile mobile-web production-preflight

setup:
	npm install --ignore-scripts

test:
	npm test

lint:
	npm run check:syntax
	npm run check:active-surface

check:
	npm run check

simulate:
	npm run simulate

api:
	npm run api

mobile:
	npm run mobile

mobile-web:
	npm run mobile:web

production-preflight:
	@bash scripts/production_preflight.sh
