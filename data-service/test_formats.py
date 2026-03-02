import ioisis.mst as mst
import traceback

file_path = r"d:\bibiotecav2\WINISIS\DATA\ARTHUR.MST"

formats = ["isis", "ffi"]
packed_opts = [False, True]
lockable_opts = [False, True]
shifts = [0, 3, 6]

found = False

for fmt in formats:
    for packed in packed_opts:
        for lockable in lockable_opts:
            for shift in shifts:
                try:
                    sc = mst.StructCreator(format=fmt, packed=packed, lockable=lockable, default_shift=shift)
                    records = []
                    with open(file_path, "rb") as f:
                        for idx, raw_tl in enumerate(sc.iter_raw_tl(f)):
                            records.append(raw_tl)
                            if idx > 0:
                                break
                    print(f"SUCCESS: format={fmt}, packed={packed}, lockable={lockable}, shift={shift}")
                    found = True
                    break
                except Exception as e:
                    pass
            if found: break
        if found: break
    if found: break

if not found:
    print("FAILED ALL COMBINATIONS")
