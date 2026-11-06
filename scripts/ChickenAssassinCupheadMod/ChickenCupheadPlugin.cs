using System;
using System.IO;
using System.Reflection;
using System.Collections.Generic;
using BepInEx;
using HarmonyLib;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

namespace ChickenCupheadMod
{
    [BepInPlugin("com.antigravity.chickencuphead", "Chicken Assassin in Cuphead", "2.1.0")]
    public class ChickenCupheadPlugin : BaseUnityPlugin
    {
        public static ChickenCupheadPlugin Instance;
        public static BepInEx.Logging.ManualLogSource ModLogger;

        // Sprites de Animação do Franklin (PPU = 1.0f para resolução nativa 720p/1080p do Cuphead)
        public Sprite[] IdleSprites;
        public Sprite[] RunSprites;
        public Sprite JumpSprite;
        public Sprite DuckSprite;
        public Sprite[] PunchSprites;
        public Sprite FistProjectileSprite;

        // Texturas da Loja do Chicken Assassin
        public Texture2D BlackMarketBg;
        public Texture2D BlackMarketLogo;
        public Texture2D ChickenLogo;
        public Texture2D ArrowIcon;

        // Cards de Upgrade
        public Texture2D CardSavage;
        public Texture2D CardRapidFire;
        public Texture2D CardIronShirt;
        public Texture2D CardBraveheart;
        public Texture2D CardSoulCrusher;
        public Texture2D CardDronePet;

        // Efeitos Sonoros Oficiais
        public List<AudioClip> PunchClips = new List<AudioClip>();
        public AudioClip BlackMarketClip;
        public AudioClip ButtonClickClip;
        public AudioClip SoulPickUpClip;
        private AudioSource sfxSource;

        public bool SpritesLoaded = false;

        // Upgrades Comprados
        public bool UpgradeTitanPunch = false;    // Soco Brutal (25x dano)
        public bool UpgradeFurySpeed = false;     // Metralhadora de Socos
        public bool UpgradeArmorHP = false;       // Armadura de Galo (25 HP)
        public bool UpgradeInstantSuper = false;  // Fúria Instantânea (Super EX inicial cheio)
        public bool UpgradeSoulCrusher = false;   // Crítico Devastador (30% chance de 50x dano)
        public bool UpgradeDronePet = false;      // Auxiliar Drone (15% chance de drop de moedas por golpe)

        private void Awake()
        {
            Instance = this;
            ModLogger = Logger;
            DontDestroyOnLoad(gameObject);
            sfxSource = gameObject.AddComponent<AudioSource>();
            sfxSource.playOnAwake = false;

            Logger.LogInfo("=== Chicken Assassin in Cuphead Mod (v2.1.0 - Full Animation & Attack Crossover) Loading... ===");
            LoadAllFranklinSprites();
            LoadShopTextures();
            LoadAudioClips();
            LoadUpgrades();

            gameObject.AddComponent<ChickenShopUI>();

            try
            {
                Harmony harmony = new Harmony("com.antigravity.chickencuphead");
                harmony.PatchAll(Assembly.GetExecutingAssembly());
                Logger.LogInfo("=== Chicken Assassin Harmony Patches Injected Successfully! ===");
            }
            catch (Exception ex)
            {
                Logger.LogError("Harmony Patching Error: " + ex);
            }
        }

        private void LoadAllFranklinSprites()
        {
            try
            {
                string animDir = Path.Combine(Path.Combine(Paths.PluginPath, "ChickenAssets"), "Anims");
                string rootAssets = Path.Combine(Paths.PluginPath, "ChickenAssets");

                // No Cuphead, a câmera ortográfica usa tamanho 360 (1280x720) onde 1 unidade = 1 pixel.
                // Portanto o PPU (Pixels Per Unit) DEVE ser 1.0f (ou ~0.914f) para renderizar o galo em escala real!
                float franklinPPU = 1.0f;
                Vector2 franklinPivot = new Vector2(0.5f, 0.38f);

                // 1. Idle (3 frames)
                IdleSprites = new Sprite[3];
                for (int i = 0; i < 3; i++)
                {
                    IdleSprites[i] = LoadSprite(Path.Combine(animDir, string.Format("franklin_idle_{0}.png", i)), franklinPivot, franklinPPU);
                }

                // 2. Run (4 frames)
                RunSprites = new Sprite[4];
                for (int i = 0; i < 4; i++)
                {
                    RunSprites[i] = LoadSprite(Path.Combine(animDir, string.Format("franklin_run_{0}.png", i)), franklinPivot, franklinPPU);
                }

                // 3. Jump & Duck
                JumpSprite = LoadSprite(Path.Combine(animDir, "franklin_jump.png"), franklinPivot, franklinPPU);
                DuckSprite = LoadSprite(Path.Combine(animDir, "franklin_duck.png"), franklinPivot, franklinPPU);

                // 4. Punch Combos (Jab, Cross, Uppercut, Hook)
                PunchSprites = new Sprite[4];
                PunchSprites[0] = LoadSprite(Path.Combine(animDir, "franklin_punch_jab.png"), franklinPivot, franklinPPU);
                PunchSprites[1] = LoadSprite(Path.Combine(animDir, "franklin_punch_cross.png"), franklinPivot, franklinPPU);
                PunchSprites[2] = LoadSprite(Path.Combine(animDir, "franklin_punch_uppercut.png"), franklinPivot, franklinPPU);
                PunchSprites[3] = LoadSprite(Path.Combine(animDir, "franklin_punch_hook.png"), franklinPivot, franklinPPU);

                // 5. Projétil de Soco Brawler
                FistProjectileSprite = LoadSprite(Path.Combine(rootAssets, "fist_projectile.png"), new Vector2(0.5f, 0.5f), 1.0f);

                SpritesLoaded = (IdleSprites[0] != null);
                Logger.LogInfo(string.Format("Loaded Franklin Animation Suite with PPU={0}! (Idle: {1}x{2})",
                    franklinPPU, IdleSprites[0].texture.width, IdleSprites[0].texture.height));
            }
            catch (Exception ex)
            {
                Logger.LogError("Error loading Franklin animation suite: " + ex);
            }
        }

