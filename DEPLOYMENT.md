# Cara Deploy RNR Webstore ke Vercel

## Prasyarat
1. **Akun Vercel** - Daftar di [vercel.com](https://vercel.com)
2. **GitHub** - Connect akun Vercel dengan GitHub
3. **Database** - Database production (MySQL/PostgreSQL) untuk Vercel

## Langkah 1: Persiapan Project

✅ **File yang sudah dibuat:**
- `vercel.json` - Konfigurasi Vercel
- `api/index.py` - Serverless function entry point
- `requirements.txt` - Python dependencies

## Langkah 2: Setup Database Production

Vercel tidak menyediakan database, Anda perlu database eksternal:

### Pilihan 1: Supabase (Recommended)
1. Daftar di [supabase.com](https://supabase.com)
2. Buat project baru
3. Dapatkan connection string dari Settings > Database

### Pilihan 2: Railway
1. Daftar di [railway.app](https://railway.app)
2. Buat project PostgreSQL
3. Dapatkan DATABASE_URL

## Langkah 3: Update Configuration

Buat file `.env.production`:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Secret
JWT_SECRET_KEY=your-secret-key-here

# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=false
```

## Langkah 4: Deploy ke Vercel

### Option A: Melalui Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login ke Vercel:
```bash
vercel login
```

3. Deploy project:
```bash
vercel --prod
```

4. Follow instruksi:
- Link ke existing project? **No**
- What's your project's name? **rnr-webstore**
- In which directory is your code located? **./**
- Want to override the settings? **Yes**

### Option B: Melalui Dashboard Vercel

1. Push project ke GitHub
2. Login ke [vercel.com](https://vercel.com)
3. Click **"Add New..."** → **"Project"**
4. Import repository GitHub Anda
5. Configure settings:
   - **Framework Preset:** Other
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** build
   - **Install Command:** `npm install`

## Langkah 5: Environment Variables

Di Vercel Dashboard, tambahkan environment variables:

1. Buka project Anda di Vercel
2. Go to **Settings** → **Environment Variables**
3. Tambahkan variables:
   - `DATABASE_URL`
   - `JWT_SECRET_KEY`
   - `FLASK_ENV=production`
   - `FLASK_DEBUG=false`

## Langkah 6: Update Frontend API URLs

Setelah deploy, update base URL API di frontend:

Buka `src/App.js` dan ganti:
```javascript
// Sebelumnya
const API_BASE_URL = 'http://localhost:5000';

// Setelah deploy
const API_BASE_URL = 'https://your-app-name.vercel.app';
```

Atau gunakan environment detection:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-app-name.vercel.app'
  : 'http://localhost:5000';
```

## Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Pastikan DATABASE_URL benar
   - Database accessible dari internet

2. **CORS Error**
   - Tambahkan domain Vercel ke CORS config
   - Update `api/index.py`

3. **Build Error**
   - Pastikan semua dependencies ada di `requirements.txt`
   - Check Python version compatibility

4. **API Not Found**
   - Pastikan routes di `vercel.json` benar
   - Check serverless function structure

### Log Debugging:
- View logs di Vercel Dashboard → Functions tab
- Check Build Logs untuk dependency issues

## Tips Deploy

1. **Database Pooling:** Gunakan connection pooling untuk production
2. **Timeout:** Set appropriate timeout untuk serverless functions
3. **Monitoring:** Setup error monitoring (Sentry)
4. **Performance:** Enable Vercel Analytics

## Alternative: Backend Separation

Jika mengalami kesulitan, pertimbangkan:
1. Deploy backend ke Railway/Render
2. Deploy frontend ke Vercel
3. Update API URLs ke backend URL

---

## File Structure untuk Vercel

```
rnr-webstore/
├── api/
│   └── index.py          # Serverless function entry
├── backend/              # Backend modules
│   ├── models/
│   ├── routes/
│   └── config.py
├── src/                  # React frontend
├── public/               # Static files
├── vercel.json           # Vercel config
├── requirements.txt      # Python deps
└── package.json          # Node.js deps
```