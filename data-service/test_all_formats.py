import ioisis.mst as mst
import traceback
import sys

file_path = r"d:\bibiotecav2\WINISIS\DATA\ARTHUR.MST"

formats = ["isis", "ffi"]
packed_opts = [False, True]
lockable_opts = [False, True]
shifts = [0, 3, 6]
ibps = ["check", "ignore", "store"]
endiannesses = ["little", "big"]
min_modulus = [1, 2]

print("Starting enhanced scan...")
total = len(formats) * len(packed_opts) * len(lockable_opts) * len(shifts) * len(ibps) * len(endiannesses) * len(min_modulus)
current = 0

for fmt in formats:
    for packed in packed_opts:
        for lockable in lockable_opts:
            for shift in shifts:
                for ibp in ibps:
                    for endian in endiannesses:
                        for mod in min_modulus:
                            current += 1
                            if current % 100 == 0: print(f"Progress {current}/{total}")
                            try:
                                sc = mst.StructCreator(format=fmt, packed=packed, lockable=lockable, default_shift=shift, ibp=ibp, endianness=endian, min_modulus=mod)
                                count = 0
                                errors = 0
                                with open(file_path, "rb") as f:
                                    for raw_tl in sc.iter_raw_tl(f):
                                        count += 1
                                if count > 0 and errors == 0:
                                    print(f"SUCCESS: count={count}, format={fmt}, packed={packed}, lockable={lockable}, shift={shift}, ibp={ibp}, endianness={endian}, min_modulus={mod}")
                                    sys.exit(0)
                            except Exception as e:
                                pass
print("FAILED ALL COMBINATIONS")
