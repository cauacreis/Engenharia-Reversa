using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Windows.Forms;

namespace PvZLauncher
{
    public class PvZLauncherForm : Form
    {
        public enum OverlayState
        {
            None,
            Downloading,
            Completed,
            Failed
        }

        private List<ModEntry> mods;
        private string activeTab = "pvz1"; // "pvz1" ou "pvz2"
        private int selectedIndex = 0;
        private int hoveredIndex = -1;

        // Modal Overlay State
        private OverlayState currentOverlay = OverlayState.None;
        private ModEntry activeMod = null;
        private ModEntry completedMod = null;
        private string completedModTitle = "";
        private string failureReason = "";

        // Assets
        private Bitmap bmpTopLeft, bmpTopMiddle, bmpTopRight;
        private Bitmap bmpCenterLeft, bmpCenterMiddle, bmpCenterRight;
        private Bitmap bmpBottomLeft, bmpBottomMiddle, bmpBottomRight;
        private Bitmap bmpHeader;
        private Bitmap bmpBtnLeft, bmpBtnMiddle, bmpBtnRight;

        // UI Rectangles
        private Rectangle tabPvZ1Rect;
        private Rectangle tabPvZ2Rect;
        private Rectangle listRect;
        private Rectangle langInfoRect;
        private Rectangle btnPlayRect;
        private Rectangle btnLangRect;
        private Rectangle btnActionRect;
        private Rectangle btnSavesRect;
        private Rectangle btnCloseRect;
        private Rectangle statusBarRect;

        // Modal Overlay Rectangles
        private Rectangle overlayDialogRect;
        private Rectangle overlayBtnPrimaryRect;
        private Rectangle overlayBtnSecondaryRect;

        // Button hover & press states
        private Rectangle pressedButton = Rectangle.Empty;
        private Rectangle hoveredButton = Rectangle.Empty;
        private bool isHoveringTab1 = false;
        private bool isHoveringTab2 = false;

        // Fonts
        private Font titleFont;
        private Font tabFont;
        private Font itemFont;
        private Font descFont;
        private Font badgeFont;
        private Font btnFont;
        private Font statusFont;
        private Font detailFont;
        private Font modalHeaderFont;
        private Font modalSubFont;

        // Window drag state
        private bool isDragging = false;
        private Point dragCursorPoint;
        private Point dragFormPoint;

        private NotifyIcon trayIcon;

        public PvZLauncherForm()
        {
            this.Text = "Plants vs. Zombies - Multi-Mod Launcher";
            this.FormBorderStyle = FormBorderStyle.None;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.Size = new Size(760, 540);
            this.BackColor = Color.FromArgb(34, 36, 52);
            this.DoubleBuffered = true;
            this.SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.UserPaint | ControlStyles.OptimizedDoubleBuffer, true);

            LoadAssets();
            try { this.Icon = PvZResources.GetAppIcon(); } catch { }
            LoadMods();
            InitFonts();
            SetupLayout();
            SetupTrayIcon();
            SetupDownloaderEvents();
        }

        private void SetupDownloaderEvents()
        {
            DownloaderManager.ProgressUpdated += delegate
            {
                if (this.IsDisposed) return;
                try
                {
                    if (this.InvokeRequired)
                    {
                        this.BeginInvoke(new Action(delegate { this.Invalidate(); }));
                    }
                    else
                    {
                        this.Invalidate();
                    }
                }
                catch { }
            };

            DownloaderManager.DownloadCompleted += delegate(string modId, bool success, string error)
            {
                if (this.IsDisposed) return;
                try
                {
                    this.BeginInvoke(new Action(delegate
                    {
                        LoadMods();
                        if (success)
                        {
                            currentOverlay = OverlayState.Completed;
                            completedMod = mods.Find(m => m.Id == modId);
                            completedModTitle = (completedMod != null) ? completedMod.Title : modId;
                            try { System.Media.SystemSounds.Asterisk.Play(); } catch { }
                            try
                            {
                                trayIcon.ShowBalloonTip(4000, "Plants vs. Zombies", "Mod instalado com sucesso! Pronto para jogar na Steam.", ToolTipIcon.Info);
                            }
                            catch { }
                        }
                        else
                        {
                            currentOverlay = OverlayState.Failed;
                            failureReason = error ?? "Erro desconhecido durante o download.";
                            try { System.Media.SystemSounds.Hand.Play(); } catch { }
                        }
                        this.Invalidate();
                    }));
                }
                catch { }
            };
        }

        private void LoadAssets()
        {
            bmpTopLeft = PvZResources.GetDialogTopLeft();
            bmpTopMiddle = PvZResources.GetDialogTopMiddle();
            bmpTopRight = PvZResources.GetDialogTopRight();
            bmpCenterLeft = PvZResources.GetDialogCenterLeft();
            bmpCenterMiddle = PvZResources.GetDialogCenterMiddle();
            bmpCenterRight = PvZResources.GetDialogCenterRight();
            bmpBottomLeft = PvZResources.GetDialogBottomLeft();
            bmpBottomMiddle = PvZResources.GetDialogBottomMiddle();
            bmpBottomRight = PvZResources.GetDialogBottomRight();
            bmpHeader = PvZResources.GetDialogHeader();
            bmpBtnLeft = PvZResources.GetButtonLeft();
            bmpBtnMiddle = PvZResources.GetButtonMiddle();
            bmpBtnRight = PvZResources.GetButtonRight();
        }

        private void LoadMods()
        {
            mods = ModManager.GetAvailableMods();
            List<ModEntry> displayed = GetDisplayedMods();
            if (selectedIndex >= displayed.Count) selectedIndex = 0;
        }

        private List<ModEntry> GetDisplayedMods()
        {
            if (mods == null) return new List<ModEntry>();
            return mods.FindAll(m => m.Category == activeTab);
        }

        private void InitFonts()
        {
            try { titleFont = new Font("Arial", 18, FontStyle.Bold); } catch { titleFont = SystemFonts.DefaultFont; }
            try { tabFont = new Font("Arial", 10, FontStyle.Bold); } catch { tabFont = SystemFonts.DefaultFont; }
            try { itemFont = new Font("Arial", 11, FontStyle.Bold); } catch { itemFont = SystemFonts.DefaultFont; }
            try { descFont = new Font("Arial", 9, FontStyle.Regular); } catch { descFont = SystemFonts.DefaultFont; }
            try { badgeFont = new Font("Arial", 8, FontStyle.Bold); } catch { badgeFont = SystemFonts.DefaultFont; }
            try { btnFont = new Font("Arial", 11, FontStyle.Bold); } catch { btnFont = SystemFonts.DefaultFont; }
            try { statusFont = new Font("Arial", 9, FontStyle.Bold); } catch { statusFont = SystemFonts.DefaultFont; }
            try { detailFont = new Font("Arial", 8, FontStyle.Regular); } catch { detailFont = SystemFonts.DefaultFont; }
            try { modalHeaderFont = new Font("Arial", 15, FontStyle.Bold); } catch { modalHeaderFont = SystemFonts.DefaultFont; }
            try { modalSubFont = new Font("Arial", 11, FontStyle.Bold); } catch { modalSubFont = SystemFonts.DefaultFont; }
        }

        private void SetupLayout()
        {
            tabPvZ1Rect = new Rectangle(45, 66, 241, 30);
            tabPvZ2Rect = new Rectangle(287, 66, 243, 30);

            listRect = new Rectangle(45, 96, 485, 291);
            langInfoRect = new Rectangle(45, 394, 485, 44);

            int btnX = 545;
            int btnW = 175;
            int btnH = bmpBtnLeft.Height > 0 ? bmpBtnLeft.Height : 46;

            btnPlayRect = new Rectangle(btnX, 105, btnW, btnH);
            btnLangRect = new Rectangle(btnX, 165, btnW, btnH);
            btnActionRect = new Rectangle(btnX, 225, btnW, btnH);
            btnSavesRect = new Rectangle(btnX, 285, btnW, btnH);
            btnCloseRect = new Rectangle(btnX, 345, btnW, btnH);

            statusBarRect = new Rectangle(45, 448, 675, 48);

            // Modal overlay centered
            overlayDialogRect = new Rectangle(100, 115, 560, 310);
            overlayBtnPrimaryRect = new Rectangle(180, 360, 180, 44);
            overlayBtnSecondaryRect = new Rectangle(380, 360, 160, 44);
        }

