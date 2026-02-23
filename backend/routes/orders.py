from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from supabase_client import supabase
from datetime import datetime
import pytz

orders_bp = Blueprint('orders', __name__)

def get_current_time_wita():
    wita_tz = pytz.timezone('Asia/Makassar')
    return datetime.now(wita_tz).isoformat()


@orders_bp.route('/api/orders', methods=['POST'])
@jwt_required()
def create_order():
    data = request.json
    user_id = get_jwt_identity()

    # Cek user exists
    user_result = supabase.table('user').select('user_id').eq('user_id', user_id).execute()
    if not user_result.data:
        return jsonify({'message': 'User not authenticated or does not exist'}), 400

    # Cek shoe exists
    shoe_result = supabase.table('shoe_detail').select('shoe_detail_id').eq('shoe_detail_id', data['shoe_detail_id']).execute()
    if not shoe_result.data:
        return jsonify({'message': 'Shoe Detail ID does not exist'}), 400

    try:
        order_date = datetime.strptime(data['order_date'], '%Y-%m-%d').strftime('%Y-%m-%d')
    except ValueError:
        return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD.'}), 400

    new_order = {
        'user_id': int(user_id),
        'shoe_detail_id': data['shoe_detail_id'],
        'order_status': data['order_status'],
        'order_date': order_date,
        'amount': data['amount'],
        'last_updated': get_current_time_wita()
    }

    new_interaction = {
        'id_user': int(user_id),
        'shoe_detail_id': data['shoe_detail_id'],
        'interaction_type': 'order',
        'interaction_date': get_current_time_wita()
    }

    result = supabase.table('order').insert(new_order).execute()
    supabase.table('user_interaction').insert(new_interaction).execute()

    order_id = result.data[0]['order_id'] if result.data else None
    return jsonify({'message': 'Order created successfully', 'order_id': order_id}), 201


@orders_bp.route('/api/orders', methods=['GET'])
@jwt_required()
def get_orders():
    result = supabase.table('order').select('*').execute()
    return jsonify(result.data), 200


@orders_bp.route('/api/orders/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_orders_for_user(user_id):
    orders_result = supabase.table('order').select('*').eq('user_id', user_id).execute()
    order_data = []

    for order in orders_result.data:
        shoe_result = supabase.table('shoe_detail').select('shoe_name').eq('shoe_detail_id', order['shoe_detail_id']).execute()
        shoe_name = shoe_result.data[0]['shoe_name'] if shoe_result.data else 'Unknown'

        order_data.append({
            'order_id': order['order_id'],
            'user_id': order['user_id'],
            'shoe_detail_id': order['shoe_detail_id'],
            'shoe_name': shoe_name,
            'order_status': order['order_status'],
            'order_date': order['order_date'],
            'amount': order['amount']
        })

    return jsonify(order_data), 200


@orders_bp.route('/api/orders/<int:order_id>', methods=['PUT'])
@jwt_required()
def update_order(order_id):
    data = request.json

    # Check order exists
    result = supabase.table('order').select('*').eq('order_id', order_id).execute()
    if not result.data:
        return jsonify({'message': 'Order not found'}), 404

    update_data = {}
    if 'order_status' in data:
        valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
        if data['order_status'].lower() not in valid_statuses:
            return jsonify({'message': f'Invalid status. Use one of: {", ".join(valid_statuses)}'}), 400
        update_data['order_status'] = data['order_status']
    if 'order_date' in data:
        try:
            order_date = datetime.strptime(data['order_date'], '%Y-%m-%d').strftime('%Y-%m-%d')
            update_data['order_date'] = order_date
        except ValueError:
            return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD.'}), 400

    update_data['last_updated'] = get_current_time_wita()

    supabase.table('order').update(update_data).eq('order_id', order_id).execute()
    return jsonify({'message': 'Order updated successfully'}), 200


@orders_bp.route('/api/orders/<int:order_id>', methods=['DELETE'])
@jwt_required()
def delete_order(order_id):
    result = supabase.table('order').select('order_id').eq('order_id', order_id).execute()
    if result.data:
        supabase.table('order').delete().eq('order_id', order_id).execute()
        return jsonify({'message': 'Order deleted successfully'}), 200
    return jsonify({'message': 'Order not found'}), 404
