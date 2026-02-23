import sqlite3
import random
import enum
from datetime import datetime, timedelta

# Enum untuk jenis interaksi
class InteractionType(enum.Enum):
    view = "view"
    wishlist = "wishlist"
    cart = "cart"
    order = "order"

# Fungsi untuk mendapatkan waktu saat ini (WITA)
def get_current_time_wita():
    # Menggunakan waktu UTC dan menambah 8 jam untuk WITA (UTC +8)
    return datetime.utcnow() + timedelta(hours=8)

# Ganti dengan path file database SQLite Anda (gunakan raw string literals atau double backslash)
db_path = r'D:\Kuliah\V\RNR-Webstore\backend\instance\site.db'

# Membuka koneksi ke database SQLite
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Kosongkan tabel user_interaction dan tabel terkait terlebih dahulu
cursor.execute("DELETE FROM user_interaction")
cursor.execute("DELETE FROM 'order'")
cursor.execute("DELETE FROM cart")
cursor.execute("DELETE FROM wishlist")

# Data interaksi yang akan dimasukkan
for n in range(1, 10001):  # 10000 data interaksi
    user_id = (n % 25) + 1  # User ID antara 1 dan 25
    interaction_type = random.choice([interaction.value for interaction in InteractionType])  # Pilih interaksi

    # Pilih beberapa sepatu secara acak untuk interaksi (ID sepatu antara 1 sampai 50)
    shoe_ids = [random.randint(1, 50) for _ in range(random.randint(1, 3))]  # Pilih antara 1 sampai 3 sepatu (ID 1-50)

    # Masukkan data ke tabel UserInteraction untuk setiap sepatu yang terlibat
    for shoe_detail_id in shoe_ids:
        cursor.execute(
            '''INSERT INTO user_interaction (id_user, shoe_detail_id, interaction_type, interaction_date)
               VALUES (?, ?, ?, ?)''',
            (user_id, shoe_detail_id, interaction_type, get_current_time_wita())
        )

        # Masukkan data ke tabel sesuai dengan tipe interaksi
        if interaction_type == 'order':
            cursor.execute(
                '''INSERT INTO 'order' (user_id, shoe_detail_id, order_date, amount, order_status, last_updated)
                   VALUES (?, ?, ?, ?, ?, ?)''',
                (user_id, shoe_detail_id, get_current_time_wita().date(), random.uniform(50, 300), 'Shipment', get_current_time_wita())
            )
        elif interaction_type == 'cart':
            # Periksa apakah item sudah ada di cart untuk user tersebut
            cursor.execute(
                '''SELECT 1 FROM cart WHERE id_user = ? AND shoe_detail_id = ?''',
                (user_id, shoe_detail_id)
            )
            result = cursor.fetchone()

            # Jika item tidak ada, masukkan ke cart
            if not result:
                cursor.execute(
                    '''INSERT INTO cart (id_user, shoe_detail_id, quantity, date_added, last_updated)
                       VALUES (?, ?, ?, ?, ?)''',
                    (user_id, shoe_detail_id, random.randint(1, 3), get_current_time_wita(), get_current_time_wita())
                )
        elif interaction_type == 'wishlist':
            cursor.execute(
                '''INSERT INTO wishlist (id_user, shoe_detail_id, date_added)
                   VALUES (?, ?, ?)''',
                (user_id, shoe_detail_id, get_current_time_wita())
            )

# Commit perubahan dan menutup koneksi
conn.commit()
conn.close()

print("User interactions and related data inserted successfully!")
