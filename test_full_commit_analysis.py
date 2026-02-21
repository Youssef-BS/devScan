import requests

# Test analyzing multiple files in a commit
files_context = '''
Commit: Fix security vulnerabilities
Author: DevScan Bot
Date: 2026-02-21
Total Files Changed: 2
Total Additions: +45
Total Deletions: -12

Analysis: Please review all these files together and identify issues across the entire commit.

================================================================================
File 1: auth/login.ts (modified)
------------------------------------------------------------------------
Additions: +20 | Deletions: -5 | Changes: 25
------------------------------------------------------------------------
- function verifyPassword(input: string, hash: string) {
+ function verifyPassword(input: string, hash: string): boolean {
+   if (!input || !hash) return false;
    return bcrypt.compare(input, hash);
  }

================================================================================
File 2: database/queries.ts (modified)
------------------------------------------------------------------------
Additions: +25 | Deletions: -7 | Changes: 32
------------------------------------------------------------------------
- const query = 'SELECT * FROM users WHERE id = ' + userId;
+ const query = 'SELECT * FROM users WHERE id = $1';
+ const result = await db.query(query, [userId]);
'''

data = {
    'code': files_context,
    'analysisType': 'commit'
}

try:
    r = requests.post('http://localhost:4000/github/commit/analyze', json=data, timeout=60)
    print(f'Status: {r.status_code}')
    if r.status_code == 200:
        result = r.json()
        print(f'✅ Full Commit Analysis successful')
        print(f'\nAnalysis:\n{result.get("analysis", "No analysis")[:800]}...')
    else:
        print(f'❌ Error: {r.text[:200]}')
except Exception as e:
    print(f'❌ Error: {e}')
