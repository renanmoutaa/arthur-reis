from fastapi import FastAPI, HTTPException
import ioisis
import ioisis.mst as mst
import ioisis.fieldutils
import os

app = FastAPI(title="Bibliographic Data Service")

WINISIS_DATA_DIR = r"d:\bibiotecav2\WINISIS\DATA"

@app.get("/")
def read_root():
    return {"message": "Data Service is running."}

@app.get("/api/extract/{db_name}")
def extract_winisis_db(db_name: str, limit: int = 100):
    """
    Extracts a WINISIS database (.MST file) to JSON.
    """
    file_path = os.path.join(WINISIS_DATA_DIR, f"{db_name}.MST")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Database file not found")
        
    try:
        struct_creator = mst.StructCreator(format='isis', packed=True, lockable=True, default_shift=0, endianness='little')
        sfp = ioisis.fieldutils.SubfieldParser(prefix='^', first='_')
        
        records = []
        with open(file_path, "rb") as f:
            last_pos = f.tell()
            for count, con in enumerate(struct_creator.iter_con(f)):
                if limit > 0 and count >= limit:
                    break
                    
                cur_pos = f.tell()
                if cur_pos <= last_pos:
                    # Infinite loop detected, possibly EOF corruption
                    break
                last_pos = cur_pos
                
                try:
                    if con.status != 0:
                        continue # logically deleted
                    
                    raw_tl = ioisis.fieldutils.con_pairs(con, ftf=mst.DEFAULT_MST_FTF)
                    record = ioisis.fieldutils.tl2record(raw_tl, sfp, mode="field")
                    decoded_record = ioisis.fieldutils.nest_decode(record, encoding='latin-1') 
                    records.append(decoded_record)
                except Exception:
                    pass
                
        return {"status": "success", "db": db_name, "count": len(records), "data": records}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
