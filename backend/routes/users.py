from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from supabase_client import supabase
from datetime import datetime
import pytz

users_bp = Blueprint('users', __name__)

def get_current_time_wita():
    wita_tz = pytz.timezone('Asia/Makassar')
    return datetime.now(wita_tz).isoformat()


# ========== REGISTER ==========
@users_bp.route('/api/users/register', methods=['POST'])
def register():
    data = request.get_json() or {}

    if not data.get('username') or not data.get('password') or not data.get('email'):
        return jsonify({'message': 'Username, password, and email are required'}), 400

    # Cek username sudah ada
    existing = supabase.table('user').select('user_id').eq('username', data['username']).execute()
    if existing.data:
        return jsonify({'message': 'Username already exists'}), 409

    # Cek email sudah ada
    existing_email = supabase.table('user').select('user_id').eq('email', data['email']).execute()
    if existing_email.data:
        return jsonify({'message': 'Email already exists'}), 409

    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')

    new_user = {
        'username': data['username'],
        'password': hashed_password,
        'email': data['email'],
        'first_name': data.get('first_name', ' '),
        'last_name': data.get('last_name', ' '),
        'role': data.get('role', 'User'),
        'address': data.get('address', ''),
        'phone': data.get('phone', ''),
        'date_added': get_current_time_wita(),
        'last_updated': get_current_time_wita(),
    }

    result = supabase.table('user').insert(new_user).execute()
    return jsonify({'message': 'User registered successfully'}), 201


# ========== LOGIN ==========
@users_bp.route('/api/users/login', methods=['POST'])
def login():
    data = request.get_json() or {}

    if not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Username and password are required'}), 400

    result = supabase.table('user').select('*').eq('username', data['username']).execute()
    user = result.data[0] if result.data else None

    if user and check_password_hash(user['password'], data['password']):
        access_token = create_access_token(identity=str(user['user_id']))

        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'username': user['username'],
            'role': user['role'],
            'user_id': user['user_id']
        }), 200

    return jsonify({'message': 'Invalid credentials'}), 401


# ========== UPDATE PROFILE ==========
@users_bp.route('/api/users/profile/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_profile(user_id):
    current_user_id = int(get_jwt_identity())
    if current_user_id != user_id:
        return jsonify({'message': 'Permission denied'}), 403

    data = request.get_json() or {}

    result = supabase.table('user').select('*').eq('user_id', user_id).execute()
    user = result.data[0] if result.data else None
    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Cek username unik
    new_username = data.get('username', user['username'])
    if new_username != user['username']:
        existing = supabase.table('user').select('user_id').eq('username', new_username).neq('user_id', user_id).execute()
        if existing.data:
            return jsonify({'message': 'Username already exists'}), 409

    update_data = {
        'username': new_username,
        'email': data.get('email', user['email']),
        'first_name': data.get('first_name', user['first_name']),
        'last_name': data.get('last_name', user['last_name']),
        'address': data.get('address', user['address']),
        'phone': data.get('phone', user['phone']),
        'last_updated': get_current_time_wita(),
    }

    supabase.table('user').update(update_data).eq('user_id', user_id).execute()
    return jsonify({'message': 'Profile updated successfully'}), 200


# ========== LOGOUT ==========
@users_bp.route('/api/users/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': 'Logged out successfully'}), 200


# ========== GET USER BY ID ==========
@users_bp.route('/api/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    result = supabase.table('user').select('*').eq('user_id', user_id).execute()
    user = result.data[0] if result.data else None

    if user:
        return jsonify({
            'user_id': user['user_id'],
            'username': user['username'],
            'email': user['email'],
            'first_name': user['first_name'],
            'last_name': user['last_name'],
            'address': user['address'],
            'phone': user['phone'],
            'role': user['role'],
            'date_added': user['date_added'],
            'last_updated': user['last_updated']
        }), 200
    return jsonify({'message': 'User not found'}), 404


# ========== GET ALL USERS ==========
@users_bp.route('/api/users', methods=['GET'])
def get_users():
    result = supabase.table('user').select('*').execute()
    if not result.data:
        return jsonify({'message': 'No users found'}), 404

    users = [{
        'user_id': u['user_id'],
        'username': u['username'],
        'email': u['email'],
        'first_name': u['first_name'],
        'last_name': u['last_name'],
        'address': u['address'],
        'phone': u['phone'],
        'role': u['role'],
        'date_added': u['date_added'],
        'last_updated': u['last_updated']
    } for u in result.data]

    return jsonify(users), 200


# ========== DELETE USER ==========
@users_bp.route('/api/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user_id = int(get_jwt_identity())

    # Cek role admin
    admin_result = supabase.table('user').select('role').eq('user_id', current_user_id).execute()
    admin = admin_result.data[0] if admin_result.data else None
    if not admin or admin['role'] != 'Admin':
        return jsonify({'message': 'Admin access required'}), 403

    # Cek user exists
    user_result = supabase.table('user').select('user_id').eq('user_id', user_id).execute()
    if not user_result.data:
        return jsonify({'message': 'User not found'}), 404

    supabase.table('user').delete().eq('user_id', user_id).execute()
    return jsonify({'message': 'User deleted successfully'}), 200