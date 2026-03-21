![GRILSS Logo](https://github.com/UW-SASWE/GRILSS/blob/main/visualizer/public/GRILSS_logo.png)

# GRILSS: Global Reservoir Inventory of Lost Storage by Sedimentation

![AGU Award](https://img.shields.io/badge/🏆_Awarded-Impactful_Earth_Science_Dataset_(AGU)-gold)
![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-coral.svg)
![Version](https://img.shields.io/badge/Version-1.2-turquoise)
![Open Access](https://img.shields.io/badge/Open%20Access-Available-blue)
![Free Data](https://img.shields.io/badge/Free%20Data-Available-green)
![Open Source](https://img.shields.io/badge/Open%20Source-Available-brightgreen)


**Award**: Impactful Earth Science Dataset — [American Geophysical Union (AGU)](https://www.agu.org)  
**Version**: 1.2  
**Release Date**: 10 February, 2025  
**Authors**: Sanchit Minocha and Faisal Hossain  
**Affiliation**: Department of Civil and Environmental Engineering, University of Washington, Seattle, WA 98105, US  
**License**: CC BY 4.0  

---

## Overview

The **Global Reservoir Inventory of Lost Storage by Sedimentation (GRILSS)** dataset provides open-source data on sedimentation and capacity loss for 1,013 reservoirs in 75 major river basins across 54 countries. This dataset serves as a critical resource for studying reservoir sedimentation, which affects the storage capacity of artificial reservoirs, with implications for water management, environmental sustainability, and infrastructure planning.

The dataset consists of two main components: sedimentation data and spatial vector data, allowing for detailed geospatial analysis of reservoirs, dams, and catchments worldwide. The data is intended to support sediment management strategies, research, and future contributions from the community.

## Visualizer

The GRILSS visualizer is a web-based interactive frontend for exploring the GRILSS dataset created using AntiGravity Agentic AI Tool. It allows users to explore the dataset and visualize the capacity loss and sedimentation information of over thousand reservoirs worldwide on an interactive map. The visualizer is built using [Vite](https://vitejs.dev/), [Vanilla JS](https://developer.mozilla.org/en-US/docs/Web/JavaScript), and [Leaflet](https://leafletjs.com/). It is deployed on GitHub Pages. 

🔗 **GRILSS Visualizer:** [https://uw-saswe.github.io/GRILSS/](https://uw-saswe.github.io/GRILSS/)

---

## File Structure

`GRILSS_v1.2.zip` contains the following directories and files:

1. **Sedimentation_data**  
   - `GRILSS_data_v1.2.xlsx`: Contains sedimentation data, with detailed fields described in the table below.

2. **Vector_data**  
   - **geojson** folder:
     - `GRILSS_reservoirs_v1.2.geojson`: Reservoir boundary polygons.
     - `GRILSS_dams_v1.2.geojson`: Dam point locations.
     - `GRILSS_catchments_v1.2.geojson`: Catchment polygons.
     - `GRILSS_dam_sp_pts_v1.2.geojson`: Snap point locations corresponding to dam locations to create catchment polygons.
   
   - **shapefile** folder:
     - `/reservoirs_shapefile/GRILSS_reservoirs_v1.2.shp`: Reservoir boundary polygons (Shapefile format).
     - `/dams_shapefile/GRILSS_dams_v1.2.shp`: Dam point locations (Shapefile format).
     - `/catchments_shapefile/GRILSS_catchments_v1.2.shp`: Catchment polygons (Shapefile format).
     - `/catchments_shapefile/GRILSS_dam_sp_pts_v1.2.shp`: Snap point locations corresponding to dam locations to create catchment polygons. (Shapefile format).

---

## GRILSS_data_v1.2.xlsx Field Descriptions

| **Field Name**                | **Description**                                                        | **Units**                   | **Data Type**      |
|-------------------------------|------------------------------------------------------------------------|-----------------------------|--------------------|
| GRILSS OID                     | Unique identifier for each sedimentation record                        | -                           | Integer            |
| GRILSS RID                     | Unique identifier for each reservoir                                   | -                           | Integer            |
| Reservoir                      | Name of the reservoir                                                  | -                           | String             |
| Country                        | Country where the reservoir is located                                 | -                           | String             |
| HYBAS_ID                       | HydroSHEDS ID for the major basin containing the reservoir              | -                           | Integer            |
| Major River Basin              | Name of the major river basin (unique to each HYBAS_ID)                | -                           | String             |
| Continent                      | Continent where the reservoir is located                               | -                           | String             |
| Capacity Loss Rate (%/year)    | Annual rate of capacity loss                                           | %/year                      | Float              |
| Sedimentation Rate (MCM/year)  | Annual sedimentation rate                                              | Million cubic meters/year    | Float              |
| Capacity Loss (%)              | Percentage of original capacity lost                                   | %                           | Float              |
| Sedimentation Amount (MT)      | Total sediment deposited                                               | Million tons                | Float              |
| Sedimentation Amount (MCM)     | Volume of sediment deposited                                           | Million cubic meters         | Float              |
| Sediment Bulk Density (ton/m^3) | Bulk density of sediment                                               | Tons/cubic meter             | Float              |
| Observed Duration (years)      | Duration over which sedimentation was measured                         | Years                       | Integer            |
| Observation End Year           | Year when sedimentation observation ended                              | -                           | Integer            |
| Observation Start Year         | Year when sedimentation observation began                              | -                           | Integer            |
| Built Year                     | Year of reservoir construction                                         | -                           | Integer            |
| Original Built Capacity (MCM)  | Original capacity at time of construction                              | Million cubic meters         | Float              |
| Catchment Area (km^2)           | Catchment area of the reservoir                                        | Square kilometers            | Float              |
| Height (m)                     | Height of the reservoir's impoundment                                  | Meters                      | Float              |
| Latitude                       | Latitude coordinate of the dam                                         | Degrees                     | Float              |
| Longitude                      | Longitude coordinate of the dam                                        | Degrees                     | Float              |
| Survey Type                    | Method used to estimate sedimentation volume (BS-Bathymetric Survey, RS-Remote Sensing, NM-Numerical Modeling)              | -                           | String             |
| Type of Storage                | Type of reservoir storage for sedimentation estimate (Gross or Live)   | -                           | String             |
| Comments                       | Additional information                                                 | -                           | String             |
| Original Source URL            | URL of the original data source                                        | -                           | String             |
| Fields Corrected               | Names of fields manually corrected                                     | -                           | String             |
| Fields Computed                | Names of fields computed for this record                               | -                           | String             |
| GDAT Dam Name                  | Name of the dam in the GDAT dataset                                    | -                           | String             |
| GDAT Feature_ID                | Feature ID in the GDAT dataset                                         | -                           | Integer            |
| GRAND_ID                       | Reservoir ID in the GRanD database                                     | -                           | Integer            |
| GRAND Wrong Location           | Flag indicating incorrect dam coordinates in GRanD                     | -                           | Boolean (0/1)      |
| GDAT Wrong Location            | Flag indicating incorrect dam coordinates in GDAT                      | -                           | Boolean (0/1)      |
| Dam Removed or Dried           | Flag indicating if the reservoir is removed or dried                   | -                           | Boolean (0/1)      |
| Creek Dam                      | Flag indicating if the dam is classified as a creek dam                | -                           | Boolean (0/1)      |

---

## Vector Data Field Descriptions

1. **Reservoir Vector Data (GRILSS_reservoirs_v1.2.geojson/.shp)**
   - GRILSS RID: Unique reservoir ID.
   - Reservoir: Reservoir name.
   - Country: Country of the reservoir.
   - Cap (MCM): Original built capacity in Million Cubic Meters.
   - Height (m): Height of the reservoir impoundment in meters.
   - Geometry: Polygon representing reservoir boundaries.

2. **Dam Vector Data (GRILSS_dams_v1.2.geojson/.shp)**
   - GRILSS RID: Unique reservoir ID.
   - Reservoir: Reservoir name.
   - Country: Country of the dam.
   - Latitude: Latitude of the dam.
   - Longitude: Longitude of the dam.
   - Geometry: Point representing the dam location.

3. **Catchment Vector Data (GRILSS_catchments_v1.2.geojson/.shp)**
   - GRILSS RID: Unique reservoir ID.
   - Reservoir: Reservoir name.
   - Country: Country of the catchment.
   - CA_AreaKm2: Computed catchment area in square kilometers (can be different from Catchment Area (Km^2) in GRILSS_data.xlsx).
   - Geometry: Polygon representing catchment boundaries.

4. **Dam Snap Point Vector Data (GRILSS_dam_sp_pts_v1.2.geojson/.shp)**
   - GRILSS RID: Unique reservoir ID.
   - Reservoir: Reservoir name.
   - Country: Country of the dam.
   - Latitude: Latitude of the dam.
   - Longitude: Longitude of the dam.
   - Geometry: Point representing the snap point for the dam to create catchment polygons.


---

## Usage Instructions

1. **Download and Extract**: Download the `GRILSS_v1.2.zip` file and extract its contents.
2. **Sedimentation Data**: Use `GRILSS_data_v1.2.xlsx` for detailed sedimentation records. Open it in Excel or any compatible software.
3. **Vector Data**: Import the GeoJSON or Shapefile data into GIS software (such as QGIS or ArcGIS) for geospatial analysis of reservoir boundaries, dams, and catchment areas.

---

## Applications

- **Reservoir Management**: Analyze trends in sedimentation and capacity loss for informed management decisions.
- **Global and Regional Studies**: Examine sedimentation patterns across different regions, river basins, and countries.
- **Environmental Impact Research**: Investigate how land use changes and climate variations influence sedimentation in reservoirs.

---

## Version Updates

v1.1 (2025-02-10): Initial release.

v1.2 (2025-09-26): Corrected catchments polygons for some reservoirs.

---

## License

The dataset is distributed under the **Creative Commons Attribution 4.0 International License (CC BY 4.0)**. You are free to share, adapt, and build upon this dataset, provided you give appropriate credit.

---

## Citation

If you use this dataset in your work, please cite it as follows:

- Minocha, S., & Hossain, F. (2025, February 10). GRILSS [Dataset]. Retrieved from [osf.io/w4ug8](https://osf.io/w4ug8/).
- Minocha, S., & Hossain, F., 2025. GRILSS: opening the gateway to global reservoir sedimentation data curation. Earth Syst. Sci. Data 17(4), 1743–1759. [https://doi.org/10.5194/essd-17-1743-2025](https://doi.org/10.5194/essd-17-1743-2025).

---

## Contact

For any inquiries or support, please contact:  
Faisal Hossain  (fhossain@uw.edu)  <br>
Sanchit Minocha  (msanchit@uw.edu)  <br>
Email: saswe@uw.edu  <br>
Affiliation: Department of Civil and Environmental Engineering, University of Washington, Seattle, WA 98105, US
