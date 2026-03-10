export default async function handler(req, res) {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: "Missing 'name' query parameter" });
    }

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: "API key not configured on server" });
    }

    const url = `https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(
      name
    )}&apikey=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error("Error in /api/geoname:", error);
    res.status(500).json({ error: "Failed to fetch geoname data" });
  }
}