        private void SetupTrayIcon()
        {
            trayIcon = new NotifyIcon();
            trayIcon.Text = "Plants vs. Zombies - Mod Manager";
            try
            {
                trayIcon.Icon = this.Icon != null ? this.Icon : PvZResources.GetAppIcon();
            }
            catch { }

            ContextMenuStrip cms = new ContextMenuStrip();
            ToolStripMenuItem itemOpen = new ToolStripMenuItem("Abrir Menu do Launcher");
            itemOpen.Click += (s, e) =>
            {
                this.Show();
                this.WindowState = FormWindowState.Normal;
                this.BringToFront();
                this.Invalidate();
            };
            ToolStripMenuItem itemExit = new ToolStripMenuItem("Encerrar e Fechar Launcher");
            itemExit.Click += (s, e) =>
            {
                trayIcon.Visible = false;
                Application.Exit();
            };
            cms.Items.Add(itemOpen);
            cms.Items.Add(new ToolStripSeparator());
            cms.Items.Add(itemExit);
            trayIcon.ContextMenuStrip = cms;

            trayIcon.DoubleClick += (s, e) =>
            {
                this.Show();
                this.WindowState = FormWindowState.Normal;
                this.BringToFront();
                this.Invalidate();
            };

            trayIcon.Visible = false;
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            Graphics g = e.Graphics;
            g.Clear(Color.FromArgb(34, 36, 52));
            g.PixelOffsetMode = PixelOffsetMode.Half;
            g.SmoothingMode = SmoothingMode.HighQuality;
            g.InterpolationMode = InterpolationMode.Bilinear;
            g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;

            // 1. Draw 9-slice stone dialog border with ZERO gaps
            Draw9SliceDialog(g, 0, 0, this.Width, this.Height);

            // 2. Draw Header Banner
            int hw = bmpHeader.Width;
            int hx = (this.Width - hw) / 2;
            g.DrawImage(bmpHeader, hx, -5);

            // Header Text with rich drop-shadow
            string titleText = "QUAL VERSÃO VAI JOGAR?";
            SizeF titleSize = g.MeasureString(titleText, titleFont);
            float tx = (this.Width - titleSize.Width) / 2f;
            float ty = 26f;
            g.DrawString(titleText, titleFont, Brushes.Black, tx + 2, ty + 2);
            using (Brush goldBrush = new SolidBrush(Color.FromArgb(255, 235, 140)))
            {
                g.DrawString(titleText, titleFont, goldBrush, tx, ty);
            }

            // 3. Draw Category Tabs (PvZ 1 vs PvZ 2)
            DrawCategoryTabs(g);

            // 4. Draw Inset Mod List Box (Stone sunken look)
            using (SolidBrush bgBrush = new SolidBrush(Color.FromArgb(240, 25, 20, 16)))
            using (Pen borderPen = new Pen(Color.FromArgb(95, 75, 50), 2))
            using (Pen innerPen = new Pen(Color.FromArgb(15, 10, 8), 1))
            {
                g.FillRectangle(bgBrush, listRect);
                g.DrawRectangle(borderPen, listRect);
                g.DrawRectangle(innerPen, listRect.X + 2, listRect.Y + 2, listRect.Width - 4, listRect.Height - 4);
            }

            // Draw Mod items for current active tab
            List<ModEntry> displayed = GetDisplayedMods();
            int itemCount = displayed.Count;
            int itemHeight = listRect.Height / Math.Max(itemCount, 1);

            for (int i = 0; i < itemCount; i++)
            {
                ModEntry mod = displayed[i];
                Rectangle rowRect = new Rectangle(listRect.X + 4, listRect.Y + 4 + (i * itemHeight), listRect.Width - 8, itemHeight - 6);

                bool isSelected = (i == selectedIndex);
                bool isHovered = (i == hoveredIndex && !isSelected);

                if (isSelected)
                {
                    using (SolidBrush selBg = new SolidBrush(Color.FromArgb(240, 70, 50, 30)))
                    using (Pen selPen = new Pen(Color.FromArgb(240, 210, 100), 2))
                    {
                        g.FillRectangle(selBg, rowRect);
                        g.DrawRectangle(selPen, rowRect);
                    }
                }
                else if (isHovered)
                {
                    using (SolidBrush hovBg = new SolidBrush(Color.FromArgb(180, 50, 40, 30)))
                    using (Pen hovPen = new Pen(Color.FromArgb(140, 120, 80), 1))
                    {
                        g.FillRectangle(hovBg, rowRect);
                        g.DrawRectangle(hovPen, rowRect);
                    }
                }
                else
                {
                    using (SolidBrush itemBg = new SolidBrush(Color.FromArgb(180, 35, 28, 22)))
                    using (Pen itemPen = new Pen(Color.FromArgb(55, 45, 35), 1))
                    {
                        g.FillRectangle(itemBg, rowRect);
                        g.DrawRectangle(itemPen, rowRect);
                    }
                }

                // If currently downloading this mod, draw active progress fill on row background!
                bool isThisDownloading = (DownloaderManager.IsDownloading && DownloaderManager.CurrentModId == mod.Id);
                if (isThisDownloading && DownloaderManager.ProgressPercentage > 0)
                {
                    int fillW = (int)((rowRect.Width - 4) * (DownloaderManager.ProgressPercentage / 100.0));
                    if (fillW > 0)
                    {
                        using (SolidBrush dlRowFill = new SolidBrush(Color.FromArgb(45, 60, 190, 70)))
                        {
                            g.FillRectangle(dlRowFill, rowRect.X + 2, rowRect.Y + 2, fillW, rowRect.Height - 4);
                        }
                    }
                }

                // Draw Custom Vector Thematic Badge Icon
                DrawThematicBadgeIcon(g, mod.ThemeKey, rowRect.X + 18, rowRect.Y + rowRect.Height / 2);

                // Right Badges (Calculated from right edge to avoid collision)
                // 1. Status Badge (INSTALADO / BAIXAR / BAIXANDO...)
                string statusText = isThisDownloading ? ("BAIXANDO " + DownloaderManager.ProgressPercentage + "%") : (mod.IsInstalled ? "INSTALADO" : "BAIXAR");
                Color badgeBg = isThisDownloading ? Color.FromArgb(40, 140, 210) : (mod.IsInstalled ? Color.FromArgb(60, 145, 60) : Color.FromArgb(190, 120, 30));

                int bw = isThisDownloading ? 96 : 74;
                int bh = 20;
                int bx = rowRect.Right - bw - 6;
                int by = rowRect.Y + 8;
                Rectangle bRect = new Rectangle(bx, by, bw, bh);

                using (SolidBrush bBrush = new SolidBrush(badgeBg))
                using (Pen bPen = new Pen(Color.FromArgb(25, 20, 15), 1))
                {
                    g.FillRectangle(bBrush, bRect);
                    g.DrawRectangle(bPen, bRect);
                    TextRenderer.DrawText(g, statusText, badgeFont, bRect, Color.White, TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter);
                }

                // 2. Language Badge ([PT-BR], [ENG], [中文])
                LanguageOption lang = LanguageManager.GetCurrentLanguage(mod.Id);
                int lw = 44;
                int lx = bx - lw - 6;
                Rectangle lRect = new Rectangle(lx, by, lw, bh);
                using (SolidBrush lBrush = new SolidBrush(Color.FromArgb(50, 75, 100)))
                using (Pen lPen = new Pen(Color.FromArgb(90, 130, 170), 1))
                {
                    g.FillRectangle(lBrush, lRect);
                    g.DrawRectangle(lPen, lRect);
                    TextRenderer.DrawText(g, lang.ShortName, badgeFont, lRect, Color.FromArgb(230, 240, 255), TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter);
                }

                // Title (With strict right boundary so it NEVER touches badges!)
                int titleMaxW = lx - (rowRect.X + 36) - 8;
                Rectangle titleRect = new Rectangle(rowRect.X + 36, rowRect.Y + 6, titleMaxW, 20);
                Color tColor = isSelected ? Color.White : Color.FromArgb(225, 215, 195);
                TextRenderer.DrawText(g, mod.Title, itemFont, new Rectangle(titleRect.X + 1, titleRect.Y + 1, titleRect.Width, titleRect.Height), Color.Black, TextFormatFlags.Left | TextFormatFlags.VerticalCenter | TextFormatFlags.EndEllipsis);
                TextRenderer.DrawText(g, mod.Title, itemFont, titleRect, tColor, TextFormatFlags.Left | TextFormatFlags.VerticalCenter | TextFormatFlags.EndEllipsis);

                // Description
                Color dColor = isSelected ? Color.FromArgb(240, 230, 200) : Color.FromArgb(170, 160, 145);
                Rectangle descRect = new Rectangle(rowRect.X + 36, rowRect.Y + 28, rowRect.Width - 44, 18);
                TextRenderer.DrawText(g, mod.Description, descFont, descRect, dColor, TextFormatFlags.Left | TextFormatFlags.VerticalCenter | TextFormatFlags.EndEllipsis);
            }

            // 5. Draw Language & Info Bar under list (Shows live progress bar during downloads!)
            DrawLanguageInfoBar(g);

            // 6. Draw Authentic Action Buttons
            ModEntry current = (selectedIndex >= 0 && selectedIndex < displayed.Count) ? displayed[selectedIndex] : null;

            string playBtnText = "JOGAR";
            if (DownloaderManager.IsDownloading && current != null && current.Id == DownloaderManager.CurrentModId)
            {
                playBtnText = "BAIXANDO " + DownloaderManager.ProgressPercentage + "%";
            }
            else if (current != null && !current.IsInstalled)
            {
                playBtnText = "INSTALAR";
            }

            LanguageOption curLang = current != null ? LanguageManager.GetCurrentLanguage(current.Id) : new LanguageOption { ShortName = "PT-BR" };
            string langBtnText = "IDIOMA (" + curLang.ShortName + ")";
            string actionBtnText = (current != null && current.IsInstalled) ? "EXPLORAR" : "BAIXAR";

            DrawPvZButton(g, btnPlayRect, playBtnText, true);
            DrawPvZButton(g, btnLangRect, langBtnText, false);
            DrawPvZButton(g, btnActionRect, actionBtnText, false);
            DrawPvZButton(g, btnSavesRect, "SAVES", false);
            DrawPvZButton(g, btnCloseRect, "FECHAR", false);

            // 7. Bottom Status Bar & Steam Tracking Banner
            DrawStatusBar(g);

            // 8. If an overlay is active, render the prominent PopCap Modal on top!
            if (currentOverlay != OverlayState.None)
            {
                DrawModalOverlay(g);
            }
        }

