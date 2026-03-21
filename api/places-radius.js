export default async function handler(req, res) {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res
        .status(400)
        .json({ error: "Missing 'lat' or 'lon' query parameter" });
    }

    const API_KEY = process.env.API_KEY;
    if (API_KEY) {
      const otpUrl = `https://api.opentripmap.com/0.1/en/places/radius?radius=5000&lon=${lon}&lat=${lat}&apikey=${API_KEY}`;
      const otpResponse = await fetch(otpUrl);
      const otpData = await otpResponse.json();
      if (otpData && Array.isArray(otpData.features)) {
        return res.status(200).json(otpData);
      }
    }

    // Fallback for Vercel when API_KEY is not configured
    const overpassQuery = `[out:json];
(
  node(around:5000,${lat},${lon})[tourism];
  node(around:5000,${lat},${lon})[historic];
  way(around:5000,${lat},${lon})[tourism];
  way(around:5000,${lat},${lon})[historic];
);
out center 40;`;

    const overpassResponse = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: overpassQuery }),
    });

    const overpassData = await overpassResponse.json();
    const features = (overpassData.elements || []).map((el) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [elLon, elLat],
        },
        properties: {
          name: el.tags?.name || el.tags?.tourism || el.tags?.historic || "Tourist Place",
        },
      };
    }).filter((f) => Number.isFinite(f.geometry.coordinates[0]) && Number.isFinite(f.geometry.coordinates[1]));

    return res.status(200).json({ type: "FeatureCollection", features });
  } catch (error) {
    console.error("Error in /api/places-radius:", error);
    return res.status(500).json({ error: "Failed to fetch places data" });
  }
}
