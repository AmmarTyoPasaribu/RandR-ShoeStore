# wishlist.py
from flask import Blueprint, request, jsonify
from supabase_client import supabase
from datetime import datetime
import pytz

wishlist_bp = Blueprint('wishlist', __name__)

def get_current_time_wita():
    wita_tz = pytz.timezone('Asia/Makassar')
    return datetime.now(wita_tz).isoformat()


@wishlist_bp.route('/api/wishlist/<int:user_id>', methods=['GET'])
def get_wishlist(user_id):
    result = supabase.table('wishlist').select('*').eq('id_user', user_id).execute()
    if result.data:
        return jsonify(result.data), 200
    return jsonify({'message': 'Wishlist is empty'}), 404


@wishlist_bp.route('/api/wishlist', methods=['POST'])
def add_to_wishlist():
    data = request.json

    # Cek user
    user_result = supabase.table('user').select('user_id').eq('user_id', data['id_user']).execute()
    if not user_result.data:
        return jsonify({'message': 'User not found'}), 404

    # Cek shoe
    shoe_result = supabase.table('shoe_detail').select('shoe_detail_id').eq('shoe_detail_id', data['shoe_detail_id']).execute()
    if not shoe_result.data:
        return jsonify({'message': 'Shoe not found'}), 404

    new_item = {
        'shoe_detail_id': data['shoe_detail_id'],
        'id_user': data['id_user'],
        'date_added': get_current_time_wita()
    }

    new_interaction = {
        'id_user': data['id_user'],
        'shoe_detail_id': data['shoe_detail_id'],
        'interaction_type': 'wishlist',
        'interaction_date': get_current_time_wita()
    }

    supabase.table('wishlist').insert(new_item).execute()
    supabase.table('user_interaction').insert(new_interaction).execute()
    return jsonify({'message': 'Item added to wishlist successfully'}), 201


@wishlist_bp.route('/api/wishlist/<int:id_wishlist>', methods=['DELETE'])
def remove_from_wishlist(id_wishlist):
    result = supabase.table('wishlist').select('id_wishlist').eq('id_wishlist', id_wishlist).execute()
    if result.data:
        supabase.table('wishlist').delete().eq('id_wishlist', id_wishlist).execute()
        return jsonify({'message': 'Item removed from wishlist successfully'}), 200
    return jsonify({'message': 'Item not found'}), 404


@wishlist_bp.route('/api/wishlist/<int:id_wishlist>', methods=['PUT'])
def update_wishlist(id_wishlist):
    data = request.json
    result = supabase.table('wishlist').select('*').eq('id_wishlist', id_wishlist).execute()
    if not result.data:
        return jsonify({'message': 'Item not found'}), 404

    update_data = {}
    if 'shoe_detail_id' in data:
        update_data['shoe_detail_id'] = data['shoe_detail_id']
    if 'id_user' in data:
        update_data['id_user'] = data['id_user']
    update_data['date_added'] = get_current_time_wita()

    supabase.table('wishlist').update(update_data).eq('id_wishlist', id_wishlist).execute()
    return jsonify({'message': 'Wishlist updated successfully'}), 200


@wishlist_bp.route('/api/wishlist/item/<int:id_wishlist>', methods=['GET'])
def get_wishlist_item(id_wishlist):
    result = supabase.table('wishlist').select('*').eq('id_wishlist', id_wishlist).execute()
    if result.data:
        return jsonify(result.data[0]), 200
    return jsonify({'message': 'Item not found'}), 404


@wishlist_bp.route('/api/wishlist', methods=['GET'])
def get_all_wishlist_items():
    result = supabase.table('wishlist').select('*').execute()
    return jsonify(result.data), 200
