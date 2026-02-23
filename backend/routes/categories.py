from flask import Blueprint, request, jsonify
from supabase_client import supabase
from datetime import datetime
import pytz

categories_bp = Blueprint('categories', __name__)

def get_current_time_wita():
    wita_tz = pytz.timezone('Asia/Makassar')
    return datetime.now(wita_tz).isoformat()


@categories_bp.route('/api/categories', methods=['POST'])
def add_category():
    data = request.json
    new_category = {
        'category_name': data['category_name'],
        'date_added': get_current_time_wita(),
        'last_updated': get_current_time_wita()
    }
    supabase.table('shoe_category').insert(new_category).execute()
    return jsonify({'message': 'Category added successfully'}), 201


@categories_bp.route('/api/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    result = supabase.table('shoe_category').select('category_id').eq('category_id', category_id).execute()
    if result.data:
        supabase.table('shoe_category').delete().eq('category_id', category_id).execute()
        return jsonify({'message': 'Category deleted successfully'}), 200
    return jsonify({'message': 'Category not found'}), 404


@categories_bp.route('/api/categories/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    data = request.json
    result = supabase.table('shoe_category').select('*').eq('category_id', category_id).execute()
    if not result.data:
        return jsonify({'message': 'Category not found'}), 404

    category = result.data[0]
    update_data = {
        'category_name': data.get('category_name', category['category_name']),
        'last_updated': get_current_time_wita()
    }
    supabase.table('shoe_category').update(update_data).eq('category_id', category_id).execute()
    return jsonify({'message': 'Category updated successfully'}), 200


@categories_bp.route('/api/categories/<int:category_id>', methods=['GET'])
def get_category(category_id):
    result = supabase.table('shoe_category').select('*').eq('category_id', category_id).execute()
    if result.data:
        return jsonify(result.data[0]), 200
    return jsonify({'message': 'Category not found'}), 404


@categories_bp.route('/api/categories', methods=['GET'])
def get_categories():
    result = supabase.table('shoe_category').select('*').execute()
    if result.data:
        return jsonify(result.data), 200
    return jsonify({'message': 'No categories found'}), 404
