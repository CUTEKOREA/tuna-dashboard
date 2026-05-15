import re

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/PetFoodDashboard.module.css', 'r') as f:
    css = f.read()

grid_replacement = """.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.grid > :last-child:nth-child(odd) {
  grid-column: 1 / -1;
}"""

css = re.sub(r'\.grid\s*\{[^}]+\}', grid_replacement, css)

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/PetFoodDashboard.module.css', 'w') as f:
    f.write(css)

print("Updated PetFoodDashboard.module.css")