        private Sprite LoadSprite(string path, Vector2 pivot, float ppu)
        {
            if (!File.Exists(path)) return null;
            byte[] data = File.ReadAllBytes(path);
            Texture2D tex = new Texture2D(2, 2, TextureFormat.RGBA32, false);
            ImageConversion.LoadImage(tex, data);
            tex.filterMode = FilterMode.Point;
            return Sprite.Create(tex, new Rect(0, 0, tex.width, tex.height), pivot, ppu);
        }

        private void LoadShopTextures()
        {
            try
            {
                string shopDir = Path.Combine(Path.Combine(Paths.PluginPath, "ChickenAssets"), "Shop");
                string cardsDir = Path.Combine(shopDir, "Cards");

                BlackMarketBg = LoadTex(Path.Combine(shopDir, "blackmarket_bg.png"));
                BlackMarketLogo = LoadTex(Path.Combine(shopDir, "blackmarket.png"));
                ChickenLogo = LoadTex(Path.Combine(shopDir, "chicken.png"));
                ArrowIcon = LoadTex(Path.Combine(shopDir, "arrow.png"));

                CardSavage = LoadTex(Path.Combine(cardsDir, "savage.png"));
                CardRapidFire = LoadTex(Path.Combine(cardsDir, "rapid_fire.png"));
                CardIronShirt = LoadTex(Path.Combine(cardsDir, "ironshirt.png"));
                CardBraveheart = LoadTex(Path.Combine(cardsDir, "braaveheart.png"));
                CardSoulCrusher = LoadTex(Path.Combine(cardsDir, "soul_crusher.png"));
                CardDronePet = LoadTex(Path.Combine(cardsDir, "drone_pet.png"));

                Logger.LogInfo("Loaded authentic Chicken Assassin Black Market textures and cards!");
            }
            catch (Exception ex)
            {
                Logger.LogError("Error loading shop textures: " + ex);
            }
        }

        private void LoadAudioClips()
        {
            try
            {
                string audioDir = Path.Combine(Path.Combine(Paths.PluginPath, "ChickenAssets"), "Audio");
                if (Directory.Exists(audioDir))
                {
                    for (int i = 1; i <= 4; i++)
                    {
                        AudioClip p = LoadWav(Path.Combine(audioDir, "punch" + i + ".wav"), "punch" + i);
                        if (p != null) PunchClips.Add(p);
                    }
                    BlackMarketClip = LoadWav(Path.Combine(audioDir, "Black Market.wav"), "BlackMarket");
                    ButtonClickClip = LoadWav(Path.Combine(audioDir, "Button Click.wav"), "ButtonClick");
                    SoulPickUpClip = LoadWav(Path.Combine(audioDir, "Soul Pick Up.wav"), "SoulPickUp");

                    Logger.LogInfo(string.Format("Loaded {0} authentic Chicken Assassin audio clips!", PunchClips.Count + 3));
                }
            }
            catch (Exception ex)
            {
                Logger.LogError("Error loading audio clips: " + ex);
            }
        }

        public void PlayPunch()
        {
            if (PunchClips.Count > 0 && sfxSource != null)
            {
                AudioClip clip = PunchClips[UnityEngine.Random.Range(0, PunchClips.Count)];
                sfxSource.PlayOneShot(clip, 0.75f);
            }
        }

        public void PlayCoinSound()
        {
            if (SoulPickUpClip != null && sfxSource != null)
            {
                sfxSource.PlayOneShot(SoulPickUpClip, 0.8f);
            }
        }

        public void PlayButtonClick()
        {
            if (ButtonClickClip != null && sfxSource != null)
            {
                sfxSource.PlayOneShot(ButtonClickClip, 0.7f);
            }
        }

        public void PlayShopTheme()
        {
            if (BlackMarketClip != null && sfxSource != null)
            {
                sfxSource.PlayOneShot(BlackMarketClip, 0.65f);
            }
        }

        private Texture2D LoadTex(string path)
        {
            if (File.Exists(path))
            {
                byte[] data = File.ReadAllBytes(path);
                Texture2D tex = new Texture2D(2, 2, TextureFormat.RGBA32, false);
                ImageConversion.LoadImage(tex, data);
                return tex;
            }
            return null;
        }

        private AudioClip LoadWav(string path, string clipName)
        {
            if (!File.Exists(path)) return null;
            byte[] fileBytes = File.ReadAllBytes(path);
            int pos = 12;
            int dataPos = 0;
            int dataLen = 0;
            while (pos < fileBytes.Length - 8)
            {
                string chunkId = System.Text.Encoding.ASCII.GetString(fileBytes, pos, 4);
                int chunkSize = BitConverter.ToInt32(fileBytes, pos + 4);
                if (chunkId == "data")
                {
                    dataPos = pos + 8;
                    dataLen = chunkSize;
                    break;
                }
                pos += 8 + chunkSize;
            }

            if (dataPos == 0 || dataLen <= 0) return null;

            int sampleCount = dataLen / 2;
            float[] samples = new float[sampleCount];
            for (int i = 0; i < sampleCount; i++)
            {
                short s = BitConverter.ToInt16(fileBytes, dataPos + i * 2);
                samples[i] = s / 32768f;
            }

            int frames = sampleCount / 2;
            AudioClip clip = AudioClip.Create(clipName, frames, 2, 44100, false);
            clip.SetData(samples, 0);
            return clip;
        }

