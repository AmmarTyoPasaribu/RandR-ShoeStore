# backend/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Supabase PostgreSQL (production) atau SQLite (fallback development)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'sqlite:///instance/site.db'  # fallback untuk dev lokal
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
