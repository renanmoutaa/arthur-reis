import json
from main import extract_winisis_db

try:
    result = extract_winisis_db("ARTHUR", limit=50) # Just test 50 to see if it doesn't loop
    print(f"Extracted {result['count']} records.")
    print(json.dumps(result['data'][0], indent=2, ensure_ascii=False))
except Exception as e:
    import traceback
    traceback.print_exc()