        public void SaveUpgrades()
        {
            try
            {
                string path = Path.Combine(Paths.ConfigPath, "ChickenUpgrades.cfg");
                string content = string.Format("TitanPunch={0}\nFurySpeed={1}\nArmorHP={2}\nInstantSuper={3}\nSoulCrusher={4}\nDronePet={5}",
                    UpgradeTitanPunch, UpgradeFurySpeed, UpgradeArmorHP, UpgradeInstantSuper, UpgradeSoulCrusher, UpgradeDronePet);
                File.WriteAllText(path, content);
            }
            catch { }
        }

        public void LoadUpgrades()
        {
            try
            {
                string path = Path.Combine(Paths.ConfigPath, "ChickenUpgrades.cfg");
                if (File.Exists(path))
                {
                    string[] lines = File.ReadAllLines(path);
                    foreach (string l in lines)
                    {
                        if (l.StartsWith("TitanPunch=")) UpgradeTitanPunch = bool.Parse(l.Split('=')[1]);
                        if (l.StartsWith("FurySpeed=")) UpgradeFurySpeed = bool.Parse(l.Split('=')[1]);
                        if (l.StartsWith("ArmorHP=")) UpgradeArmorHP = bool.Parse(l.Split('=')[1]);
                        if (l.StartsWith("InstantSuper=")) UpgradeInstantSuper = bool.Parse(l.Split('=')[1]);
                        if (l.StartsWith("SoulCrusher=")) UpgradeSoulCrusher = bool.Parse(l.Split('=')[1]);
                        if (l.StartsWith("DronePet=")) UpgradeDronePet = bool.Parse(l.Split('=')[1]);
                    }
                }
            }
            catch { }
        }
    }

    /// <summary>
    /// CONTROLADOR VISUAL DEFINITIVO E FLUIDO DO FRANKLIN NAS FASES TERRESTRES:
    /// </summary>
    public class FranklinVisualController : MonoBehaviour
    {
        private LevelPlayerAnimationController animCtrl;
        private LevelPlayerMotor motor;
        private LevelPlayerWeaponManager weaponManager;
        private AbstractPlayerController playerController;

        private GameObject visualModel;
        private SpriteRenderer franklinRenderer;
        private Material franklinMat;

        // Timers de Animação
        private float idleTimer = 0f;
        private int idleIndex = 0;

        private float runTimer = 0f;
        private int runIndex = 0;

        private float punchTimer = 0f;
        private int punchIndex = 0;

        public void Setup(LevelPlayerAnimationController controller)
        {
            animCtrl = controller;
            motor = controller.GetComponent<LevelPlayerMotor>();
            weaponManager = controller.GetComponent<LevelPlayerWeaponManager>();
            playerController = controller.GetComponent<AbstractPlayerController>();

            // Cria ou recupera o material seguro
            if (franklinMat == null)
            {
                Shader s = Shader.Find("Sprites/Default");
                if (s == null) s = Shader.Find("Unlit/Transparent");
                if (s != null)
                {
                    franklinMat = new Material(s);
                }
                else if (controller.spriteRenderer != null && controller.spriteRenderer.sharedMaterial != null)
                {
                    franklinMat = new Material(controller.spriteRenderer.sharedMaterial);
                }
            }

            if (visualModel == null)
            {
                visualModel = new GameObject("FranklinVisualModel");
                visualModel.transform.SetParent(controller.transform, false);
                visualModel.transform.localPosition = Vector3.zero;
                visualModel.transform.localScale = Vector3.one;

                franklinRenderer = visualModel.AddComponent<SpriteRenderer>();
                if (franklinMat != null) franklinRenderer.material = franklinMat;
                
                // Camada 'Player' (uniqueID: 3711759135)
                franklinRenderer.sortingLayerName = "Player";
                franklinRenderer.sortingOrder = 120;
                franklinRenderer.color = Color.white;
                franklinRenderer.enabled = true;
            }

            // Define a pose inicial
            if (ChickenCupheadPlugin.Instance != null && ChickenCupheadPlugin.Instance.IdleSprites != null && ChickenCupheadPlugin.Instance.IdleSprites.Length > 0)
            {
                franklinRenderer.sprite = ChickenCupheadPlugin.Instance.IdleSprites[0];
            }

            ChickenCupheadPlugin.ModLogger.LogInfo("[ChickenMod] FranklinVisualController configurado com sucesso! Renderizando Franklin!");
        }

