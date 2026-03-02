import struct
import os
import json
import sys

WINISIS_DIR = r"d:\bibiotecav2\WINISIS\DATA"

def robust_extract(db_name):
    mst_path = os.path.join(WINISIS_DIR, f"{db_name}.MST")
    records_dict = {}
    
    with open(mst_path, "rb") as f:
        data = f.read()

    print(f"File size: {len(data)} bytes")
    
    # Start scanning after control record (typically 64 bytes)
    offset = 64
    
    # ISIS format (packed=True, little-endian):
    # mfn(4s), mfrl(2u), mfbwb(4s), mfbwp(2u), base(2u), nvf(2u), status(2u)
    # total 18 bytes
    
    VALID_MFN_MAX = 500000
    
    while offset < len(data) - 18:
        # Avoid reading past the end padding of a block (512 bytes alignment)
        # However, records are packed sequentially.
        try:
            mfn, mfrl, mfbwb, mfbwp, base, nvf, status = struct.unpack_from("<ihhihhh", data, offset)
            # mfn is 4 bytes integer (i). mfrl is 2 bytes unsigned (H).
            # wait, python format: i=int(4), h=short(2), H=unsigned short(2)
            # Actually, standard isis ISIS unpacked: <i h i H H H H -> 4+2+4+2+2+2+2 = 18? Wait, i=4, h=2, i=4, H=2, H=2, H=2, H=2 -> 20 bytes?
            # Packed ISIS: MFN(4), MFRL(2), MFBWB(4), MFBWP(2), BASE(2), NVF(2), STATUS(2) -> 4+2+4+2+2+2+2 = 18 bytes.
            mfn, mfrl, mfbwb, mfbwp, base, nvf, status = struct.unpack_from("<ihihhhh", data, offset)
        except:
            offset += 1
            continue

        if mfrl < 0:
            mfrl = -mfrl # RLOCK sign bit trick in WINISIS

        # Heuristics for a valid record header
        if 0 < mfn < VALID_MFN_MAX and base == 18 + 6 * nvf and 0 <= nvf < 500 and (status == 0 or status == 1):
            if mfrl >= base and offset + mfrl <= len(data):
                # Valid record!
                record = {"mfn": mfn, "status": status, "fields": {}}
                dir_offset = offset + 18
                valid_fields = True
                
                # Parse directory
                for i in range(nvf):
                    tag, pos, length = struct.unpack_from("<hhh", data, dir_offset)
                    if pos + length > mfrl:
                        valid_fields = False
                        break
                    
                    field_data = data[offset + base + pos : offset + base + pos + length]
                    
                    try:
                        text = field_data.decode("cp850", errors="replace")
                    except:
                        text = repr(field_data)
                    
                    # Store subfields later, for now raw text
                    if str(tag) not in record["fields"]:
                        record["fields"][str(tag)] = []
                    record["fields"][str(tag)].append(text)
                    
                    dir_offset += 6
                
                if valid_fields:
                    # Deduplicate by MFN - latter records overwrite earlier (update semantics of WINISIS)
                    records_dict[mfn] = record
                    offset += mfrl  # jump to next record
                    continue
        
        # If not matched, move forward by 2 bytes (alignment) or 1
        offset += 2

    # Filter out active status (status == 0) and sort by MFN
    final_records = [rec for rec in records_dict.values() if rec["status"] == 0]
    final_records.sort(key=lambda x: x["mfn"])
    return final_records

if __name__ == "__main__":
    db = sys.argv[1] if len(sys.argv) > 1 else "ARTHUR"
    recs = robust_extract(db)
    print(f"Extracted {len(recs)} records from {db}.")
    if recs:
        with open(f"{db}.json", "w", encoding="utf-8") as f:
            json.dump(recs, f, ensure_ascii=False)
