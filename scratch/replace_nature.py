import re
import sys

file_path = "src/modules/fun/NatureJigsaw/index.vue"
out_path = "scratch/index_nature_updated.vue"
try:
    with open(file_path, "r") as f:
        content = f.read()
except FileNotFoundError:
    print("File not found.")
    sys.exit(1)

replacements = {
    "Animal Jigsaw": "Nature Jigsaw",
    "animal pieces": "nature pieces",
    "AnimalDef": "NatureDef",
    "ANIMALS": "NATURE_ITEMS",
    "ColorfulAnimal": "ColorfulNature",
    "currentAnimalIdx": "currentNatureIdx",
    "animal.value": "nature.value",
    "animal.id": "nature.id",
    "animal.emoji": "nature.emoji",
    "animal.label": "nature.label",
    "fun-animal-jigsaw": "fun-nature-jigsaw",
    "nextAnimal": "nextNature",
    "animalId:": "natureId:",
    "const animal = ": "const nature = ",
    "Next Animal": "Next Nature",
}

for k, v in replacements.items():
    if k != "animal":
        content = content.replace(k, v)

array_pattern = r"const NATURE_ITEMS: NatureDef\[\] = \[.*?\];"
new_array = """const NATURE_ITEMS: NatureDef[] = [
  { id: 'tree', label: 'Tree', emoji: '🌳' },
  { id: 'flower', label: 'Flower', emoji: '🌻' },
  { id: 'sun', label: 'Sun', emoji: '☀️' },
  { id: 'cloud', label: 'Cloud', emoji: '☁️' },
  { id: 'mountain', label: 'Mountain', emoji: '⛰️' },
  { id: 'rainbow', label: 'Rainbow', emoji: '🌈' },
  { id: 'leaf', label: 'Leaf', emoji: '🍃' },
  { id: 'mushroom', label: 'Mushroom', emoji: '🍄' },
];"""
content = re.sub(array_pattern, new_array, content, flags=re.DOTALL)

with open(out_path, "w") as f:
    f.write(content)
print("Replaced successfully to scratch.")
