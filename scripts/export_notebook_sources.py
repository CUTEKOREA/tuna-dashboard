import sys
import os
import time
import json
from pathlib import Path

# Add the uv python environment site-packages to path so we can import notebooklm_mcp
site_packages_path = os.path.expanduser("~/.local/share/uv/tools/notebooklm-mcp-server/lib/python3.14/site-packages")
sys.path.append(site_packages_path)

from notebooklm_mcp.api_client import NotebookLMClient
from notebooklm_mcp.auth import load_cached_tokens

def export_sources(notebook_id, output_dir):
    tokens = load_cached_tokens()
    if not tokens:
        print("No cached tokens found. Please authenticate first.")
        return
    
    client = NotebookLMClient(cookies=tokens.cookies, csrf_token=tokens.csrf_token, session_id=tokens.session_id)
    
    # Get notebook details to get sources
    sources = client.get_notebook_sources_with_types(notebook_id)
    print(f"Exporting sources from notebook {notebook_id}")
    
    os.makedirs(output_dir, exist_ok=True)
    
    # There are 497 sources. We'll do it sequentially to be safe
    success_count = 0
    fail_count = 0
    
    for i, source in enumerate(sources):
        source_id = source.get("id")
        title = source.get("title", f"source_{source_id}")
        # Clean title for filename
        safe_title = "".join([c if c.isalnum() or c in " .-_" else "_" for c in title])
        file_path = os.path.join(output_dir, f"{safe_title}.md")
        
        # Skip if already downloaded
        if os.path.exists(file_path):
            print(f"[{i+1}/{len(sources)}] Skipping already downloaded: {safe_title}")
            success_count += 1
            continue
            
        print(f"[{i+1}/{len(sources)}] Downloading: {title} ({source_id})")
        try:
            result = client.get_source_fulltext(source_id)
            content = result.get("content", "")
            
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(f"# {title}\n\n")
                f.write(content)
                
            success_count += 1
            # Add a small delay to avoid hitting limits too quickly
            time.sleep(0.1)
        except Exception as e:
            print(f"Error downloading {title}: {e}")
            fail_count += 1
            
    print(f"Export complete. Success: {success_count}, Failed: {fail_count}")

if __name__ == "__main__":
    notebook_id = "1ce41abd-bdd2-4fce-8de7-e6a9f27ef6da"
    output_dir = "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/data/참치"
    export_sources(notebook_id, output_dir)
