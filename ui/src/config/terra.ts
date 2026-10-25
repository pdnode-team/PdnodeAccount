// Cloudflare Worker 验证地址配置
// 部署 Cloudflare Worker 后，可在此修改默认地址，或者在环境变量 .env 中设置 VITE_TERRA_WORKER_URL
export const TERRA_WORKER_URL = import.meta.env.VITE_TERRA_WORKER_URL ||
  "https://terra-reviewer-check.bretren2013.workers.dev/";