        private void DrawModalOverlay(Graphics g)
        {
            // 1. Semi-transparent wash over background
            using (SolidBrush darkWash = new SolidBrush(Color.FromArgb(185, 0, 0, 0)))
            {
                g.FillRectangle(darkWash, 0, 0, this.Width, this.Height);
            }

            // 2. Stone sunken card with authentic PopCap border
            using (SolidBrush cardBg = new SolidBrush(Color.FromArgb(248, 28, 22, 17)))
            using (Pen goldBorder = new Pen(Color.FromArgb(220, 180, 80), 3))
            using (Pen darkInner = new Pen(Color.FromArgb(12, 8, 6), 2))
            {
                g.FillRectangle(cardBg, overlayDialogRect);
                g.DrawRectangle(goldBorder, overlayDialogRect);
                g.DrawRectangle(darkInner, overlayDialogRect.X + 3, overlayDialogRect.Y + 3, overlayDialogRect.Width - 6, overlayDialogRect.Height - 6);
            }

            // Draw 4 corner gold studs
            DrawStud(g, overlayDialogRect.X + 8, overlayDialogRect.Y + 8);
            DrawStud(g, overlayDialogRect.Right - 16, overlayDialogRect.Y + 8);
            DrawStud(g, overlayDialogRect.X + 8, overlayDialogRect.Bottom - 16);
            DrawStud(g, overlayDialogRect.Right - 16, overlayDialogRect.Bottom - 16);

            // 3. Render content according to overlay state
            if (currentOverlay == OverlayState.Downloading)
            {
                DrawDownloadingModal(g);
            }
            else if (currentOverlay == OverlayState.Completed)
            {
                DrawCompletedModal(g);
            }
            else if (currentOverlay == OverlayState.Failed)
            {
                DrawFailedModal(g);
            }
        }

        private void DrawDownloadingModal(Graphics g)
        {
            string title = "INSTALANDO MOD AUTONOMAMENTE";
            SizeF ts = g.MeasureString(title, modalHeaderFont);
            float tx = overlayDialogRect.X + (overlayDialogRect.Width - ts.Width) / 2f;
            float ty = overlayDialogRect.Y + 22f;

            using (Brush bShadow = new SolidBrush(Color.Black))
            using (Brush bGold = new SolidBrush(Color.FromArgb(255, 235, 140)))
            {
                g.DrawString(title, modalHeaderFont, bShadow, tx + 1, ty + 1);
                g.DrawString(title, modalHeaderFont, bGold, tx, ty);
            }

            string modTitle = DownloaderManager.CurrentModTitle ?? (activeMod != null ? activeMod.Title : "Carregando mod...");
            SizeF ms = g.MeasureString(modTitle, modalSubFont);
            float mx = overlayDialogRect.X + (overlayDialogRect.Width - ms.Width) / 2f;
            float my = overlayDialogRect.Y + 54f;

            using (Brush bWhite = new SolidBrush(Color.FromArgb(240, 235, 215)))
            {
                g.DrawString(modTitle, modalSubFont, bWhite, mx, my);
            }

            // Big Prominent Progress Bar
            int barX = overlayDialogRect.X + 40;
            int barY = overlayDialogRect.Y + 95;
            int barW = overlayDialogRect.Width - 80;
            int barH = 28;

            using (SolidBrush barBg = new SolidBrush(Color.FromArgb(16, 12, 10)))
            using (Pen barBorder = new Pen(Color.FromArgb(75, 60, 42), 2))
            {
                g.FillRectangle(barBg, barX, barY, barW, barH);
                g.DrawRectangle(barBorder, barX, barY, barW, barH);
            }

            int pct = DownloaderManager.ProgressPercentage;
            if (pct > 0)
            {
                int fillW = (int)((barW - 4) * (Math.Min(pct, 100) / 100.0));
                if (fillW > 0)
                {
                    using (LinearGradientBrush fillB = new LinearGradientBrush(new Rectangle(barX + 2, barY + 2, fillW, barH - 4), Color.FromArgb(75, 215, 90), Color.FromArgb(45, 165, 60), LinearGradientMode.Vertical))
                    {
                        g.FillRectangle(fillB, barX + 2, barY + 2, fillW, barH - 4);
                    }
                    // Top shine highlight
                    using (Pen shineP = new Pen(Color.FromArgb(120, 255, 255, 255), 1))
                    {
                        g.DrawLine(shineP, barX + 3, barY + 3, barX + fillW, barY + 3);
                    }
                }
            }

            // Percentage inside progress bar
            string pctText = pct + "%";
            TextRenderer.DrawText(g, pctText, btnFont, new Rectangle(barX, barY, barW, barH), Color.White, TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter);

            // Detailed Speed & Size stats
            string details = DownloaderManager.DetailedProgress ?? "Iniciando transferência...";
            SizeF ds = g.MeasureString(details, itemFont);
            float dx = overlayDialogRect.X + (overlayDialogRect.Width - ds.Width) / 2f;
            float dy = barY + barH + 16f;

            using (Brush bCyan = new SolidBrush(Color.FromArgb(130, 235, 190)))
            {
                g.DrawString(details, itemFont, bCyan, dx, dy);
            }

            // Status message
            string status = DownloaderManager.StatusMessage ?? "Processando...";
            SizeF ss = g.MeasureString(status, detailFont);
            float sx = overlayDialogRect.X + (overlayDialogRect.Width - ss.Width) / 2f;
            float sy = dy + 22f;

            using (Brush bStatus = new SolidBrush(Color.FromArgb(210, 200, 180)))
            {
                g.DrawString(status, detailFont, bStatus, sx, sy);
            }

            // Buttons: [ SEGUNDO PLANO ] e [ CANCELAR ]
            overlayBtnPrimaryRect = new Rectangle(overlayDialogRect.X + 80, overlayDialogRect.Bottom - 62, 220, 42);
            overlayBtnSecondaryRect = new Rectangle(overlayDialogRect.X + 320, overlayDialogRect.Bottom - 62, 160, 42);

            DrawPvZButton(g, overlayBtnPrimaryRect, "SEGUNDO PLANO", false);
            DrawPvZButton(g, overlayBtnSecondaryRect, "CANCELAR", false);
        }

