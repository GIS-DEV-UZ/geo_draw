from json import loads
import os
from flask import send_from_directory
from flask_login import current_user
from src.models.base import Base
from src.utils.extensions import db
from geoalchemy2 import Geometry, WKTElement
from geoalchemy2 import functions

# from src.models.user import User

class Polygon(Base):
    __tablname__ = 'polygon'

    # user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    place_name = db.Column(db.String(255))
    crop_code = db.Column(db.String(255))
    place_area = db.Column(db.Float())
    geometry = db.Column(Geometry('MULTIPOLYGON', srid=4326))
    
    # def __repr__(self):
    #     return self.user_id

    @classmethod
    def create(cls, **kwargs):
        polygon = cls(**{ k: v if k != 'geometry' else functions.ST_GeomFromGeoJSON(v, srid=4326) for k, v in kwargs.items() })
        db.session.add(polygon)
        db.session.commit()
        return polygon
        
    def delete(self):
        db.session.delete(self)
        db.session.commit()

    @classmethod
    def get(cls):
        featureLayer = {
            "type": "FeatureCollection",
            "features": [],
        }
        polygons = db.session.query(cls.place_name, cls.crop_code, cls.place_area, functions.ST_AsGeoJSON(cls.geometry), cls.id).filter_by(user_id = current_user.id).all()
        if polygons:            
            for poly in polygons:
                poly_obj = {
                    "type": "Feature",
                    "properties": {
                        "id" : poly[4],
                        "place_name" : poly[0],
                        "crop_code" : poly[1],
                        "place_area" : poly[2],
                    },
                    "geometry": loads(poly[3]),
                }
                featureLayer['features'].append(poly_obj)
            
            
            return featureLayer
        else:
            return False
    
    def get_image(self):
        from src.routes.polygon import draw_polygon_coordinates
        
        if not os.path.exists(f"src/uploads/{self.id}.png"):
            geometry = db.session.query(functions.ST_AsGeoJSON(self.geometry)).filter(Polygon.id == self.id).first()
            if geometry is None:
                return None
            geometry = loads(geometry[0])
            draw_polygon_coordinates(geometry['coordinates'][0][0], self.id)
        return send_from_directory("uploads", f"{self.id}.png")
        