        private void LateUpdate()
        {
            if (ChickenCupheadPlugin.Instance == null || !ChickenCupheadPlugin.Instance.SpritesLoaded) return;
            if (animCtrl == null) return;
            if (visualModel == null || franklinRenderer == null)
            {
                Setup(animCtrl);
                return;
            }

            // Oculta os renderers nativos do Cuphead para deixar apenas o Franklin visível
            foreach (SpriteRenderer sr in animCtrl.GetComponentsInChildren<SpriteRenderer>())
            {
                if (sr != franklinRenderer)
                {
                    sr.enabled = false;
                }
            }

            // Se o jogador estiver morto (modo fantasma), deixa o jogo renderizar o anjinho nativo
            if (playerController != null && playerController.IsDead)
            {
                franklinRenderer.enabled = false;
                return;
            }
            franklinRenderer.enabled = true;

            bool isAttacking = (weaponManager != null && weaponManager.IsShooting);
            bool isGrounded = (motor == null || motor.Grounded);
            bool isDucking = (motor != null && motor.Ducking);
            bool isMoving = (motor != null && Mathf.Abs(motor.MoveDirection.x) > 0.05f);

            // 1. ATAQUE BRAWLER (COMBO DE SOCOS DO FRANKLIN)
            if (isAttacking && ChickenCupheadPlugin.Instance.PunchSprites != null && ChickenCupheadPlugin.Instance.PunchSprites.Length > 0)
            {
                punchTimer += Time.deltaTime;
                if (punchTimer >= 0.06f)
                {
                    punchTimer = 0f;
                    punchIndex = (punchIndex + 1) % ChickenCupheadPlugin.Instance.PunchSprites.Length;
                    ChickenCupheadPlugin.Instance.PlayPunch();
                }
                franklinRenderer.sprite = ChickenCupheadPlugin.Instance.PunchSprites[punchIndex];
            }
            // 2. PULO (NO AR)
            else if (!isGrounded && ChickenCupheadPlugin.Instance.JumpSprite != null)
            {
                franklinRenderer.sprite = ChickenCupheadPlugin.Instance.JumpSprite;
            }
            // 3. AGACHADO (GUARDA BAIXA)
            else if (isDucking && ChickenCupheadPlugin.Instance.DuckSprite != null)
            {
                franklinRenderer.sprite = ChickenCupheadPlugin.Instance.DuckSprite;
            }
            // 4. CORRENDO (PASSADA DE LUTA)
            else if (isMoving && ChickenCupheadPlugin.Instance.RunSprites != null && ChickenCupheadPlugin.Instance.RunSprites.Length > 0)
            {
                runTimer += Time.deltaTime;
                if (runTimer >= 0.09f)
                {
                    runTimer = 0f;
                    runIndex = (runIndex + 1) % ChickenCupheadPlugin.Instance.RunSprites.Length;
                }
                franklinRenderer.sprite = ChickenCupheadPlugin.Instance.RunSprites[runIndex];
            }
            // 5. IDLE (RESPIRAÇÃO FLUIDA)
            else if (ChickenCupheadPlugin.Instance.IdleSprites != null && ChickenCupheadPlugin.Instance.IdleSprites.Length > 0)
            {
                idleTimer += Time.deltaTime;
                if (idleTimer >= 0.16f)
                {
                    idleTimer = 0f;
                    idleIndex = (idleIndex + 1) % ChickenCupheadPlugin.Instance.IdleSprites.Length;
                }
                franklinRenderer.sprite = ChickenCupheadPlugin.Instance.IdleSprites[idleIndex];
            }
        }
    }

    /// <summary>
    /// CONTROLADOR VISUAL DO FRANKLIN NO MAPA (OVERWORLD):
    /// </summary>
    public class FranklinMapVisualController : MonoBehaviour
    {
        private MapPlayerAnimationController mapAnimCtrl;
        private GameObject mapVisualModel;
        private SpriteRenderer mapRenderer;
        private Material mapMat;

        private float mapIdleTimer = 0f;
        private int mapIdleIndex = 0;

        private float mapRunTimer = 0f;
        private int mapRunIndex = 0;

        public void Setup(MapPlayerAnimationController controller)
        {
            mapAnimCtrl = controller;

            if (mapMat == null)
            {
                Shader s = Shader.Find("Sprites/Default");
                if (s == null) s = Shader.Find("Unlit/Transparent");
                if (s != null) mapMat = new Material(s);
            }

            if (mapVisualModel == null)
            {
                mapVisualModel = new GameObject("FranklinMapVisualModel");
                mapVisualModel.transform.SetParent(controller.transform, false);
                mapVisualModel.transform.localPosition = Vector3.zero;
                mapVisualModel.transform.localScale = Vector3.one;

                mapRenderer = mapVisualModel.AddComponent<SpriteRenderer>();
                if (mapMat != null) mapRenderer.material = mapMat;
                mapRenderer.sortingLayerName = "Player";
                mapRenderer.sortingOrder = 120;
                mapRenderer.color = Color.white;
                mapRenderer.enabled = true;
            }

            ChickenCupheadPlugin.ModLogger.LogInfo("[ChickenMod] FranklinMapVisualController configurado com sucesso no mapa!");
        }

        private void LateUpdate()
        {
            if (ChickenCupheadPlugin.Instance == null || !ChickenCupheadPlugin.Instance.SpritesLoaded) return;
            if (mapAnimCtrl == null) return;
            if (mapVisualModel == null || mapRenderer == null)
            {
                Setup(mapAnimCtrl);
                return;
            }

            // Oculta os renderers nativos do mapa
            foreach (SpriteRenderer sr in mapAnimCtrl.GetComponentsInChildren<SpriteRenderer>())
            {
                if (sr != mapRenderer)
                {
                    sr.enabled = false;
                }
            }

            bool isMoving = (mapAnimCtrl.state == MapPlayerAnimationController.State.Walk);

            if (isMoving && ChickenCupheadPlugin.Instance.RunSprites != null && ChickenCupheadPlugin.Instance.RunSprites.Length > 0)
            {
                mapRunTimer += Time.deltaTime;
                if (mapRunTimer >= 0.10f)
                {
                    mapRunTimer = 0f;
                    mapRunIndex = (mapRunIndex + 1) % ChickenCupheadPlugin.Instance.RunSprites.Length;
                }
                mapRenderer.sprite = ChickenCupheadPlugin.Instance.RunSprites[mapRunIndex];
            }
            else if (ChickenCupheadPlugin.Instance.IdleSprites != null && ChickenCupheadPlugin.Instance.IdleSprites.Length > 0)
            {
                mapIdleTimer += Time.deltaTime;
                if (mapIdleTimer >= 0.18f)
                {
                    mapIdleTimer = 0f;
                    mapIdleIndex = (mapIdleIndex + 1) % ChickenCupheadPlugin.Instance.IdleSprites.Length;
                }
                mapRenderer.sprite = ChickenCupheadPlugin.Instance.IdleSprites[mapIdleIndex];
            }
        }
    }

    /// <summary>
    /// CONTROLADOR VISUAL DO FRANKLIN NAS FASES DE AVIÃO (SHMUP):
    /// </summary>
    public class FranklinPlaneVisualController : MonoBehaviour
    {
        private PlanePlayerAnimationController planeAnimCtrl;
        private GameObject planeVisualModel;
        private SpriteRenderer planeRenderer;
        private Material planeMat;

        private float animTimer = 0f;
        private int animIndex = 0;

