from flask import request
from flask_sqlalchemy import SQLAlchemy
from flask_oneid import OneID
from flask_login import LoginManager


db = SQLAlchemy()
oneid = OneID()
login_manager = LoginManager()

def register_extensions(app):
    db.init_app(app)
    oneid.init_app(app)
    login_manager.init_app(app)
    

    @login_manager.user_loader
    def load_user(id):
        from src.models.user import User
        return User.query.get(id)

def register_blueprints(app):
    from src.routes.base import base_route
    from src.routes.auth import auth_route
    from src.routes.dashboard import dashboard_route 
    from src.routes.polygon import polygon_route 
    from src.routes.line import line_route

    app.register_blueprint(base_route)
    app.register_blueprint(auth_route)
    app.register_blueprint(dashboard_route)
    app.register_blueprint(polygon_route)
    app.register_blueprint(line_route)