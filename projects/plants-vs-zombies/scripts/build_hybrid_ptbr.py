# -*- coding: utf-8 -*-
import os
import re

def parse_lawnstrings(filepath, encoding='latin-1'):
    with open(filepath, 'r', encoding=encoding, errors='ignore') as f:
        content = f.read()
    
    entries = {}
    current_key = None
    current_lines = []
    
    for line in content.splitlines():
        m = re.match(r'^\[([A-Z0-9_]+)\]\s*$', line.strip())
        if m:
            if current_key:
                entries[current_key] = "\n".join(current_lines).strip()
            current_key = m.group(1)
            current_lines = []
        else:
            if current_key:
                current_lines.append(line)
                
    if current_key:
        entries[current_key] = "\n".join(current_lines).strip()
        
    return entries

def main():
    base_ptbr_path = r"projects\plants-vs-zombies\src\PvZLauncher\Languages\pt-BR\LawnStrings.txt"
    hybrid_eng_path = r"projects\plants-vs-zombies\reports\hybrid_lawnstrings_eng.txt"
    
    ptbr_base = parse_lawnstrings(base_ptbr_path)
    hybrid_eng = parse_lawnstrings(hybrid_eng_path)
    
    print(f"Base PT-BR entries: {len(ptbr_base)}")
    print(f"Hybrid English entries: {len(hybrid_eng)}")
    
    # Translation dictionary for hybrid concepts, plants, zombies, mechanics
    hybrid_terms = {
        "Jalapeno Potato Mine": "Batata-Mina Jalapeño",
        "Potato Mine and Jalapeno both drank too much!": "Batata-Mina e Jalapeño beberam demais naquele dia!",
        "Toughness:": "Resistência:",
        "Power:": "Dano:",
        "Range:": "Alcance:",
        "Feature:": "Característica:",
        "Clear ice tracks": "Derrete trilhas de gelo",
        "One row": "Uma linha",
        "Repeat last selection": "Repetir última seleção",
        "Plants vs. Zombies Turbo Version!": "Plants vs. Zombies: Versão Turbo!",
        "Be careful of Zombies coming through the portals!": "Cuidado com os zumbis vindo pelos portais!",
        "Plant one, get a whole row!": "Plante uma, ganhe a linha inteira!",
        "Tiny but cute!": "Pequenino mas mortal!",
        "Watch out! Gravitational anomaly!": "Cuidado! Anomalia gravitacional!",
        "Why did it go dark? Can you see them?": "Por que escureceu? Você consegue vê-los?",
        "Red alert, buddies!": "Alerta vermelho, camaradas!",
        "Can't hold down the coffin board anymore!!!": "A tampa do caixão não vai aguentar mais nada!!!",
        "Invisible brain-eater!": "Devorador de cérebros invisível!",
        "Inflation, brother!": "Inflação galopante, meu amigo!",
        "Gatling Peashooter": "Disparervilha Metralhadora",
        "Twin Sunflower": "Girassol Gêmeo",
        "Gloom-shroom": "Cogumelo-da-Penumbra",
        "Cattail": "Rabo-de-Gato",
        "Winter Melon": "Melancia de Inverno",
        "Gold Magnet": "Ímã Dourado",
        "Spikerock": "Rocha-Espinho",
        "Cob Cannon": "Canhão de Milho",
        "Ice Shroom": "Cogumelo-Gelo",
        "Doom Shroom": "Cogumelo-da-Ruína",
        "Sunflower": "Girassol",
        "Peashooter": "Disparervilha",
        "Wall-nut": "Noz-noz",
        "Tall-nut": "Noz-Alta",
        "Squash": "Esmagadora",
        "Chomper": "Carnívora",
        "Jalapeno": "Jalapeño",
        "Cherry Bomb": "Cereja-Bomba",
        "Torchwood": "Tronco Flamejante",
        "Garlic": "Alho",
        "Pumpkin": "Abóbora",
        "Magnet-shroom": "Cogumelo-Ímã",
        "Hypno-shroom": "Cogumelo-Hipnótico",
        "Fume-shroom": "Cogumelo-Fumaça",
        "Puff-shroom": "Cogumelo-Baforada",
        "Sun-shroom": "Cogumelo-Solar",
        "Scaredy-shroom": "Cogumelo-Medroso",
        "Starfruit": "Carambola",
        "Threepeater": "Tripla-Ervilha",
        "Snow Pea": "Gelhervilha",
        "Repeater": "Repetervilha",
        "Cabbage-pult": "Catapulta-Repolho",
        "Kernel-pult": "Catapulta-Milho",
        "Melon-pult": "Catapulta-Melancia",
        "Coffee Bean": "Grão de Café",
        "Grave Buster": "Devorador de Túmulos",
        "Lily Pad": "Vitória-Régia",
        "Tangle Kelp": "Alga Emaranhada",
        "Sea-shroom": "Cogumelo-Marinho",
        "Plantern": "Lanterna",
        "Cactus": "Cacto",
        "Blover": "Soprador",
        "Split Pea": "Ervilha Dupla",
        "Marigold": "Margarida",
        "Adventure": "Aventura",
        "Survival": "Sobrevivência",
        "Challenge": "Desafio",
        "Mini-Games": "Minijogos",
        "Puzzles": "Quebra-Cabeças",
        "Zen Garden": "Jardim Zen",
        "Almanac": "Almanaque",
        "Store": "Loja",
        "Options": "Opções",
        "Help": "Ajuda",
        "Quit": "Sair",
        "Back to Game": "Voltar ao Jogo",
        "Main Menu": "Menu Principal",
        "Restart Level": "Reiniciar Nível",
        "Back to Main Menu": "Voltar ao Menu Principal",
        "Full Screen": "Tela Cheia",
        "3D Acceleration": "Aceleração 3D",
        "Music": "Música",
        "Sound FX": "Efeitos Sonoros",
    }
    
    # Merge entries: start with hybrid_eng as template so all hybrid keys exist
    merged = {}
    for key, val in hybrid_eng.items():
        if key in ptbr_base:
            merged[key] = ptbr_base[key]
        else:
            translated = val
            for eng_term, pt_term in hybrid_terms.items():
                translated = translated.replace(eng_term, pt_term)
            merged[key] = translated
            
    # Also add any base PT-BR keys not in hybrid
    for key, val in ptbr_base.items():
        if key not in merged:
            merged[key] = val
            
    print(f"Total merged PT-BR Hybrid entries: {len(merged)}")
    
    # Output path for hybrid pt-BR
    out_dir = r"projects\plants-vs-zombies\src\PvZLauncher\Languages\pt-BR"
    out_file = os.path.join(out_dir, "LawnStrings_hybrid.txt")
    
    with open(out_file, "w", encoding="latin-1", errors="replace") as f:
        for k, v in merged.items():
            f.write(f"[{k}]\n{v}\n\n")
            
    print(f"Wrote {os.path.getsize(out_file)} bytes to {out_file}")

if __name__ == "__main__":
    main()
