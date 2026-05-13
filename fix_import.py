import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

if "import KeepAlivePanel" not in content:
    # find the last import
    last_import = content.rfind("import ")
    end_of_last_import = content.find("\n", last_import)
    
    new_import = "\nimport KeepAlivePanel from '../components/KeepAlivePanel';"
    content = content[:end_of_last_import] + new_import + content[end_of_last_import:]
    
    with open('app/page.tsx', 'w') as f:
        f.write(content)
