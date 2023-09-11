from json import loads
from flask import Blueprint, jsonify, request, redirect, url_for
from src.views.base_controller import home_view
from src.utils.extensions import oneid
from pprint import pprint
from src.models.user import User
import os
from flask_login import login_user, current_user
from src.utils.extensions import db
from src.models.line import Line
from src.models.polygon import Polygon 
from geoalchemy2 import functions

base_route = Blueprint('base_route', __name__, url_prefix='/')

@base_route.route('/')
def home():
    
    print(os)
    print(os.getenv('SECRET_KEY'))
    return home_view()


@base_route.route("/params", methods=['GET'])
def params():
    data = oneid.Params_To_Dict(request.args)
    user = User.query.filter_by(user_id=data['user_id']).first()
    if user:
        login_user(user)
        return redirect(url_for('dashboard_route.show_map'))
    else:
        user = User(user_id = data['user_id'],
                    email = data['email'],
                    first_name = data['first_name'],
                    sur_name = data['sur_name'],
                    full_name = data['full_name'],
                    birth_place = data['birth_place'],
                    birth_date = data['birth_date'],
                    pport_no = data['pport_no'],
                    mob_phone_no = data['mob_phone_no']
                    )
        user.save()
        login_user(user)
        return redirect(url_for('dashboard_route.show_map'))
    
@base_route.route("/get/geometries", methods=['GET', 'POST'])
def get_geometries():
    featureLayer = {
            "type": "FeatureCollection",
            "features": [],
        }
    polygons = db.session.query(Polygon.place_name, Polygon.crop_code, Polygon.place_area, Polygon.place_length, functions.ST_AsGeoJSON(Polygon.geometry), Polygon.id).filter_by(user_id = current_user.id).all()
    lines = db.session.query(Line.place_name, Line.place_length, functions.ST_AsGeoJSON(Line.geometry), Line.id).filter_by(user_id = current_user.id).all()

    if polygons or lines:  
        if polygons:          
            for poly in polygons:
                poly_obj = {
                    "type": "Feature",
                    "properties": {
                        "id" : poly[5],
                        "place_name" : poly[0],
                        "crop_code" : poly[1],
                        "place_area" : poly[2],
                        "place_length" : poly[3]
                    },
                    "geometry": loads(poly[4]),
                }
                featureLayer['features'].append(poly_obj)
        if lines:          
            for line in lines:
                line_obj = {
                    "type": "Feature",
                    "properties": {
                        "id" : line[3],
                        "place_name" : line[0],
                        "place_length" : line[1]
                    },
                    "geometry": loads(line[2]),
                }
                featureLayer['features'].append(line_obj)
        
        
        return jsonify(featureLayer)
    else:
        return jsonify({'data' : False})