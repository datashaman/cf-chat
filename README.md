# cf-chat

A simple chat app using Cloudflare Workers and WebSockets.

## Install
```
yarn
```

## Configure
```
cp .example.env .env
```

You will need a token to deploy to Cloudflare Workers. To create a token:

1. From the [Cloudflare dashboard](https://dash.cloudflare.com/profile/api-tokens/), go to **My Profile > API Tokens**.
2. Select **Create Token**.
3. Select the **Edit Cloudflare Workers** template, select **Account** and **Zone**, and click **Continue to Summary**.
4. Read the token summary and click **Create Token**.
5. Copy the token and paste into `.env` as `CLOUDFLARE_API_TOKEN`.

## Develop
```
yarn dev
```

### Test
```
yarn test
```

## Deploy
```
yarn deploy
```
