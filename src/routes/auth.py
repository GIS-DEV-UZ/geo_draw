from flask import Blueprint
from src.views.auth_controller import auth_view

auth_route = Blueprint('auth_route', __name__, url_prefix='/auth')

@auth_route.route('/login')
def user_login():
    return auth_view()
