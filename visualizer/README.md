# GRILSS Visualizer

This represents the official web-based interactive frontend for exploring the **GRILSS (Global Reservoir Inventory of Lost Storage by Sedimentation)** dataset! 

It was built and engineered using the **AntiGravity Agentic AI Tool**. It parses robust Shapefiles and outputs a stunning, native mapping experience powered by Vite, Vanilla JS, and Leaflet. 

## 🗺️ How it works
The raw `.shp` files provided by the GRILSS database are incredibly rich but extremely heavy (130MB+ for geometries alone). To allow this visualizer to run natively and swiftly inside a standard web browser on GitHub Pages without crashing, it relies on a Python pipeline.
The included python script, `visualizer_data_prep.py`, reads the Excel Tabular Data + Geographical Shapefiles using `pandas` and `geopandas`, intelligently aggregates all multi-period observation history by Dam, and dynamically chunks out individual geometry `.geojson` files into `visualizer/public/`. 
The frontend map therefore only ever requests the *exact* catchment or reservoir geometry you actively click on!

## 🚀 How to Upgrade to Future Versions (v1.3+)
This tool is entirely **future-proofed**. When the next GRILSS dataset drops:
1. Drop the new `GRILSS_v1.3` folder straight into the project root alongside `visualizer/`.
2. Ensure the standard folder structure inside remains similar (`Sedimentation_data/GRILSS_data_v1.3.xlsx`, `Vector_data/shapefile/dams_shapefile/...`).
3. Run the python script locally:
   ```bash
   cd ..
   python3 visualizer_data_prep.py
   ```
   The script is programmed to automatically scan your parent folder, find the **highest** indexed version (e.g., `v1.3`), ingest it via Shapefiles, process the tables, and seamlessly overwrite the generated files securely into `visualizer/public/` without breaking any of the web logic!
4. Boot up the app to test it via `npm run dev`.
