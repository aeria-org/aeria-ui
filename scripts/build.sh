#!/bin/sh

rm -rf packages/*/dist

pnpm --filter='./packages/aeria-icons' build \
  && pnpm --filter='./packages/utils' build \
  && pnpm --filter='./packages/cli' build \
  && pnpm --filter='./packages/i18n' build \
  && pnpm --filter='./packages/state-management' build \
  && pnpm --filter='./packages/core' build \
  && pnpm --filter='./packages/theme' build \
  && pnpm --filter='./packages/ui' build \
  && pnpm --filter='./packages/create-aeria-app' build \
  && pnpm --filter='./packages/aeria-ui' build \
  && pnpm --filter='./layouts/*' build

