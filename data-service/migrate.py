import psycopg2

DB_URL = "postgresql://admin:adminpassword@localhost:5435/bibliotecadb"

def manual_migration():
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cursor = conn.cursor()
    
    try:
        print("Dropping index...")
        cursor.execute('DROP INDEX IF EXISTS "Book_mfn_key";')
        
        print("Adding column winisisId...")
        cursor.execute('ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "winisisId" TEXT UNIQUE;')
        
        print("Populating winisisId for existing records...")
        cursor.execute('''
            UPDATE "Book" 
            SET "winisisId" = 'ARTHUR-' || CAST(mfn AS TEXT) || '-0' 
            WHERE "winisisId" IS NULL AND mfn IS NOT NULL;
        ''')
        print("Migration done.")
    except Exception as e:
        print("Error:", e)
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    manual_migration()
