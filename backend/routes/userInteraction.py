from flask import Blueprint, request, jsonify
from supabase_client import supabase
from datetime import datetime
import pytz

user_interaction_bp = Blueprint('user_interaction', __name__)

def get_current_time_wita():
    wita_tz = pytz.timezone('Asia/Makassar')
    return datetime.now(wita_tz).isoformat()


@user_interaction_bp.route('/api/user_interactions', methods=['GET'])
def get_all_interactions():
    result = supabase.table('user_interaction').select('*').execute()
    return jsonify(result.data), 200


@user_interaction_bp.route('/api/user_interactions', methods=['POST'])
def create_interaction():
    data = request.get_json()

    if 'id_user' not in data or 'shoe_detail_id' not in data or 'interaction_type' not in data:
        return jsonify({'message': 'Missing required fields'}), 400

    # Validasi user
    user_result = supabase.table('user').select('user_id').eq('user_id', data['id_user']).execute()
    if not user_result.data:
        return jsonify({'message': 'User not found'}), 404

    # Validasi shoe
    shoe_result = supabase.table('shoe_detail').select('shoe_detail_id').eq('shoe_detail_id', data['shoe_detail_id']).execute()
    if not shoe_result.data:
        return jsonify({'message': 'Shoe not found'}), 404

    # Validasi interaction_type
    valid_types = ['view', 'wishlist', 'cart', 'order']
    if data['interaction_type'] not in valid_types:
        return jsonify({'message': 'Invalid interaction type'}), 400

    try:
        new_interaction = {
            'id_user': data['id_user'],
            'shoe_detail_id': data['shoe_detail_id'],
            'interaction_type': data['interaction_type'],
            'interaction_date': get_current_time_wita()
        }
        supabase.table('user_interaction').insert(new_interaction).execute()
        return jsonify({'message': 'Interaction recorded successfully'}), 201
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


@user_interaction_bp.route('/api/user_interactions/<int:interaction_id>', methods=['PUT'])
def update_interaction(interaction_id):
    data = request.json

    result = supabase.table('user_interaction').select('*').eq('interaction_id', interaction_id).execute()
    if not result.data:
        return jsonify({'message': 'Interaction not found'}), 404

    valid_types = ['view', 'wishlist', 'cart', 'order']
    if data['interaction_type'] not in valid_types:
        return jsonify({'message': 'Invalid interaction type'}), 400

    supabase.table('user_interaction').update({
        'interaction_type': data['interaction_type'],
        'interaction_date': get_current_time_wita()
    }).eq('interaction_id', interaction_id).execute()
    return jsonify({'message': 'Interaction updated successfully'}), 200


@user_interaction_bp.route('/api/user_interactions/<int:interaction_id>', methods=['DELETE'])
def delete_interaction(interaction_id):
    result = supabase.table('user_interaction').select('interaction_id').eq('interaction_id', interaction_id).execute()
    if not result.data:
        return jsonify({'message': 'Interaction not found'}), 404

    supabase.table('user_interaction').delete().eq('interaction_id', interaction_id).execute()
    return jsonify({'message': 'Interaction deleted successfully'}), 200