        private void DrawCompletedModal(Graphics g)
        {
            string title = "INSTALAÇÃO CONCLUÍDA!";
            SizeF ts = g.MeasureString(title, titleFont);
            float tx = overlayDialogRect.X + (overlayDialogRect.Width - ts.Width) / 2f;
            float ty = overlayDialogRect.Y + 22f;

            using (Brush bShadow = new SolidBrush(Color.Black))
            using (Brush bGold = new SolidBrush(Color.FromArgb(255, 235, 140)))
            {
                g.DrawString(title, titleFont, bShadow, tx + 1, ty + 1);
                g.DrawString(title, titleFont, bGold, tx, ty);
            }

            // Large victory badge icon (Center)
            int badgeCy = overlayDialogRect.Y + 70;
            int badgeCx = overlayDialogRect.X + overlayDialogRect.Width / 2;
            using (Brush bGreen = new SolidBrush(Color.FromArgb(60, 185, 75)))
            using (Pen pGreen = new Pen(Color.FromArgb(25, 100, 35), 2))
            using (Pen checkPen = new Pen(Color.White, 3))
            {
                g.FillEllipse(bGreen, badgeCx - 18, badgeCy - 18, 36, 36);
                g.DrawEllipse(pGreen, badgeCx - 18, badgeCy - 18, 36, 36);
                // Checkmark
                g.DrawLine(checkPen, badgeCx - 8, badgeCy, badgeCx - 2, badgeCy + 6);
                g.DrawLine(checkPen, badgeCx - 2, badgeCy + 6, badgeCx + 8, badgeCy - 5);
            }

            string modTitle = completedModTitle ?? (completedMod != null ? completedMod.Title : "Mod");
            string lineSuccess = string.Format("O mod \"{0}\" foi instalado com 100% de sucesso!", modTitle);
            SizeF ms = g.MeasureString(lineSuccess, itemFont);
            float mx = overlayDialogRect.X + (overlayDialogRect.Width - ms.Width) / 2f;
            float my = overlayDialogRect.Y + 104f;

            using (Brush bWhite = new SolidBrush(Color.FromArgb(250, 245, 230)))
            {
                g.DrawString(lineSuccess, itemFont, bWhite, mx, my);
            }

            // Features checklist with crisp custom vector checkmarks
            string[] perks = new string[] {
                "Todos os arquivos foram baixados e extraídos com integridade",
                "Executável vinculado e compatível com contagem de horas da Steam (AppID: 3590)",
                "Sandbox seguro de saves ativado sem conflito com o jogo original"
            };

            float perkY = my + 26f;
            using (Brush perkB = new SolidBrush(Color.FromArgb(170, 235, 180)))
            using (Brush dotB = new SolidBrush(Color.FromArgb(60, 185, 75)))
            using (Pen chkP = new Pen(Color.White, 1.5f))
            {
                foreach (string p in perks)
                {
                    SizeF ps = g.MeasureString(p, descFont);
                    int totalW = 14 + 8 + (int)ps.Width;
                    int px = overlayDialogRect.X + (overlayDialogRect.Width - totalW) / 2;
                    int py = (int)perkY;

                    // Mini check circle
                    g.FillEllipse(dotB, px, py + 2, 12, 12);
                    g.DrawLine(chkP, px + 2, py + 7, px + 5, py + 10);
                    g.DrawLine(chkP, px + 5, py + 10, px + 10, py + 4);

                    g.DrawString(p, descFont, perkB, px + 20, perkY);
                    perkY += 21f;
                }
            }

            // Buttons: [ JOGAR AGORA ] (Gold) e [ CONCLUÍDO ] (Stone)
            overlayBtnPrimaryRect = new Rectangle(overlayDialogRect.X + 90, overlayDialogRect.Bottom - 62, 190, 42);
            overlayBtnSecondaryRect = new Rectangle(overlayDialogRect.X + 300, overlayDialogRect.Bottom - 62, 170, 42);

            DrawPvZButton(g, overlayBtnPrimaryRect, "JOGAR AGORA", true);
            DrawPvZButton(g, overlayBtnSecondaryRect, "CONCLUÍDO", false);
        }

        private void DrawFailedModal(Graphics g)
        {
            string title = "FALHA NA INSTALAÇÃO";
            SizeF ts = g.MeasureString(title, titleFont);
            float tx = overlayDialogRect.X + (overlayDialogRect.Width - ts.Width) / 2f;
            float ty = overlayDialogRect.Y + 24f;

            using (Brush bRed = new SolidBrush(Color.FromArgb(235, 75, 75)))
            {
                g.DrawString(title, titleFont, Brushes.Black, tx + 1, ty + 1);
                g.DrawString(title, titleFont, bRed, tx, ty);
            }

            string line1 = "Ocorreu um erro durante o download ou extração autônoma dos arquivos:";
            SizeF s1 = g.MeasureString(line1, itemFont);
            float x1 = overlayDialogRect.X + (overlayDialogRect.Width - s1.Width) / 2f;
            float y1 = overlayDialogRect.Y + 70f;

            using (Brush bWhite = new SolidBrush(Color.FromArgb(240, 230, 220)))
            {
                g.DrawString(line1, itemFont, bWhite, x1, y1);
            }

            string errText = failureReason ?? "Erro de rede ou permissão.";
            Rectangle errRect = new Rectangle(overlayDialogRect.X + 30, (int)y1 + 30, overlayDialogRect.Width - 60, 60);
            using (SolidBrush ebBg = new SolidBrush(Color.FromArgb(20, 14, 12)))
            using (Pen ebPen = new Pen(Color.FromArgb(80, 50, 40), 1))
            {
                g.FillRectangle(ebBg, errRect);
                g.DrawRectangle(ebPen, errRect);
                TextRenderer.DrawText(g, errText, descFont, errRect, Color.FromArgb(255, 170, 170), TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter | TextFormatFlags.WordBreak);
            }

            overlayBtnPrimaryRect = new Rectangle(overlayDialogRect.X + 80, overlayDialogRect.Bottom - 62, 210, 42);
            overlayBtnSecondaryRect = new Rectangle(overlayDialogRect.X + 310, overlayDialogRect.Bottom - 62, 170, 42);

            DrawPvZButton(g, overlayBtnPrimaryRect, "TENTAR NOVAMENTE", true);
            DrawPvZButton(g, overlayBtnSecondaryRect, "FECHAR", false);
        }

        private void DrawStud(Graphics g, int x, int y)
        {
            using (Brush studB = new SolidBrush(Color.FromArgb(230, 190, 80)))
            using (Pen studP = new Pen(Color.FromArgb(140, 100, 30), 1))
            using (Brush studHi = new SolidBrush(Color.FromArgb(255, 245, 180)))
            {
                g.FillEllipse(studB, x, y, 8, 8);
                g.DrawEllipse(studP, x, y, 8, 8);
                g.FillEllipse(studHi, x + 2, y + 2, 3, 3);
            }
        }

        private void DrawCategoryTabs(Graphics g)
        {
            bool isPvZ1Active = (activeTab == "pvz1");
            bool isPvZ2Active = (activeTab == "pvz2");

            DrawSingleTab(g, tabPvZ1Rect, "PLANTS VS. ZOMBIES 1", "sun", isPvZ1Active, isHoveringTab1);
            DrawSingleTab(g, tabPvZ2Rect, "PLANTS VS. ZOMBIES 2", "time", isPvZ2Active, isHoveringTab2);
        }

