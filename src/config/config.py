class Config():
    SECRET_KEY = '2ae0a61787937e86297484b3051424dc'
    SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg2://postgres:eladmin@127.0.0.1:5432/geo-draw'
    
    ONEID_LOGIN = "at_agrosanoat_markazi"
    ONEID_PASSWORD = "nCeV5BFAcruvPxW9sK721qdR"
    ONEID_URL = "https://sso.egov.uz/sso/oauth/Authorization.do" 
    
    HOST = '0.0.0.0'
    PORT = 5001

class ProdConfig(Config):
    SQLALCHEMY_DATABASE_URI = 'postgresql://geo_draw_admin:Geo-draw2023@blurcode.uz:5432/geo_draw'

class TestConfig(Config):
    pass

class DevConfig(Config):
    DEBUG = True