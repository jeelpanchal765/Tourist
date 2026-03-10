export default async function handler(req, res) {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res
        .status(400)
        .json({ error: "Missing 'lat' or 'lon' query parameter" });
    }

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: "API key not configured on server" });
    }

    const url = `https://api.opentripmap.com/0.1/en/places/radius?radius=5000&lon=${lon}&lat=${lat}&apikey=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error("Error in /api/places-radius:", error);
    res.status(500).json({ error: "Failed to fetch places data" });
  }
}

