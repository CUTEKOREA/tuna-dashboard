import re

def extract_widget(text, title_snippet):
    # Find the start of the card div that contains the title_snippet
    # We look backwards from the title snippet to find <div className={styles.card}>
    idx = text.find(title_snippet)
    if idx == -1: return None, text
    
    start_idx = text.rfind("<div className={styles.card}>", 0, idx)
    if start_idx == -1: return None, text
    
    # Count braces to find the end of the div
    div_count = 0
    end_idx = start_idx
    i = start_idx
    while i < len(text):
        if text[i:i+4] == "<div":
            div_count += 1
        elif text[i:i+6] == "</div>":
            div_count -= 1
            if div_count == 0:
                end_idx = i + 6
                break
        i += 1
        
    widget = text[start_idx:end_idx]
    # Remove from text
    new_text = text[:start_idx] + text[end_idx:]
    return widget, new_text

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/PetFoodDashboard.tsx', 'r') as f:
    text = f.read()

w1, text = extract_widget(text, 'title={d_kfas_w05.title}')
print("Extracted w1:", w1[:50] if w1 else None)

