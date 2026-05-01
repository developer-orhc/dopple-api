export default async function handler(req, res) {
  try {
    const isLive = process.env.DOPPLE_ENV === "prod";

    const domain = isLive
      ? "https://app.dopplepay.com"
      : "https://uat-app.dopplepay.com";

    const params = new URLSearchParams({
      api_key: process.env.DOPPLE_API_KEY,
      system_id: process.env.DOPPLE_SYSTEM_ID,
      merchant_unique_reference: `optimum-${Date.now()}`,
      csn_url: process.env.ZAPIER_WEBHOOK_URL,
      return_url_accepted: "https://optimumhealthcentre.co.uk/finance-approved",
      return_url_declined: "https://optimumhealthcentre.co.uk/finance-declined",
      return_url_other: "https://optimumhealthcentre.co.uk/finance-application-status"
    });

    const endpoint = `${domain}/api/merchants/applications?${params.toString()}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        goods: [
          {
            description: "Adult Autism Assessment",
            price: 199900
          }
        ]
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

    if (!response.ok) {
      return res.status(500).send(`Dopple error: ${data?.error?.reason || rawText || "Unknown error"}`);
    }

    if (data.url) {
      return res.redirect(data.url);
    }

    if (data.application_id) {
      return res.redirect(`${domain}/apply?a=${data.application_id}`);
    }

    return res.status(500).send(`No URL returned. Response: ${rawText}`);

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).send(`Server error: ${error.message}`);
  }
}
