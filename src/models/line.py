from json import loads
import os
from flask import send_from_directory
from flask_login import current_user
from src.models.base import Base
from src.utils.extensions import db
from geoalchemy2 import Geometry, WKTElement
from geoalchemy2 import functions

# from src.models.user import User

class Line(Base):
    __tablname__ = 'line'

    # user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    place_name = db.Column(db.String(255))
    place_length = db.Column(db.Float())
    geometry = db.Column(Geometry('LINESTRING', srid=4326))


    @classmethod
    def create(cls, **kwargs):
        line = cls(**{ k: v if k != 'geometry' else functions.ST_GeomFromGeoJSON(v, srid=4326) for k, v in kwargs.items() })
        db.session.add(line)
        db.session.commit()
        return line
        
    def delete(self):
        db.session.delete(self)
        db.session.commit()

    # @classmethod
    # def get(cls):
    #     featureLayer = {
    #         "type": "FeatureCollection",
    #         "features": [],
    #     }
    #     polygons = db.session.query(cls.place_name, cls.crop_code, cls.place_area, functions.ST_AsGeoJSON(cls.geometry), cls.id).filter_by(user_id = current_user.id).all()
    #     if polygons:            
    #         for poly in polygons:
    #             poly_obj = {
    #                 "type": "Feature",
    #                 "properties": {
    #                     "id" : poly[4],
    #                     "place_name" : poly[0],
    #                     "crop_code" : poly[1],
    #                     "place_area" : poly[2],
    #                 },
    #                 "geometry": loads(poly[3]),
    #             }
    #             featureLayer['features'].append(poly_obj)
            
            
    #         return featureLayer
    #     else:
    #         return False