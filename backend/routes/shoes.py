from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
from werkzeug.security import check_password_hash
from supabase_client import supabase
from datetime import datetime
import pytz

shoes_bp = Blueprint('shoes', __name__)

def get_current_time_wita():
    wita_tz = pytz.timezone('Asia/Makassar')
    return datetime.now(wita_tz).isoformat()


# ============================
# LOGIN – GENERATE JWT TOKEN
# ============================
@shoes_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username dan password wajib diisi'}), 400

    result = supabase.table('user').select('*').eq('username', username).execute()
    user = result.data[0] if result.data else None

    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401

    if not check_password_hash(user['password'], password):
        return jsonify({'message': 'Invalid credentials'}), 401

    user_id = user.get('user_id') or user.get('id_user') or user.get('id')
    if user_id is None:
        return jsonify({'message': 'User ID not found'}), 500

    access_token = create_access_token(identity=str(user_id))
    return jsonify(access_token=access_token), 200


# ============================
# CRUD SHOE DETAIL
# ============================

@shoes_bp.route('/api/shoes', methods=['POST'])
@jwt_required()
def add_shoe_detail():
    data = request.get_json() or {}
    required_fields = ['category_id', 'shoe_name', 'shoe_price', 'shoe_size', 'stock']
    missing = [f for f in required_fields if f not in data]
    if missing:
        return jsonify({'message': f'Field berikut wajib diisi: {", ".join(missing)}'}), 400

    # Cek category exists
    cat_result = supabase.table('shoe_category').select('category_id').eq('category_id', data['category_id']).execute()
    if not cat_result.data:
        return jsonify({'message': 'Category ID does not exist'}), 400

    new_shoe = {
        'category_id': data['category_id'],
        'shoe_name': data['shoe_name'],
        'shoe_price': data['shoe_price'],
        'shoe_size': data['shoe_size'],
        'stock': data['stock'],
        'date_added': get_current_time_wita(),
        'last_updated': get_current_time_wita()
    }

    result = supabase.table('shoe_detail').insert(new_shoe).execute()
    return jsonify({
        'message': 'Shoe detail added successfully',
        'shoe_detail_id': result.data[0]['shoe_detail_id'] if result.data else None
    }), 201


@shoes_bp.route('/api/shoes/<int:shoe_detail_id>', methods=['PUT'])
@jwt_required()
def update_shoe_detail(shoe_detail_id):
    data = request.get_json() or {}

    result = supabase.table('shoe_detail').select('*').eq('shoe_detail_id', shoe_detail_id).execute()
    shoe = result.data[0] if result.data else None
    if not shoe:
        return jsonify({'message': 'Shoe detail not found'}), 404

    if 'category_id' in data:
        cat_result = supabase.table('shoe_category').select('category_id').eq('category_id', data['category_id']).execute()
        if not cat_result.data:
            return jsonify({'message': 'Category ID does not exist'}), 400

    update_data = {
        'shoe_name': data.get('shoe_name', shoe['shoe_name']),
        'shoe_price': data.get('shoe_price', shoe['shoe_price']),
        'shoe_size': data.get('shoe_size', shoe['shoe_size']),
        'stock': data.get('stock', shoe['stock']),
        'last_updated': get_current_time_wita()
    }
    if 'category_id' in data:
        update_data['category_id'] = data['category_id']

    supabase.table('shoe_detail').update(update_data).eq('shoe_detail_id', shoe_detail_id).execute()
    return jsonify({'message': 'Shoe detail updated successfully'}), 200


@shoes_bp.route('/api/shoes/<int:shoe_detail_id>', methods=['DELETE'])
@jwt_required()
def delete_shoe_detail(shoe_detail_id):
    result = supabase.table('shoe_detail').select('shoe_detail_id').eq('shoe_detail_id', shoe_detail_id).execute()
    if not result.data:
        return jsonify({'message': 'Shoe detail not found'}), 404

    supabase.table('shoe_detail').delete().eq('shoe_detail_id', shoe_detail_id).execute()
    return jsonify({'message': 'Shoe detail deleted successfully'}), 200


@shoes_bp.route('/api/shoes/<int:shoe_detail_id>', methods=['GET'])
@jwt_required()
def get_shoe_detail(shoe_detail_id):
    result = supabase.table('shoe_detail').select('*').eq('shoe_detail_id', shoe_detail_id).execute()
    shoe = result.data[0] if result.data else None
    if not shoe:
        return jsonify({'message': 'Shoe detail not found'}), 404

    return jsonify(shoe), 200


@shoes_bp.route('/api/shoes', methods=['GET'])
@jwt_required()
def get_all_shoes():
    result = supabase.table('shoe_detail').select('*').execute()
    if not result.data:
        return jsonify({'message': 'No Shoe detail found'}), 404
    return jsonify(result.data), 200
