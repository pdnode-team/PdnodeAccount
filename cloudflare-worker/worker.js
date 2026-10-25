const ALLOWED_SLACK_IDS = ["U0123456789", "U9876543210"];

const slackIdSet = new Set(ALLOWED_SLACK_IDS);

export default {
  async fetch(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const slackId = url.searchParams.get("slack_id");

    const isAllowed = Boolean(slackId && slackIdSet.has(slackId.trim()));

    return new Response(
      JSON.stringify({
        allowed: isAllowed,
        slack_id: slackId || null,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  },
};
