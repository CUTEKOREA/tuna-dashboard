import re

filepath = "components/PetFoodDashboard.tsx"
with open(filepath, "r") as f:
    content = f.read()

# 1. Import TakeawayBox
if "import TakeawayBox" not in content:
    content = re.sub(r"import EstimateBadge from '\./EstimateBadge';", "import EstimateBadge from './EstimateBadge';\nimport TakeawayBox from './TakeawayBox';", content)

# 2. Remove local TakeawayBox
content = re.sub(r"const TakeawayBox = \(\{ situation, strategy, source \}.*?\n\);\n", "", content, flags=re.DOTALL)

# 3. Rename strategy -> actionPlan
content = re.sub(r"<TakeawayBox\s+situation=([^s]+)\s+strategy=", r"<TakeawayBox situation=\1 actionPlan=", content)

with open(filepath, "w") as f:
    f.write(content)
print("Updated PetFood Takeaways")
