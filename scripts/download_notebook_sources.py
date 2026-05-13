import os
import sys
import re
import time
from pathlib import Path
from datetime import datetime
import concurrent.futures

from notebooklm_mcp.api_client import NotebookLMClient
from notebooklm_mcp.auth import load_cached_tokens

def sanitize_filename(name):
    if not name:
        return "untitled"
    name = re.sub(r'[<>:"/\\|?*]', '_', name)
    name = name.replace('\n', '').replace('\r', '')
    return name.strip()

def download_source(client, source, out_dir):
    source_id = source.get('id')
    title = source.get('title', f"source_{source_id}")
    filename = f"{sanitize_filename(title)}.md"
    filepath = out_dir / filename
    
    if filepath.exists():
        return True, title  # Skip if already exists
        
    try:
        res = client.get_source_fulltext(source_id)
        content = res.get("content", "")
        source_type = res.get("source_type", source.get('source_type_name', 'unknown'))
        url = res.get("url", source.get('url', ''))
        
        md_content = f"# {title}\n\n"
        md_content += f"- **Source ID**: `{source_id}`\n"
        md_content += f"- **Type**: `{source_type}`\n"
        if url:
            md_content += f"- **URL**: {url}\n"
        md_content += f"- **Extracted At**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        md_content += "---\n\n"
        md_content += content
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(md_content)
        return True, title
    except Exception as e:
        return False, f"{title} (Error: {e})"

def main():
    tokens = load_cached_tokens()
    if not tokens:
        print("Error: No authentication tokens found.")
        sys.exit(1)
        
    client = NotebookLMClient(cookies=tokens.cookies)
    notebook_id = "767b7190-c2b6-447b-aa72-d86e06734031"
    
    print("Fetching source list...")
    sources = client.get_notebook_sources_with_types(notebook_id)
    total = len(sources)
    print(f"Total sources found: {total}")
    
    out_dir = Path("data/명태")
    out_dir.mkdir(parents=True, exist_ok=True)
    
    success = 0
    fail = 0
    
    # Use ThreadPoolExecutor for concurrent downloads
    print(f"Starting download to {out_dir.resolve()}...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        # submit all tasks
        future_to_source = {executor.submit(download_source, client, src, out_dir): src for src in sources}
        
        for i, future in enumerate(concurrent.futures.as_completed(future_to_source)):
            src = future_to_source[future]
            try:
                ok, msg = future.result()
                if ok:
                    success += 1
                    print(f"[{success+fail}/{total}] \033[32mSUCCESS\033[0m: {msg}")
                else:
                    fail += 1
                    print(f"[{success+fail}/{total}] \033[31mFAILED\033[0m: {msg}")
            except Exception as exc:
                fail += 1
                print(f"[{success+fail}/{total}] \033[31mFAILED\033[0m: {src.get('id')} generated an exception: {exc}")

    print(f"\nDone! Success: {success}, Failed: {fail}")

if __name__ == "__main__":
    main()
