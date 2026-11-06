import json

with open(r'c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\real_franklin\textasset_1_skeleton.txt', 'r', encoding='utf-8') as f:
    skel = json.load(f)

bones = {b['name']: b for b in skel.get('bones', [])}
slots = {s['name']: s for s in skel.get('slots', [])}

print('=== SLOTS & ATTACHED BONES ===')
for sname in ['Leg2', 'Foot2', 'Arm2', 'Hand2', 'Fist2', 'Body', 'Leg1', 'Foot1', 'Head', 'Armor/HeadArmor/Chicken', 'Armor/Masks/Glasses', 'Arm1', 'Hand1', 'Fist1']:
    slot = slots.get(sname, {})
    print(f"{sname}: bone={slot.get('bone')}, attachment={slot.get('attachment')}")

print('\n=== KEY BONES IN SETUP POSE ===')
for bname in ['root', 'bone23', 'bone24', 'bone', 'bone31', 'bone32', 'bone33', 'bone34', 'bone35', 'bone36', 'bone25', 'bone29', 'bone26', 'bone27']:
    if bname in bones:
        b = bones[bname]
        print(f"{bname}: parent={b.get('parent')}, x={b.get('x',0)}, y={b.get('y',0)}, rot={b.get('rotation',0)}, scaleX={b.get('scaleX',1)}, scaleY={b.get('scaleY',1)}")

default_skin = skel.get('skins', {}).get('default', {})
print('\n=== ATTACHMENT OFFSETS (default skin) ===')
for slot_name in ['Head', 'Armor/HeadArmor/Chicken', 'Armor/Masks/Glasses', 'Body', 'Arm1', 'Arm2', 'Hand1', 'Hand2', 'Fist1', 'Leg1', 'Leg2', 'Foot1', 'Foot2']:
    slot_data = default_skin.get(slot_name, {})
    for att_name, att in slot_data.items():
        if att_name in ['Head', 'Armor/HeadArmor/Crest', 'Armor/HeadArmor/Aviator Sunglasses', 'Body', 'a1', 'Arm2', 'Hand1', 'Hand2', 'Weapon/Boxing Gloves', 'Weapon/Hand Wrap', 'Leg1', 'Leg2', 'Foot1', 'Foot2']:
            print(f"  [{slot_name} -> {att_name}]: x={att.get('x',0)}, y={att.get('y',0)}, rot={att.get('rotation',0)}, scaleX={att.get('scaleX',1)}, scaleY={att.get('scaleY',1)}, w={att.get('width')}, h={att.get('height')}")

print('\n=== ACCESSORY BONES ===')
for bname in ['Hats', 'glasses', 'Fist1', 'Fist2', 'bone28', 'bone30', 'bone']:
    if bname in bones:
        b = bones[bname]
        print(f"{bname}: parent={b.get('parent')}, x={b.get('x',0)}, y={b.get('y',0)}, rot={b.get('rotation',0)}")
