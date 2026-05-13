import os
import re
import glob

# Search for all .tsx files in components/
path = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/*.tsx'
files = glob.glob(path)

# Regex to find <InfoTooltip ... />
info_tooltip_re = re.compile(r'<InfoTooltip\s+([^>]+)/>', re.DOTALL)
prop_re = re.compile(r'(\w+)=["\']([^"\']+)["\']')
import_re = re.compile(r'import\s+InfoTooltip\s+from\s+[\'"](?:\./)?InfoTooltip[\'"];?\n')

for file_path in files:
    if file_path.endswith('InfoTooltip.tsx'):
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '<InfoTooltip' not in content and 'import InfoTooltip' not in content:
        continue
    
    print(f"Processing {file_path}")
    
    # 1. Remove import
    content = import_re.sub('', content)
    
    # Process multiple InfoTooltip tags if there are multiple
    while True:
        match = info_tooltip_re.search(content)
        if not match:
            break
            
        props_str = match.group(1)
        props = dict(prop_re.findall(props_str))
        
        description = props.get('description', '')
        methodology = props.get('methodology', '')
        data_source = props.get('dataSource', '')
        
        combined_text = ' '.join(filter(None, [description, methodology]))
        
        # Replace the InfoTooltip with empty string
        start, end = match.span()
        
        # Now find the closest </h3> before this InfoTooltip if we want to insert <p>, 
        # OR we just insert the <p> exactly where the InfoTooltip was, or better yet, under the </h3>!
        # Actually, if we just look for </h3> before the match:
        h3_end_idx = content.rfind('</h3>', 0, start)
        
        content = content[:start] + content[end:] # Remove InfoTooltip
        
        if h3_end_idx != -1 and combined_text:
            # check if there's already a <p> right after </h3>
            # since we modify the content, the index h3_end_idx is still valid for everything before 'start'
            post_h3 = content[h3_end_idx+5:h3_end_idx+100].lstrip()
            if not post_h3.startswith('<p'):
                insert_pos = h3_end_idx + 5
                p_tag = f'\n        <p style={{{{ margin: \'4px 0 0 0\', fontSize: \'0.82rem\', color: \'#94a3b8\', lineHeight: 1.5 }}}}>\n          {combined_text}\n        </p>'
                content = content[:insert_pos] + p_tag + content[insert_pos:]
        
        # If the InfoTooltip had a dataSource, and TakeawayBox does NOT have a source prop, add it.
        if data_source:
            # Let's find the nearest TakeawayBox after this InfoTooltip
            # But just searching globally in the file is often fine if it's a 1-widget file.
            tb_match = re.search(r'<TakeawayBox\s+([^>]+)/>', content, re.DOTALL)
            if tb_match:
                tb_props = tb_match.group(1)
                if 'source=' not in tb_props:
                    new_tb = f'<TakeawayBox source="{data_source}" {tb_props}/>'
                    content = content.replace(tb_match.group(0), new_tb)
                    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Updated {file_path}")

