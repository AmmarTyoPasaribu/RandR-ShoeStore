"""
Seeder script: Insert shoe categories and shoe details into Supabase.
Run this once: python seed_shoes.py
"""
import os
import sys

# Fix Windows console encoding
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from dotenv import load_dotenv

load_dotenv()

from supabase_client import supabase
from datetime import datetime
import pytz

def get_current_time_wita():
    wita_tz = pytz.timezone('Asia/Makassar')
    return datetime.now(wita_tz).isoformat()

# =============================================
# DATA: 5 Kategori + 50 Sepatu
# =============================================

CATEGORIES = ['Boots', 'Casual', 'Formal', 'Heels', 'Sport']

SHOES = {
    'Boots': [
        {'name': 'AP Boots Terra Eco', 'price': 185000, 'size': '42', 'stock': 15},
        {'name': 'AXEL BROWN Chelsea High Boots', 'price': 450000, 'size': '41', 'stock': 10},
        {'name': 'Azcost Allison Original', 'price': 380000, 'size': '43', 'stock': 12},
        {'name': 'Casual Kulit Asli Docmart', 'price': 520000, 'size': '42', 'stock': 8},
        {'name': 'Lennox Oliv Moc Toe Boots Rugged Style Crazy Horse', 'price': 650000, 'size': '42', 'stock': 6},
        {'name': 'MANCOW High Boots', 'price': 350000, 'size': '43', 'stock': 14},
        {'name': 'Nokha Boots Harlow Black', 'price': 890000, 'size': '40', 'stock': 5},
        {'name': 'Parabellum COBRA', 'price': 750000, 'size': '42', 'stock': 7},
        {'name': 'Snow boots men winter', 'price': 420000, 'size': '43', 'stock': 10},
        {'name': 'uthor Aztec Tan Rugged Adventure Koku Footwear', 'price': 580000, 'size': '41', 'stock': 9},
    ],
    'Casual': [
        {'name': 'Asics Gel Sonoma SE', 'price': 1200000, 'size': '42', 'stock': 8},
        {'name': 'Converse 70S OX Black White Egret Low Original', 'price': 950000, 'size': '41', 'stock': 12},
        {'name': 'FromZero Aransa Black', 'price': 280000, 'size': '43', 'stock': 20},
        {'name': 'New Balance Black Dark Grey', 'price': 850000, 'size': '42', 'stock': 10},
        {'name': 'Nike Air Jordan 1 Low Red Bred Toe', 'price': 1750000, 'size': '42', 'stock': 6},
        {'name': 'Nike Air Jordan 1 Low White Wolf Grey', 'price': 1650000, 'size': '43', 'stock': 7},
        {'name': 'Nike Dunk Panda', 'price': 1500000, 'size': '41', 'stock': 8},
        {'name': 'PHOENIX VOYAGE ORIGINAL', 'price': 350000, 'size': '42', 'stock': 15},
        {'name': 'Slip On Mission Black White', 'price': 250000, 'size': '40', 'stock': 25},
        {'name': 'XternalStepSure Miterns Storm Low Black White', 'price': 320000, 'size': '43', 'stock': 18},
    ],
    'Formal': [
        {'name': 'BYWALK Cms45 Casual Moccasin', 'price': 280000, 'size': '42', 'stock': 15},
        {'name': 'Brick Mansions Slip On Mission', 'price': 320000, 'size': '41', 'stock': 12},
        {'name': 'Cardinal M0839E01A', 'price': 450000, 'size': '43', 'stock': 10},
        {'name': 'Casual leather pantofel', 'price': 550000, 'size': '42', 'stock': 8},
        {'name': 'Francis Pantofel', 'price': 680000, 'size': '41', 'stock': 6},
        {'name': 'Kenzios Hatta Black Series', 'price': 750000, 'size': '42', 'stock': 7},
        {'name': 'Pantofel Premium Tie 4449', 'price': 850000, 'size': '43', 'stock': 5},
        {'name': 'Wirken Oxford', 'price': 920000, 'size': '42', 'stock': 4},
        {'name': 'leather pantofel d2a', 'price': 480000, 'size': '41', 'stock': 11},
        {'name': 'oxford quarter cap toe', 'price': 1050000, 'size': '42', 'stock': 3},
    ],
    'Heels': [
        {'name': 'Celline Heels', 'price': 350000, 'size': '37', 'stock': 10},
        {'name': 'Glossy Beige Italian Sole', 'price': 890000, 'size': '38', 'stock': 6},
        {'name': 'Glossy Black Slingback Italian Sole', 'price': 920000, 'size': '37', 'stock': 5},
        {'name': 'Glossy Italian Sole Pink', 'price': 880000, 'size': '36', 'stock': 7},
        {'name': 'Glossy Suina France Sole', 'price': 950000, 'size': '38', 'stock': 4},
        {'name': 'Jasmine Mules Heels', 'price': 420000, 'size': '37', 'stock': 12},
        {'name': 'Metallic Silver Slingback Italian Sole', 'price': 980000, 'size': '38', 'stock': 5},
        {'name': 'Pennay Callista Mules Heels', 'price': 320000, 'size': '36', 'stock': 15},
        {'name': 'Satin Crystal Italian Sole Heels', 'price': 1100000, 'size': '37', 'stock': 3},
        {'name': 'Satin Crystal Italian Sole', 'price': 1050000, 'size': '38', 'stock': 4},
    ],
    'Sport': [
        {'name': 'Ardiles Nfinity Burst', 'price': 280000, 'size': '42', 'stock': 20},
        {'name': 'Asics Magic Speed 4 Digital Aqua Original', 'price': 2800000, 'size': '43', 'stock': 5},
        {'name': 'Asics Novablast 4 Tr Nature Bathing Original', 'price': 2500000, 'size': '42', 'stock': 6},
        {'name': 'Eagle Run Breaker', 'price': 350000, 'size': '43', 'stock': 18},
        {'name': 'Mizuno Wave Rebellion Flash 2 River Blue Original', 'price': 2200000, 'size': '42', 'stock': 4},
        {'name': 'New Balance Fuelcell Rebel V4 Off White Lime Original', 'price': 2100000, 'size': '41', 'stock': 5},
        {'name': 'Nike Air Zoom Pegasus 41 Blueprint White Original', 'price': 1900000, 'size': '43', 'stock': 7},
        {'name': 'NovaBlast 4 Platinum', 'price': 2400000, 'size': '42', 'stock': 6},
        {'name': 'ORTUSEIGHT HYPERBLAST 1.3', 'price': 450000, 'size': '43', 'stock': 15},
        {'name': 'Ortuseight Running Hyperfuse 1.4 Black Cyan', 'price': 520000, 'size': '42', 'stock': 12},
    ],
}


