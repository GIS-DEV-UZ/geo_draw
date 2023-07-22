from src.models.base import Base
from src.utils.extensions import db
from flask_login import UserMixin

class User(Base, UserMixin):
    __tablename__ = 'user'

    user_id = db.Column(db.String(50), unique=True)
    email = db.Column(db.String(50), unique=True)
    first_name = db.Column(db.String(50))
    sur_name = db.Column(db.String(50))
    full_name = db.Column(db.String(100))
    birth_place = db.Column(db.String(50))
    birth_date = db.Column(db.DateTime())
    pport_no = db.Column(db.String(50), unique=True)
    mob_phone_no = db.Column(db.String(50))
    
    def save(self):
        db.session.add(self)
        db.session.commit()
    