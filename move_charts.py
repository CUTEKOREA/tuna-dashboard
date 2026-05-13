import re

with open('components/CarrotDashboard.tsx', 'r') as f:
    content = f.read()

# Extract Section 0 blocks
fao1_regex = re.compile(r'(?:[ \t]*\{\/\* FAO Chart 1: Production vs Yield \*\/\}).*?(?:[ \t]*\{\/\* FAO Chart 2)', re.DOTALL)
fao2_regex = re.compile(r'(?:[ \t]*\{\/\* FAO Chart 2: Trade Dependencies \*\/\}).*?(?:[ \t]*\{\/\* FAO Chart 3)', re.DOTALL)
fao3_regex = re.compile(r'(?:[ \t]*\{\/\* FAO Chart 3: Producer Price Volatility \*\/\}).*?(?:[ \t]*\{\/\* FAO Chart 4)', re.DOTALL)
fao4_regex = re.compile(r'(?:[ \t]*\{\/\* FAO Chart 4: Supply Utilization and Loss \*\/\}).*?(?:[ \t]*</div>\n[ \t]*\n[ \t]*\{\/\* Section 1)', re.DOTALL)

fao1_match = fao1_regex.search(content)
fao2_match = fao2_regex.search(content)
fao3_match = fao3_regex.search(content)
fao4_match = fao4_regex.search(content)

fao1 = fao1_match.group(0) if fao1_match else ""
fao2 = fao2_match.group(0) if fao2_match else ""
fao3 = fao3_match.group(0) if fao3_match else ""
fao4 = fao4_match.group(0) if fao4_match else ""

# Remove '<!-- FAO Chart N ...' to the end from each group so we just get the div
fao1 = re.sub(r'[ \t]*\{\/\* FAO Chart 2.*', '', fao1, flags=re.DOTALL)
fao2 = re.sub(r'[ \t]*\{\/\* FAO Chart 3.*', '', fao2, flags=re.DOTALL)
fao3 = re.sub(r'[ \t]*\{\/\* FAO Chart 4.*', '', fao3, flags=re.DOTALL)
fao4 = re.sub(r'[ \t]*</div>\n[ \t]*\n[ \t]*\{\/\* Section 1.*', '', fao4, flags=re.DOTALL)

# Delete Section 0 completely from content
section0_regex = re.compile(r'[ \t]*\{\/\* Section 0: FAOSTAT Factbook \*\/\}.*?(?=\{\/\* Section 1: Raw Material \*\/})', re.DOTALL)
content = section0_regex.sub('', content)

# Insert FAO 1 & 3 into Section 1
sec1_insert = r'({\/\* Section 1: Raw Material \*\/}.*?<div style={{ display:\'grid\', gridTemplateColumns:\'repeat\(auto-fit, minmax\(min\(100%,540px\), 1fr\)\)\', gap:\'1.5rem\', marginBottom:\'2.5rem\' }}>\n)'
content = re.sub(sec1_insert, r'\g<1>' + fao1 + fao3, content, count=1, flags=re.DOTALL)

# Insert FAO 2 into Section 3
sec3_insert = r'({\/\* Section 3: Logistics \*\/}.*?<div style={{ display:\'grid\', gridTemplateColumns:\'repeat\(auto-fit, minmax\(min\(100%,540px\), 1fr\)\)\', gap:\'1.5rem\', marginBottom:\'2.5rem\' }}>\n)'
content = re.sub(sec3_insert, r'\g<1>' + fao2, content, count=1, flags=re.DOTALL)

# Insert FAO 4 into Section 5
sec5_insert = r'({\/\* Section 5: ESG \*\/}.*?<div style={{ display:\'grid\', gridTemplateColumns:\'repeat\(auto-fit, minmax\(min\(100%,540px\), 1fr\)\)\', gap:\'1.5rem\', marginBottom:\'2.5rem\' }}>\n)'
content = re.sub(sec5_insert, r'\g<1>' + fao4, content, count=1, flags=re.DOTALL)

with open('components/CarrotDashboard.tsx', 'w') as f:
    f.write(content)

print("Done rearranging charts.")
