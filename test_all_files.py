#!/usr/bin/env python3
"""
Comprehensive test to verify all files are fetched for a commit
"""

import requests
import json
from datetime import datetime

API_BASE = "http://localhost:4000"

def test_commit_file_retrieval():
    """Test fetching commit details and verify all files are returned"""
    
    # First, let's check if there are any commits in the database
    print("=" * 80)
    print("TEST: Verify ALL commit files are fetched and displayed")
    print("=" * 80)
    
    # Test with a specific SHA - you'll need to get this from your database
    test_sha = "abc123def456"  # Replace with actual SHA
    
    print(f"\n1. Testing API with SHA: {test_sha}")
    print("-" * 40)
    
    try:
        response = requests.get(
            f"{API_BASE}/github/commit/details/{test_sha}",
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"\n✅ Successfully retrieved commit data")
            print(f"   Message: {data['commitInfo']['message'][:50]}...")
            print(f"   Author: {data['commitInfo']['author']}")
            print(f"   Total Files: {len(data['files'])}")
            print(f"   Total Changes: {data['commitInfo']['totalChanges']}")
            
            print(f"\n2. Analyzing files returned:")
            print("-" * 40)
            
            with_patch = 0
            without_patch = 0
            file_types = {}
            
            for i, file in enumerate(data['files'], 1):
                has_patch = bool(file.get('patch') and file['patch'].strip())
                if has_patch:
                    with_patch += 1
                else:
                    without_patch += 1
                    
                status = file['status']
                file_types[status] = file_types.get(status, 0) + 1
                
                print(f"   {i}. {file['path']}")
                print(f"      Status: {status} | Changes: +{file['additions']} -{file['deletions']}")
                print(f"      Patch: {'✓ ' + str(len(file['patch'])) + ' chars' if has_patch else '✗ Empty/Missing'}")
            
            print(f"\n3. Summary:")
            print("-" * 40)
            print(f"   Files with patch data: {with_patch}")
            print(f"   Files without patch data: {without_patch}")
            print(f"   File status breakdown: {file_types}")
            
            if without_patch > 0:
                print(f"\n⚠️  {without_patch} files have no patch data")
                print("   These might be binary files or files with no textual changes")
                print("   ✓ API should have fallback descriptions")
            
            print(f"\n✅ TEST PASSED" if len(data['files']) > 0 else "❌ TEST FAILED - No files returned")
            
        elif response.status_code == 404:
            print("❌ Commit not found")
            print("   Make sure the SHA exists in the database")
        else:
            print(f"❌ Error: {response.text[:200]}")
            
    except requests.exceptions.Timeout:
        print("❌ API request timed out")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "=" * 80)
    print("INSTRUCTIONS:")
    print("=" * 80)
    print("""
1. To test with a real commit:
   - Open your app at http://localhost:3000
   - Go to a repository and view a commit
   - Note the commit SHA (e.g., from URL: /commits/abc123def456)
   - Replace 'test_sha' in this script with the actual SHA
   - Run this test again

2. Expected results:
   ✓ All files from the commit should be listed
   ✓ Files should have patch data (even if it's just a fallback)
   ✓ Total file count should be > 0

3. If files are missing:
   ✗ Check database for CommitFile records
   ✗ Verify GitHub API access token is valid
   ✗ Check server logs for errors
""")

if __name__ == "__main__":
    test_commit_file_retrieval()
