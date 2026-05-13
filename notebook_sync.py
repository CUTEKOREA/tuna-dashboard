import json
import sys
import subprocess
import time
import os

def sync_sources():
    output_dir = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/data/캐슈넛/raw/notebooklm'
    os.makedirs(output_dir, exist_ok=True)
    
    with open('/Users/idong-geon/.gemini/antigravity/brain/3bb6f98a-87e0-433d-b20a-9ef73fff8d60/.system_generated/steps/215/output.txt', 'r') as f:
        data = json.load(f)
    
    sources = data.get("notebook", [])[0][1]
    
    proc = subprocess.Popen(
        ['/Users/idong-geon/.local/bin/notebooklm-mcp'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL, # Ignore FastMCP stderr
        text=True,
        bufsize=1
    )
    
    def send_req(req):
        proc.stdin.write(json.dumps(req) + '\n')
        proc.stdin.flush()
        
    def read_resp():
        return json.loads(proc.stdout.readline())

    # Initialize
    send_req({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "sync", "version": "1.0"}
        }
    })
    
    read_resp() # Wait for init
    
    send_req({
        "jsonrpc": "2.0",
        "method": "notifications/initialized"
    })

    req_id = 2
    total = len(sources)
    for i, source in enumerate(sources):
        source_id = source[0][0]
        title = source[1]
        
        safe_title = "".join([c for c in title if c.isalpha() or c.isdigit() or c in ' -_']).rstrip()
        filename = os.path.join(output_dir, f"{safe_title}.txt")
        
        # Skip if already downloaded
        if os.path.exists(filename) and os.path.getsize(filename) > 0:
            print(f"[{i+1}/{total}] Skipping {safe_title} (already exists)")
            continue
            
        print(f"[{i+1}/{total}] Fetching {safe_title}...")
        
        send_req({
            "jsonrpc": "2.0",
            "id": req_id,
            "method": "tools/call",
            "params": {
                "name": "notebooklm-mcp_source_get_content",
                "arguments": {
                    "source_id": source_id
                }
            }
        })
        
        resp = read_resp()
        if "result" in resp and "content" in resp["result"]:
            content_text = resp["result"]["content"][0]["text"]
            with open(filename, "w") as out:
                out.write(content_text)
        else:
            print(f"Error fetching {safe_title}:", resp)
            
        req_id += 1
    
    proc.terminate()
    print("Done fetching all sources.")

if __name__ == '__main__':
    sync_sources()
