from flask import Flask, url_for
from src.utils.extensions import register_blueprints, register_extensions
from src.utils.filter_plugins import register_filters
from src.utils.extensions import oneid

def create_app(config:str):
    app = Flask(__name__)

    if config in ['dev', 'prod', 'test']:
        app.config.from_object(f"src.config.config.{config.capitalize()}Config")
        
    register_blueprints(app)
    register_extensions(app)
    register_filters(app)
    register_filters(app)
    
    with app.app_context():
        from src.utils.extensions import db
        from src.models.user import User

        # db.drop_all()
        db.create_all()
        
    with app.test_request_context():
        oneid.Set_Callback(url_for('base_route.params'))
    
    return app