        public void Setup(PlanePlayerAnimationController controller)
        {
            planeAnimCtrl = controller;

            if (planeMat == null)
            {
                Shader s = Shader.Find("Sprites/Default");
                if (s == null) s = Shader.Find("Unlit/Transparent");
                if (s != null) planeMat = new Material(s);
            }

            if (planeVisualModel == null)
            {
                planeVisualModel = new GameObject("FranklinPlaneVisualModel");
                planeVisualModel.transform.SetParent(controller.transform, false);
                planeVisualModel.transform.localPosition = Vector3.zero;
                planeVisualModel.transform.localScale = Vector3.one;

                planeRenderer = planeVisualModel.AddComponent<SpriteRenderer>();
                if (planeMat != null) planeRenderer.material = planeMat;
                planeRenderer.sortingLayerName = "Player";
                planeRenderer.sortingOrder = 120;
                planeRenderer.color = Color.white;
                planeRenderer.enabled = true;
            }

            ChickenCupheadPlugin.ModLogger.LogInfo("[ChickenMod] FranklinPlaneVisualController configurado na fase de avião!");
        }

        private void LateUpdate()
        {
            if (ChickenCupheadPlugin.Instance == null || !ChickenCupheadPlugin.Instance.SpritesLoaded) return;
            if (planeAnimCtrl == null) return;
            if (planeVisualModel == null || planeRenderer == null)
            {
                Setup(planeAnimCtrl);
                return;
            }

            // Oculta os renderers nativos do avião do Cuphead
            foreach (SpriteRenderer sr in planeAnimCtrl.GetComponentsInChildren<SpriteRenderer>())
            {
                if (sr != planeRenderer)
                {
                    sr.enabled = false;
                }
            }

            if (planeAnimCtrl.basePlayer != null && planeAnimCtrl.basePlayer.IsDead)
            {
                planeRenderer.enabled = false;
                return;
            }
            planeRenderer.enabled = true;

            // Franklin voando no modo aéreo
            animTimer += Time.deltaTime;
            if (animTimer >= 0.10f)
            {
                animTimer = 0f;
                if (ChickenCupheadPlugin.Instance.RunSprites != null && ChickenCupheadPlugin.Instance.RunSprites.Length > 0)
                {
                    animIndex = (animIndex + 1) % ChickenCupheadPlugin.Instance.RunSprites.Length;
                    planeRenderer.sprite = ChickenCupheadPlugin.Instance.RunSprites[animIndex];
                }
            }
        }
    }

    /// <summary>
    /// PROJÉTIL DE SOCO VOADOR PERMANENTE:
    /// </summary>
    public class FranklinFistProjectile : MonoBehaviour
    {
        private SpriteRenderer sr;
        private Material defaultMat;

        private void Awake()
        {
            Shader s = Shader.Find("Sprites/Default");
            if (s == null) s = Shader.Find("Unlit/Transparent");
            if (s != null) defaultMat = new Material(s);

            foreach (Animator a in GetComponentsInChildren<Animator>())
            {
                a.enabled = false;
            }
            sr = GetComponentInChildren<SpriteRenderer>();
            ApplyFist();
        }

        private void LateUpdate()
        {
            ApplyFist();
        }

        private void ApplyFist()
        {
            if (ChickenCupheadPlugin.Instance == null || ChickenCupheadPlugin.Instance.FistProjectileSprite == null) return;

            if (sr == null) sr = GetComponentInChildren<SpriteRenderer>();
            if (sr != null)
            {
                sr.sprite = ChickenCupheadPlugin.Instance.FistProjectileSprite;
                if (defaultMat != null && sr.material != defaultMat)
                {
                    sr.material = defaultMat;
                }
                sr.sortingLayerName = "Projectiles";
                sr.sortingOrder = 120;
                sr.color = Color.white;
            }
        }
    }

    [HarmonyPatch(typeof(LevelPlayerAnimationController), "Start")]
    public static class Patch_PlayerAnimStart
    {
        [HarmonyPostfix]
        public static void Postfix(LevelPlayerAnimationController __instance)
        {
            if (__instance.GetComponent<FranklinVisualController>() == null)
            {
                FranklinVisualController fv = __instance.gameObject.AddComponent<FranklinVisualController>();
                fv.Setup(__instance);
            }
        }
    }

    [HarmonyPatch(typeof(LevelPlayerAnimationController), "LevelInit")]
    public static class Patch_PlayerAnimLevelInit
    {
        [HarmonyPostfix]
        public static void Postfix(LevelPlayerAnimationController __instance)
        {
            if (__instance.GetComponent<FranklinVisualController>() == null)
            {
                FranklinVisualController fv = __instance.gameObject.AddComponent<FranklinVisualController>();
                fv.Setup(__instance);
            }
        }
    }

    [HarmonyPatch(typeof(LevelPlayerAnimationController), "SetSprites")]
    public static class Patch_PlayerAnimSetSprites
    {
        [HarmonyPostfix]
        public static void Postfix(LevelPlayerAnimationController __instance)
        {
            if (__instance.GetComponent<FranklinVisualController>() == null)
            {
                FranklinVisualController fv = __instance.gameObject.AddComponent<FranklinVisualController>();
                fv.Setup(__instance);
            }
        }
    }

    [HarmonyPatch(typeof(MapPlayerAnimationController), "Init")]
    public static class Patch_MapPlayerAnimInit
    {
        [HarmonyPostfix]
        public static void Postfix(MapPlayerAnimationController __instance)
        {
            if (__instance.GetComponent<FranklinMapVisualController>() == null)
            {
                FranklinMapVisualController fmv = __instance.gameObject.AddComponent<FranklinMapVisualController>();
                fmv.Setup(__instance);
            }
        }
    }

    [HarmonyPatch(typeof(PlanePlayerAnimationController), "Start")]
    public static class Patch_PlanePlayerAnimStart
    {
        [HarmonyPostfix]
        public static void Postfix(PlanePlayerAnimationController __instance)
        {
            if (__instance.GetComponent<FranklinPlaneVisualController>() == null)
            {
                FranklinPlaneVisualController fp = __instance.gameObject.AddComponent<FranklinPlaneVisualController>();
                fp.Setup(__instance);
            }
        }
    }

