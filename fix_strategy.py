import re

filepath = "components/PetFoodDashboard.tsx"
with open(filepath, "r") as f:
    content = f.read()

# Replace strategy= with actionPlan= inside TakeawayBox blocks
# Since TakeawayBox is the only component using 'strategy' attribute here, we can just replace 'strategy='
content = content.replace("strategy=", "actionPlan=")

with open(filepath, "w") as f:
    f.write(content)
print("Updated strategy to actionPlan")
