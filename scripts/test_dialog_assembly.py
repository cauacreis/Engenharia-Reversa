import os
from PIL import Image, ImageDraw, ImageFont

asset_dir = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\pvz_launcher_assets\images"
out_dir = r"c:\Users\Cauã Felype\Documents\Engenharia Reversa\pvz_launcher_assets"

# Load and convert all parts to RGBA
parts = {
    'tl': Image.open(os.path.join(asset_dir, "dialog_topleft.png")).convert("RGBA"),
    'tm': Image.open(os.path.join(asset_dir, "dialog_topmiddle.png")).convert("RGBA"),
    'tr': Image.open(os.path.join(asset_dir, "dialog_topright.png")).convert("RGBA"),
    'cl': Image.open(os.path.join(asset_dir, "dialog_centerleft.png")).convert("RGBA"),
    'cm': Image.open(os.path.join(asset_dir, "dialog_centermiddle.png")).convert("RGBA"),
    'cr': Image.open(os.path.join(asset_dir, "dialog_centerright.png")).convert("RGBA"),
    'bl': Image.open(os.path.join(asset_dir, "dialog_bottomleft.png")).convert("RGBA"),
    'bm': Image.open(os.path.join(asset_dir, "dialog_bottommiddle.png")).convert("RGBA"),
    'br': Image.open(os.path.join(asset_dir, "dialog_bottomright.png")).convert("RGBA"),
    'header': Image.open(os.path.join(asset_dir, "dialog_header.png")).convert("RGBA"),
    'btn_l': Image.open(os.path.join(asset_dir, "button_left.png")).convert("RGBA"),
    'btn_m': Image.open(os.path.join(asset_dir, "button_middle.png")).convert("RGBA"),
    'btn_r': Image.open(os.path.join(asset_dir, "button_right.png")).convert("RGBA"),
}

# Build a dialog of 680x500
w, h = 680, 500
dialog = Image.new("RGBA", (w, h), (0, 0, 0, 0))

tl_w, tl_h = parts['tl'].size
tr_w, tr_h = parts['tr'].size
bl_w, bl_h = parts['bl'].size
br_w, br_h = parts['br'].size

# Corners
dialog.paste(parts['tl'], (0, 0), parts['tl'])
dialog.paste(parts['tr'], (w - tr_w, 0), parts['tr'])
dialog.paste(parts['bl'], (0, h - bl_h), parts['bl'])
dialog.paste(parts['br'], (w - br_w, h - br_h), parts['br'])

# Top edge
tm_w, tm_h = parts['tm'].size
top_fill_w = w - tl_w - tr_w
top_tile = parts['tm'].resize((top_fill_w, tm_h), Image.Resampling.BILINEAR)
dialog.paste(top_tile, (tl_w, 0), top_tile)

# Bottom edge
bm_w, bm_h = parts['bm'].size
bot_fill_w = w - bl_w - br_w
bot_tile = parts['bm'].resize((bot_fill_w, bm_h), Image.Resampling.BILINEAR)
dialog.paste(bot_tile, (bl_w, h - bm_h), bot_tile)

# Left edge
cl_w, cl_h = parts['cl'].size
left_fill_h = h - tl_h - bl_h
left_tile = parts['cl'].resize((cl_w, left_fill_h), Image.Resampling.BILINEAR)
dialog.paste(left_tile, (0, tl_h), left_tile)

# Right edge
cr_w, cr_h = parts['cr'].size
right_fill_h = h - tr_h - br_h
right_tile = parts['cr'].resize((cr_w, right_fill_h), Image.Resampling.BILINEAR)
dialog.paste(right_tile, (w - cr_w, tr_h), right_tile)

# Center middle fill
cm_fill_w = w - cl_w - cr_w
cm_fill_h = h - tm_h - bm_h
cm_tile = parts['cm'].resize((cm_fill_w, cm_fill_h), Image.Resampling.BILINEAR)
dialog.paste(cm_tile, (cl_w, tm_h), cm_tile)

# Header banner at top
hw, hh = parts['header'].size
hx = (w - hw) // 2
dialog.paste(parts['header'], (hx, -5), parts['header'])

# Helper function to create an authentic PvZ button
def make_button(btn_w, text="OK"):
    bl, bm, br = parts['btn_l'], parts['btn_m'], parts['btn_r']
    btn = Image.new("RGBA", (btn_w, bl.height), (0, 0, 0, 0))
    btn.paste(bl, (0, 0), bl)
    mid_w = btn_w - bl.width - br.width
    mid_scaled = bm.resize((mid_w, bm.height), Image.Resampling.BILINEAR)
    btn.paste(mid_scaled, (bl.width, 0), mid_scaled)
    btn.paste(br, (bl.width + mid_w, 0), br)
    
    # Text on button
    draw = ImageDraw.Draw(btn)
    # Use default or basic font
    try:
        font = ImageFont.truetype("arialbd.ttf", 16)
    except:
        font = ImageFont.load_default()
    
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = (btn_w - tw) // 2
    ty = (bl.height - th) // 2 - 2
    # Shadow + Greenish gold PopCap text
    draw.text((tx + 1, ty + 1), text, font=font, fill=(30, 20, 10, 200))
    draw.text((tx, ty), text, font=font, fill=(240, 220, 120, 255))
    return btn

# Paste a couple sample buttons
btn_play = make_button(140, "JOGAR")
btn_saves = make_button(140, "SAVES")
btn_close = make_button(140, "FECHAR")

dialog.paste(btn_play, (w - 180, 160), btn_play)
dialog.paste(btn_saves, (w - 180, 225), btn_saves)
dialog.paste(btn_close, (w - 180, 290), btn_close)

# Draw inner user-selector frame (dark inset parchment box)
draw = ImageDraw.Draw(dialog)
inner_box = (50, 130, w - 210, 420)
# Dark border with sunken stone look
draw.rectangle(inner_box, fill=(45, 30, 20, 230), outline=(90, 70, 45, 255), width=3)

# Sample items inside the list
versions = [
    ("🌻 Plants vs. Zombies (Original Steam)", True),
    ("🧟 PvZ: DLC Edition Mod (v2.7.2)", False),
    ("🧬 PvZ: Hybrid Edition (Zabao Ban)", False),
    ("⚡ PvZ: Fusion Edition", False),
    ("🏆 PvZ: Community Edition (16:9 Widescreen)", False),
]

try:
    item_font = ImageFont.truetype("arialbd.ttf", 15)
    header_font = ImageFont.truetype("arialbd.ttf", 18)
except:
    item_font = header_font = ImageFont.load_default()

# Header text
draw.text((w // 2 - 120, 32), "QUAL VERSAO VAI JOGAR?", font=header_font, fill=(245, 230, 160, 255))

for i, (vname, selected) in enumerate(versions):
    iy = 145 + i * 50
    if selected:
        # Highlighted row (like PvZ user selection)
        draw.rectangle((55, iy - 5, w - 215, iy + 35), fill=(95, 75, 45, 240), outline=(230, 200, 100, 255), width=2)
        draw.text((65, iy + 5), vname, font=item_font, fill=(255, 240, 120, 255))
    else:
        draw.text((65, iy + 5), vname, font=item_font, fill=(210, 195, 170, 220))

test_path = os.path.join(out_dir, "test_dialog_frame.png")
dialog.save(test_path)
print("Saved complete authentic PvZ dialog prototype to:", test_path)