        private void DrawSingleTab(Graphics g, Rectangle r, string text, string iconType, bool isActive, bool isHovered)
        {
            Color tabBg = isActive ? Color.FromArgb(245, 45, 36, 28) : (isHovered ? Color.FromArgb(210, 32, 26, 20) : Color.FromArgb(190, 22, 17, 13));
            Color tabBorder = isActive ? Color.FromArgb(200, 160, 80) : Color.FromArgb(75, 60, 42);
            Color textColor = isActive ? Color.FromArgb(255, 235, 140) : (isHovered ? Color.White : Color.FromArgb(170, 160, 145));

            using (SolidBrush bgB = new SolidBrush(tabBg))
            using (Pen borderP = new Pen(tabBorder, 2))
            {
                g.FillRectangle(bgB, r);

                // Top, Left, Right borders
                g.DrawLine(borderP, r.Left, r.Bottom, r.Left, r.Top + 2);
                g.DrawLine(borderP, r.Left + 2, r.Top, r.Right - 2, r.Top);
                g.DrawLine(borderP, r.Right, r.Top + 2, r.Right, r.Bottom);

                if (!isActive)
                {
                    // Bottom border separating inactive tab from list
                    g.DrawLine(borderP, r.Left, r.Bottom, r.Right, r.Bottom);
                }
                else
                {
                    // Active tab merges seamlessly with list below
                    using (SolidBrush blendBrush = new SolidBrush(tabBg))
                    {
                        g.FillRectangle(blendBrush, r.Left + 1, r.Bottom - 1, r.Width - 2, 4);
                    }
                    // Inner gold glow on active tab top
                    using (Pen glowP = new Pen(Color.FromArgb(60, 255, 255, 200), 1))
                    {
                        g.DrawLine(glowP, r.Left + 2, r.Top + 2, r.Right - 2, r.Top + 2);
                    }
                }
            }

            // Draw custom vector icon and text
            SizeF s = g.MeasureString(text, tabFont);
            int totalW = 14 + 6 + (int)s.Width;
            int startX = r.X + (r.Width - totalW) / 2;
            int iconCy = r.Y + r.Height / 2 - (isActive ? 1 : 0);

            if (iconType == "sun")
            {
                using (Brush petalB = new SolidBrush(Color.FromArgb(255, 205, 30)))
                using (Pen petalP = new Pen(Color.FromArgb(190, 130, 10), 1))
                using (Brush centerB = new SolidBrush(Color.FromArgb(150, 85, 10)))
                {
                    g.FillEllipse(petalB, startX, iconCy - 6, 12, 12);
                    g.DrawEllipse(petalP, startX, iconCy - 6, 12, 12);
                    g.FillEllipse(centerB, startX + 3, iconCy - 3, 6, 6);
                }
            }
            else if (iconType == "time")
            {
                using (Brush capB = new SolidBrush(Color.FromArgb(160, 120, 60)))
                using (Brush glassB = new SolidBrush(Color.FromArgb(80, 180, 230)))
                using (Brush sandB = new SolidBrush(Color.FromArgb(250, 210, 90)))
                {
                    g.FillRectangle(capB, startX, iconCy - 6, 12, 2);
                    g.FillRectangle(capB, startX, iconCy + 4, 12, 2);
                    Point[] p1 = new Point[] { new Point(startX + 1, iconCy - 4), new Point(startX + 11, iconCy - 4), new Point(startX + 6, iconCy) };
                    Point[] p2 = new Point[] { new Point(startX + 6, iconCy), new Point(startX + 11, iconCy + 4), new Point(startX + 1, iconCy + 4) };
                    g.FillPolygon(glassB, p1);
                    g.FillPolygon(glassB, p2);
                    Point[] sandP = new Point[] { new Point(startX + 3, iconCy + 4), new Point(startX + 9, iconCy + 4), new Point(startX + 6, iconCy + 1) };
                    g.FillPolygon(sandB, sandP);
                }
            }

            int textX = startX + 18;
            int textY = r.Y + (r.Height - (int)s.Height) / 2 - (isActive ? 1 : 0);

            using (Brush shadowB = new SolidBrush(Color.Black))
            using (Brush textB = new SolidBrush(textColor))
            {
                g.DrawString(text, tabFont, shadowB, textX + 1, textY + 1);
                g.DrawString(text, tabFont, textB, textX, textY);
            }
        }

        private void DrawThematicBadgeIcon(Graphics g, string themeKey, int cx, int cy)
        {
            switch (themeKey)
            {
                case "sun":
                    using (Brush petalB = new SolidBrush(Color.FromArgb(255, 200, 20)))
                    using (Pen petalP = new Pen(Color.FromArgb(200, 130, 0), 1))
                    using (Brush centerB = new SolidBrush(Color.FromArgb(160, 90, 0)))
                    {
                        g.FillEllipse(petalB, cx - 10, cy - 10, 20, 20);
                        g.DrawEllipse(petalP, cx - 10, cy - 10, 20, 20);
                        g.FillEllipse(centerB, cx - 5, cy - 5, 10, 10);
                    }
                    break;

                case "dlc":
                    using (Brush zombieB = new SolidBrush(Color.FromArgb(80, 140, 90)))
                    using (Pen zombieP = new Pen(Color.FromArgb(30, 70, 40), 1))
                    using (Brush eyeB = new SolidBrush(Color.FromArgb(220, 40, 40)))
                    {
                        g.FillRectangle(zombieB, cx - 9, cy - 11, 18, 22);
                        g.DrawRectangle(zombieP, cx - 9, cy - 11, 18, 22);
                        g.FillEllipse(eyeB, cx - 6, cy - 4, 4, 4);
                        g.FillEllipse(eyeB, cx + 2, cy - 4, 4, 4);
                    }
                    break;

                case "trophy":
                    using (Brush cupB = new SolidBrush(Color.FromArgb(240, 210, 50)))
                    using (Pen cupP = new Pen(Color.FromArgb(170, 130, 10), 1))
                    using (Brush stemB = new SolidBrush(Color.FromArgb(180, 140, 20)))
                    {
                        Point[] poly = new Point[] {
                            new Point(cx - 8, cy - 9),
                            new Point(cx + 8, cy - 9),
                            new Point(cx + 5, cy + 2),
                            new Point(cx - 5, cy + 2)
                        };
                        g.FillPolygon(cupB, poly);
                        g.DrawPolygon(cupP, poly);
                        g.FillRectangle(stemB, cx - 2, cy + 2, 4, 5);
                        g.FillRectangle(cupB, cx - 6, cy + 7, 12, 3);
                    }
                    break;

                case "hybrid":
                    using (Brush hybridB = new SolidBrush(Color.FromArgb(60, 160, 180)))
                    using (Pen hybridP = new Pen(Color.FromArgb(30, 100, 120), 1))
                    using (Pen lineP = new Pen(Color.White, 2))
                    {
                        g.FillEllipse(hybridB, cx - 9, cy - 9, 18, 18);
                        g.DrawEllipse(hybridP, cx - 9, cy - 9, 18, 18);
                        g.DrawLine(lineP, cx - 5, cy + 5, cx + 5, cy - 5);
                    }
                    break;

                case "fusion":
                    using (Brush boltB = new SolidBrush(Color.FromArgb(255, 230, 40)))
                    using (Pen boltP = new Pen(Color.FromArgb(180, 140, 0), 1))
                    {
                        Point[] bolt = new Point[] {
                            new Point(cx + 2, cy - 11),
                            new Point(cx - 6, cy),
                            new Point(cx, cy),
                            new Point(cx - 2, cy + 11),
                            new Point(cx + 7, cy - 1),
                            new Point(cx + 1, cy - 1)
                        };
                        g.FillPolygon(boltB, bolt);
                        g.DrawPolygon(boltP, bolt);
                    }
                    break;

                case "rfl":
                    // Crazy Dave's Golden Taco / Temporal Gateway
                    using (Brush tacoB = new SolidBrush(Color.FromArgb(235, 175, 45)))
                    using (Pen tacoP = new Pen(Color.FromArgb(170, 115, 20), 1))
                    using (Brush greenB = new SolidBrush(Color.FromArgb(60, 180, 60)))
                    using (Brush redB = new SolidBrush(Color.FromArgb(220, 50, 40)))
                    {
                        g.FillPie(tacoB, cx - 10, cy - 10, 20, 20, 180, 180);
                        g.DrawArc(tacoP, cx - 10, cy - 10, 20, 20, 180, 180);
                        g.DrawLine(tacoP, cx - 10, cy, cx + 10, cy);
                        g.FillEllipse(greenB, cx - 7, cy - 4, 6, 4);
                        g.FillEllipse(greenB, cx + 1, cy - 4, 6, 4);
                        g.FillRectangle(redB, cx - 2, cy - 3, 4, 3);
                    }
                    break;

                case "altverz":
                    // Hourglass of Time
                    using (Brush glassB = new SolidBrush(Color.FromArgb(70, 160, 210)))
                    using (Brush sandB = new SolidBrush(Color.FromArgb(240, 200, 80)))
                    using (Pen frameP = new Pen(Color.FromArgb(160, 130, 70), 1))
                    using (Brush capB = new SolidBrush(Color.FromArgb(120, 85, 40)))
                    {
                        g.FillRectangle(capB, cx - 8, cy - 10, 16, 3);
                        g.FillRectangle(capB, cx - 8, cy + 7, 16, 3);
                        Point[] topTri = new Point[] { new Point(cx - 6, cy - 7), new Point(cx + 6, cy - 7), new Point(cx, cy) };
                        g.FillPolygon(glassB, topTri);
                        Point[] botTri = new Point[] { new Point(cx, cy), new Point(cx + 6, cy + 7), new Point(cx - 6, cy + 7) };
                        g.FillPolygon(glassB, botTri);
                        Point[] sandTri = new Point[] { new Point(cx - 4, cy + 7), new Point(cx + 4, cy + 7), new Point(cx, cy + 3) };
                        g.FillPolygon(sandB, sandTri);
                        g.DrawLine(frameP, cx - 7, cy - 7, cx - 7, cy + 7);
                        g.DrawLine(frameP, cx + 7, cy - 7, cx + 7, cy + 7);
                    }
                    break;

                case "pvz2pc":
                    // Native PC Monitor with Seedling
                    using (Brush monB = new SolidBrush(Color.FromArgb(45, 55, 72)))
                    using (Brush screenB = new SolidBrush(Color.FromArgb(20, 140, 180)))
                    using (Pen monFrameP = new Pen(Color.FromArgb(90, 110, 135), 1))
                    using (Brush sproutB = new SolidBrush(Color.FromArgb(110, 215, 60)))
                    {
                        g.FillRectangle(monB, cx - 9, cy - 8, 18, 13);
                        g.DrawRectangle(monFrameP, cx - 9, cy - 8, 18, 13);
                        g.FillRectangle(screenB, cx - 7, cy - 6, 14, 9);
                        g.FillEllipse(sproutB, cx - 3, cy - 4, 3, 4);
                        g.FillEllipse(sproutB, cx, cy - 4, 3, 4);
                        g.FillRectangle(monB, cx - 2, cy + 5, 4, 3);
                        g.FillRectangle(monB, cx - 6, cy + 8, 12, 2);
                    }
                    break;

                case "tat":
                    // Cosmic Time Vortex
                    using (Brush outerB = new SolidBrush(Color.FromArgb(140, 70, 190)))
                    using (Brush innerB = new SolidBrush(Color.FromArgb(70, 170, 240)))
                    using (Pen starP = new Pen(Color.FromArgb(255, 240, 160), 1))
                    {
                        g.FillEllipse(outerB, cx - 9, cy - 9, 18, 18);
                        g.FillEllipse(innerB, cx - 5, cy - 5, 10, 10);
                        g.DrawLine(starP, cx - 7, cy, cx + 7, cy);
                        g.DrawLine(starP, cx, cy - 7, cx, cy + 7);
                    }
                    break;
            }
        }

