from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from supabase_client import supabase
from datetime import datetime
import pytz

cart_bp = Blueprint('cart', __name__)

def get_current_time_wita():
    wita_tz = pytz.timezone('Asia/Makassar')
    return datetime.now(wita_tz).isoformat()


@cart_bp.route('/api/cart/<int:user_id>', methods=['GET'])
@jwt_required()
def get_cart(user_id):
    current_user = get_jwt_identity()
    if int(current_user) != user_id:
        return jsonify({'message': 'You are not authorized to view this cart'}), 403

    cart_result = supabase.table('cart').select('*').eq('id_user', user_id).execute()
    if cart_result.data:
        result = []
        for item in cart_result.data:
            shoe_result = supabase.table('shoe_detail').select('shoe_name,shoe_price,shoe_size,stock').eq('shoe_detail_id', item['shoe_detail_id']).execute()
            shoe = shoe_result.data[0] if shoe_result.data else None
            if shoe:
                result.append({
                    'id_cart': item['id_cart'],
                    'shoe_detail_id': item['shoe_detail_id'],
                    'id_user': item['id_user'],
                    'quantity': item['quantity'],
                    'shoe_name': shoe['shoe_name'],
                    'shoe_price': shoe['shoe_price'],
                    'shoe_size': shoe['shoe_size'],
                    'stock': shoe['stock'],
                    'date_added': item['date_added'],
                    'last_updated': item['last_updated']
                })
        return jsonify(result), 200
    return jsonify({'message': 'Cart is empty'}), 404


@cart_bp.route('/api/cart', methods=['POST'])
@jwt_required()
def add_to_cart():
    data = request.json
    current_user = get_jwt_identity()

    if not data.get('shoe_detail_id') or not data.get('quantity'):
        return jsonify({'message': 'Shoe detail ID and quantity are required'}), 400

    if int(current_user) != data.get('id_user'):
        return jsonify({'message': 'You are not authorized to add items to this cart'}), 403

    # Cek user exists
    user_result = supabase.table('user').select('user_id').eq('user_id', data['id_user']).execute()
    if not user_result.data:
        return jsonify({'message': 'User not found'}), 404

    # Cek shoe exists & stock
    shoe_result = supabase.table('shoe_detail').select('*').eq('shoe_detail_id', data['shoe_detail_id']).execute()
    if not shoe_result.data:
        return jsonify({'message': 'Shoe not found'}), 404

    shoe = shoe_result.data[0]
    if shoe['stock'] < data['quantity']:
        return jsonify({'message': 'Insufficient stock available'}), 400

    # Cek item sudah ada di cart
    existing_result = supabase.table('cart').select('*').eq('id_user', data['id_user']).eq('shoe_detail_id', data['shoe_detail_id']).execute()

    if existing_result.data:
        existing_item = existing_result.data[0]
        new_quantity = existing_item['quantity'] + data['quantity']
        supabase.table('cart').update({
            'quantity': new_quantity,
            'last_updated': get_current_time_wita()
        }).eq('id_cart', existing_item['id_cart']).execute()
        message = 'Item quantity updated in cart'
        status_code = 200
    else:
        new_item = {
            'shoe_detail_id': data['shoe_detail_id'],
            'id_user': data['id_user'],
            'quantity': data['quantity'],
            'date_added': get_current_time_wita(),
            'last_updated': get_current_time_wita()
        }
        supabase.table('cart').insert(new_item).execute()
        message = 'Item added to cart successfully'
        status_code = 201

    # Catat interaksi
    new_interaction = {
        'id_user': data['id_user'],
        'shoe_detail_id': data['shoe_detail_id'],
        'interaction_type': 'cart',
        'interaction_date': get_current_time_wita()
    }
    supabase.table('user_interaction').insert(new_interaction).execute()

    return jsonify({'message': message}), status_code


