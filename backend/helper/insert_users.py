import sqlite3
from werkzeug.security import generate_password_hash
from datetime import datetime

# Ganti dengan path file database SQLite Anda
db_path = 'D:\\Kuliah\\V\\RNR-Webstore\\backend\\instance\\site.db'

# Membuka koneksi ke database SQLite
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Kosongkan tabel user terlebih dahulu
cursor.execute("DELETE FROM user")

# # Membuat 25 pengguna dengan password yang di-hash
for n in range(1, 26):  # Ubah dari 101 ke 26 untuk membuat 25 pengguna
    # Hash password
    password = generate_password_hash(f'password{n}', method='pbkdf2:sha256')
    
    # Data pengguna yang akan dimasukkan
    username = f'user_{n}'
    email = f'user{n}@example.com'
    address = f'Address {n}'
    phone = f'081234567{n}'
    first_name = 'FirstName'
    last_name = 'LastName'
    role = 'User'
    date_now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # Format waktu saat ini
    
    # Menjalankan query untuk menambahkan data pengguna
    query = '''
    INSERT INTO user (username, password, email, address, phone, first_name, last_name, role, date_added, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    '''
    
    cursor.execute(query, (username, password, email, address, phone, first_name, last_name, role, date_now, date_now))

# Commit perubahan dan menutup koneksi
conn.commit()
conn.close()

print("25 users with hashed passwords inserted successfully!")
