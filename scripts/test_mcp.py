import json
import subprocess
import threading
import time

def main():
    p = subprocess.Popen(["npx", "-y", "notebooklm-mcp"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)
    
    def read_stdout():
        for line in p.stdout:
            print("STDOUT:", line.strip())
            
    def read_stderr():
        for line in p.stderr:
            print("STDERR:", line.strip())

    threading.Thread(target=read_stdout, daemon=True).start()
    threading.Thread(target=read_stderr, daemon=True).start()

    init_msg = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "test", "version": "1.0"}
        }
    }
    p.stdin.write(json.dumps(init_msg) + "\n")
    p.stdin.flush()
    time.sleep(2)
    p.terminate()

if __name__ == "__main__":
    main()