@cart_bp.route('/api/cart/<int:id_cart>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(id_cart):
    current_user = get_jwt_identity()

    result = supabase.table('cart').select('*').eq('id_cart', id_cart).execute()
    item = result.data[0] if result.data else None

    if item and item['id_user'] == int(current_user):
        supabase.table('cart').delete().eq('id_cart', id_cart).execute()
        return jsonify({'message': 'Item removed from cart successfully'}), 200

    return jsonify({'message': 'Item not found or unauthorized'}), 404


@cart_bp.route('/api/cart/<int:id_cart>', methods=['PUT'])
@jwt_required()
def update_cart(id_cart):
    data = request.json
    current_user = get_jwt_identity()

    result = supabase.table('cart').select('*').eq('id_cart', id_cart).execute()
    item = result.data[0] if result.data else None

    if not item or item['id_user'] != int(current_user):
        return jsonify({'message': 'Item not found or unauthorized'}), 404

    # Cek user
    user_id = data.get('id_user', item['id_user'])
    user_result = supabase.table('user').select('user_id').eq('user_id', user_id).execute()
    if not user_result.data:
        return jsonify({'message': 'User not found'}), 404

    # Cek shoe & stock
    shoe_id = data.get('shoe_detail_id', item['shoe_detail_id'])
    shoe_result = supabase.table('shoe_detail').select('*').eq('shoe_detail_id', shoe_id).execute()
    if not shoe_result.data:
        return jsonify({'message': 'Shoe not found'}), 404

    shoe = shoe_result.data[0]
    quantity = data.get('quantity', item['quantity'])
    if shoe['stock'] < quantity:
        return jsonify({'message': 'Not enough stock'}), 400

    update_data = {
        'shoe_detail_id': shoe_id,
        'id_user': user_id,
        'quantity': quantity,
        'last_updated': get_current_time_wita()
    }

    supabase.table('cart').update(update_data).eq('id_cart', id_cart).execute()
    return jsonify({'message': 'Cart updated successfully'}), 200


@cart_bp.route('/api/cart/item/<int:id_cart>', methods=['GET'])
@jwt_required()
def get_cart_item(id_cart):
    current_user = get_jwt_identity()

    result = supabase.table('cart').select('*').eq('id_cart', id_cart).execute()
    item = result.data[0] if result.data else None

    if item and item['id_user'] == int(current_user):
        shoe_result = supabase.table('shoe_detail').select('shoe_name,shoe_price,shoe_size,stock').eq('shoe_detail_id', item['shoe_detail_id']).execute()
        shoe = shoe_result.data[0] if shoe_result.data else None
        if shoe:
            return jsonify({
                'id_cart': item['id_cart'],
                'shoe_detail_id': item['shoe_detail_id'],
                'id_user': item['id_user'],
                'quantity': item['quantity'],
                'shoe_name': shoe['shoe_name'],
                'shoe_price': shoe['shoe_price'],
                'shoe_size': shoe['shoe_size'],
                'stock': shoe['stock'],
                'date_added': item['date_added'],
                'last_updated': item['last_updated']
            }), 200
        return jsonify({'message': 'Shoe not found'}), 404
    return jsonify({'message': 'Item not found or unauthorized'}), 404


@cart_bp.route('/api/cart', methods=['GET'])
@jwt_required()
def get_all_cart_items():
    current_user = get_jwt_identity()

    cart_result = supabase.table('cart').select('*').eq('id_user', int(current_user)).execute()
    result = []
    for item in cart_result.data:
        shoe_result = supabase.table('shoe_detail').select('shoe_name,shoe_price,shoe_size,stock').eq('shoe_detail_id', item['shoe_detail_id']).execute()
        shoe = shoe_result.data[0] if shoe_result.data else None
        if shoe:
            result.append({
                'id_cart': item['id_cart'],
                'shoe_detail_id': item['shoe_detail_id'],
                'id_user': item['id_user'],
                'quantity': item['quantity'],
                'shoe_name': shoe['shoe_name'],
                'shoe_price': shoe['shoe_price'],
                'shoe_size': shoe['shoe_size'],
                'stock': shoe['stock'],
                'date_added': item['date_added'],
                'last_updated': item['last_updated']
            })
    return jsonify(result), 200
