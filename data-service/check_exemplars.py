from extract_robust import robust_extract
import json

dbs = ["ARTHUR", "BOOKS", "CDS", "FOLHE", "PERIO", "SELETA"]

for db in dbs:
    print(f"\nScanning {db}...")
    try:
        recs = robust_extract(db)
    except Exception as e:
        print(f"Failed to extract {db}: {e}")
        continue
        
    for r in recs:
        fields = r["fields"]
        if "180" in fields and len(fields["180"]) > 1:
            print(f"MFN {r['mfn']} in {db} has multiple 180s: {fields['180']}")
            break
        elif "180" in fields:
            # Maybe it's comma separated?
            if any("," in v or "ex." in v.lower() for v in fields["180"]):
                print(f"MFN {r['mfn']} in {db} has comma/ex in 180: {fields['180']}")
                break
