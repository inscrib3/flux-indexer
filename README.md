# Flux Indexer by Inscrib3

Indexing Flux protocol tokens and related actions like transfers, deployments, mints.

## Local

Duplicate `.env.example` and rename to `.env`.

Update environment variables expecially Fractal Node instance `BITCOIN_NODE_URL`.

Run the following command to start the indexer locally using docker

```bash
docker compose -f docker-compose-local.yml up -d
```

Or using node

```bash
npm ci && npm run build && npm run start:prod
```

## Production

`CERTBOT_EMAIL` is used in production for SSL.

Update `server_name` inside `nginx/nginx-override.conf` to your domain or subdomain.

Point your domain using DNS to the IP of the indexer.

Run the following command to start the indexer using docker;

```bash
docker compose up -d
```

Or using node

```bash
npm ci && npm run build && npm run start:prod
```
