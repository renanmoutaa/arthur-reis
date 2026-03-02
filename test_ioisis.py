from ioisis import mst

try:
    with open(r"d:\bibiotecav2\WINISIS\DATA\ARTHUR.MST", "rb") as f:
        # ioisis iter_records should yield record dicts
        for i, record in enumerate(mst.iter_records(f)):
            print(record)
            if i >= 3:
                break
    print("SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()
