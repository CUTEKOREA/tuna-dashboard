import re

with open("/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/TunaRanching.tsx", "r") as f:
    content = f.read()

# 1. Add xFmt definition
xfmt_code = """
  const xFmt = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const cleaned = tick.replace(/\\s*\\(.*?\\)\\s*/g, '').trim();
    return cleaned.length > 6 ? cleaned.substring(0, 6) + '..' : cleaned;
  };
"""

content = content.replace("const [isEduOpen, setIsEduOpen] = useState(true);", "const [isEduOpen, setIsEduOpen] = useState(true);\n" + xfmt_code)

# 2. Add tickFormatter={xFmt} to XAxis
def replace_xaxis(match):
    tag = match.group(0)
    if "tickFormatter" not in tag:
        # Check if tick object exists
        if "tick={" in tag:
            # We can't cleanly parse JSX with regex if it's complex, but we can do a simple replacement
            # Insert tickFormatter={xFmt} before closing bracket or />
            tag = tag.replace("/>", " tickFormatter={xFmt} />")
            tag = tag.replace("> ", " tickFormatter={xFmt}> ")
    return tag

content = re.sub(r'<XAxis[^>]*/>', replace_xaxis, content)
content = re.sub(r'<PolarAngleAxis[^>]*/>', replace_xaxis, content)

with open("/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/TunaRanching.tsx", "w") as f:
    f.write(content)
