import json
from flask import Blueprint, jsonify, request
from flask_login import current_user
from src.models.line import Line

line_route = Blueprint('line_route', __name__, url_prefix='/api/line')



@line_route.route('/save', methods=['GET', 'POST'])
def line_save():
    if request.method == 'POST':
        req_data = request.get_json()
        print(req_data)
        place_name = req_data['field_name']
        place_length = req_data['line_length']
        geometry = req_data['geometry']
            
        line = Line.create(user_id=current_user.id, place_name=place_name, place_length=place_length, geometry=json.dumps(geometry))
        
        # draw_polygon_coordinates(geometry['coordinates'][0][0], polygon.id)
        
        obj = {
            "success": True, 
            "polygon_id" : line.id,
            "place_name" : line.place_name,
            "place_length" : line.place_length
        }

    return jsonify(obj)