        private void DrawLanguageInfoBar(Graphics g)
        {
            using (SolidBrush sb = new SolidBrush(Color.FromArgb(240, 30, 24, 18)))
            using (Pen borderP = new Pen(Color.FromArgb(90, 70, 45), 2))
            {
                g.FillRectangle(sb, langInfoRect);
                g.DrawRectangle(borderP, langInfoRect);
            }

            // Se houver download ativo, desenha barra de progresso autônoma!
            if (DownloaderManager.IsDownloading)
            {
                string status = DownloaderManager.StatusMessage;
                string details = DownloaderManager.DetailedProgress;
                int pct = DownloaderManager.ProgressPercentage;

                using (Brush b1 = new SolidBrush(Color.FromArgb(255, 230, 110)))
                {
                    g.DrawString(status, statusFont, b1, langInfoRect.X + 8, langInfoRect.Y + 4);
                }

                // Desenha barra de progresso estilizada em pedra
                int barX = langInfoRect.X + 8;
                int barY = langInfoRect.Y + 23;
                int barW = langInfoRect.Width - 16;
                int barH = 14;

                using (SolidBrush barBg = new SolidBrush(Color.FromArgb(20, 15, 10)))
                using (Pen barBorder = new Pen(Color.FromArgb(70, 55, 35), 1))
                {
                    g.FillRectangle(barBg, barX, barY, barW, barH);
                    g.DrawRectangle(barBorder, barX, barY, barW, barH);
                }

                if (pct > 0)
                {
                    int fillW = (int)((barW - 2) * (Math.Min(pct, 100) / 100.0));
                    if (fillW > 0)
                    {
                        using (SolidBrush fillB = new SolidBrush(Color.FromArgb(60, 190, 70)))
                        {
                            g.FillRectangle(fillB, barX + 1, barY + 1, fillW, barH - 2);
                        }
                    }
                }

                using (Brush b2 = new SolidBrush(Color.FromArgb(240, 230, 200)))
                {
                    SizeF s = g.MeasureString(details, detailFont);
                    g.DrawString(details, detailFont, b2, barX + barW - s.Width - 4, barY + 1);
                }
                return;
            }

            // Modo normal: Detalhes do idioma
            List<ModEntry> displayed = GetDisplayedMods();
            ModEntry current = (selectedIndex >= 0 && selectedIndex < displayed.Count) ? displayed[selectedIndex] : null;
            LanguageOption curLang = current != null ? LanguageManager.GetCurrentLanguage(current.Id) : new LanguageOption { Code = "pt-BR", DisplayName = "Português (Brasil)", Description = "Tradução comunitária ativa." };

            string line1 = string.Format("IDIOMA SELECIONADO: {0} [{1}]", curLang.DisplayName, curLang.ShortName);
            string line2 = curLang.Description;

            using (Brush b1 = new SolidBrush(Color.FromArgb(120, 230, 140)))
            using (Brush b2 = new SolidBrush(Color.FromArgb(200, 190, 170)))
            {
                g.DrawString(line1, statusFont, b1, langInfoRect.X + 8, langInfoRect.Y + 6);
                g.DrawString(line2, detailFont, b2, langInfoRect.X + 8, langInfoRect.Y + 23);
            }
        }

        private void Draw9SliceDialog(Graphics g, int x, int y, int w, int h)
        {
            int leftW = 107;
            int rightW = 120;
            int topH = 97;
            int bottomH = 114;

            int midW = w - leftW - rightW;
            int midH = h - topH - bottomH;

            // 1. Center Middle Fill with 2px overlap to eliminate any hairline seams
            g.DrawImage(bmpCenterMiddle, new Rectangle(x + leftW - 2, y + topH - 2, midW + 4, midH + 4));

            // 2. Edges with 1px overlap
            g.DrawImage(bmpTopMiddle, new Rectangle(x + leftW - 1, y, midW + 2, topH));
            g.DrawImage(bmpBottomMiddle, new Rectangle(x + leftW - 1, y + h - bottomH, midW + 2, bottomH));
            g.DrawImage(bmpCenterLeft, new Rectangle(x, y + topH - 1, leftW, midH + 2));
            g.DrawImage(bmpCenterRight, new Rectangle(x + w - rightW, y + topH - 1, rightW, midH + 2));

            // 3. Corners on top
            g.DrawImage(bmpTopLeft, x, y, leftW, topH);
            g.DrawImage(bmpTopRight, x + w - rightW, y, rightW, topH);
            g.DrawImage(bmpBottomLeft, x, y + h - bottomH, leftW, bottomH);
            g.DrawImage(bmpBottomRight, x + w - rightW, y + h - bottomH, rightW, bottomH);
        }

        private void DrawPvZButton(Graphics g, Rectangle r, string text, bool isPrimary)
        {
            int lw = bmpBtnLeft.Width;
            int rw = bmpBtnRight.Width;
            int mw = r.Width - lw - rw;

            bool isPressed = (pressedButton == r);
            bool isHovered = (hoveredButton == r);

            g.DrawImage(bmpBtnLeft, r.X, r.Y, lw, r.Height);
            g.DrawImage(bmpBtnMiddle, new Rectangle(r.X + lw, r.Y, mw, r.Height));
            g.DrawImage(bmpBtnRight, r.X + lw + mw, r.Y, rw, r.Height);

            if (isHovered && !isPressed)
            {
                using (SolidBrush hovGlow = new SolidBrush(Color.FromArgb(40, 255, 255, 200)))
                {
                    g.FillRectangle(hovGlow, r.X + 4, r.Y + 4, r.Width - 8, r.Height - 8);
                }
            }

            int shiftY = isPressed ? 1 : 0;
            SizeF s = g.MeasureString(text, btnFont);
            float tx = r.X + (r.Width - s.Width) / 2f;
            float ty = r.Y + (r.Height - s.Height) / 2f - 2 + shiftY;

            g.DrawString(text, btnFont, Brushes.Black, tx + 1, ty + 1);
            Color col = isPrimary ? Color.FromArgb(255, 240, 130) : (isHovered ? Color.White : Color.FromArgb(230, 220, 190));
            using (Brush b = new SolidBrush(col))
            {
                g.DrawString(text, btnFont, b, tx, ty);
            }
        }

