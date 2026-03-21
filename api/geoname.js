export default async function handler(req, res) {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: "Missing 'name' query parameter" });
    }

    const API_KEY = process.env.API_KEY;
    if (API_KEY) {
      const otpUrl = `https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(
        name
      )}&apikey=${API_KEY}`;

      const otpResponse = await fetch(otpUrl);
      const otpData = await otpResponse.json();

      if (otpData && otpData.lat !== undefined && otpData.lon !== undefined) {
        return res.status(200).json(otpData);
      }
    }

    // Fallback for Vercel when API_KEY is not configured
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      name
    )}`;
    const nominatimResponse = await fetch(nominatimUrl, {
      headers: { "User-Agent": "TouristGuide/1.0" },
    });
    const nominatimData = await nominatimResponse.json();

    if (!Array.isArray(nominatimData) || nominatimData.length === 0) {
      return res.status(404).json({ error: "City not found" });
    }

    const place = nominatimData[0];
    return res.status(200).json({
      name: place.display_name,
      lat: Number(place.lat),
      lon: Number(place.lon),
    });
  } catch (error) {
    console.error("Error in /api/geoname:", error);
    return res.status(500).json({ error: "Failed to fetch geoname data" });
  }
}
