import psycopg2
import json
from extract_robust import robust_extract

DB_URL = "postgresql://admin:adminpassword@localhost:5435/bibliotecadb"
DBS = ["ARTHUR", "BOOKS", "CDS", "FOLHE", "PERIO", "SELETA"]

def seed_db():
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cursor = conn.cursor()
    
    total_inserted = 0
    total_updated = 0

    for db_name in DBS:
        print(f"\nExtracting {db_name}...")
        try:
            records = robust_extract(db_name)
        except Exception as e:
            print(f"Error extracting {db_name}: {e}")
            continue

        print(f"Found {len(records)} records in {db_name}. Seeding...")
        
        for r in records:
            mfn = r["mfn"]
            fields = r["fields"]
            
            all_strs = [s for sublist in fields.values() for s in sublist]
            title = max(all_strs, key=len) if all_strs else f"Registro {mfn} ({db_name})"
            
            authors = ", ".join(fields.get("10", fields.get("16", fields.get("100", []))))
            publisher = ", ".join(fields.get("30", fields.get("260", [])))
            year = ", ".join(fields.get("31", fields.get("260", [])))
            isbn = ", ".join(fields.get("20", fields.get("020", [])))
            subject = json.dumps(fields, ensure_ascii=False)
            
            # Extract and split registration numbers (exemplars)
            reg_nums_raw = fields.get("180", [""])
            reg_nums = []
            for raw in reg_nums_raw:
                # Some might have commas inside a single field entry
                for part in str(raw).split(","):
                    part = part.strip()
                    if part:
                        reg_nums.append(part)
                        
            if not reg_nums:
                reg_nums = [""]
            
            for idx, reg_num in enumerate(reg_nums):
                winisis_id = f"{db_name}-{mfn}-{idx}"
                
                try:
                    cursor.execute('''
                        INSERT INTO "Book" (
                            id, "registrationNumber", title, authors, publisher, 
                            year, isbn, subject, mfn, "winisisId", "createdAt", "updatedAt"
                        )
                        VALUES (
                            gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
                        )
                        ON CONFLICT ("winisisId") DO UPDATE SET
                            "registrationNumber" = EXCLUDED."registrationNumber",
                            title = EXCLUDED.title,
                            authors = EXCLUDED.authors,
                            publisher = EXCLUDED.publisher,
                            year = EXCLUDED.year,
                            isbn = EXCLUDED.isbn,
                            subject = EXCLUDED.subject,
                            mfn = EXCLUDED.mfn,
                            "updatedAt" = NOW()
                    ''', (
                        reg_num, title[:255] if title else "", authors[:255], 
                        publisher[:255], year[:255], isbn[:255], subject, 
                        mfn, winisis_id
                    ))
                    
                    if cursor.statusmessage.startswith("INSERT"):
                        total_inserted += 1
                    else:
                        total_updated += 1
                        
                except Exception as e:
                    print(f"DB Error on {winisis_id}:", getattr(e, "pgerror", str(e)))
                    break
            
    cursor.close()
    conn.close()
    print(f"\nSeed complete. Inserted: {total_inserted}, Updated: {total_updated}")

if __name__ == "__main__":
    seed_db()