    [HarmonyPatch(typeof(PlanePlayerAnimationController), "LevelInit")]
    public static class Patch_PlanePlayerAnimLevelInit
    {
        [HarmonyPostfix]
        public static void Postfix(PlanePlayerAnimationController __instance)
        {
            if (__instance.GetComponent<FranklinPlaneVisualController>() == null)
            {
                FranklinPlaneVisualController fp = __instance.gameObject.AddComponent<FranklinPlaneVisualController>();
                fp.Setup(__instance);
            }
        }
    }

    /// <summary>
    /// SUBSTITUI OS PROJÉTEIS DO JOGADOR PELOS PUNHOS / LUVAS BRAWLER DO CHICKEN ASSASSIN:
    /// </summary>
    [HarmonyPatch(typeof(AbstractProjectile), "Start")]
    public static class Patch_ProjectileStart
    {
        [HarmonyPostfix]
        public static void Postfix(AbstractProjectile __instance)
        {
            if (__instance.DamageSource != DamageDealer.DamageSource.Enemy &&
                ChickenCupheadPlugin.Instance != null && ChickenCupheadPlugin.Instance.FistProjectileSprite != null)
            {
                if (__instance.GetComponent<FranklinFistProjectile>() == null)
                {
                    __instance.gameObject.AddComponent<FranklinFistProjectile>();
                }
            }
        }
    }

    /// <summary>
    /// PROTEGE O CONTADOR DE MOEDAS DO MAPA CONTRA INDEX OUT OF RANGE:
    /// </summary>
    [HarmonyPatch(typeof(MapUICoins), "Update")]
    public static class Patch_MapUICoins
    {
        [HarmonyPrefix]
        public static bool Prefix(MapUICoins __instance, PlayerId ___playerId, ref int ___previousCurrency, Image ___currencyNbImage, Sprite[] ___coinSprites)
        {
            if (PlayerData.Data == null) return false;
            int currency = PlayerData.Data.GetCurrency(___playerId);
            if (currency != ___previousCurrency)
            {
                ___previousCurrency = currency;
                if (___coinSprites != null && ___coinSprites.Length > 0 && ___currencyNbImage != null)
                {
                    int safeIdx = Mathf.Clamp(currency, 0, ___coinSprites.Length - 1);
                    ___currencyNbImage.sprite = ___coinSprites[safeIdx];
                }
            }
            return false;
        }
    }

    /// <summary>
    /// UI DO MERCADO NEGRO DO CHICKEN ASSASSIN:
    /// </summary>
    public class ChickenShopUI : MonoBehaviour
    {
        public bool isChickenShopOpen = false;
        private GUIStyle headerStyle;
        private GUIStyle boxStyle;
        private GUIStyle buttonStyle;
        private GUIStyle boughtStyle;
        private GUIStyle cheatButtonStyle;
        private GUIStyle coinStyle;
        private GUIStyle cardTitleStyle;
        private GUIStyle cardDescStyle;
        private Vector2 scrollPos = Vector2.zero;

        private void Update()
        {
            if (Input.GetKeyDown(KeyCode.F1) || Input.GetKeyDown(KeyCode.Tab))
            {
                ToggleShop();
            }

            if (isChickenShopOpen && Input.GetKeyDown(KeyCode.Escape))
            {
                ToggleShop();
            }

            // CHEAT HOTKEYS:
            if (Input.GetKeyDown(KeyCode.F2)) AddCoins(10);
            if (Input.GetKeyDown(KeyCode.F3)) AddCoins(50);
            if (Input.GetKeyDown(KeyCode.F4)) AddCoins(100);
            if (Input.GetKeyDown(KeyCode.F5)) AddCoins(999);
        }

        public void ToggleShop()
        {
            isChickenShopOpen = !isChickenShopOpen;
            if (isChickenShopOpen)
            {
                if (ChickenCupheadPlugin.Instance != null)
                {
                    ChickenCupheadPlugin.Instance.PlayShopTheme();
                }
            }
        }

        private void AddCoins(int amount)
        {
            if (PlayerData.Data != null)
            {
                PlayerData.Data.AddCurrency(PlayerId.PlayerOne, amount);
                PlayerData.SaveCurrentFile();
                if (ChickenCupheadPlugin.Instance != null)
                {
                    ChickenCupheadPlugin.Instance.PlayCoinSound();
                }
                ChickenCupheadPlugin.ModLogger.LogInfo(string.Format("[ChickenMod] Moedas Adicionadas (+{0})! Novo Saldo: {1}", amount, PlayerData.Data.GetCurrency(PlayerId.PlayerOne)));
            }
        }

