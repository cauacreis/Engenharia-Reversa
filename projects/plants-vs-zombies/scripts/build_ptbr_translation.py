# -*- coding: utf-8 -*-
"""
Gerador de Tradução Português do Brasil (PT-BR) para Plants vs. Zombies
Gera um LawnStrings.txt completo e compatível com a engine original PopCap (ISO-8859-1).
"""
import os
import re

def build_ptbr_strings():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    workspace_dir = os.path.abspath(os.path.join(script_dir, "..", "..", ".."))
    
    # 1. Base strings source
    base_file = os.path.join(workspace_dir, "pvz_launcher_assets", "properties", "LawnStrings.txt")
    if not os.path.exists(base_file):
        print(f"Base file not found: {base_file}")
        return
        
    with open(base_file, "r", encoding="latin-1") as f:
        content = f.read()

    # Dictionary of official PT-BR community translations
    translations = {
        "LOCALE": "Portuguese_Brazil",
        "CURRENCY_SYMBOL": "R$",
        "CURRENCY_STRING": "{CURRENCY_SYMBOL}{AMOUNT}",
        
        # Plantas
        "PEASHOOTER": "Disparervilha",
        "PEASHOOTER_TOOLTIP": "Atira ervilhas nos zumbis",
        "SUNFLOWER": "Girassol",
        "SUNFLOWER_TOOLTIP": "Fornece sol adicional",
        "CHERRY_BOMB": "Cereja-Bomba",
        "CHERRY_BOMB_TOOLTIP": "Explode todos os zumbis em uma área",
        "WALL_NUT": "Noz-noz",
        "WALL_NUT_TOOLTIP": "Bloqueia zumbis e protege suas plantas",
        "POTATO_MINE": "Batatamina",
        "POTATO_MINE_TOOLTIP": "Explode ao contato, mas precisa de tempo para armar",
        "SNOW_PEA": "Gelhervilha",
        "SNOW_PEA_TOOLTIP": "Dispara ervilhas congeladas que desaceleram zumbis",
        "CHOMPER": "Carnívora",
        "CHOMPER_TOOLTIP": "Engole um zumbi inteiro, mas mastiga devagar",
        "REPEATER": "Repetervilha",
        "REPEATER_TOOLTIP": "Dispara duas ervilhas por vez",
        "PUFF_SHROOM": "Cogumelo-Baforada",
        "PUFF_SHROOM_TOOLTIP": "Atira esporos de curto alcance, custo zero",
        "SUN_SHROOM": "Cogumelo-Solar",
        "SUN_SHROOM_TOOLTIP": "Dá pouco sol no início, depois cresce",
        "FUME_SHROOM": "Cogumelo-Fumaça",
        "FUME_SHROOM_TOOLTIP": "Atira fumaça que perfura portas e escudos",
        "GRAVE_BUSTER": "Devorador de Túmulos",
        "GRAVE_BUSTER_TOOLTIP": "Plante em sepulturas para destruí-las",
        "HYPNO_SHROOM": "Cogumelo-Hipnótico",
        "HYPNO_SHROOM_TOOLTIP": "Faz o zumbi que o comer lutar a seu favor",
        "SCAREDY_SHROOM": "Cogumelo-Medroso",
        "SCAREDY_SHROOM_TOOLTIP": "Atirador de longo alcance, esconde-se se o zumbi chegar perto",
        "ICE_SHROOM": "Cogumelo-Gelo",
        "ICE_SHROOM_TOOLTIP": "Congela temporariamente todos os zumbis na tela",
        "DOOM_SHROOM": "Cogumelo-da-Ruína",
        "DOOM_SHROOM_TOOLTIP": "Destrói tudo em uma enorme área e deixa uma cratera",
        "LILY_PAD": "Vitória-Régia",
        "LILY_PAD_TOOLTIP": "Permite plantar plantas terrestres na água",
        "SQUASH": "Esmagadora",
        "SQUASH_TOOLTIP": "Esmaga o primeiro zumbi que se aproximar",
        "THREEPEATER": "Tripla-Ervilha",
        "THREEPEATER_TOOLTIP": "Dispara ervilhas em três linhas simultaneamente",
        "TANGLE_KELP": "Alga Emaranhada",
        "TANGLE_KELP_TOOLTIP": "Puxa um zumbi aquático para as profundezas",
        "JALAPENO": "Pimenta Jalapeño",
        "JALAPENO_TOOLTIP": "Incinera uma linha inteira de zumbis",
        "SPIKEWEED": "Planta-Espículo",
        "SPIKEWEED_TOOLTIP": "Fere zumbis que pisam nela e fura pneus de Zomboni",
        "TORCHWOOD": "Tronco Flamejante",
        "TORCHWOOD_TOOLTIP": "Transforma ervilhas normais em bolas de fogo de dano duplo",
        "TALL_NUT": "Noz-Alta",
        "TALL_NUT_TOOLTIP": "Barreira pesada que zumbis não podem pular",
        "SEA_SHROOM": "Cogumelo-Marinho",
        "SEA_SHROOM_TOOLTIP": "Cogumelo aquático gratuito de curto alcance",
        "PLANTERN": "Lanterna",
        "PLANTERN_TOOLTIP": "Ilumina a névoa ao seu redor",
        "CACTUS": "Cacto",
        "CACTUS_TOOLTIP": "Dispara espinhos e estoura balões de zumbis",
        "BLOVER": "Trevo-Soprador",
        "BLOVER_TOOLTIP": "Sopra embora toda a névoa e zumbis voadores",
        "SPLIT_PEA": "Ervilha-Dupla",
        "SPLIT_PEA_TOOLTIP": "Atira para frente e para trás",
        "STARFRUIT": "Carambola",
        "STARFRUIT_TOOLTIP": "Dispara estrelas em cinco direções",
        "PUMPKIN": "Abóbora",
        "PUMPKIN_TOOLTIP": "Protege a planta colocada dentro dela",
        "MAGNET_SHROOM": "Cogumelo-Ímã",
        "MAGNET_SHROOM_TOOLTIP": "Remove capacetes, baldes e objetos de metal dos zumbis",
        "CABBAGE_PULT": "Repolho-Catapulta",
        "CABBAGE_PULT_TOOLTIP": "Arremessa repolhos no telhado",
        "FLOWER_POT": "Vaso de Flor",
        "FLOWER_POT_TOOLTIP": "Permite plantar no telhado",
        "KERNEL_PULT": "Milho-Catapulta",
        "KERNEL_PULT_TOOLTIP": "Arremessa grãos de milho e manteiga que paralisa",
        "COFFEE_BEAN": "Grão de Café",
        "COFFEE_BEAN_TOOLTIP": "Acorda cogumelos durante o dia",
        "GARLIC": "Alho",
        "GARLIC_TOOLTIP": "Desvia os zumbis mordedores para outras linhas",
        "UMBRELLA_LEAF": "Folha-Guarda-Chuva",
        "UMBRELLA_LEAF_TOOLTIP": "Protege plantas vizinhas contra catapultas e bungees",
        "MARIGOLD": "Margarida",
        "MARIGOLD_TOOLTIP": "Produz moedas de ouro e prata",
        "MELON_PULT": "Melancia-Catapulta",
        "MELON_PULT_TOOLTIP": "Causa dano pesado e em área aos zumbis",
        "GATLING_PEA": "Metralhadora de Ervilhas",
        "GATLING_PEA_TOOLTIP": "Dispara 4 ervilhas velozes em sequência",
        "TWIN_SUNFLOWER": "Girassol Duplo",
        "TWIN_SUNFLOWER_TOOLTIP": "Fornece o dobro de sol de um girassol normal",
        "GLOOM_SHROOM": "Cogumelo-Sombrio",
        "GLOOM_SHROOM_TOOLTIP": "Dispara fumaça em 8 direções ao redor",
        "CATTAIL": "Rabo-de-Gato",
        "CATTAIL_TOOLTIP": "Dispara espinhos teleguiados em qualquer linha ou zumbi voador",
        "WINTER_MELON": "Melancia Gelada",
        "WINTER_MELON_TOOLTIP": "Causa dano colossal e congela grupos de zumbis",
        "GOLD_MAGNET": "Ímã Dourado",
        "GOLD_MAGNET_TOOLTIP": "Coleta moedas e diamantes automaticamente",
        "SPIKEROCK": "Pedra-Espículo",
        "SPIKEROCK_TOOLTIP": "Causa dano contínuo e resiste a vários esmagamentos de Zomboni",
        "COB_CANNON": "Canhão de Espigas",
        "COB_CANNON_TOOLTIP": "Mire e lance um míssil devastador de milho gigante",
        "IMITATER": "Imitador",
        "IMITATER_TOOLTIP": "Permite usar duas cópias da mesma planta em um nível",

        # Zumbis
        "ZOMBIE": "Zumbi",
        "FLAG_ZOMBIE": "Zumbi da Bandeira",
        "CONEHEAD_ZOMBIE": "Zumbi com Cone",
        "POLE_VAULTING_ZOMBIE": "Zumbi com Vara",
        "BUCKETHEAD_ZOMBIE": "Zumbi do Balde",
        "NEWSPAPER_ZOMBIE": "Zumbi do Jornal",
        "DOOR_ZOMBIE": "Zumbi da Porta de Tela",
        "FOOTBALL_ZOMBIE": "Zumbi de Futebol Americano",
        "DANCING_ZOMBIE": "Zumbi Dançarino",
        "BACKUP_DANCER": "Dançarino Reserva",
        "DUCKY_TUBE_ZOMBIE": "Zumbi com Boia de Pato",
        "SNORKEL_ZOMBIE": "Zumbi Mergulhador",
        "ZOMBONI": "Zomboni",
        "BOBSLED_ZOMBIE": "Equipe de Bobsled Zumbi",
        "DOLPHIN_RIDER_ZOMBIE": "Zumbi Montador de Golfinho",
        "JACK_IN_THE_BOX_ZOMBIE": "Zumbi da Caixa de Surpresa",
        "BALLOON_ZOMBIE": "Zumbi do Balão",
        "DIGGER_ZOMBIE": "Zumbi Mineiro",
        "POGO_ZOMBIE": "Zumbi do Pula-Pula",
        "YETI_ZOMBIE": "Zumbi Yeti",
        "BUNGEE_ZOMBIE": "Zumbi de Bungee Jump",
        "LADDER_ZOMBIE": "Zumbi da Escada",
        "CATAPULT_ZOMBIE": "Zumbi da Catapulta",
        "GARGANTUAR": "Gargantua",
        "IMP": "Diabrete",
        "BOSS_ZOMBIE": "Dr. Zombão",

        # Menus & Modos de Jogo
        "ADVENTURE": "Aventura",
        "MINIGAMES": "Minijogos",
        "PUZZLE": "Quebra-Cabeça",
        "SURVIVAL": "Sobrevivência",
        "ZEN_GARDEN": "Jardim Zen",
        "ALMANAC": "Almanaque",
        "ALMANAC_HEADER": "Almanaque Suburbano",
        "ALMANAC_PLANTS": "Ver Plantas",
        "ALMANAC_ZOMBIES": "Ver Zumbis",
        "OPTIONS": "Opções",
        "HELP": "Ajuda",
        "QUIT": "Sair",
        "MENU_BUTTON": "Menu",
        "DIALOG_BUTTON_OK": "OK",
        "DIALOG_BUTTON_CANCEL": "CANCELAR",
        "DIALOG_BUTTON_YES": "SIM",
        "DIALOG_BUTTON_NO": "NÃO",
        "BUTTON_OK": "Ok",
        "BUTTON_CANCEL": "Cancelar",
        "BUTTON_YES": "Sim",
        "BUTTON_NO": "Não",
        "CONTINUE_BUTTON": "Continuar",
        "RESTART_BUTTON": "Reiniciar",
        "MAIN_MENU_BUTTON": "Menu Principal",
        "NEXT_LEVEL_BUTTON": "Próximo Nível!",
        "A_HUGE_WAVE_OF_ZOMBIES_IS_APPROACHING": "Uma enorme horda de zumbis se aproxima!",
        "FINAL_WAVE": "HORDA FINAL",
        "THE_ZOMBIES_ATE_YOUR_BRAINS": "OS ZUMBIS COMERAM SEU CÉREBRO!",
        "CLICK_TO_START": "Clique para Iniciar",
        "RESUME_GAME": "Voltar ao Jogo",
        "RESTART_LEVEL": "Reiniciar Nível",
        "LEAVE_GAME": "Sair do Jogo",
        "BACK_TO_GAME": "Voltar",
        "GAME_OVER": "Fim de Jogo",
        "VICTORY": "Vitória!",
        "PAUSED": "PAUSADO",
        "WHO_ARE_YOU": "QUEM É VOCÊ?",
        "NEW_USER": "(Criar Novo Usuário)",
        "RENAME_USER": "Renomear",
        "DELETE_USER": "Excluir"
    }

    # Replace keys in content
    def replace_key(match):
        key = match.group(1)
        if key in translations:
            return f"[{key}]\n{translations[key]}\n"
        return match.group(0)

    # Regex matches [KEY]\n(value)
    pattern = re.compile(r'\[([A-Z0-9_]+)\]\r?\n([^\r\n\[]*(?:\r?\n(?![\[A-Z0-9_]+\])[^\r\n\[]*)*)', re.MULTILINE)
    
    translated_content = pattern.sub(replace_key, content)
    
    # Save translated file in projects/plants-vs-zombies/src/PvZLauncher/Resources/
    target_dir = os.path.join(script_dir, "..", "src", "PvZLauncher", "Languages", "pt-BR")
    os.makedirs(target_dir, exist_ok=True)
    out_file = os.path.join(target_dir, "LawnStrings.txt")
    
    with open(out_file, "w", encoding="latin-1", errors="replace") as f:
        f.write(translated_content)
        
    print(f"Generated PT-BR strings: {out_file} ({os.path.getsize(out_file):,} bytes)")
    return out_file

if __name__ == "__main__":
    build_ptbr_strings()