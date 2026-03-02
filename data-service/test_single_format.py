import ioisis.mst as mst

file_path = r"d:\bibiotecav2\WINISIS\DATA\ARTHUR.MST"

sc = mst.StructCreator(format='isis', packed=False, lockable=True, default_shift=0, ibp="ignore")

count = 0
try:
    with open(file_path, "rb") as f:
        for idx, raw_tl in enumerate(sc.iter_raw_tl(f)):
            count += 1
            if count % 1000 == 0:
                print(f"Parsed {count} records...")
except Exception as e:
    import traceback
    traceback.print_exc()

print(f"Total parsed: {count}")
