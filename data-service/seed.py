import psycopg2
import json
from extract_robust import robust_extract

DB_URL = "postgresql://admin:adminpassword@localhost:5433/bibliotecadb"

def seed_db():
    conn = psycopg2.connect(DB_URL)
    cursor = conn.cursor()
    
    # Create Book table just in case Prisma failed
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS "Book" (
            id UUID PRIMARY KEY,
            "registrationNumber" TEXT,
            title TEXT,
            authors TEXT,
            publisher TEXT,
            year TEXT,
            isbn TEXT,
            subject TEXT,
            mfn INTEGER UNIQUE,
            "createdAt" TIMESTAMP DEFAULT NOW(),
            "updatedAt" TIMESTAMP DEFAULT NOW()
        )
    ''')
    conn.commit()
    
    print("Extracting ARTHUR...")
    records = robust_extract("ARTHUR")
    print(f"Seeding {len(records)} records...")
    
    for r in records:
        mfn = r["mfn"]
        fields = r["fields"]
        
        # Best effort WINISIS field mapping without the FDT
        # We will dump the entire 'fields' dict into 'subject' so no data is lost.
        all_strs = [s for sublist in fields.values() for s in sublist]
        title = max(all_strs, key=len) if all_strs else f"Registro {mfn}"
        
        authors = ", ".join(fields.get("10", fields.get("16", fields.get("100", []))))
        publisher = ", ".join(fields.get("30", fields.get("260", [])))
        year = ", ".join(fields.get("31", fields.get("260", [])))
        isbn = ", ".join(fields.get("20", fields.get("020", [])))
        subject = json.dumps(fields, ensure_ascii=False)
        reg_num = ", ".join(fields.get("180", [""]))
        
        # Trim fields to avoid DB overflow just in case
        try:
            cursor.execute('''
                INSERT INTO "Book" (id, "registrationNumber", title, authors, publisher, year, isbn, subject, mfn, "createdAt", "updatedAt")
                VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                ON CONFLICT (mfn) DO NOTHING
            ''', (reg_num, title[:255], authors[:255], publisher[:255], year[:255], isbn[:255], subject, mfn))
        except Exception as e:
            print("DB Error:", getattr(e, "pgerror", str(e)))
            break
        
    conn.commit()
    cursor.close()
    conn.close()
    print("Seed complete.")

if __name__ == "__main__":
    seed_db()
