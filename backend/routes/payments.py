from flask import Blueprint, request, jsonify
from supabase_client import supabase
from datetime import datetime

payments_bp = Blueprint('payments', __name__)


@payments_bp.route('/api/payments', methods=['POST'])
def process_payment():
    data = request.json

    if not data or 'order_id' not in data or 'payment_method' not in data or 'payment_status' not in data or 'payment_date' not in data:
        return jsonify({'message': 'Data yang dikirim tidak lengkap'}), 400

    try:
        payment_date = datetime.strptime(data['payment_date'], '%Y-%m-%d').strftime('%Y-%m-%d')
    except ValueError:
        return jsonify({'message': 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD.'}), 400

    # Cek order exists
    order_result = supabase.table('order').select('order_id').eq('order_id', data['order_id']).execute()
    if not order_result.data:
        return jsonify({'message': 'Order ID tidak ditemukan'}), 400

    # Cek payment sudah ada
    existing = supabase.table('payment').select('payment_id').eq('order_id', data['order_id']).execute()
    if existing.data:
        return jsonify({'message': 'Pembayaran sudah dilakukan untuk Order ini'}), 400

    new_payment = {
        'order_id': data['order_id'],
        'payment_method': data['payment_method'],
        'payment_status': data['payment_status'],
        'payment_date': payment_date
    }

    supabase.table('payment').insert(new_payment).execute()
    return jsonify({'message': 'Pembayaran berhasil diproses'}), 201


@payments_bp.route('/api/payments/<int:payment_id>', methods=['PUT'])
def update_payment_status(payment_id):
    data = request.json

    result = supabase.table('payment').select('*').eq('payment_id', payment_id).execute()
    if not result.data:
        return jsonify({'message': 'Pembayaran tidak ditemukan'}), 404

    if 'payment_status' not in data:
        return jsonify({'message': 'Status pembayaran tidak disertakan'}), 400

    supabase.table('payment').update({'payment_status': data['payment_status']}).eq('payment_id', payment_id).execute()
    return jsonify({'message': 'Status pembayaran berhasil diperbarui'}), 200


@payments_bp.route('/api/payments/<int:payment_id>', methods=['GET'])
def get_payment(payment_id):
    result = supabase.table('payment').select('*').eq('payment_id', payment_id).execute()
    if result.data:
        return jsonify(result.data[0]), 200
    return jsonify({'message': 'Pembayaran tidak ditemukan'}), 404


@payments_bp.route('/api/payments', methods=['GET'])
def get_payments():
    result = supabase.table('payment').select('*').execute()
    if result.data:
        return jsonify(result.data), 200
    return jsonify({'message': 'Tidak ada pembayaran ditemukan'}), 404


@payments_bp.route('/api/payments/<int:payment_id>', methods=['DELETE'])
def delete_payment(payment_id):
    result = supabase.table('payment').select('payment_id').eq('payment_id', payment_id).execute()
    if result.data:
        supabase.table('payment').delete().eq('payment_id', payment_id).execute()
        return jsonify({'message': 'Pembayaran berhasil dihapus'}), 200
    return jsonify({'message': 'Pembayaran tidak ditemukan'}), 404