        private void OnGUI()
        {
            InitStyles();

            string sceneName = SceneManager.GetActiveScene().name.ToLower();
            bool inShopOrMap = sceneName.Contains("shop") || sceneName.Contains("map") || (ShopScene.Current != null);

            // Seta oficial visível na loja e no mapa, ou com a loja aberta
            if (inShopOrMap || isChickenShopOpen)
            {
                string arrowLabel = isChickenShopOpen ? "⬅️ VOLTAR AO PORKRIND" : "🍗 MERCADO NEGRO (F1) ➡️";
                if (GUI.Button(new Rect(Screen.width - 290, 20, 270, 50), arrowLabel, buttonStyle))
                {
                    ToggleShop();
                }
            }

            // Janela do Mercado Negro
            if (isChickenShopOpen)
            {
                int w = 820;
                int h = 580;
                int x = (Screen.width - w) / 2;
                int y = (Screen.height - h) / 2;

                if (ChickenCupheadPlugin.Instance != null && ChickenCupheadPlugin.Instance.BlackMarketBg != null)
                {
                    GUI.DrawTexture(new Rect(x, y, w, h), ChickenCupheadPlugin.Instance.BlackMarketBg, ScaleMode.StretchToFill);
                }
                else
                {
                    GUI.Box(new Rect(x, y, w, h), "", boxStyle);
                }

                GUILayout.BeginArea(new Rect(x + 20, y + 15, w - 40, h - 30));

                GUILayout.BeginHorizontal();
                if (ChickenCupheadPlugin.Instance != null && ChickenCupheadPlugin.Instance.ChickenLogo != null)
                {
                    GUILayout.Label(ChickenCupheadPlugin.Instance.ChickenLogo, GUILayout.Width(50), GUILayout.Height(38));
                }
                GUILayout.BeginVertical();
                GUILayout.Label("CHICKEN ASSASSIN: MERCADO NEGRO DO FRANKLIN", headerStyle);
                int coins = (PlayerData.Data != null) ? PlayerData.Data.GetCurrency(PlayerId.PlayerOne) : 0;
                GUILayout.Label(string.Format("<b>SEU SALDO: <color=yellow>{0} MOEDAS</color> (VALOR 2X ATIVO EM TODO O JOGO)</b>", coins), coinStyle);
                GUILayout.EndVertical();
                GUILayout.EndHorizontal();

                GUILayout.Space(8);

                // BARRA DE MOEDAS À VONTADE:
                GUILayout.BeginHorizontal();
                GUILayout.Label("<b>ADICIONAR MOEDAS:</b>", coinStyle, GUILayout.Width(150));
                if (GUILayout.Button("+10 (F2)", cheatButtonStyle, GUILayout.Height(28))) AddCoins(10);
                if (GUILayout.Button("+50 (F3)", cheatButtonStyle, GUILayout.Height(28))) AddCoins(50);
                if (GUILayout.Button("+100 (F4)", cheatButtonStyle, GUILayout.Height(28))) AddCoins(100);
                if (GUILayout.Button("💰 +999 (F5)", cheatButtonStyle, GUILayout.Height(28))) AddCoins(999);
                GUILayout.EndHorizontal();

                GUILayout.Space(10);

                // GRID DOS CARDS DE UPGRADE OFICIAIS:
                scrollPos = GUILayout.BeginScrollView(scrollPos, GUILayout.Height(390));

                GUILayout.BeginHorizontal();
                DrawCardItem("SOCO TITÂNICO", "Dano multiplicado por 25x brutal", 3,
                    ChickenCupheadPlugin.Instance.CardSavage,
                    ChickenCupheadPlugin.Instance.UpgradeTitanPunch, () => {
                        ChickenCupheadPlugin.Instance.UpgradeTitanPunch = true;
                    });

                DrawCardItem("METRALHADORA FÚRIA", "Cadência extrema: 40 socos por segundo", 3,
                    ChickenCupheadPlugin.Instance.CardRapidFire,
                    ChickenCupheadPlugin.Instance.UpgradeFurySpeed, () => {
                        ChickenCupheadPlugin.Instance.UpgradeFurySpeed = true;
                    });

                DrawCardItem("COLETE DE PENAS", "Inicia as fases com 25 de Vida (HP)", 4,
                    ChickenCupheadPlugin.Instance.CardIronShirt,
                    ChickenCupheadPlugin.Instance.UpgradeArmorHP, () => {
                        ChickenCupheadPlugin.Instance.UpgradeArmorHP = true;
                    });
                GUILayout.EndHorizontal();

                GUILayout.Space(12);

                GUILayout.BeginHorizontal();
                DrawCardItem("FÚRIA INSTANTÂNEA", "Inicia as fases com Super EX 100% carregado", 5,
                    ChickenCupheadPlugin.Instance.CardBraveheart,
                    ChickenCupheadPlugin.Instance.UpgradeInstantSuper, () => {
                        ChickenCupheadPlugin.Instance.UpgradeInstantSuper = true;
                    });

                DrawCardItem("CRÍTICO DEVASTADOR", "30% de chance de soco crítico fatal (50x dano)", 5,
                    ChickenCupheadPlugin.Instance.CardSoulCrusher,
                    ChickenCupheadPlugin.Instance.UpgradeSoulCrusher, () => {
                        ChickenCupheadPlugin.Instance.UpgradeSoulCrusher = true;
                    });

                DrawCardItem("DRONE PET", "Chance de 15% de drop de moedas ao golpear inimigos", 4,
                    ChickenCupheadPlugin.Instance.CardDronePet,
                    ChickenCupheadPlugin.Instance.UpgradeDronePet, () => {
                        ChickenCupheadPlugin.Instance.UpgradeDronePet = true;
                    });
                GUILayout.EndHorizontal();

                GUILayout.EndScrollView();

                GUILayout.Space(6);
                if (GUILayout.Button("⬅️ FECHAR E VOLTAR AO JOGO (ESC)", buttonStyle, GUILayout.Height(36)))
                {
                    ToggleShop();
                }

                GUILayout.EndArea();
            }
        }

        private void DrawCardItem(string name, string desc, int cost, Texture2D cardTex, bool bought, Action onBuy)
        {
            GUILayout.BeginVertical(boxStyle, GUILayout.Width(250), GUILayout.Height(175));

            GUILayout.BeginHorizontal();
            if (cardTex != null)
            {
                GUILayout.Label(cardTex, GUILayout.Width(50), GUILayout.Height(98));
            }
            GUILayout.BeginVertical();
            GUILayout.Label(name, cardTitleStyle);
            GUILayout.Label(desc, cardDescStyle);
            GUILayout.EndVertical();
            GUILayout.EndHorizontal();

            GUILayout.FlexibleSpace();

            if (bought)
            {
                GUILayout.Label("✅ ADQUIRIDO", boughtStyle, GUILayout.Height(30));
            }
            else
            {
                int coins = (PlayerData.Data != null) ? PlayerData.Data.GetCurrency(PlayerId.PlayerOne) : 0;
                string btnText = string.Format("COMPRAR ({0} MOEDAS)", cost);
                if (GUILayout.Button(btnText, buttonStyle, GUILayout.Height(30)))
                {
                    if (coins >= cost)
                    {
                        PlayerData.Data.AddCurrency(PlayerId.PlayerOne, -cost);
                        PlayerData.SaveCurrentFile();
                        onBuy();
                        ChickenCupheadPlugin.Instance.SaveUpgrades();
                        if (ChickenCupheadPlugin.Instance != null)
                        {
                            ChickenCupheadPlugin.Instance.PlayButtonClick();
                        }
                        ChickenCupheadPlugin.ModLogger.LogInfo("[ChickenMod] Upgrade adquirido: " + name);
                    }
                }
            }

            GUILayout.EndVertical();
        }

