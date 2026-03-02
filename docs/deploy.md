# Cloudflare Workers Builds (OpenNext)

Recommended settings for this repo:

- Build command: `npm run build:worker`
- Deploy command (production): `npx wrangler versions upload`
- Deploy command (non-production): `npx wrangler versions upload`

Notes:
- `build:worker` already runs Next build through OpenNext, so avoid `npm run build` before it.
- `nodejs_compat` is required in `wrangler.toml` for Node built-ins used by the OpenNext worker bundle.
