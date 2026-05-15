import re

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/PetFoodDashboard.tsx', 'r') as f:
    text = f.read()

def extract_widget(txt, title_snippet):
    idx = txt.find(title_snippet)
    if idx == -1: return None, txt
    
    start_idx = txt.rfind("<div className={styles.card}>", 0, idx)
    if start_idx == -1: return None, txt
    
    div_count = 0
    end_idx = start_idx
    i = start_idx
    while i < len(txt):
        if txt[i:i+4] == "<div": div_count += 1
        elif txt[i:i+6] == "</div>":
            div_count -= 1
            if div_count == 0:
                end_idx = i + 6
                break
        i += 1
        
    widget = txt[start_idx:end_idx]
    new_txt = txt[:start_idx] + txt[end_idx:]
    return widget, new_txt

widgets_to_move = {
    "Part I": [
        'title={d_kfas_w05.title}',
        'title="RFMO 쿼터 축소 → 원물 공급 리스크"',
        'title="기후변화 → 참치 서식지 이동 전망 (2050/2100)"'
    ],
    "Part II": [
        'title={d_kfas_w02.title}',
        'title={d_kfas_w04.title}'
    ],
    "Part III": [
        'title="US MMPA 비관세 장벽 리스크 레이더"'
    ],
    "Part V": [
        'title={d_kfas_w01.title}',
        'title={d_kfas_w03.title}',
        'title="참치 바이캐치 구조 해부 (대서양 vs 인도양)"',
        'title="전자감시(EMS) 컴플라이언스 스코어카드"',
        'title="Full Retention 양륙 → 펫푸드 원료 파이프라인"'
    ]
}

extracted = {"Part I": [], "Part II": [], "Part III": [], "Part V": []}

for part, snippets in widgets_to_move.items():
    for snip in snippets:
        w, text = extract_widget(text, snip)
        if w:
            extracted[part].append(w)
        else:
            print(f"Warning: could not find widget with snippet: {snip}")

# Now insert them into the respective parts
for part, widgets in extracted.items():
    if not widgets: continue
    
    # Find the header of the part
    if part == "Part I": part_str = "Part I — "
    elif part == "Part II": part_str = "Part II — "
    elif part == "Part III": part_str = "Part III — "
    elif part == "Part V": part_str = "Part V — "
    
    part_idx = text.find(part_str)
    if part_idx == -1: 
        print(f"Could not find {part_str}")
        continue
        
    grid_start = text.find("<div className={styles.grid}>", part_idx)
    
    # Find the end of this grid
    div_count = 0
    end_idx = grid_start
    i = grid_start
    while i < len(text):
        if text[i:i+4] == "<div": div_count += 1
        elif text[i:i+6] == "</div>":
            div_count -= 1
            if div_count == 0:
                end_idx = i
                break
        i += 1
        
    # Insert before end_idx
    widgets_str = "\n".join(widgets) + "\n"
    text = text[:end_idx] + widgets_str + text[end_idx:]

# Now we must remove the headers for Part VI and VII
# They look like this:
# <div style={{ marginBottom: '3rem' }}>
#   <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
# ... Part VII ...
#   <div className={styles.grid}>
#   </div>
# </div>

text = re.sub(r'<div style=\{\{\s*marginBottom:\s*\'3rem\'\s*\}\}>\s*<div style=\{\{\s*marginBottom:\'1rem\'.*?Part VII.*?</div>\s*</div>\s*<div className=\{styles\.grid\}>\s*</div>\s*</div>', '', text, flags=re.DOTALL)
text = re.sub(r'<div style=\{\{\s*marginBottom:\s*\'3rem\'\s*\}\}>\s*<div style=\{\{\s*marginBottom:\'1rem\'.*?Part VI — 공급망.*?</div>\s*</div>\s*<div className=\{styles\.grid\}>\s*</div>\s*</div>', '', text, flags=re.DOTALL)

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/PetFoodDashboard.tsx', 'w') as f:
    f.write(text)

print("Widgets extracted, inserted, and old sections removed.")
