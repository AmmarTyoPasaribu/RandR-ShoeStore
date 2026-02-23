import pandas as pd
from supabase_client import supabase
import logging

logging.basicConfig(level=logging.INFO)

# Bobot interaksi
INTERACTION_WEIGHTS = {
    'view': 0.5,
    'wishlist': 1,
    'cart': 2,
    'order': 3
}

def train_nmf_model():
    """
    Global Popularity Recommendation:
    - Akumulasi semua interaksi dari semua user
    - Hitung skor popularitas per produk (berdasarkan bobot interaksi)
    - Top N produk paling populer direkomendasikan ke SEMUA user
    """
    try:
        # 1. Fetch semua interaksi
        interactions_result = supabase.table('user_interaction').select('*').execute()
        interactions = interactions_result.data or []
        logging.info(f'Total interaksi: {len(interactions)}')
    except Exception as e:
        logging.error(f'Error saat membaca data interaksi: {e}')
        raise

    if not interactions:
        return {'message': 'No interaction data available for training', 'status': 'skipped'}

    df = pd.DataFrame(interactions)

    # 2. Filter data valid
    df = df.dropna(subset=['shoe_detail_id', 'interaction_type'])
    df = df[df['shoe_detail_id'] > 0]

    if df.empty:
        return {'message': 'No valid interaction data after cleaning', 'status': 'skipped'}

    # 3. Hitung skor per produk
    df['score'] = df['interaction_type'].map(INTERACTION_WEIGHTS).fillna(0)

    # Akumulasi skor per sepatu
    shoe_scores = df.groupby('shoe_detail_id').agg(
        total_score=('score', 'sum'),
        interaction_count=('score', 'count'),
        unique_users=('id_user', 'nunique')
    ).reset_index()

    # Sort by total score descending
    shoe_scores = shoe_scores.sort_values('total_score', ascending=False)

    logging.info(f'Produk dengan interaksi: {len(shoe_scores)}')
    logging.info(f'Top 5 produk:\n{shoe_scores.head()}')

    # 4. Ambil top 10 produk paling populer
    top_n = min(10, len(shoe_scores))
    top_shoes = shoe_scores.head(top_n)['shoe_detail_id'].tolist()

    if not top_shoes:
        return {'message': 'No products with interactions found', 'status': 'skipped'}

    # 5. Fetch semua user
    try:
        users_result = supabase.table('user').select('user_id').execute()
        all_users = [u['user_id'] for u in users_result.data] if users_result.data else []
    except Exception as e:
        logging.error(f'Error saat membaca data user: {e}')
        raise

    if not all_users:
        return {'message': 'No users found in database', 'status': 'skipped'}

    # 6. Validasi shoe_detail_id yang masih ada
    try:
        shoes_result = supabase.table('shoe_detail').select('shoe_detail_id').execute()
        valid_shoe_ids = set(s['shoe_detail_id'] for s in shoes_result.data) if shoes_result.data else set()
    except Exception as e:
        logging.error(f'Error saat membaca data sepatu: {e}')
        raise

    top_shoes = [s for s in top_shoes if s in valid_shoe_ids]

    if not top_shoes:
        return {'message': 'No valid products found for recommendations', 'status': 'skipped'}

    # 7. Simpan rekomendasi: setiap user dapat produk yang sama
    try:
        # Hapus rekomendasi lama
        supabase.table('shoe_recomendation_for_users').delete().neq('id_shoe_recomendation', 0).execute()

        # Insert rekomendasi baru untuk setiap user
        records = []
        for user_id in all_users:
            for shoe_id in top_shoes:
                records.append({
                    'id_user': int(user_id),
                    'shoe_detail_id': int(shoe_id)
                })

        # Batch insert (max 50 per request to avoid timeout)
        batch_size = 50
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            supabase.table('shoe_recomendation_for_users').insert(batch).execute()

        logging.info(f'Rekomendasi berhasil disimpan: {len(records)} records ({len(all_users)} users x {len(top_shoes)} produk)')
    except Exception as e:
        logging.error(f'Error saat menyimpan rekomendasi: {e}')
        raise

    return {
        'message': f'Training completed! {len(top_shoes)} top products recommended to {len(all_users)} users.',
        'status': 'success',
        'total_recommendations': len(records),
        'top_products': len(top_shoes),
        'total_users': len(all_users)
    }
