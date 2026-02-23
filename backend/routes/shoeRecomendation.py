from flask import Blueprint, request, jsonify
from supabase_client import supabase
from datetime import datetime
import pytz

shoe_recommendation_bp = Blueprint('shoe_recommendation', __name__)

def get_current_time_wita():
    wita_tz = pytz.timezone('Asia/Makassar')
    return datetime.now(wita_tz).isoformat()


@shoe_recommendation_bp.route('/api/shoe_recommendations/<int:user_id>', methods=['GET'])
def get_recommendations_for_user(user_id):
    rec_result = supabase.table('shoe_recomendation_for_users').select('*').eq('id_user', user_id).execute()

    if rec_result.data:
        result = []
        for rec in rec_result.data:
            shoe_result = supabase.table('shoe_detail').select('*').eq('shoe_detail_id', rec['shoe_detail_id']).execute()
            shoe = shoe_result.data[0] if shoe_result.data else None
            if shoe:
                result.append({
                    'id_shoe_recomendation': rec['id_shoe_recomendation'],
                    'id_user': rec['id_user'],
                    'shoe_detail_id': rec['shoe_detail_id'],
                    'shoe_name': shoe['shoe_name'],
                    'shoe_price': shoe['shoe_price'],
                    'shoe_size': shoe['shoe_size'],
                    'stock': shoe['stock'],
                    'category_id': shoe.get('category_id'),
                    'date_added': shoe['date_added'],
                    'last_updated': shoe['last_updated']
                })
        return jsonify(result), 200
    return jsonify([]), 200


@shoe_recommendation_bp.route('/api/shoe_recommendations', methods=['POST'])
def add_recommendation():
    data = request.json

    user_result = supabase.table('user').select('user_id').eq('user_id', data['id_user']).execute()
    if not user_result.data:
        return jsonify({'message': 'User not found'}), 404

    shoe_result = supabase.table('shoe_detail').select('shoe_detail_id').eq('shoe_detail_id', data['shoe_detail_id']).execute()
    if not shoe_result.data:
        return jsonify({'message': 'Shoe not found'}), 404

    existing = supabase.table('shoe_recomendation_for_users').select('id_shoe_recomendation').eq('id_user', data['id_user']).eq('shoe_detail_id', data['shoe_detail_id']).execute()
    if existing.data:
        return jsonify({'message': 'Recommendation already exists'}), 400

    new_rec = {
        'id_user': data['id_user'],
        'shoe_detail_id': data['shoe_detail_id']
    }
    supabase.table('shoe_recomendation_for_users').insert(new_rec).execute()
    return jsonify({'message': 'Recommendation added successfully'}), 201


@shoe_recommendation_bp.route('/api/shoe_recommendations/<int:id_shoe_recomendation>', methods=['DELETE'])
def remove_recommendation(id_shoe_recomendation):
    result = supabase.table('shoe_recomendation_for_users').select('id_shoe_recomendation').eq('id_shoe_recomendation', id_shoe_recomendation).execute()
    if result.data:
        supabase.table('shoe_recomendation_for_users').delete().eq('id_shoe_recomendation', id_shoe_recomendation).execute()
        return jsonify({'message': 'Recommendation removed successfully'}), 200
    return jsonify({'message': 'Recommendation not found'}), 404


@shoe_recommendation_bp.route('/api/shoe_recommendations/<int:id_shoe_recomendation>', methods=['PUT'])
def update_recommendation(id_shoe_recomendation):
    data = request.json

    result = supabase.table('shoe_recomendation_for_users').select('*').eq('id_shoe_recomendation', id_shoe_recomendation).execute()
    if not result.data:
        return jsonify({'message': 'Recommendation not found'}), 404

    rec = result.data[0]
    new_user_id = data.get('id_user', rec['id_user'])
    new_shoe_id = data.get('shoe_detail_id', rec['shoe_detail_id'])

    # Validasi user
    user_result = supabase.table('user').select('user_id').eq('user_id', new_user_id).execute()
    if not user_result.data:
        return jsonify({'message': 'User not found'}), 404

    # Validasi shoe
    shoe_result = supabase.table('shoe_detail').select('shoe_detail_id').eq('shoe_detail_id', new_shoe_id).execute()
    if not shoe_result.data:
        return jsonify({'message': 'Shoe not found'}), 404

    supabase.table('shoe_recomendation_for_users').update({
        'id_user': new_user_id,
        'shoe_detail_id': new_shoe_id
    }).eq('id_shoe_recomendation', id_shoe_recomendation).execute()
    return jsonify({'message': 'Recommendation updated successfully'}), 200


@shoe_recommendation_bp.route('/api/shoe_recommendations/<int:id_shoe_recomendation>', methods=['GET'])
def get_recommendation(id_shoe_recomendation):
    result = supabase.table('shoe_recomendation_for_users').select('*').eq('id_shoe_recomendation', id_shoe_recomendation).execute()
    if result.data:
        rec = result.data[0]
        shoe_result = supabase.table('shoe_detail').select('*').eq('shoe_detail_id', rec['shoe_detail_id']).execute()
        shoe = shoe_result.data[0] if shoe_result.data else None
        if shoe:
            return jsonify({
                'id_shoe_recomendation': rec['id_shoe_recomendation'],
                'id_user': rec['id_user'],
                'shoe_detail_id': rec['shoe_detail_id'],
                'shoe_name': shoe['shoe_name'],
                'shoe_price': shoe['shoe_price'],
                'shoe_size': shoe['shoe_size'],
                'stock': shoe['stock'],
                'category_id': shoe['category_id'],
                'date_added': shoe['date_added'],
                'last_updated': shoe['last_updated']
            }), 200
    return jsonify({'message': 'Recommendation not found'}), 404


@shoe_recommendation_bp.route('/api/shoe_recommendations', methods=['GET'])
def get_all_recommendations():
    rec_result = supabase.table('shoe_recomendation_for_users').select('*').execute()
    result = []
    for rec in rec_result.data:
        shoe_result = supabase.table('shoe_detail').select('*').eq('shoe_detail_id', rec['shoe_detail_id']).execute()
        shoe = shoe_result.data[0] if shoe_result.data else None
        if shoe:
            result.append({
                'id_shoe_recomendation': rec['id_shoe_recomendation'],
                'id_user': rec['id_user'],
                'shoe_detail_id': rec['shoe_detail_id'],
                'shoe_name': shoe['shoe_name'],
                'shoe_price': shoe['shoe_price'],
                'shoe_size': shoe['shoe_size'],
                'stock': shoe['stock'],
                'date_added': shoe['date_added'],
                'last_updated': shoe['last_updated']
            })
    return jsonify(result), 200
