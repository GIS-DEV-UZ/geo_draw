from src.utils.extensions import db
from datetime import datetime

class Base(db.Model):
    
    __abstract__ = True
    
    id = db.Column(db.Integer(), primary_key=True)
    created_at = db.Column(db.DateTime(), default=datetime.now())
    updated_at = db.Column(db.DateTime(), default=datetime.now(), onupdate=datetime.now())