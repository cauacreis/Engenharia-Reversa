# -*- coding: utf-8 -*-
import os
from PIL import Image, ImageDraw, ImageFont

def render_tab_preview(active_category="pvz2", out_filename="pvz2_tab_preview.png"):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    workspace_dir = os.path.abspath(os.path.join(script_dir, "..", "..", ".."))
    assets_dir = os.path.join(workspace_dir, "pvz_launcher_assets", "images")
    
    w, h = 760, 540
    img = Image.new("RGBA", (w, h), (34, 36, 52, 255))
    
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

    tlw, tlh = 107, 97
    trw, trh = 120, 97
    blw, blh = 107, 114
    brw, brh = 120, 114

    midW = w - tlw - trw
    midH = h - tlh - blh

    # 1. 9-slice stone dialog with zero-gap overlap
    cm_scaled = cm.resize((midW + 4, midH + 4), Image.Resampling.BILINEAR)
    img.paste(cm_scaled, (tlw - 2, tlh - 2), cm_scaled)

    tm_scaled = tm.resize((midW + 2, tlh), Image.Resampling.BILINEAR)
    img.paste(tm_scaled, (tlw - 1, 0), tm_scaled)

    bm_scaled = bm.resize((midW + 2, blh), Image.Resampling.BILINEAR)
    img.paste(bm_scaled, (tlw - 1, h - blh), bm_scaled)

    cl_scaled = cl.resize((tlw, midH + 2), Image.Resampling.BILINEAR)
    img.paste(cl_scaled, (0, tlh - 1), cl_scaled)

    cr_scaled = cr.resize((trw, midH + 2), Image.Resampling.BILINEAR)
    img.paste(cr_scaled, (w - trw, trh - 1), cr_scaled)

    img.paste(tl, (0, 0), tl)
    img.paste(tr, (w - trw, 0), tr)
    img.paste(bl, (0, h - blh), bl)
    img.paste(br, (w - brw, h - brh), br)

    # 2. Header
    hw, hh = header.size
    hx = (w - hw) // 2
    img.paste(header, (hx, -5), header)

    draw = ImageDraw.Draw(img)

    try:
        title_font = ImageFont.truetype("arialbd.ttf", 18)
        tab_font = ImageFont.truetype("arialbd.ttf", 10)
        item_font = ImageFont.truetype("arialbd.ttf", 11)
        desc_font = ImageFont.truetype("arial.ttf", 9)
        badge_font = ImageFont.truetype("arialbd.ttf", 8)
        btn_font = ImageFont.truetype("arialbd.ttf", 11)
        status_font = ImageFont.truetype("arialbd.ttf", 9)
        detail_font = ImageFont.truetype("arial.ttf", 8)
    except:
        title_font = tab_font = item_font = desc_font = badge_font = btn_font = status_font = detail_font = ImageFont.load_default()

    # Title
    t_text = "QUAL VERSÃO VAI JOGAR?"
    bbox = draw.textbbox((0, 0), t_text, font=title_font)
    tw = bbox[2] - bbox[0]
    tx = (w - tw) // 2
    draw.text((tx + 2, 28), t_text, fill=(0, 0, 0, 255), font=title_font)
    draw.text((tx, 26), t_text, fill=(255, 235, 140, 255), font=title_font)

    # 3. Category Tabs
    tab1_rect = (45, 66, 286, 96)
    tab2_rect = (287, 66, 530, 96)

    is_pvz1 = (active_category == "pvz1")

    # Draw Tab 1
    t1_bg = (45, 36, 28, 245) if is_pvz1 else (22, 17, 13, 190)
    t1_border = (200, 160, 80, 255) if is_pvz1 else (75, 60, 42, 255)
    t1_text_col = (255, 235, 140, 255) if is_pvz1 else (170, 160, 145, 255)
    draw.rectangle([tab1_rect[0], tab1_rect[1], tab1_rect[2], tab1_rect[3]], fill=t1_bg, outline=t1_border, width=2)
    s1 = draw.textbbox((0, 0), "🌻  PLANTS VS. ZOMBIES 1", font=tab_font)
    tx1 = tab1_rect[0] + (tab1_rect[2] - tab1_rect[0] - (s1[2] - s1[0])) // 2
    ty1 = tab1_rect[1] + (tab1_rect[3] - tab1_rect[1] - (s1[3] - s1[0])) // 2
    draw.text((tx1 + 1, ty1 + 1), "🌻  PLANTS VS. ZOMBIES 1", fill=(0, 0, 0, 255), font=tab_font)
    draw.text((tx1, ty1), "🌻  PLANTS VS. ZOMBIES 1", fill=t1_text_col, font=tab_font)

    # Draw Tab 2
    t2_bg = (45, 36, 28, 245) if not is_pvz1 else (22, 17, 13, 190)
    t2_border = (200, 160, 80, 255) if not is_pvz1 else (75, 60, 42, 255)
    t2_text_col = (255, 235, 140, 255) if not is_pvz1 else (170, 160, 145, 255)
    draw.rectangle([tab2_rect[0], tab2_rect[1], tab2_rect[2], tab2_rect[3]], fill=t2_bg, outline=t2_border, width=2)
    s2 = draw.textbbox((0, 0), "⏳  PLANTS VS. ZOMBIES 2", font=tab_font)
    tx2 = tab2_rect[0] + (tab2_rect[2] - tab2_rect[0] - (s2[2] - s2[0])) // 2
    ty2 = tab2_rect[1] + (tab2_rect[3] - tab2_rect[1] - (s2[3] - s2[0])) // 2
    draw.text((tx2 + 1, ty2 + 1), "⏳  PLANTS VS. ZOMBIES 2", fill=(0, 0, 0, 255), font=tab_font)
    draw.text((tx2, ty2), "⏳  PLANTS VS. ZOMBIES 2", fill=t2_text_col, font=tab_font)

    # 4. Mod List Panel
    list_x, list_y, list_w, list_h = 45, 96, 485, 291
    draw.rectangle([list_x, list_y, list_x + list_w, list_y + list_h], fill=(25, 20, 16, 240), outline=(95, 75, 50, 255), width=2)
    draw.rectangle([list_x + 2, list_y + 2, list_x + list_w - 2, list_y + list_h - 2], outline=(15, 10, 8, 255), width=1)

    if is_pvz1:
        mods = [
            {"id": "vanilla", "title": "Plants vs. Zombies (Steam GOTY)", "desc": "Versão clássica pura de 2009. Total compatibilidade com conquistas.", "installed": True, "lang": "PT-BR", "type": "sun"},
            {"id": "dlc_edition", "title": "Plants vs. Zombies: DLC Edition (v2.7.2)", "desc": "Expansão da comunidade GameJolt. Novos mundos, plantas e zumbis.", "installed": True, "lang": "PT-BR", "type": "dlc"},
            {"id": "community_edition", "title": "Plants vs. Zombies: Widescreen (16:9 60FPS)", "desc": "Mod oficial que adiciona 16:9 Widescreen e 60 FPS com motor PopCap.", "installed": True, "lang": "PT-BR", "type": "trophy"},
            {"id": "hybrid", "title": "Plants vs. Zombies: Hybrid Edition (杂交版)", "desc": "Fenômeno global com plantas híbridas e poderes combinados.", "installed": False, "lang": "ENG", "type": "hybrid"},
            {"id": "fusion", "title": "Plants vs. Zombies: Fusion Edition (融合版)", "desc": "Fusão dinâmica de plantas em tempo real diretamente no gramado.", "installed": False, "lang": "PT-BR", "type": "fusion"},
        ]
    else:
        mods = [
            {"id": "pvz2_reflourished", "title": "PvZ 2: Reflourished (RFL Definitivo)", "desc": "O mod definitivo de PvZ 2 sem microtransações, mundos expandidos e balanceamento.", "installed": True, "lang": "PT-BR", "type": "rfl"},
            {"id": "pvz2_altverz", "title": "PvZ 2: AltVerZ (Reimaginação Clássica)", "desc": "Reimaginação com 25 fases por mundo, meta clássico de 50 sóis e estética nostálgica.", "installed": False, "lang": "ENG", "type": "altverz"},
            {"id": "pvz2_pc_port", "title": "PvZ 2: PC Edition (Port Nativo)", "desc": "Port 100% nativo para PC. Roda direto no Windows sem emulador, com widescreen e 60 FPS.", "installed": True, "lang": "PT-BR", "type": "pvz2pc"},
            {"id": "pvz2_tat", "title": "PvZ 2: Travel Around Time (TAT)", "desc": "Expansão para PC com mundos chineses exclusivos, chefes colossais e mecânicas temporais.", "installed": False, "lang": "PT-BR", "type": "tat"},
        ]

    item_h = list_h // len(mods)
    selected_idx = 0

    for i, m in enumerate(mods):
        rx = list_x + 4
        ry = list_y + 4 + (i * item_h)
        rw = list_w - 8
        rh = item_h - 6

        is_sel = (i == selected_idx)
        bg = (70, 50, 30, 240) if is_sel else (35, 28, 22, 180)
        border = (240, 210, 100, 255) if is_sel else (55, 45, 35, 255)
        draw.rectangle([rx, ry, rx + rw, ry + rh], fill=bg, outline=border, width=2 if is_sel else 1)

        # Draw Badge Vector Icon
        cx = rx + 18
        cy = ry + rh // 2
        t = m["type"]
        if t == "sun":
            draw.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=(255, 200, 20), outline=(200, 130, 0))
            draw.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=(160, 90, 0))
        elif t == "dlc":
            draw.rectangle([cx - 8, cy - 10, cx + 8, cy + 10], fill=(80, 140, 90), outline=(30, 70, 40))
            draw.ellipse([cx - 5, cy - 3, cx - 1, cy + 1], fill=(220, 40, 40))
            draw.ellipse([cx + 1, cy - 3, cx + 5, cy + 1], fill=(220, 40, 40))
        elif t == "trophy":
            draw.polygon([(cx - 7, cy - 8), (cx + 7, cy - 8), (cx + 4, cy + 2), (cx - 4, cy + 2)], fill=(240, 210, 50), outline=(170, 130, 10))
            draw.rectangle([cx - 2, cy + 2, cx + 2, cy + 6], fill=(180, 140, 20))
            draw.rectangle([cx - 5, cy + 6, cx + 5, cy + 8], fill=(240, 210, 50))
        elif t == "hybrid":
            draw.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=(60, 160, 180), outline=(30, 100, 120))
            draw.line([(cx - 5, cy + 5), (cx + 5, cy - 5)], fill=(255, 255, 255), width=2)
        elif t == "fusion":
            draw.polygon([(cx + 2, cy - 10), (cx - 5, cy), (cx, cy), (cx - 2, cy + 10), (cx + 6, cy - 1), (cx + 1, cy - 1)], fill=(255, 230, 40), outline=(180, 140, 0))
        elif t == "rfl": # Golden Taco
            draw.pieslice([cx - 9, cy - 9, cx + 9, cy + 9], 180, 360, fill=(235, 175, 45), outline=(170, 115, 20))
            draw.ellipse([cx - 6, cy - 4, cx, cy], fill=(60, 180, 60))
            draw.ellipse([cx, cy - 4, cx + 6, cy], fill=(60, 180, 60))
            draw.rectangle([cx - 2, cy - 3, cx + 2, cy], fill=(220, 50, 40))
        elif t == "altverz": # Hourglass
            draw.rectangle([cx - 7, cy - 9, cx + 7, cy - 7], fill=(120, 85, 40))
            draw.rectangle([cx - 7, cy + 6, cx + 7, cy + 8], fill=(120, 85, 40))
            draw.polygon([(cx - 5, cy - 6), (cx + 5, cy - 6), (cx, cy)], fill=(70, 160, 210))
            draw.polygon([(cx, cy), (cx + 5, cy + 6), (cx - 5, cy + 6)], fill=(70, 160, 210))
            draw.polygon([(cx - 3, cy + 6), (cx + 3, cy + 6), (cx, cy + 2)], fill=(240, 200, 80))
        elif t == "pvz2pc": # Monitor
            draw.rectangle([cx - 8, cy - 7, cx + 8, cy + 4], fill=(45, 55, 72), outline=(90, 110, 135))
            draw.rectangle([cx - 6, cy - 5, cx + 6, cy + 2], fill=(20, 140, 180))
            draw.ellipse([cx - 3, cy - 3, cx, cy], fill=(110, 215, 60))
            draw.ellipse([cx, cy - 3, cx + 3, cy], fill=(110, 215, 60))
            draw.rectangle([cx - 2, cy + 4, cx + 2, cy + 6], fill=(45, 55, 72))
            draw.rectangle([cx - 5, cy + 6, cx + 5, cy + 7], fill=(45, 55, 72))
        elif t == "tat": # Cosmic Time Vortex
            draw.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=(140, 70, 190))
            draw.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=(70, 170, 240))
            draw.line([(cx - 6, cy), (cx + 6, cy)], fill=(255, 240, 160), width=1)
            draw.line([(cx, cy - 6), (cx, cy + 6)], fill=(255, 240, 160), width=1)

        # Status badge
        st_text = "INSTALADO" if m["installed"] else "BAIXAR"
        st_bg = (60, 145, 60) if m["installed"] else (190, 120, 30)
        bw, bh = 74, 20
        bx = rx + rw - bw - 6
        by = ry + 8
        draw.rectangle([bx, by, bx + bw, by + bh], fill=st_bg, outline=(25, 20, 15), width=1)
        sb = draw.textbbox((0, 0), st_text, font=badge_font)
        draw.text((bx + (bw - (sb[2] - sb[0])) // 2, by + (bh - (sb[3] - sb[1])) // 2), st_text, fill=(255, 255, 255), font=badge_font)

        # Lang badge
        lw = 44
        lx = bx - lw - 6
        draw.rectangle([lx, by, lx + lw, by + bh], fill=(50, 75, 100), outline=(90, 130, 170), width=1)
        lb = draw.textbbox((0, 0), m["lang"], font=badge_font)
        draw.text((lx + (lw - (lb[2] - lb[0])) // 2, by + (bh - (lb[3] - lb[1])) // 2), m["lang"], fill=(230, 240, 255), font=badge_font)

        # Title
        t_col = (255, 255, 255) if is_sel else (225, 215, 195)
        draw.text((rx + 37, ry + 7), m["title"], fill=(0, 0, 0), font=item_font)
        draw.text((rx + 36, ry + 6), m["title"], fill=t_col, font=item_font)

        # Desc
        d_col = (240, 230, 200) if is_sel else (170, 160, 145)
        draw.text((rx + 36, ry + 28), m["desc"], fill=d_col, font=desc_font)

    # 5. Language Info Bar
    lang_y = 394
    draw.rectangle([45, lang_y, 45 + 485, lang_y + 44], fill=(30, 24, 18, 240), outline=(90, 70, 45, 255), width=2)
    cur_m = mods[selected_idx]
    draw.text((53, lang_y + 6), f"IDIOMA SELECIONADO: Português (Brasil) [{cur_m['lang']}]", fill=(120, 230, 140), font=status_font)
    draw.text((53, lang_y + 24), "Localização comunitária completa em PT-BR para o mod.", fill=(200, 190, 170), font=detail_font)

    # 6. Action Buttons
    def draw_btn(r, text, is_primary):
        bx, by, bw, bh = r
        lw, rw = btn_l.size[0], btn_r.size[0]
        mw = bw - lw - rw
        img.paste(btn_l, (bx, by), btn_l)
        bm_s = btn_m.resize((mw, bh), Image.Resampling.BILINEAR)
        img.paste(bm_s, (bx + lw, by), bm_s)
        img.paste(btn_r, (bx + lw + mw, by), btn_r)

        bb = draw.textbbox((0, 0), text, font=btn_font)
        btn_w = bb[2] - bb[0]
        btn_h = bb[3] - bb[1]
        tx = bx + (bw - btn_w) // 2
        ty = by + (bh - btn_h) // 2 - 2
        draw.text((tx + 1, ty + 1), text, fill=(0, 0, 0), font=btn_font)
        col = (255, 240, 130) if is_primary else (230, 220, 190)
        draw.text((tx, ty), text, fill=col, font=btn_font)

    btn_x = 545
    btn_w = 175
    btn_h = 46
    draw_btn((btn_x, 105, btn_w, btn_h), "JOGAR", True)
    draw_btn((btn_x, 165, btn_w, btn_h), f"IDIOMA ({cur_m['lang']})", False)
    draw_btn((btn_x, 225, btn_w, btn_h), "EXPLORAR" if cur_m["installed"] else "BAIXAR", False)
    draw_btn((btn_x, 285, btn_w, btn_h), "SAVES", False)
    draw_btn((btn_x, 345, btn_w, btn_h), "FECHAR", False)

    # 7. Status Bar
    sb_y = 448
    draw.rectangle([45, sb_y, 45 + 675, sb_y + 48], fill=(22, 17, 13, 240), outline=(80, 60, 40, 255), width=2)
    draw.ellipse([57, sb_y + 12, 67, sb_y + 22], fill=(80, 230, 80), outline=(20, 120, 20))
    draw.ellipse([59, sb_y + 14, 63, sb_y + 18], fill=(200, 255, 200))

    line1 = "Conexão Steam Ativa (AppID: 3590) • Rastreamento de Horas Habilitado"
    if not is_pvz1:
        line2 = "PvZ 2 Runner Integrado • Suporte a Emulador / Android • Horas Steam Contabilizadas 100%"
    else:
        line2 = "Saves: Sandbox Seguro Isolado • Conquistas Steam: Totalmente Suportadas"

    draw.text((73, sb_y + 9), line1, fill=(130, 235, 130), font=status_font)
    draw.text((73, sb_y + 27), line2, fill=(195, 185, 165), font=detail_font)

    out_path = os.path.join(r"C:\Users\Cauã Felype\.gemini\antigravity\brain\78753bbc-b9f7-4391-80af-6f4ae1b15257", out_filename)
    img.save(out_path)
    print(f"Generated preview at {out_path}")

if __name__ == "__main__":
    render_tab_preview("pvz1", "pvz_tab1_preview.png")
    render_tab_preview("pvz2", "pvz_tab2_preview.png")
