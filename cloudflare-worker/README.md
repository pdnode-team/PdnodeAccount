# Terra Slack Verifier (Cloudflare Worker)

Used to verify whether the Hack Club Slack ID of the currently logged-in user has **Terra Worker** permissions.

## 1. Enter Authorized Slack IDs
Open [`worker.js`](./worker.js) and add the authorized Slack IDs (e.g., `U0AHHTFJ4TV`) to the `ALLOWED_SLACK_IDS` array:

```javascript
const ALLOWED_SLACK_IDS = [
"U0123456789", // Replace with your Slack ID
"U9876543210",
];
```

## 2. Deployment Methods

### Method A: Deploy via Cloudflare Dashboard (Recommended, fastest)
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/);
2. Navigate to **Workers & Pages** -> click **Create Application** -> **Create Worker**;
3. Name your Worker (e.g., `terra-slack-verifier`) and click **Deploy**;
4. Go to the details page for the newly created Worker and click **Edit code** in the top-right corner;
5. Copy and paste the entire contents of [`worker.js`](./worker.js) into the editor, then click **Deploy** to save;
6. Copy the assigned domain (e.g., `https://terra-slack-verifier.<your-subdomain>.workers.dev`).

### Method B: Deploy via Wrangler CLI
Run the following command in the `cloudflare-worker` directory:
```bash
npx wrangler deploy
```

## 3. Configure the Worker URL in Your Frontend Project
Once deployed, create or edit the `.env` file in the root directory of your frontend project (or modify [`ui/src/config/terra.ts`](../ui/src/config/terra.ts)):

```env
VITE_TERRA_WORKER_URL=https://terra-slack-verifier.<your-subdomain>.workers.dev
```