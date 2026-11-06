import json

with open(r'c:\Users\Cauã Felype\Documents\Engenharia Reversa\extracted_bin\real_franklin\textasset_1_skeleton.txt', 'r', encoding='utf-8') as f:
    skel = json.load(f)

anims = skel.get('animations', {})

for anim_name in ['fists_idle', 'fists_punch1', 'fists_punch2', 'fists_punch3', 'fists_punch4']:
    if anim_name in anims:
        a = anims[anim_name]
        bones_in_anim = list(a.get('bones', {}).keys())
        print(f"Animation: {anim_name}")
        print(f"  Bones affected: {len(bones_in_anim)} bones: {bones_in_anim[:8]}...")
        # Check duration
        max_time = 0
        for b_name, b_data in a.get('bones', {}).items():
            for timeline_type in ['rotate', 'translate', 'scale']:
                for kf in b_data.get(timeline_type, []):
                    t = kf.get('time', 0)
                    if t > max_time:
                        max_time = t
        print(f"  Duration: {max_time:.2f}s")
