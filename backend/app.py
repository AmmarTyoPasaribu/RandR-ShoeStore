# app.py
import os
from dotenv import load_dotenv

load_dotenv()
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# import semua blueprint
from routes.users import users_bp
from routes.orders import orders_bp
from routes.payments import payments_bp
from routes.shoes import shoes_bp
from routes.categories import categories_bp
from routes.cart import cart_bp
from routes.wishlist import wishlist_bp
from routes.userInteraction import user_interaction_bp
from routes.shoeRecomendation import shoe_recommendation_bp

# Inisialisasi aplikasi Flask
app = Flask(__name__)

# Konfigurasi untuk JWT
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', '9b1df6b4d7f2c3b58d1b6398c0f47a9a7a3e8d2b4f6a1e3f')
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # Token never expires

# Inisialisasi JWTManager
jwt = JWTManager(app)

# CORS Configuration
if os.environ.get('RAILWAY_ENVIRONMENT'):
    allowed_origins = [
        "https://rnr-webstore-6g88xzlnr-mahendra-kirana-mbs-projects.vercel.app",
        "https://rnr-webstore-3pybq4g06-mahendra-kirana-mbs-projects.vercel.app",
        "https://rnr-webstore-bofx44evs-mahendra-kirana-mbs-projects.vercel.app",
        "*.vercel.app"
    ]
else:
    allowed_origins = ["http://localhost:3000"]

CORS(app, resources={
    r"/api/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True,
        "max_age": 3600
    }
})


# =============== ROUTE KHUSUS TRAINING ===============
@app.route('/api/train_recommendation', methods=['POST'])
def train_recommendation():
    from data_training import train_nmf_model
    try:
        result = train_nmf_model()
        if result and result.get('status') == 'skipped':
            return jsonify(result), 200
        return jsonify(result or {"message": "Model training successfully completed!"}), 200
    except Exception as e:
        app.logger.error(f'Error saat melatih model: {str(e)}')
        return jsonify({"error": str(e)}), 500


# =============== ROOT ROUTE FOR HEALTHCHECK ===============
@app.route('/')
def health_check():
    return jsonify({
        "status": "ok",
        "message": "RNR Backend API is running!",
        "service": "RNR Webstore Backend",
        "version": "2.0.0"
    }), 200

# =============== REGISTER BLUEPRINTS ===============
app.register_blueprint(users_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(payments_bp)
app.register_blueprint(shoes_bp)
app.register_blueprint(categories_bp)
app.register_blueprint(cart_bp)
app.register_blueprint(wishlist_bp)
app.register_blueprint(user_interaction_bp)
app.register_blueprint(shoe_recommendation_bp)


# =============== GLOBAL ERROR HANDLER ===============
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"message": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"message": "Internal server error"}), 500


# =============== JWT ERROR HANDLERS ===============
@jwt.unauthorized_loader
def missing_token_callback(err):
    return jsonify({"message": "Missing Authorization Header", "detail": str(err)}), 401

@jwt.invalid_token_loader
def invalid_token_callback(err):
    return jsonify({"message": "Invalid token", "detail": str(err)}), 422

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"message": "Token has expired"}), 401

@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    return jsonify({"message": "Token has been revoked"}), 401


# =============== ENTRY POINT ===============
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("\nStarting Flask Server...")
    print(f"JWT_SECRET_KEY configured: {'OK' if app.config.get('JWT_SECRET_KEY') else 'MISSING'}")
    print(f"SUPABASE_URL: {os.environ.get('SUPABASE_URL', 'NOT SET')}")
    print(f"Environment: {'Production' if os.environ.get('RAILWAY_ENVIRONMENT') else 'Development'}")
    print(f"Server running on: http://0.0.0.0:{port}\n")
    debug_mode = False if os.environ.get('RAILWAY_ENVIRONMENT') else True
    app.run(host='0.0.0.0', port=port, debug=debug_mode)