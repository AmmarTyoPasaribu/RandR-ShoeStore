# Vercel Serverless Function Entry Point
import sys
import os

# Add backend folder to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import Flask app
from app import app

# Handler for Vercel
def handler(request):
    return app(request.environ, lambda status, headers: None)

# Export handler for Vercel
app.handler = handler

# For Vercel serverless functions
from flask import Flask, jsonify

# Create a new app instance for serverless
app = Flask(__name__)

# Import config
from config import Config
app.config.from_object(Config)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = '9b1df6b4d7f2c3b58d1b6398c0f47a9a7a3e8d2b4f6a1e3f'
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False

# Database and extensions
from models import db
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager

db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# CORS for Vercel
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://your-vercel-app.vercel.app", "http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

# Import all blueprints
from routes.users import users_bp
from routes.orders import orders_bp
from routes.payments import payments_bp
from routes.shoes import shoes_bp
from routes.categories import categories_bp
from routes.cart import cart_bp
from routes.wishlist import wishlist_bp
from routes.userInteraction import user_interaction_bp
from routes.shoeRecomendation import shoe_recommendation_bp

# Register blueprints
app.register_blueprint(users_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(payments_bp)
app.register_blueprint(shoes_bp)
app.register_blueprint(categories_bp)
app.register_blueprint(cart_bp)
app.register_blueprint(wishlist_bp)
app.register_blueprint(user_interaction_bp)
app.register_blueprint(shoe_recommendation_bp)

# Main handler for Vercel
def lambda_handler(event, context):
    # This is for AWS Lambda, but Vercel uses a different approach
    pass

# Export the app for Vercel
def handler(request):
    return app(request.environ, lambda status, headers: None)