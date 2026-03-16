export async function isSafeUrl(url: string): Promise<boolean> {
  const API_KEY = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

  if (!API_KEY) {
    console.warn("[safe-browsing] API key not set, skipping check");
    return true;
  }

  const API_URL = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;

  const body = {
    client: { clientId: "shortener", clientVersion: "1.0" },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url }],
    },
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`[safe-browsing] API zwróciło ${response.status}`);
      return true;
    }

    const data = await response.json();
    return !data.matches;
  } catch (error) {
    console.error("[safe-browsing] Sprawdzanie nie powiodło się:", error);
    return true;
  }
}