def seed():
    now = get_current_time_wita()

    # 1. Insert categories
    print("📁 Inserting shoe categories...")
    category_map = {}  # name -> category_id

    for cat_name in CATEGORIES:
        # Check if category already exists
        existing = supabase.table('shoe_category').select('category_id').eq('category_name', cat_name).execute()
        if existing.data:
            category_map[cat_name] = existing.data[0]['category_id']
            print(f"   ⏭️  Category '{cat_name}' already exists (ID: {category_map[cat_name]})")
        else:
            result = supabase.table('shoe_category').insert({
                'category_name': cat_name,
                'date_added': now,
                'last_updated': now
            }).execute()
            category_map[cat_name] = result.data[0]['category_id']
            print(f"   ✅ Category '{cat_name}' inserted (ID: {category_map[cat_name]})")

    # 2. Insert shoes
    print("\n👟 Inserting shoe details...")
    total_inserted = 0
    total_skipped = 0

    for cat_name, shoes in SHOES.items():
        cat_id = category_map[cat_name]
        print(f"\n   📂 {cat_name} (category_id: {cat_id}):")

        for shoe in shoes:
            # Check if shoe already exists
            existing = supabase.table('shoe_detail').select('shoe_detail_id').eq('shoe_name', shoe['name']).execute()
            if existing.data:
                print(f"      ⏭️  '{shoe['name']}' already exists")
                total_skipped += 1
                continue

            result = supabase.table('shoe_detail').insert({
                'category_id': cat_id,
                'shoe_name': shoe['name'],
                'shoe_price': shoe['price'],
                'shoe_size': shoe['size'],
                'stock': shoe['stock'],
                'date_added': now,
                'last_updated': now
            }).execute()
            print(f"      ✅ '{shoe['name']}' - Rp {shoe['price']:,}")
            total_inserted += 1

    print(f"\n{'='*50}")
    print(f"🎉 Seeding complete!")
    print(f"   Categories: {len(CATEGORIES)}")
    print(f"   Shoes inserted: {total_inserted}")
    print(f"   Shoes skipped (already exist): {total_skipped}")
    print(f"{'='*50}")


if __name__ == '__main__':
    seed()