        private void InitStyles()
        {
            if (headerStyle == null)
            {
                headerStyle = new GUIStyle(GUI.skin.label);
                headerStyle.fontSize = 18;
                headerStyle.fontStyle = FontStyle.Bold;
                headerStyle.normal.textColor = Color.yellow;

                cardTitleStyle = new GUIStyle(GUI.skin.label);
                cardTitleStyle.fontSize = 13;
                cardTitleStyle.fontStyle = FontStyle.Bold;
                cardTitleStyle.normal.textColor = Color.white;

                cardDescStyle = new GUIStyle(GUI.skin.label);
                cardDescStyle.fontSize = 11;
                cardDescStyle.wordWrap = true;
                cardDescStyle.normal.textColor = new Color(0.85f, 0.85f, 0.85f);

                coinStyle = new GUIStyle(GUI.skin.label);
                coinStyle.fontSize = 12;
                coinStyle.normal.textColor = Color.white;

                boxStyle = new GUIStyle(GUI.skin.box);
                Texture2D bg = new Texture2D(1, 1);
                bg.SetPixel(0, 0, new Color(0.08f, 0.04f, 0.04f, 0.92f));
                bg.Apply();
                boxStyle.normal.background = bg;

                buttonStyle = new GUIStyle(GUI.skin.button);
                buttonStyle.fontSize = 12;
                buttonStyle.fontStyle = FontStyle.Bold;

                cheatButtonStyle = new GUIStyle(GUI.skin.button);
                cheatButtonStyle.fontSize = 11;
                cheatButtonStyle.fontStyle = FontStyle.Bold;

                boughtStyle = new GUIStyle(GUI.skin.label);
                boughtStyle.fontSize = 12;
                boughtStyle.fontStyle = FontStyle.Bold;
                boughtStyle.normal.textColor = Color.green;
                boughtStyle.alignment = TextAnchor.MiddleCenter;
            }
        }
    }

    /// <summary>
    /// TODAS AS MOEDAS QUE O JOGO SPAWNA, DROPA E COLETA VALEM 2X:
    /// </summary>
    [HarmonyPatch(typeof(PlayerData), "AddCurrency")]
    public static class Patch_DoubleCurrency
    {
        [HarmonyPrefix]
        public static void Prefix(PlayerId player, ref int value)
        {
            if (value > 0)
            {
                value = value * 2;
            }
        }
    }

    /// <summary>
    /// RECOMPENSA POR VENCER DE FASE:
    /// </summary>
    [HarmonyPatch(typeof(Level), "OnWin")]
    public static class Patch_LevelWinReward
    {
        [HarmonyPostfix]
        public static void Postfix()
        {
            if (PlayerData.Data != null)
            {
                PlayerData.Data.AddCurrency(PlayerId.PlayerOne, 5);
                PlayerData.SaveCurrentFile();
            }
        }
    }

    /// <summary>
    /// DANO BRAWLER E EFEITOS SONOROS DE SOCO DO CHICKEN ASSASSIN:
    /// </summary>
    [HarmonyPatch(typeof(DamageDealer), "DealDamage")]
    public static class Patch_DamageDealer
    {
        [HarmonyPrefix]
        public static void Prefix(DamageDealer __instance, ref float ___damageMultiplier, DamageDealer.DamageSource ___damageSource)
        {
            if (___damageSource != DamageDealer.DamageSource.Enemy)
            {
                float mult = 15f;

                if (ChickenCupheadPlugin.Instance != null)
                {
                    if (ChickenCupheadPlugin.Instance.UpgradeSoulCrusher && UnityEngine.Random.Range(0, 100) < 30)
                    {
                        mult = 50f;
                    }
                    else if (ChickenCupheadPlugin.Instance.UpgradeTitanPunch)
                    {
                        mult = 25f;
                    }

                    // Chance de drop de moedas ao golpear
                    if ((ChickenCupheadPlugin.Instance.UpgradeDronePet && UnityEngine.Random.Range(0, 100) < 15) ||
                        UnityEngine.Random.Range(0, 100) < 5)
                    {
                        if (PlayerData.Data != null)
                        {
                            PlayerData.Data.AddCurrency(PlayerId.PlayerOne, 1);
                        }
                    }

                    ChickenCupheadPlugin.Instance.PlayPunch();
                }

                ___damageMultiplier = mult;
            }
        }
    }

    /// <summary>
    /// VITALIDADE E SUPER BASEADOS NOS UPGRADES DO CHICKEN ASSASSIN:
    /// </summary>
    [HarmonyPatch(typeof(PlayerStatsManager), "LevelInit")]
    public static class Patch_PlayerStats
    {
        [HarmonyPostfix]
        public static void Postfix(PlayerStatsManager __instance)
        {
            int hp = (ChickenCupheadPlugin.Instance != null && ChickenCupheadPlugin.Instance.UpgradeArmorHP) ? 25 : 12;
            __instance.SetHealth(hp);

            if (ChickenCupheadPlugin.Instance != null && ChickenCupheadPlugin.Instance.UpgradeInstantSuper)
            {
                for (int i = 0; i < 5; i++) __instance.AddEx();
            }
            else
            {
                __instance.AddEx();
            }
        }
    }
}
