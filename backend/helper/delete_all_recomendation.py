import sqlite3

# Ganti dengan path file database SQLite Anda
db_path = 'D:\\Kuliah\\V\\RNR-Webstore\\backend\\instance\\site.db'

try:
    # Menggunakan 'with' statement untuk membuka koneksi yang akan otomatis ditutup
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()

        # Kosongkan tabel shoe_recomendation_for_user terlebih dahulu
        cursor.execute("DELETE FROM shoe_recomendation_for_users")

        # Commit perubahan secara eksplisit
        conn.commit()

    print("All data in the 'shoe_recomendation_for_user' table has been deleted successfully!")

except sqlite3.Error as e:
    print(f"An error occurred while deleting data: {e}")
