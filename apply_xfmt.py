import re

with open("/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/TunaRanching.tsx", "r") as f:
    content = f.read()

def replace_xaxis(match):
    tag = match.group(0)
    if "tickFormatter" not in tag:
        tag = tag.replace("/>", " tickFormatter={xFmt} />")
        tag = tag.replace("> ", " tickFormatter={xFmt}> ")
    return tag

content = re.sub(r'<XAxis[^>]*/>', replace_xaxis, content)
content = re.sub(r'<PolarAngleAxis[^>]*/>', replace_xaxis, content)

with open("/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/TunaRanching.tsx", "w") as f:
    f.write(content)

print("Applied xFmt")
