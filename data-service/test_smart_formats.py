import ioisis.mst as mst

file_path = r"d:\bibiotecav2\WINISIS\DATA\ARTHUR.MST"

formats = ["isis", "ffi"]
packed_opts = [False, True]
lockable_opts = [False, True]
shifts = [0, 3, 6]
endiannesses = ["little", "big"]

with open("smart_scan_results.txt", "w") as out_f:
    out_f.write("Starting smart scan...\n")
    for fmt in formats:
        for packed in packed_opts:
            for lockable in lockable_opts:
                for shift in shifts:
                    for endian in endiannesses:
                        try:
                            sc = mst.StructCreator(format=fmt, packed=packed, lockable=lockable, default_shift=shift, endianness=endian)
                            count = 0
                            with open(file_path, "rb") as f:
                                last_pos = f.tell()
                                for raw_tl in sc.iter_raw_tl(f):
                                    cur_pos = f.tell()
                                    if cur_pos <= last_pos:
                                        raise ValueError("Infinite loop")
                                    last_pos = cur_pos
                                    count += 1
                                    if count >= 10:
                                        break
                            if count >= 10:
                                res = f"SUCCESS: format={fmt}, packed={packed}, lockable={lockable}, shift={shift}, endianness={endian}\n"
                                out_f.write(res)
                        except Exception as e:
                            pass
    out_f.write("Finished scan.\n")
