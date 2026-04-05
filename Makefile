.PHONY: dev ios android web test test-watch lint typecheck db-generate install clean

dev: ## Start Expo dev server (tunnel for WSL2)
	npx expo start --tunnel

ios: ## Start on iOS simulator (tunnel for WSL2)
	npx expo start --ios --tunnel

android: ## Start on Android emulator (tunnel for WSL2)
	npx expo start --android --tunnel

web: ## Start web dev server
	npx expo start --web

test: ## Run tests
	npx vitest run

test-watch: ## Run tests in watch mode
	npx vitest

lint: ## Run ESLint
	npx expo lint

typecheck: ## Run TypeScript type checking
	npx tsc --noEmit

db-generate: ## Generate Drizzle migration from schema changes
	npx drizzle-kit generate

install: ## Install dependencies
	npm install

clean: ## Remove build artifacts and caches
	rm -rf node_modules/.cache .expo dist

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
