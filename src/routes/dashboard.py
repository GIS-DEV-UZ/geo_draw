from flask import Blueprint, request
from src.views.dashboard_controller import add_field_view, map_view, fields_view

dashboard_route = Blueprint('dashboard_route', __name__, url_prefix='/dashboard')

@dashboard_route.route('/map')
def show_map():
    return map_view()

@dashboard_route.route('/fields')
def show_fields():
    return fields_view()

@dashboard_route.route('/fields/add-field')
def add_field():
    return add_field_view()