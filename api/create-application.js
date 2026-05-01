export default async function handler(req, res) {
  try {
    const isLive = process.env.DOPPLE_ENV === "prod";

    const endpoint = isLive
      ? "https://app.dopplepay.com/api/merchants/applications"
      : "https://uat-app.dopplepay.com/api/merchants/applications";

    const identifier = `optimum-${Date.now()}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DOPPLE_API_KEY}`
      },
      body: JSON.stringify({
        system_id: process.env.DOPPLE_SYSTEM_ID,
        identifier: identifier,
        csn_url: process.env.ZAPIER_WEBHOOK_URL
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Dopple error:", data);
      return res.status(500).send("Unable to create finance application.");
    }

console.log("Dopple response:", JSON.stringify(data, null, 2));

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

    if (!applicationUrl) {
      console.error("No application URL returned:", data);
      return res.status(500).send("Finance application created but no redirect URL was returned.");
    }

    return res.redirect(applicationUrl);

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).send("Something went wrong creating the finance application.");
  }
}
