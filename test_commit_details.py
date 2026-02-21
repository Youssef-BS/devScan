#!/usr/bin/env python3
"""
Test script to verify commit details are being fetched correctly
"""

import requests
import json

# Replace with an actual commit SHA from your database
test_sha = "test_sha_here"

api_url = "http://localhost:4000/github/commit/details"

try:
    response = requests.get(f"{api_url}/{test_sha}", timeout=30)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nCommit Info:")
        print(f"  Message: {data['commitInfo']['message']}")
        print(f"  Author: {data['commitInfo']['author']}")
        print(f"  Files: {len(data['files'])}")
        
        print(f"\nFiles in commit:")
        for i, file in enumerate(data['files'][:3], 1):
            patch_length = len(file.get('patch', ''))
            print(f"  {i}. {file['path']}")
            print(f"     Status: {file['status']}")
            print(f"     Changes: +{file['additions']} -{file['deletions']}")
            print(f"     Patch Length: {patch_length} chars")
            if file.get('patch'):
                print(f"     Has Patch: ✓")
            else:
                print(f"     Has Patch: ✗")
    else:
        print(f"Error: {response.text[:200]}")

except Exception as e:
    print(f"Error: {e}")
    print("\nNote: Replace test_sha_here with an actual commit SHA")
