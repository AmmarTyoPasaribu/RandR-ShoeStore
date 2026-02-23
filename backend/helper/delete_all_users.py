import sqlite3

# Ganti dengan path file database SQLite Anda
db_path = 'D:\\Kuliah\\V\\RNR-Webstore\\backend\\instance\\site.db'

# Membuka koneksi ke database SQLite
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Kosongkan tabel user terlebih dahulu
cursor.execute("DELETE FROM user")

# Commit perubahan dan menutup koneksi
conn.commit()
conn.close()

print("All data in the 'user' table has been deleted successfully!")
