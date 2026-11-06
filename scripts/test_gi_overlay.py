import os
from PIL import Image

parts_dir = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\real_franklin\parts"
out_dir = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\real_franklin"

body = Image.open(os.path.join(parts_dir, "Body.png"))
gi = Image.open(os.path.join(parts_dir, "Armor_Body_Karategi_b.png"))

print(f"Body: {body.size}, Gi: {gi.size}")

# Test pasting gi on body
test_canvas = Image.new("RGBA", (300, 300), (0, 0, 0, 0))
test_canvas.paste(body, (50, 30), body)
test_canvas.paste(gi, (50, 30), gi)
test_canvas.save(os.path.join(out_dir, "test_torso_karate.png"))
print("Saved test_torso_karate.png")
