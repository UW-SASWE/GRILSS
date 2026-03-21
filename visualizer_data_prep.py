import json
import pandas as pd
import geopandas as gpd
import os
import glob
import re

def get_latest_version_dir(base_dir):
    dirs = glob.glob(os.path.join(base_dir, 'GRILSS_v*'))
    if not dirs:
        raise ValueError("No GRILSS version directory found.")
    
    def parse_version(d):
        m = re.search(r'v(\d+\.?\d*)', d)
        return float(m.group(1)) if m else 0.0
        
    dirs.sort(key=parse_version, reverse=True)
    return dirs[0]

def prepare_data():
    base_dir = '/Users/msanchit/Desktop/web_development/GRILSS'
    latest_dir = get_latest_version_dir(base_dir)
    print(f"Found latest dataset version: {os.path.basename(latest_dir)}")
    
    excel_files = glob.glob(os.path.join(latest_dir, 'Sedimentation_data/GRILSS_data_v*.xlsx'))
    dams_files = glob.glob(os.path.join(latest_dir, 'Vector_data/shapefile/dams_shapefile/GRILSS_dams_v*.shp'))
    catch_files = glob.glob(os.path.join(latest_dir, 'Vector_data/shapefile/catchments_shapefile/GRILSS_catchments_v*.shp'))
    res_files = glob.glob(os.path.join(latest_dir, 'Vector_data/shapefile/reservoirs_shapefile/GRILSS_reservoirs_v*.shp'))
    
    if not excel_files or not dams_files:
        print("Failed to find essential data files. Check directory structure.")
        return
        
    excel_path = excel_files[0]
    dams_shp_path = dams_files[0]
    
    public_dir = os.path.join(base_dir, 'visualizer/public')
    os.makedirs(public_dir, exist_ok=True)
    
    print(f"Reading {os.path.basename(excel_path)}...")
    df = pd.read_excel(excel_path)
    
    reservoir_data_map = {}
    
    for _, row in df.iterrows():
        rid = row['GRILSS RID']
        record = row.where(pd.notnull(row), None).to_dict()
        
        if rid not in reservoir_data_map:
            reservoir_data_map[rid] = {
                'Reservoir': record.get('Reservoir'),
                'Country': record.get('Country'),
                'Continent': record.get('Continent'),
                'Major River Basin': record.get('Major River Basin'),
                'Built Year': record.get('Built Year'),
                'Original Built Capacity (MCM)': record.get('Original Built Capacity (MCM)'),
                'Catchment Area (km^2)': record.get('Catchment Area (km^2)'),
                'observations': []
            }
            
        reservoir_data_map[rid]['observations'].append({
            'Observation Start Year': record.get('Observation Start Year'),
            'Observation End Year': record.get('Observation End Year'),
            'Sedimentation Rate (MCM/year)': record.get('Sedimentation Rate (MCM/year)'),
            'Capacity Loss Rate (%/year)': record.get('Capacity Loss Rate (%/year)'),
            'Capacity Loss (%)': record.get('Capacity Loss (%)'),
            'Sedimentation Amount (MCM)': record.get('Sedimentation Amount (MCM)'),
            'Observed Duration (years)': record.get('Observed Duration (years)'),
            'Survey Type': record.get('Survey Type')
        })
        
    print(f"Reading dams shapefile: {os.path.basename(dams_shp_path)}...")
    # Convert read shapefile safely to WGS84 just in case, then to GeoJSON dict
    dams_gdf = gpd.read_file(dams_shp_path)
    if not dams_gdf.crs or dams_gdf.crs.to_epsg() != 4326:
        dams_gdf = dams_gdf.to_crs(epsg=4326)
        
    dams_data = json.loads(dams_gdf.to_json())
        
    print("Merging grouped data into dams geojson properties...")
    features = dams_data.get('features', [])
    for feature in features:
        props = feature.get('properties', {})
        # Note: Shapefiles truncate column names to 10 chars usually!
        # If the column was 'GRILSS RID', in shapefile it might be 'GRILSS_RID' or 'GRILSS RID' or 'GRILSS_RI'.
        # Since GeoPandas parses the shapefile DBF, we should find the correct RID column.
        # It's safest to look for anything matching GRILSS RID
        rid = props.get('GRILSS RID') or props.get('GRILSS_RID') or props.get('GRILSS_RI')
        
        if rid in reservoir_data_map:
            res_data = reservoir_data_map[rid]
            for key, val in res_data.items():
                if key != 'observations':
                    if key not in props or pd.isnull(props[key]):
                        props[key] = val
            props['observations'] = res_data['observations']
            
            obs = res_data['observations']
            if len(obs) > 0:
                valid_loss = [o['Capacity Loss Rate (%/year)'] for o in obs if o['Capacity Loss Rate (%/year)'] is not None]
                if valid_loss:
                    props['Avg Capacity Loss Rate (%/year)'] = sum(valid_loss) / len(valid_loss)
                valid_sed = [o['Sedimentation Rate (MCM/year)'] for o in obs if o['Sedimentation Rate (MCM/year)'] is not None]
                if valid_sed:
                    props['Avg Sedimentation Rate (MCM/year)'] = sum(valid_sed) / len(valid_sed)
                    
            # Normalize property name so frontend can definitely find it
            props['GRILSS RID'] = rid 
                    
    out_path = os.path.join(public_dir, 'data.geojson')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(dams_data, f)
        
    os.makedirs(os.path.join(public_dir, 'catchments'), exist_ok=True)
    os.makedirs(os.path.join(public_dir, 'reservoirs'), exist_ok=True)
    
    if catch_files:
        print(f"Splitting catchments shapefile: {os.path.basename(catch_files[0])}...")
        catch_gdf = gpd.read_file(catch_files[0])
        if not catch_gdf.crs or catch_gdf.crs.to_epsg() != 4326:
            catch_gdf = catch_gdf.to_crs(epsg=4326)
        catch_data = json.loads(catch_gdf.to_json())
        
        for feat in catch_data.get('features', []):
            props = feat.get('properties', {})
            rid = props.get('GRILSS RID') or props.get('GRILSS_RID') or props.get('GRILSS_RI')
            if rid is not None:
                feat['properties']['GRILSS RID'] = rid
                out_f = os.path.join(public_dir, f'catchments/{rid}.geojson')
                with open(out_f, 'w', encoding='utf-8') as out:
                    json.dump(feat, out)
                    
    if res_files:
        print(f"Splitting reservoirs shapefile: {os.path.basename(res_files[0])}...")
        res_gdf = gpd.read_file(res_files[0])
        if not res_gdf.crs or res_gdf.crs.to_epsg() != 4326:
            res_gdf = res_gdf.to_crs(epsg=4326)
        res_data = json.loads(res_gdf.to_json())
        
        for feat in res_data.get('features', []):
            props = feat.get('properties', {})
            rid = props.get('GRILSS RID') or props.get('GRILSS_RID') or props.get('GRILSS_RI')
            if rid is not None:
                feat['properties']['GRILSS RID'] = rid
                out_f = os.path.join(public_dir, f'reservoirs/{rid}.geojson')
                with open(out_f, 'w', encoding='utf-8') as out:
                    json.dump(feat, out)

    print("Data successfully mapped and split from SHAPEFILES!")

if __name__ == '__main__':
    prepare_data()