        private void DrawStatusBar(Graphics g)
        {
            using (SolidBrush sb = new SolidBrush(Color.FromArgb(240, 22, 17, 13)))
            using (Pen p = new Pen(Color.FromArgb(80, 60, 40), 2))
            {
                g.FillRectangle(sb, statusBarRect);
                g.DrawRectangle(p, statusBarRect);
            }

            int ledX = statusBarRect.X + 12;
            int ledY = statusBarRect.Y + 12;
            using (Brush ledGlow = new SolidBrush(Color.FromArgb(80, 230, 80)))
            using (Pen ledBorder = new Pen(Color.FromArgb(20, 120, 20), 1))
            using (Brush ledCenter = new SolidBrush(Color.FromArgb(200, 255, 200)))
            {
                g.FillEllipse(ledGlow, ledX, ledY, 10, 10);
                g.DrawEllipse(ledBorder, ledX, ledY, 10, 10);
                g.FillEllipse(ledCenter, ledX + 2, ledY + 2, 4, 4);
            }

            List<ModEntry> displayed = GetDisplayedMods();
            ModEntry current = (selectedIndex >= 0 && selectedIndex < displayed.Count) ? displayed[selectedIndex] : null;

            string statusLine1 = "Conexão Steam Ativa (AppID: 3590) • Rastreamento de Horas Habilitado";
            string statusLine2;

            if (current != null)
            {
                if (current.Category == "pvz2")
                {
                    statusLine2 = current.IsAndroidMod
                        ? "PvZ 2 Runner Integrado • Suporte a Emulador / Android • Horas Steam Contabilizadas 100%"
                        : "PvZ 2 Port Nativo PC • DirectX 60FPS • Conquistas e Horas Steam Ativas";
                }
                else
                {
                    statusLine2 = string.Format("Saves: Sandbox Seguro Isolado • Conquistas Steam: {0}", current.SupportsSteamAchievements ? "Totalmente Suportadas" : "Mod Customizado");
                }
            }
            else
            {
                statusLine2 = "Selecione uma versão para iniciar.";
            }

            using (Brush textB = new SolidBrush(Color.FromArgb(130, 235, 130)))
            using (Brush textB2 = new SolidBrush(Color.FromArgb(195, 185, 165)))
            {
                g.DrawString(statusLine1, statusFont, textB, statusBarRect.X + 28, statusBarRect.Y + 9);
                g.DrawString(statusLine2, detailFont, textB2, statusBarRect.X + 28, statusBarRect.Y + 27);
            }
        }

        protected override void OnMouseDown(MouseEventArgs e)
        {
            base.OnMouseDown(e);

            // Modal overlay intercepts all clicks
            if (currentOverlay != OverlayState.None)
            {
                if (overlayBtnPrimaryRect.Contains(e.Location))
                {
                    pressedButton = overlayBtnPrimaryRect;
                    this.Invalidate();
                }
                else if (overlayBtnSecondaryRect.Contains(e.Location))
                {
                    pressedButton = overlayBtnSecondaryRect;
                    this.Invalidate();
                }
                return;
            }

            if (e.Button == MouseButtons.Left && e.Y < 60)
            {
                isDragging = true;
                dragCursorPoint = Cursor.Position;
                dragFormPoint = this.Location;
                return;
            }

            // Tab clicks
            if (tabPvZ1Rect.Contains(e.Location))
            {
                if (activeTab != "pvz1")
                {
                    activeTab = "pvz1";
                    selectedIndex = 0;
                    hoveredIndex = -1;
                    this.Invalidate();
                }
                return;
            }

            if (tabPvZ2Rect.Contains(e.Location))
            {
                if (activeTab != "pvz2")
                {
                    activeTab = "pvz2";
                    selectedIndex = 0;
                    hoveredIndex = -1;
                    this.Invalidate();
                }
                return;
            }

            if (listRect.Contains(e.Location))
            {
                List<ModEntry> displayed = GetDisplayedMods();
                int itemHeight = listRect.Height / Math.Max(displayed.Count, 1);
                int clickedIdx = (e.Y - listRect.Y) / itemHeight;
                if (clickedIdx >= 0 && clickedIdx < displayed.Count)
                {
                    selectedIndex = clickedIdx;
                    this.Invalidate();
                }
                return;
            }

            if (btnPlayRect.Contains(e.Location)) { pressedButton = btnPlayRect; this.Invalidate(); }
            else if (btnLangRect.Contains(e.Location)) { pressedButton = btnLangRect; this.Invalidate(); }
            else if (btnActionRect.Contains(e.Location)) { pressedButton = btnActionRect; this.Invalidate(); }
            else if (btnSavesRect.Contains(e.Location)) { pressedButton = btnSavesRect; this.Invalidate(); }
            else if (btnCloseRect.Contains(e.Location)) { pressedButton = btnCloseRect; this.Invalidate(); }
        }

        protected override void OnMouseMove(MouseEventArgs e)
        {
            base.OnMouseMove(e);

            if (currentOverlay != OverlayState.None)
            {
                Rectangle oldHov = hoveredButton;
                if (overlayBtnPrimaryRect.Contains(e.Location)) hoveredButton = overlayBtnPrimaryRect;
                else if (overlayBtnSecondaryRect.Contains(e.Location)) hoveredButton = overlayBtnSecondaryRect;
                else hoveredButton = Rectangle.Empty;

                if (hoveredButton != Rectangle.Empty) this.Cursor = Cursors.Hand;
                else this.Cursor = Cursors.Default;

                if (oldHov != hoveredButton) this.Invalidate();
                return;
            }

            if (isDragging)
            {
                Point diff = Point.Subtract(Cursor.Position, new Size(dragCursorPoint));
                this.Location = Point.Add(dragFormPoint, new Size(diff));
                return;
            }

            bool oldHov1 = isHoveringTab1;
            bool oldHov2 = isHoveringTab2;
            isHoveringTab1 = tabPvZ1Rect.Contains(e.Location);
            isHoveringTab2 = tabPvZ2Rect.Contains(e.Location);

            int oldHover = hoveredIndex;
            List<ModEntry> displayed = GetDisplayedMods();
            if (listRect.Contains(e.Location))
            {
                int itemHeight = listRect.Height / Math.Max(displayed.Count, 1);
                hoveredIndex = (e.Y - listRect.Y) / itemHeight;
                this.Cursor = Cursors.Hand;
            }
            else
            {
                hoveredIndex = -1;
            }

            Rectangle oldBtnHover = hoveredButton;
            if (btnPlayRect.Contains(e.Location)) hoveredButton = btnPlayRect;
            else if (btnLangRect.Contains(e.Location)) hoveredButton = btnLangRect;
            else if (btnActionRect.Contains(e.Location)) hoveredButton = btnActionRect;
            else if (btnSavesRect.Contains(e.Location)) hoveredButton = btnSavesRect;
            else if (btnCloseRect.Contains(e.Location)) hoveredButton = btnCloseRect;
            else hoveredButton = Rectangle.Empty;

            if (hoveredButton != Rectangle.Empty || isHoveringTab1 || isHoveringTab2) this.Cursor = Cursors.Hand;
            else if (hoveredIndex == -1) this.Cursor = Cursors.Default;

            if (oldHover != hoveredIndex || oldBtnHover != hoveredButton || oldHov1 != isHoveringTab1 || oldHov2 != isHoveringTab2)
            {
                this.Invalidate();
            }
        }

        protected override void OnMouseUp(MouseEventArgs e)
        {
            base.OnMouseUp(e);
            isDragging = false;
            Rectangle wasPressed = pressedButton;
            pressedButton = Rectangle.Empty;

            // Handle Overlay Modal button clicks
            if (currentOverlay != OverlayState.None)
            {
                if (wasPressed == overlayBtnPrimaryRect && overlayBtnPrimaryRect.Contains(e.Location))
                {
                    HandleOverlayPrimaryClick();
                }
                else if (wasPressed == overlayBtnSecondaryRect && overlayBtnSecondaryRect.Contains(e.Location))
                {
                    HandleOverlaySecondaryClick();
                }

                this.Invalidate();
                return;
            }

            if (wasPressed == btnPlayRect && btnPlayRect.Contains(e.Location))
            {
                LaunchOrInstallSelectedMod();
            }
            else if (wasPressed == btnLangRect && btnLangRect.Contains(e.Location))
            {
                CycleLanguage();
            }
            else if (wasPressed == btnActionRect && btnActionRect.Contains(e.Location))
            {
                ActionSelectedMod();
            }
            else if (wasPressed == btnSavesRect && btnSavesRect.Contains(e.Location))
            {
                List<ModEntry> displayed = GetDisplayedMods();
                ModEntry current = (selectedIndex >= 0 && selectedIndex < displayed.Count) ? displayed[selectedIndex] : null;
                SaveManager.OpenSavesFolder(current != null ? current.Id : null);
            }
            else if (wasPressed == btnCloseRect && btnCloseRect.Contains(e.Location))
            {
                this.Close();
            }

            this.Invalidate();
        }

