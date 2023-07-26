from flask import Blueprint, request, redirect, url_for
from src.views.base_controller import home_view
from src.utils.extensions import oneid
from pprint import pprint
from src.models.user import User
import os
from flask_login import login_user

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