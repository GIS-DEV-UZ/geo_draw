from flask import Blueprint, jsonify, request, abort, send_from_directory
from flask_login import current_user
from src.models.polygon import Polygon
import json
import datetime
from geoalchemy2 import functions, elements
import matplotlib
import matplotlib.pyplot as plt
matplotlib.use('Agg')
from matplotlib.patches import Polygon as MT_Polygon
from src.utils.extensions import db
from sqlalchemy import text
from shapely.geometry import shape, Polygon as Poly

polygon_route = Blueprint('polygon_route', __name__, url_prefix='/api/polygon')

def draw_polygon_coordinates(coordinates, file_name):
    print(coordinates)
    
    # PNG fayl nomini o'zgartiring
    output_file = f"src/uploads/{file_name}.png"
    
    fig, ax = plt.subplots()
    polygon = MT_Polygon(coordinates,edgecolor='black',
                #  facecolor=None,
                 color='#38d9a9',
                 linewidth=None,
                 linestyle=None,
                 antialiased=None,
                 hatch=None,
                 
                 joinstyle=None,)
    ax.add_patch(polygon)
    ax.autoscale_view()

    # PNG rasmni saqlash
    plt.axis('off')
    plt.style.use('classic')
    plt.savefig(output_file, format='png', bbox_inches="tight", pad_inches = 0, transparent=True)
    plt.close(fig)

@polygon_route.route('/save', methods=['GET', 'POST'])
def polygon_save():
    if request.method == 'POST':
        req_data = request.get_json()
        place_name = req_data['field_name']
        crop_code = req_data['crop_code']
        place_area = req_data['field_area']
        geometry = req_data['geometry']
        
        if geometry['type'] == 'Polygon':
            geometry['coordinates'] = [geometry['coordinates']]
            geometry['type'] = 'MultiPolygon'
            
        polygon = Polygon.create(user_id=current_user.id, place_name=place_name, crop_code=crop_code, place_area=place_area, geometry=json.dumps(geometry))
        
        draw_polygon_coordinates(geometry['coordinates'][0][0], polygon.id)
        
        obj = {
            "success": True, 
            "polygon_id" : polygon.id,
            "place_name" : polygon.place_name,
            "crop_name" : polygon.crop_code,
            "place_area" : polygon.place_area
        }
    return jsonify(obj)


@polygon_route.route('/get', methods=['GET', 'POST'])
def get_polygon():
    data = Polygon.get()
    return jsonify(data)


@polygon_route.route('/get/<int:field_id>', methods=['GET', 'POST'])
def get_info_polygon(field_id):
    field = db.session.query(Polygon).filter_by(id=field_id).first()
    field_obj = {
        "place_name" : field.place_name,
        "crop_code" : field.crop_code,
        "id" : field.id
    }
    return jsonify(field_obj)


@polygon_route.route('/<int:poly_id>/image', methods=['GET', 'POST'])
def get_polygon_image(poly_id):
    return send_from_directory("uploads", f"{poly_id}.png")

    
@polygon_route.route('/draw', methods=['GET', 'POST'])
def polygon_draw():
    if request.method == 'POST':
        req_data = request.get_json()
        geometry = req_data['geometry']
        print(geometry)
        if geometry['type'] == 'Polygon':
            geometry['coordinates'] = [geometry['coordinates']]
            geometry['type'] = 'MultiPolygon'
        elif geometry['type'] == 'LineString':
            pass
        
        current_time = datetime.datetime.now()
        image_id = f"{current_time.minute}{current_time.second}{current_time.microsecond}"
        draw_polygon_coordinates(geometry['coordinates'][0][0], image_id)
        return jsonify(image_id)


@polygon_route.route('/area', methods=['GET', 'POST'])
def get_polygon_area():
    if request.method == 'POST':
        coordinates = request.get_json()
        field_area = db.session.query(functions.ST_Area(functions.ST_GeomFromGeoJSON(json.dumps({
                        "type": "MultiPolygon",
                        "coordinates": [coordinates]
                     }))) ).first()[0] * 1000000
        
        # field_perimeter = db.session.query(functions.ST_Perimeter(functions.ST_GeomFromGeoJSON(json.dumps({
        #                 "type": "MultiPolygon",
        #                 "coordinates": [coordinates]
        #              }))) ).first()[0] * 100000
        polygon = Poly(coordinates[0])
        wkt_polygon = f"POLYGON ({', '.join([f'{lon} {lat}' for lon, lat in coordinates[0]])})"
        geo_polygon  = functions.ST_GeomFromText(wkt_polygon)
        # field_perimeter = functions.ST_Perimeter(geo_polygon)
        print(polygon)
        print(wkt_polygon)
        print(geo_polygon)
        print(functions.ST_AsText(polygon))
        return jsonify(field_area)
    

@polygon_route.route('/update/<int:field_id>', methods=['PUT'])
def update_polygon(field_id):
    if request.method == 'PUT':
        req_data = request.get_json()
        field = db.session.query(Polygon).filter_by(id=field_id).first()
        field.place_name = req_data['field_name']
        field.crop_code = req_data['crop_code']
        field.place_area = req_data['field_area']        
        
        geometry = req_data['geometry']
        if geometry['type'] == 'Polygon':
            geometry['coordinates'] = [geometry['coordinates']]
            geometry['type'] = 'MultiPolygon'
        
        geometry = shape(geometry)
        field.geometry = elements.WKBElement(geometry.wkb, srid=4326)
        db.session.commit()
        return jsonify('Polygon updated')


@polygon_route.route('/delete/<int:field_id>')
def delete_polygon(field_id):
    deletable_polygon = db.session.query(Polygon).filter_by(id=field_id).first()
    db.session.delete(deletable_polygon)
    db.session.commit()
    return jsonify('Polygon deleted')



# @polygon_route.route('/perimeter')

# @polygon_route.route('/perimeter', methods=['GET', 'POST'])
# def get_polygon_area():
#     if request.method == 'POST':
#         coordinates = request.get_json()
#         field_perimeter = db.session.query(functions.ST_Perimeter(functions.ST_GeomFromGeoJSON(json.dumps({
#                         "type": "MultiPolygon",
#                         "coordinates": [coordinates]
#                      }))) ).first()[0] * 1000000
#         return jsonify(field_perimeter)