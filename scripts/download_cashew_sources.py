import re
import os
import sys

# Ensure we can import notebooklm_mcp
sys.path.append("/Users/idong-geon/.local/share/uv/tools/notebooklm-mcp-server/lib/python3.14/site-packages")
from notebooklm_mcp.server import get_client

output_file = "/Users/idong-geon/.gemini/antigravity/brain/3bb6f98a-87e0-433d-b20a-9ef73fff8d60/.system_generated/steps/2439/output.txt"
with open(output_file, 'r', encoding='utf-8') as f:
    data = f.read()

pattern = r'\[\["([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})"\]\s*,\s*"([^"\\]*(?:\\.[^"\\]*)*)"'

matches = re.findall(pattern, data)

print(f"Found {len(matches)} sources to download.")

unique_sources = {}
for src_id, title in matches:
    unique_sources[src_id] = title.replace("\\", "").replace("/", "_").replace(":", "_")

try:
    client = get_client()
except Exception as e:
    print(f"Failed to get client: {e}")
    sys.exit(1)

output_dir = "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/data/캐슈넛/notebooklm_sources"
os.makedirs(output_dir, exist_ok=True)

success_count = 0
for idx, (src_id, title) in enumerate(unique_sources.items(), 1):
    try:
        safe_title = title[:150]
        file_path = os.path.join(output_dir, f"{safe_title}.md")
        
        if os.path.exists(file_path):
            print(f"[{idx}/{len(unique_sources)}] Skipping already downloaded: {title}")
            continue
            
        print(f"[{idx}/{len(unique_sources)}] Downloading: {title} ({src_id})")
        res = client.get_source_fulltext(src_id)
        content = res.get("content", "")
        
        with open(file_path, "w", encoding='utf-8') as f:
            f.write(f"# {title}\n\n")
            f.write(content)
            
        success_count += 1
    except Exception as e:
        print(f"Error downloading {src_id}: {e}")

print(f"Successfully downloaded {success_count} new sources.")
