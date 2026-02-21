import requests
import json

# Test the file_fix analysis type
data = {
    'code': '''def get_user(user_id):
    query = 'SELECT * FROM users WHERE id = ' + str(user_id)
    cursor.execute(query)
    return cursor.fetchone()''',
    'analysisType': 'file_fix'
}

try:
    r = requests.post('http://localhost:4000/github/commit/analyze', json=data, timeout=30)
    print(f'Status: {r.status_code}')
    if r.status_code == 200:
        result = r.json()
        print(f'✅ Analysis successful')
        print(f'\nAnalysis:\n{result["analysis"][:500]}...')
    else:
        print(f'❌ Error: {r.text[:200]}')
except Exception as e:
    print(f'❌ Error: {e}')
