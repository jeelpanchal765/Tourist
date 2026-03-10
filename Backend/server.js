const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const API_KEY = process.env.API_KEY;

app.use(cors());
app.use(express.json());

// frontend folder connect
app.use(express.static(path.join(__dirname, "../Public")));

// proxy to OpenTripMap geoname endpoint
app.get("/api/geoname", async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: "Missing 'name' query parameter" });
    }

    if (!API_KEY) {
      return res.status(500).json({ error: "API key not configured on server" });
    }

    const url = `https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(
      name
    )}&apikey=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error("Error in /api/geoname:", error);
    res.status(500).json({ error: "Failed to fetch geoname data" });
  }
});

// proxy to OpenTripMap radius endpoint
app.get("/api/places-radius", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res
        .status(400)
        .json({ error: "Missing 'lat' or 'lon' query parameter" });
    }

    if (!API_KEY) {
      return res.status(500).json({ error: "API key not configured on server" });
    }

    const url = `https://api.opentripmap.com/0.1/en/places/radius?radius=5000&lon=${lon}&lat=${lat}&apikey=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error("Error in /api/places-radius:", error);
    res.status(500).json({ error: "Failed to fetch places data" });
  }
});

// example static data route (kept from original code)
app.get("/places", (req, res) => {
  const places = [
    { name: "Dumas Beach", city: "Surat" },
    { name: "Statue of Unity", city: "Kevadia" },
    { name: "Gir National Park", city: "Junagadh" },
  ];

  res.json(places);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
})