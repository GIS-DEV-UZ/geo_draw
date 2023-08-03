from decouple import config

class Config():
    SECRET_KEY = config('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = config('SQLALCHEMY_DATABASE_URI')
    
    ONEID_LOGIN = config('ONEID_LOGIN')
    ONEID_PASSWORD = config('ONEID_PASSWORD')
    ONEID_URL = config('ONEID_URL')
    
    HOST = config('HOST')
    PORT = config('PORT', cast=int)

class ProdConfig(Config):
    # SQLALCHEMY_DATABASE_URI = config('SQLALCHEMY_DATABASE_URI')
    pass

class TestConfig(Config):
    pass

class DevConfig(Config):
    DEBUG = True