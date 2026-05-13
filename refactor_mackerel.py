import os
import re
import glob

# Search for all Mackerel*.tsx files in components/
path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/Mackerel*.tsx'
files = glob.glob(path)

# Regex to find <InfoTooltip ... />
# Note: It might span multiple lines
info_tooltip_re = re.compile(r'<InfoTooltip\s+([^>]+)/>', re.DOTALL)
# Extract props
prop_re = re.compile(r'(\w+)=["\']([^"\']+)["\']')
# Import
import_re = re.compile(r'import\s+InfoTooltip\s+from\s+[\'"]\./InfoTooltip[\'"];?\n')

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '<InfoTooltip' not in content:
        continue
    
    print(f"Processing {file_path}")
    
    # 1. Remove import
    content = import_re.sub('', content)
    
    # 2. Find InfoTooltip
    match = info_tooltip_re.search(content)
    if not match:
        continue
        
    props_str = match.group(1)
    props = dict(prop_re.findall(props_str))
    
    description = props.get('description', '')
    methodology = props.get('methodology', '')
    data_source = props.get('dataSource', '')
    
    # Combine description and methodology
    combined_text = ' '.join(filter(None, [description, methodology]))
    
    # 3. Remove InfoTooltip from content
    content = info_tooltip_re.sub('', content)
    
    # 4. Insert the combined text right after </h3>
    # Let's see if there's already a <p> right after </h3>
    # Some files like MackerelUnitPrice have <p> right after </h3>
    h3_end_idx = content.find('</h3>')
    if h3_end_idx != -1:
        # Check if the next non-whitespace is <p>
        post_h3 = content[h3_end_idx+5:].lstrip()
        if not post_h3.startswith('<p'):
            # Insert a new <p>
            insert_pos = h3_end_idx + 5
            p_tag = f'\n        <p style={{{{ margin: \'4px 0 0 0\', fontSize: \'0.82rem\', color: \'#94a3b8\', lineHeight: 1.5 }}}}>\n          {combined_text}\n        </p>'
            content = content[:insert_pos] + p_tag + content[insert_pos:]
        else:
            # We already have a <p>, maybe we can just append to it if we want,
            # or maybe it already contains what we want.
            # In MackerelUnitPrice, it had a <p> with some text.
            # Let's replace the existing <p> content if we have a combined_text.
            pass

    # 5. TakeawayBox update
    # If the InfoTooltip had a dataSource, and TakeawayBox does NOT have a source prop, add it.
    if data_source:
        tb_match = re.search(r'<TakeawayBox\s+([^>]+)/>', content, re.DOTALL)
        if tb_match:
            tb_props = tb_match.group(1)
            if 'source=' not in tb_props:
                # Add source prop
                new_tb = f'<TakeawayBox source="{data_source}" {tb_props}/>'
                content = content.replace(tb_match.group(0), new_tb)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Updated {file_path}")
