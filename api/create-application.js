export default async function handler(req, res) {
  try {
    const isLive = process.env.DOPPLE_ENV === "prod";

    const domain = isLive
      ? "https://app.dopplepay.com"
      : "https://uat-app.dopplepay.com";

    const endpoint =
      `${domain}/api/merchants/applications` +
      `?api_key=${encodeURIComponent(process.env.DOPPLE_API_KEY)}` +
      `&system_id=${encodeURIComponent(process.env.DOPPLE_SYSTEM_ID)}`;

    const baseApplyUrl = `${domain}/apply?a=`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        identifier: `optimum-${Date.now()}`,
        csn_url: process.env.ZAPIER_WEBHOOK_URL
      })
    });

    const rawText = await response.text();
    console.log("Dopple raw response:", rawText);

    let data = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      return res.status(500).send(`Dopple returned non-JSON response: ${rawText}`);
    }

    console.log("Dopple parsed response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      return res.status(500).send(`Dopple error: ${data?.error?.reason || rawText || "Unknown error"}`);
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

    return res.status(500).send(`No redirect URL or application ID returned. Response: ${rawText}`);

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).send(`Server error: ${error.message}`);
  }
}
