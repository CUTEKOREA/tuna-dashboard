import re

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/PetFoodDashboard.tsx', 'r') as f:
    text = f.read()

parts = text.split("<div style={{ marginBottom: '3rem' }}>")
print(f"Number of parts found: {len(parts)}")
for i, p in enumerate(parts):
    # Print the first 50 characters of each part to see what it is
    print(f"Part {i}: {p[:100].strip()}")
