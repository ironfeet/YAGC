import re
import sys

file_path = "src/modules/fun/VehicleJigsaw/index.vue"
out_path = "scratch/index_updated.vue"
try:
    with open(file_path, "r") as f:
        content = f.read()
except FileNotFoundError:
    print("File not found.")
    sys.exit(1)

replacements = {
    "Animal Jigsaw": "Vehicle Jigsaw",
    "animal pieces": "vehicle pieces",
    "AnimalDef": "VehicleDef",
    "ANIMALS": "VEHICLES",
    "ColorfulAnimal": "ColorfulVehicle",
    "currentAnimalIdx": "currentVehicleIdx",
    "animal.value": "vehicle.value",
    "animal.id": "vehicle.id",
    "animal.emoji": "vehicle.emoji",
    "animal.label": "vehicle.label",
    "fun-animal-jigsaw": "fun-vehicle-jigsaw",
    "nextAnimal": "nextVehicle",
    "animalId:": "vehicleId:",
    "const animal = ": "const vehicle = ",
    "Next Animal": "Next Vehicle",
}
for k, v in replacements.items():
    content = content.replace(k, v)

array_pattern = r"const VEHICLES: VehicleDef\[\] = \[.*?\];"
new_array = """const VEHICLES: VehicleDef[] = [
  { id: 'car', label: 'Car', emoji: '🚗' },
  { id: 'truck', label: 'Truck', emoji: '🚚' },
  { id: 'bus', label: 'Bus', emoji: '🚌' },
  { id: 'train', label: 'Train', emoji: '🚂' },
  { id: 'airplane', label: 'Airplane', emoji: '✈️' },
  { id: 'rocket', label: 'Rocket', emoji: '🚀' },
  { id: 'boat', label: 'Boat', emoji: '⛵' },
  { id: 'submarine', label: 'Submarine', emoji: '🚤' },
];"""
content = re.sub(array_pattern, new_array, content, flags=re.DOTALL)

with open(out_path, "w") as f:
    f.write(content)
print("Replaced successfully to scratch.")
