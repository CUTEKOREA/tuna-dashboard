import os
import glob
import json
import subprocess
import shutil

def upload_all():
    md_dir = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/data/선박정보/raw/notebooklm'
    md_files = glob.glob(os.path.join(md_dir, '*.md'))
    
    # 1. NotebookLM Upload
    notebook_id = "6045ea26-ec2b-46bd-b644-37faeb96f051" # 선박
    
    proc = subprocess.Popen(
        ['/Users/idong-geon/.local/bin/notebooklm-mcp'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True,
        bufsize=1
    )
    
    def send_req(req):
        proc.stdin.write(json.dumps(req) + '\n')
        proc.stdin.flush()
        
    def read_resp():
        line = proc.stdout.readline()
        if not line:
            return None
        return json.loads(line)

    send_req({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "upload", "version": "1.0"}
        }
    })
    read_resp() # Wait for init
    send_req({
        "jsonrpc": "2.0",
        "method": "notifications/initialized"
    })
    
    req_id = 2
    for md_file in md_files:
        filename = os.path.basename(md_file)
        title = os.path.splitext(filename)[0]
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        print(f"Uploading {title} to NotebookLM...")
        send_req({
            "jsonrpc": "2.0",
            "id": req_id,
            "method": "tools/call",
            "params": {
                "name": "notebooklm-mcp_notebook_add_text",
                "arguments": {
                    "notebook_id": notebook_id,
                    "title": title,
                    "text": content
                }
            }
        })
        resp = read_resp()
        if not resp or "error" in resp:
            print(f"Error uploading {title}: {resp}")
        req_id += 1
        
    proc.terminate()
    print("NotebookLM upload complete.")

    # 2. Obsidian Upload
    obsidian_vault = '/Users/idong-geon/ledog memory/최고위_하이브리드_싱크/Sources/선박'
    os.makedirs(obsidian_vault, exist_ok=True)
    
    for md_file in md_files:
        shutil.copy2(md_file, obsidian_vault)
        
    print(f"Obsidian copy complete to {obsidian_vault}.")

if __name__ == '__main__':
    upload_all()
