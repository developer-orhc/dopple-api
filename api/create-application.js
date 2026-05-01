export default async function handler(req, res) {
  try {
    const isLive = process.env.DOPPLE_ENV === "prod";

    const endpoint = isLive
      ? "https://app.dopplepay.com/api/merchants/applications"
      : "https://uat-app.dopplepay.com/api/merchants/applications";

    const baseApplyUrl = isLive
      ? "https://app.dopplepay.com/apply?a="
      : "https://uat-app.dopplepay.com/apply?a=";

    const identifier = `optimum-${Date.now()}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_key": process.env.DOPPLE_API_KEY
      },
      body: JSON.stringify({
        system_id: process.env.DOPPLE_SYSTEM_ID,
        identifier: identifier,
        csn_url: process.env.ZAPIER_WEBHOOK_URL
      })
    });

    const data = await response.json();

    console.log("Dopple response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("Dopple error:", data);
      return res.status(500).send(`Dopple error: ${data?.error?.reason || "Unknown error"}`);
    }

    const applicationUrl =
      data.application_url ||
      data.redirect_url ||
      data.url ||
      data.apply_url ||
      data.applicationUrl ||
      data.redirectUrl ||
      data.applyUrl ||
      data.link ||
      data.href ||
      data.data?.application_url ||
      data.data?.redirect_url ||
      data.data?.url ||
      data.data?.apply_url ||
      data.data?.applicationUrl ||
      data.data?.redirectUrl ||
      data.data?.applyUrl ||
      data.data?.link;

    const applicationId =
      data.application_id ||
      data.applicationId ||
      data.id ||
      data.data?.application_id ||
      data.data?.applicationId ||
      data.data?.id;

    if (applicationUrl) {
      return res.redirect(applicationUrl);
    }

    if (applicationId) {
      return res.redirect(`${baseApplyUrl}${applicationId}`);
    }

    console.error("No application URL or ID returned:", data);
    return res.status(500).send("Finance application created but no redirect URL or application ID was returned.");

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).send("Something went wrong creating the finance application.");
  }
}
