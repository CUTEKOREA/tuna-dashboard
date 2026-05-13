import re

ces_file = "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/Ces2026Insights.tsx"
sscm_file = "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/SscmInsights.tsx"
target_file = "/Users/idong-geon/Desktop/ai/unload-report/src/app/insight/page.tsx"

def parse_insights(filename):
    with open(filename, 'r') as f:
        content = f.read()
        
    insights = []
    # Match the objects in the array
    pattern = r'\{\s*title:\s*"([^"]+)",\s*methodology:\s*"([^"]+)",\s*situation:\s*"([^"]+)",\s*takeaway:\s*"([^"]+)",\s*source:\s*"([^"]+)"\s*\}'
    matches = re.finditer(pattern, content)
    for m in matches:
        insights.append({
            'title': m.group(1),
            'methodology': m.group(2),
            'situation': m.group(3),
            'takeaway': m.group(4),
            'source': m.group(5)
        })
    return insights

ces_insights = parse_insights(ces_file)
sscm_insights = parse_insights(sscm_file)

all_insights = ces_insights + sscm_insights
print(f"Found {len(all_insights)} total insights.")

jsx_output = ""
for i, ins in enumerate(all_insights, start=22):
    color = "theme.blue" if i % 2 == 0 else "theme.green"
    if i % 3 == 0:
        color = "theme.gold"
    if i % 4 == 0:
        color = "theme.pink"
        
    jsx_output += f"""
          {{/* {i}. {ins['title'][:20]}... */}}
          <div style={{cardStyle}}>
            <div style={{{{ borderBottom: `1px solid ${{theme.border}}`, paddingBottom: '16px', marginBottom: '24px' }}}}>
              <div style={{{{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}}}>
                <h2 style={{{{ margin: 0, fontSize: '16px', fontWeight: 800, color: theme.blue, fontFamily: 'Georgia, serif', lineHeight: 1.3 }}}}>
                  {ins['title']}
                </h2>
              </div>
            </div>

            <TakeawayBox 
              color={{{color}}} 
              methodology="{ins['methodology']}" 
              situation="{ins['situation']}" 
              takeaway="{ins['takeaway']}" 
              source="{ins['source']}"
            />
          </div>
"""

with open(target_file, 'r') as f:
    target_content = f.read()

# We want to insert right before the closing div for columnCount
# find: 1820:           </div>\n1821:\n1822:         </div>
# Let's do a reliable replacement.

replace_target = """            />
          </div>

        </div>"""

if replace_target in target_content:
    new_content = target_content.replace(replace_target, f"""            />
          </div>
{jsx_output}
        </div>""")
    with open(target_file, 'w') as f:
        f.write(new_content)
    print("Successfully injected insights.")
else:
    print("Could not find the insertion point.")
