# 🛰️ Burning Activity Explorer

> **NASA Space Apps Challenge 2026**  
> **Developed by TEAM STERION**  
> *Earth Observation & Fire Dynamics Analytics Platform*

---

## ⚡ Quick Start for Teammates & Reviewers

### 1. Prerequisites
Make sure **Node.js** (v18 or v20 LTS recommended) is installed on your PC:
- Download Node.js from: **https://nodejs.org/** (Choose the LTS version).
- Verify installation by opening Terminal / PowerShell and running:
  ```bash
  node -v
  npm -v
  ```

---

### 2. How to Run

#### Option A: One-Click Launch (Easiest)
- **On Windows**: Double-click **`run.bat`**. It will automatically install packages (if missing), start the server, and open your browser!
- **On Mac / Linux**: Double-click or run **`./run.sh`** in terminal.

---

#### Option B: Standard Terminal Commands
Open your Terminal (Mac/Linux) or Command Prompt / PowerShell (Windows) inside this project folder:

```bash
# 1. Install dependencies (only required the first time)
npm install

# 2. Start the local server
npm run dev
```

Then open your browser and visit:
👉 **`http://localhost:5173`**

---

## 🇧🇩 Bangladesh layer & alerts

- All **64 districts** (8 divisions) plus ~86 detailed places/upazilas in **Rajshahi** and **Chattogram** divisions (`src/data/bangladeshAreas.js`). Coordinates are approximate centroids.
- Each area's value = real FIRMS detections nearby + modelled estimates (seeded, deterministic). Set `INCLUDE_MODELLED_ESTIMATES = false` in that file to show real FIRMS detections only.
- **Heat map / histogram** (district × day, plus daily totals) in the side panel.
- **Email alerts**: users register an email, preferred areas and a level (High+ / Very High). Subscriptions are stored in the browser; to send real emails set `VITE_ALERT_ENDPOINT` (a backend/webhook that receives a JSON POST — see `src/utils/alertService.js`). Without it the app shows the alert and a one-click email draft.

---

## 🧭 Key Features & Navigation

- **3D Global Earth Mode**:
  - Interactive 3D globe rendering NASA Blue Marble / Night Earth textures.
  - Uber H3 hexagonal spatial indexing for fire activity.
  - Click any hexagon to inspect it; the camera reset button returns to the South Asia footprint.
  
- **Satellite Map Mode (Deep Zoom)**:
  - Switch to **"Satellite Map"** using the toggle in the header navigation.
  - High-resolution ESRI Earth Imagery allowing street-level / thana-level zoom (Zoom level 11 to 18).
  - Clear H3 Hexagon sector boundaries highlighting local thanas: Boalia, Motihar, Rajpara, Shah Makhdum, Paba, Godagari, Charghat, Bagha, Tanore, etc.

- **Harmonized NASA MODIS + VIIRS Pipeline (real NASA FIRMS data)**:
  - Detections from MODIS C6.1 (Terra/Aqua) and VIIRS C2 (S-NPP, NOAA-20, NOAA-21), aggregated into H3 res-5 hexagons.
  - Per-region satellite breakdown, daily detections-by-sensor chart and a 12-month calendar (only months covered by the feed show data).
  - Multi-year (2022–2025) baselines are **not** included, so no historical comparison is shown.

---

## 🛰️ Updating the NASA data

1. Download the FIRMS files (MODIS `MCD14DL` `.txt` daily files and VIIRS `*_7d.csv`) into `data/raw/`.
2. Run `npm run build:data` — this writes `src/data/fireDetections.json`
   (drops VIIRS *low* confidence and MODIS confidence < 30, removes duplicates).
3. `npm run dev` (or `npm run build`).

---

## 📦 Project Structure

```
burning-activity-explorer/
├── public/                 # Earth texture assets (night lights, topography)
├── src/
│   ├── components/         # GlobeView, TacticalMapView, RegionPanel, Calendar, etc.
│   ├── data/               # hexData.js (H3 aggregation), fireDetections.json (generated from NASA FIRMS)
│   ├── App.jsx             # Main mission control layout & state
│   └── index.css           # NASA mission control styling & animations
├── data/raw/               # Raw NASA FIRMS downloads (input for build:data)
├── scripts/build-data.mjs  # Raw FIRMS -> src/data/fireDetections.json
├── run.bat                 # Windows one-click runner
├── run.sh                  # Mac/Linux one-click runner
├── package.json            # Project dependencies
└── vite.config.js          # Vite build configuration
```

---
*Built with ❤️ by TEAM STERION for NASA Space Apps Challenge 2026.*