        private void HandleOverlayPrimaryClick()
        {
            if (currentOverlay == OverlayState.Downloading)
            {
                // [ SEGUNDO PLANO ]: Minimiza modal para continuar navegando no launcher
                currentOverlay = OverlayState.None;
                this.Invalidate();
            }
            else if (currentOverlay == OverlayState.Completed)
            {
                // [ JOGAR AGORA ]: Inicia o mod recém-instalado imediatamente!
                currentOverlay = OverlayState.None;
                ModEntry toLaunch = completedMod ?? activeMod;
                if (toLaunch != null)
                {
                    LaunchMod(toLaunch);
                }
            }
            else if (currentOverlay == OverlayState.Failed)
            {
                // [ TENTAR NOVAMENTE ]
                if (activeMod != null)
                {
                    StartDownloadForMod(activeMod);
                }
                else
                {
                    currentOverlay = OverlayState.None;
                }
            }
        }

        private void HandleOverlaySecondaryClick()
        {
            if (currentOverlay == OverlayState.Downloading)
            {
                // [ CANCELAR ]
                DownloaderManager.CancelDownload();
                currentOverlay = OverlayState.None;
                this.Invalidate();
            }
            else if (currentOverlay == OverlayState.Completed)
            {
                // [ CONCLUÍDO / OK ]
                currentOverlay = OverlayState.None;
                this.Invalidate();
            }
            else if (currentOverlay == OverlayState.Failed)
            {
                // [ FECHAR ]
                currentOverlay = OverlayState.None;
                this.Invalidate();
            }
        }

        private void StartDownloadForMod(ModEntry mod)
        {
            if (mod == null) return;
            if (DownloaderManager.IsDownloading)
            {
                if (DownloaderManager.CurrentModId == mod.Id)
                {
                    currentOverlay = OverlayState.Downloading;
                    this.Invalidate();
                }
                else
                {
                    MessageBox.Show("Já existe um download em andamento. Aguarde a conclusão.", "Aviso", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
                return;
            }

            activeMod = mod;
            currentOverlay = OverlayState.Downloading;
            DownloaderManager.DownloadAndInstallMod(mod);
            this.Invalidate();
        }

        private void CycleLanguage()
        {
            List<ModEntry> displayed = GetDisplayedMods();
            if (selectedIndex < 0 || selectedIndex >= displayed.Count) return;
            ModEntry mod = displayed[selectedIndex];

            LanguageOption next = LanguageManager.CycleNextLanguage(mod.Id);
            this.Invalidate();
        }

        private void LaunchOrInstallSelectedMod()
        {
            List<ModEntry> displayed = GetDisplayedMods();
            if (selectedIndex < 0 || selectedIndex >= displayed.Count) return;
            ModEntry mod = displayed[selectedIndex];

            if (!mod.IsInstalled)
            {
                StartDownloadForMod(mod);
                return;
            }

            LaunchMod(mod);
        }

        private void LaunchMod(ModEntry mod)
        {
            if (mod == null) return;

            try
            {
                LanguageManager.ApplyLanguageForMod(mod);
                LanguageOption lang = LanguageManager.GetCurrentLanguage(mod.Id);

                SaveManager.PrepareSavesForMod(mod.Id);

                // Garante steam_appid.txt na pasta de execução do mod e na raiz
                string exeDir = Path.GetDirectoryName(mod.ExecutablePath);
                if (!string.IsNullOrEmpty(exeDir) && Directory.Exists(exeDir))
                {
                    try { File.WriteAllText(Path.Combine(exeDir, "steam_appid.txt"), "3590\n"); } catch { }
                }
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                try { File.WriteAllText(Path.Combine(baseDir, "steam_appid.txt"), "3590\n"); } catch { }

                this.Hide();
                trayIcon.Visible = true;
                string balloonMsg = string.Format("Rodando {0} [{1}].\nHoras da Steam contabilizando ativamente!", mod.Title, lang.DisplayName);
                trayIcon.ShowBalloonTip(3500, "Plants vs. Zombies", balloonMsg, ToolTipIcon.Info);

                Process gameProc = null;
                if (mod.Category == "pvz2")
                {
                    gameProc = PvZ2RunnerManager.LaunchPvZ2Mod(mod);
                    if (gameProc == null)
                    {
                        this.Show();
                        trayIcon.Visible = false;
                        return;
                    }
                }
                else
                {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = mod.ExecutablePath;
                    psi.WorkingDirectory = exeDir;
                    psi.UseShellExecute = false;
                    psi.EnvironmentVariables["SteamAppId"] = "3590";
                    psi.EnvironmentVariables["SteamGameId"] = "3590";
                    gameProc = Process.Start(psi);
                }

                // Monitoramento Contínuo Multi-Processo de Horas Steam
                int launcherPid = Process.GetCurrentProcess().Id;
                System.Threading.ThreadPool.QueueUserWorkItem((state) =>
                {
                    // Aguarda inicialização do processo
                    System.Threading.Thread.Sleep(2500);

                    string[] candidateNames = new string[] {
                        "PlantsVsZombies",
                        "PlantsVsZombies_ORIGINAL_BACKUP",
                        "PlantsVsZombies_vanilla",
                        "PlantsVsZombies_DLC",
                        "pvz_widescreen",
                        "PlantsVsZombies_Hybrid",
                        "pvzHE-Launcher",
                        "PlantsVsZombies_Fusion",
                        "PvZ2",
                        "PlantsVsZombies2",
                        "PlantsVsZombies2_TAT",
                        "popcapgame1",
                        "dnplayer",
                        "HD-Player",
                        "BlueStacks"
                    };

                    while (true)
                    {
                        bool isAnyAlive = false;

                        if (gameProc != null)
                        {
                            try
                            {
                                if (!gameProc.HasExited) isAnyAlive = true;
                            }
                            catch { }
                        }

                        if (!isAnyAlive)
                        {
                            try
                            {
                                Process[] procs = Process.GetProcesses();
                                foreach (Process p in procs)
                                {
                                    if (p.Id == launcherPid) continue;
                                    string pName = p.ProcessName;
                                    foreach (string cand in candidateNames)
                                    {
                                        if (pName.IndexOf(cand, StringComparison.OrdinalIgnoreCase) >= 0)
                                        {
                                            isAnyAlive = true;
                                            break;
                                        }
                                    }
                                    if (isAnyAlive) break;
                                }
                            }
                            catch { }
                        }

                        if (!isAnyAlive)
                        {
                            break;
                        }

                        System.Threading.Thread.Sleep(1500);
                    }

                    // Sincroniza saves de forma segura após encerramento
                    SaveManager.SyncSavesAfterModExit(mod.Id);

                    // Restaura launcher para primeiro plano
                    try
                    {
                        this.Invoke(new Action(() =>
                        {
                            trayIcon.Visible = false;
                            this.Show();
                            this.WindowState = FormWindowState.Normal;
                            this.BringToFront();
                            this.Invalidate();
                        }));
                    }
                    catch { }
                });
            }
            catch (Exception ex)
            {
                this.Show();
                trayIcon.Visible = false;
                MessageBox.Show("Erro ao iniciar o mod: " + ex.Message, "Erro", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void ActionSelectedMod()
        {
            List<ModEntry> displayed = GetDisplayedMods();
            if (selectedIndex < 0 || selectedIndex >= displayed.Count) return;
            ModEntry mod = displayed[selectedIndex];

            if (mod.IsInstalled)
            {
                try
                {
                    string folder = !string.IsNullOrEmpty(mod.ExecutablePath) ? Path.GetDirectoryName(mod.ExecutablePath) : null;
                    if (!string.IsNullOrEmpty(folder) && Directory.Exists(folder))
                    {
                        Process.Start("explorer.exe", folder);
                    }
                    else
                    {
                        string modFolder = Path.Combine(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "LauncherData"), Path.Combine("Mods", mod.Id));
                        if (Directory.Exists(modFolder)) Process.Start("explorer.exe", modFolder);
                    }
                }
                catch { }
            }
            else
            {
                StartDownloadForMod(mod);
            }
        }
    }
}
