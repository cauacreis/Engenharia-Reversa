# -*- coding: utf-8 -*-
import os
from PIL import Image, ImageDraw, ImageFont

def render_preview():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    workspace_dir = os.path.abspath(os.path.join(script_dir, "..", "..", ".."))
    assets_dir = os.path.join(workspace_dir, "pvz_launcher_assets", "images")
    
    w, h = 760, 540
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    
    # Load 9-slice parts
    def load(name):
        p = os.path.join(assets_dir, f"{name}.png")
        return Image.open(p).convert("RGBA")
        
    tl = load("dialog_topleft")
    tm = load("dialog_topmiddle")
    tr = load("dialog_topright")
    cl = load("dialog_centerleft")
    cm = load("dialog_centermiddle")
    cr = load("dialog_centerright")
    bl = load("dialog_bottomleft")
    bm = load("dialog_bottommiddle")
    br = load("dialog_bottomright")
    header = load("dialog_header")
    
    btn_l = load("button_left")
    btn_m = load("button_middle")
    btn_r = load("button_right")

    # 1. 9-slice border
    tlw, tlh = tl.size
    trw, trh = tr.size
    blw, blh = bl.size
    brw, brh = br.size
    clw, clh = cl.size
    crw, crh = cr.size

    img.paste(tl, (0, 0), tl)
    img.paste(tr, (w - trw, 0), tr)
    img.paste(bl, (0, h - blh), bl)
    img.paste(br, (w - brw, h - brh), br)

    tm_scaled = tm.resize((w - tlw - trw, tlh), Image.Resampling.BILINEAR)
    img.paste(tm_scaled, (tlw, 0), tm_scaled)

    bm_scaled = bm.resize((w - blw - brw, blh), Image.Resampling.BILINEAR)
    img.paste(bm_scaled, (blw, h - blh), bm_scaled)

    cl_scaled = cl.resize((cl.size[0], h - tlh - blh), Image.Resampling.BILINEAR)
    img.paste(cl_scaled, (0, tlh), cl_scaled)

    cr_scaled = cr.resize((cr.size[0], h - trh - brh), Image.Resampling.BILINEAR)
    img.paste(cr_scaled, (w - crw, trh), cr_scaled)

    cm_scaled = cm.resize((w - tlw - trw, h - tlh - blh), Image.Resampling.BILINEAR)
    img.paste(cm_scaled, (tlw, tlh), cm_scaled)

    # 2. Header
    hw, hh = header.size
    hx = (w - hw) // 2
    img.paste(header, (hx, -5), header)

    draw = ImageDraw.Draw(img)

    # Fonts
    try:
        title_font = ImageFont.truetype("arialbd.ttf", 20)
        item_font = ImageFont.truetype("arialbd.ttf", 13)
        desc_font = ImageFont.truetype("arial.ttf", 11)
        badge_font = ImageFont.truetype("arialbd.ttf", 10)
        btn_font = ImageFont.truetype("arialbd.ttf", 13)
        status_font = ImageFont.truetype("arialbd.ttf", 11)
        detail_font = ImageFont.truetype("arial.ttf", 10)
    except:
        title_font = item_font = desc_font = badge_font = btn_font = status_font = detail_font = ImageFont.load_default()

    # Draw Title
    t_text = "QUAL VERSÃO VAI JOGAR?"
    bbox = draw.textbbox((0, 0), t_text, font=title_font)
    tw = bbox[2] - bbox[0]
    tx = (w - tw) // 2
    draw.text((tx + 2, 30), t_text, fill=(20, 20, 20, 255), font=title_font)
    draw.text((tx, 28), t_text, fill=(255, 235, 140, 255), font=title_font)

    # 3. Left List Panel
    list_x, list_y, list_w, list_h = 45, 100, 485, 290
    draw.rectangle([list_x, list_y, list_x + list_w, list_y + list_h], fill=(25, 20, 16, 230), outline=(95, 75, 50, 255), width=2)
    draw.rectangle([list_x + 2, list_y + 2, list_x + list_w - 2, list_y + list_h - 2], outline=(15, 10, 8, 255), width=1)

    mods = [
        {"id": "vanilla", "title": "Plants vs. Zombies (Steam GOTY)", "desc": "Versão clássica pura de 2009. Total compatibilidade com conquistas.", "installed": True, "lang": "PT-BR", "type": "sun"},
        {"id": "dlc_edition", "title": "Plants vs. Zombies: DLC Edition (v2.7.2)", "desc": "Expansão da comunidade GameJolt. Novos mundos, plantas e zumbis.", "installed": True, "lang": "PT-BR", "type": "dlc"},
        {"id": "community_edition", "title": "Plants vs. Zombies: Community Edition", "desc": "Suporte nativo a 16:9 Widescreen e 60 FPS com motor PopCap otimizado.", "installed": False, "lang": "PT-BR", "type": "trophy"},
        {"id": "hybrid", "title": "Plants vs. Zombies: Hybrid Edition (杂交版)", "desc": "Fenômeno global com plantas híbridas e poderes combinados.", "installed": False, "lang": "ENG", "type": "hybrid"},
        {"id": "fusion", "title": "Plants vs. Zombies: Fusion Edition (融合版)", "desc": "Fusão dinâmica de plantas em tempo real diretamente no gramado.", "installed": False, "lang": "PT-BR", "type": "fusion"},
    ]

    item_h = list_h // len(mods)
    selected_idx = 1 # DLC Edition selected

    for i, m in enumerate(mods):
        ry = list_y + 4 + i * item_h
        rw = list_w - 8
        rx = list_x + 4
        rh = item_h - 6
        is_sel = (i == selected_idx)

        if is_sel:
            draw.rectangle([rx, ry, rx + rw, ry + rh], fill=(70, 50, 30, 240), outline=(240, 210, 100, 255), width=2)
        else:
            draw.rectangle([rx, ry, rx + rw, ry + rh], fill=(35, 28, 22, 180), outline=(55, 45, 35, 255), width=1)

        # Draw thematic vector icon
        icon_cx = rx + 18
        icon_cy = ry + rh // 2
        if m["type"] == "sun":
            draw.ellipse([icon_cx - 10, icon_cy - 10, icon_cx + 10, icon_cy + 10], fill=(255, 200, 20), outline=(200, 130, 0))
            draw.ellipse([icon_cx - 5, icon_cy - 5, icon_cx + 5, icon_cy + 5], fill=(160, 90, 0))
        elif m["type"] == "dlc":
            draw.rectangle([icon_cx - 9, icon_cy - 11, icon_cx + 9, icon_cy + 11], fill=(80, 140, 90), outline=(30, 70, 40))
            draw.ellipse([icon_cx - 5, icon_cy - 4, icon_cx - 2, icon_cy - 1], fill=(220, 40, 40))
            draw.ellipse([icon_cx + 2, icon_cy - 4, icon_cx + 5, icon_cy - 1], fill=(220, 40, 40))
        elif m["type"] == "trophy":
            draw.polygon([(icon_cx - 8, icon_cy - 9), (icon_cx + 8, icon_cy - 9), (icon_cx + 5, icon_cy + 2), (icon_cx - 5, icon_cy + 2)], fill=(240, 210, 50), outline=(170, 130, 10))
            draw.rectangle([icon_cx - 2, icon_cy + 2, icon_cx + 2, icon_cy + 7], fill=(180, 140, 20))
            draw.rectangle([icon_cx - 6, icon_cy + 7, icon_cx + 6, icon_cy + 9], fill=(150, 110, 10))
        elif m["type"] == "hybrid":
            draw.ellipse([icon_cx - 8, icon_cy - 8, icon_cx + 8, icon_cy + 8], fill=(60, 160, 180), outline=(30, 100, 120))
            draw.line([icon_cx - 5, icon_cy + 5, icon_cx + 5, icon_cy - 5], fill=(255, 255, 255), width=2)
        elif m["type"] == "fusion":
            draw.polygon([(icon_cx + 2, icon_cy - 11), (icon_cx - 6, icon_cy), (icon_cx, icon_cy), (icon_cx - 2, icon_cy + 11), (icon_cx + 7, icon_cy - 1), (icon_cx + 1, icon_cy - 1)], fill=(255, 230, 40), outline=(180, 140, 0))

        # Title
        t_color = (255, 255, 255) if is_sel else (225, 215, 195)
        draw.text((rx + 36, ry + 6), m["title"], fill=(10, 10, 10), font=item_font)
        draw.text((rx + 35, ry + 5), m["title"], fill=t_color, font=item_font)

        # Description
        d_color = (240, 230, 200) if is_sel else (170, 160, 145)
        draw.text((rx + 35, ry + 26), m["desc"], fill=d_color, font=desc_font)

        # Badges on the right
        # 1. Language pill
        lang_text = m["lang"]
        lw = 44
        lx = rx + rw - lw - 84
        draw.rectangle([lx, ry + 7, lx + lw, ry + 26], fill=(50, 75, 100), outline=(90, 130, 170), width=1)
        draw.text((lx + 6, ry + 9), lang_text, fill=(230, 240, 255), font=badge_font)

        # 2. Status badge (INSTALADO / BAIXAR)
        status_text = "INSTALADO" if m["installed"] else "BAIXAR"
        status_bg = (60, 145, 60) if m["installed"] else (190, 120, 30)
        bw = 72
        bx = rx + rw - bw - 6
        draw.rectangle([bx, ry + 7, bx + bw, ry + 26], fill=status_bg, outline=(25, 20, 15), width=1)
        draw.text((bx + 6, ry + 9), status_text, fill=(255, 255, 255), font=badge_font)

    # 4. Language & Detail Bar under list
    bar_x, bar_y, bar_w, bar_h = 45, 396, 485, 42
    draw.rectangle([bar_x, bar_y, bar_x + bar_w, bar_y + bar_h], fill=(30, 24, 18, 240), outline=(90, 70, 45, 255), width=2)
    draw.text((bar_x + 10, bar_y + 6), "IDIOMA SELECIONADO: Português (Brasil) [PT-BR]", fill=(120, 230, 140), font=status_font)
    draw.text((bar_x + 10, bar_y + 23), "Tradução comunitária ativa com injeção automática em LawnStrings.txt.", fill=(200, 190, 170), font=detail_font)

    # 5. Buttons on the right
    def draw_btn(x, y, text, primary=False):
        bw = 175
        bh = btn_l.size[1]
        img.paste(btn_l, (x, y), btn_l)
        bm_s = btn_m.resize((bw - btn_l.size[0] - btn_r.size[0], bh), Image.Resampling.BILINEAR)
        img.paste(bm_s, (x + btn_l.size[0], y), bm_s)
        img.paste(btn_r, (x + bw - btn_r.size[0], y), btn_r)

        bb = draw.textbbox((0, 0), text, font=btn_font)
        btw = bb[2] - bb[0]
        btx = x + (bw - btw) // 2
        bty = y + (bh - (bb[3] - bb[1])) // 2 - 2

        draw.text((btx + 1, bty + 1), text, fill=(0, 0, 0, 255), font=btn_font)
        col = (255, 240, 130) if primary else (230, 220, 190)
        draw.text((btx, bty), text, fill=col, font=btn_font)

    bx_btn = 545
    draw_btn(bx_btn, 110, "JOGAR", primary=True)
    draw_btn(bx_btn, 170, "IDIOMA (PT-BR)")
    draw_btn(bx_btn, 230, "EXPLORAR")
    draw_btn(bx_btn, 290, "SAVES")
    draw_btn(bx_btn, 350, "FECHAR")

    # 6. Bottom Steam Connection Status
    st_x, st_y, st_w, st_h = 45, 448, 675, 48
    draw.rectangle([st_x, st_y, st_x + st_w, st_y + st_h], fill=(22, 17, 13, 240), outline=(80, 60, 40, 255), width=2)
    
    # Glowing green LED
    draw.ellipse([st_x + 10, st_y + 11, st_x + 20, st_y + 21], fill=(80, 230, 80), outline=(20, 120, 20))
    draw.ellipse([st_x + 12, st_y + 13, st_x + 16, st_y + 17], fill=(200, 255, 200))
    draw.text((st_x + 26, st_y + 9), "Conexão Steam Ativa (AppID: 3590) • Rastreamento de Horas Habilitado", fill=(130, 235, 130), font=status_font)
    draw.text((st_x + 26, st_y + 27), "Saves: Sandbox Seguro Isolado • Conquistas Steam: Totalmente Suportadas", fill=(195, 185, 165), font=detail_font)

    out_path = os.path.join(workspace_dir, "pvz_launcher_assets", "pvz_improved_launcher_preview.png")
    img.save(out_path)
    print(f"Rendered preview: {out_path}")
    return out_path

if __name__ == "__main__":
    render_preview()