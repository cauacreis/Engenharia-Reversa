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
        private List<ModEntry> mods;
        private int selectedIndex = 0;
        private int hoveredIndex = -1;

        // Assets
        private Bitmap bmpTopLeft, bmpTopMiddle, bmpTopRight;
        private Bitmap bmpCenterLeft, bmpCenterMiddle, bmpCenterRight;
        private Bitmap bmpBottomLeft, bmpBottomMiddle, bmpBottomRight;
        private Bitmap bmpHeader;
        private Bitmap bmpBtnLeft, bmpBtnMiddle, bmpBtnRight;

        // UI Rectangles
        private Rectangle listRect;
        private Rectangle langInfoRect;
        private Rectangle btnPlayRect;
        private Rectangle btnLangRect;
        private Rectangle btnActionRect;
        private Rectangle btnSavesRect;
        private Rectangle btnCloseRect;
        private Rectangle statusBarRect;

        // Button hover & press states
        private Rectangle pressedButton = Rectangle.Empty;
        private Rectangle hoveredButton = Rectangle.Empty;

        // Fonts
        private Font titleFont;
        private Font itemFont;
        private Font descFont;
        private Font badgeFont;
        private Font btnFont;
        private Font statusFont;
        private Font detailFont;

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
                    if (this.InvokeRequired)
                    {
                        this.BeginInvoke(new Action(delegate
                        {
                            LoadMods();
                            this.Invalidate();
                            if (success)
                            {
                                MessageBox.Show(this, "Mod baixado e instalado com sucesso! Clique em JOGAR para iniciar.", "Instalação Concluída", MessageBoxButtons.OK, MessageBoxIcon.Information);
                            }
                            else
                            {
                                MessageBox.Show(this, "Erro durante a instalação autônoma: " + error, "Falha no Download", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                            }
                        }));
                    }
                    else
                    {
                        LoadMods();
                        this.Invalidate();
                    }
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
            if (selectedIndex >= mods.Count) selectedIndex = 0;
        }

        private void InitFonts()
        {
            try { titleFont = new Font("Arial", 18, FontStyle.Bold); } catch { titleFont = SystemFonts.DefaultFont; }
            try { itemFont = new Font("Arial", 11, FontStyle.Bold); } catch { itemFont = SystemFonts.DefaultFont; }
            try { descFont = new Font("Arial", 9, FontStyle.Regular); } catch { descFont = SystemFonts.DefaultFont; }
            try { badgeFont = new Font("Arial", 8, FontStyle.Bold); } catch { badgeFont = SystemFonts.DefaultFont; }
            try { btnFont = new Font("Arial", 11, FontStyle.Bold); } catch { btnFont = SystemFonts.DefaultFont; }
            try { statusFont = new Font("Arial", 9, FontStyle.Bold); } catch { statusFont = SystemFonts.DefaultFont; }
            try { detailFont = new Font("Arial", 8, FontStyle.Regular); } catch { detailFont = SystemFonts.DefaultFont; }
        }

        private void SetupLayout()
        {
            listRect = new Rectangle(45, 95, 485, 292);
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
            float ty = 28f;
            g.DrawString(titleText, titleFont, Brushes.Black, tx + 2, ty + 2);
            using (Brush goldBrush = new SolidBrush(Color.FromArgb(255, 235, 140)))
            {
                g.DrawString(titleText, titleFont, goldBrush, tx, ty);
            }

            // 3. Draw Inset Mod List Box (Stone sunken look)
            using (SolidBrush bgBrush = new SolidBrush(Color.FromArgb(240, 25, 20, 16)))
            using (Pen borderPen = new Pen(Color.FromArgb(95, 75, 50), 2))
            using (Pen innerPen = new Pen(Color.FromArgb(15, 10, 8), 1))
            {
                g.FillRectangle(bgBrush, listRect);
                g.DrawRectangle(borderPen, listRect);
                g.DrawRectangle(innerPen, listRect.X + 2, listRect.Y + 2, listRect.Width - 4, listRect.Height - 4);
            }

            // Draw Mod items
            int itemHeight = listRect.Height / Math.Max(mods.Count, 1);
            for (int i = 0; i < mods.Count; i++)
            {
                ModEntry mod = mods[i];
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

                // Draw Custom Vector Thematic Badge Icon
                DrawThematicBadgeIcon(g, mod.ThemeKey, rowRect.X + 18, rowRect.Y + rowRect.Height / 2);

                // Right Badges (Calculated from right edge to avoid collision)
                // 1. Status Badge (INSTALADO / BAIXAR / BAIXANDO...)
                bool isThisDownloading = (DownloaderManager.IsDownloading && DownloaderManager.CurrentModId == mod.Id);
                string statusText = isThisDownloading ? (DownloaderManager.ProgressPercentage + "%") : (mod.IsInstalled ? "INSTALADO" : "BAIXAR");
                Color badgeBg = isThisDownloading ? Color.FromArgb(40, 140, 210) : (mod.IsInstalled ? Color.FromArgb(60, 145, 60) : Color.FromArgb(190, 120, 30));
                
                int bw = 72;
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

            // 4. Draw Language & Info Bar under list (Shows live progress bar during downloads!)
            DrawLanguageInfoBar(g);

            // 5. Draw Authentic Action Buttons
            ModEntry current = (selectedIndex >= 0 && selectedIndex < mods.Count) ? mods[selectedIndex] : null;
            
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

            // 6. Bottom Status Bar & Steam Tracking Banner
            DrawStatusBar(g);
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
            ModEntry current = (selectedIndex >= 0 && selectedIndex < mods.Count) ? mods[selectedIndex] : null;
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

            ModEntry current = (selectedIndex >= 0 && selectedIndex < mods.Count) ? mods[selectedIndex] : null;
            string statusLine1 = "Conexão Steam Ativa (AppID: 3590) • Rastreamento de Horas Habilitado";
            string statusLine2 = current != null
                ? string.Format("Saves: Sandbox Seguro Isolado • Conquistas Steam: {0}", current.SupportsSteamAchievements ? "Totalmente Suportadas" : "Mod Customizado")
                : "Selecione uma versão para iniciar.";

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

            if (e.Button == MouseButtons.Left && e.Y < 80)
            {
                isDragging = true;
                dragCursorPoint = Cursor.Position;
                dragFormPoint = this.Location;
                return;
            }

            if (listRect.Contains(e.Location))
            {
                int itemHeight = listRect.Height / Math.Max(mods.Count, 1);
                int clickedIdx = (e.Y - listRect.Y) / itemHeight;
                if (clickedIdx >= 0 && clickedIdx < mods.Count)
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
            if (isDragging)
            {
                Point diff = Point.Subtract(Cursor.Position, new Size(dragCursorPoint));
                this.Location = Point.Add(dragFormPoint, new Size(diff));
                return;
            }

            int oldHover = hoveredIndex;
            if (listRect.Contains(e.Location))
            {
                int itemHeight = listRect.Height / Math.Max(mods.Count, 1);
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

            if (hoveredButton != Rectangle.Empty) this.Cursor = Cursors.Hand;
            else if (hoveredIndex == -1) this.Cursor = Cursors.Default;

            if (oldHover != hoveredIndex || oldBtnHover != hoveredButton)
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
                ModEntry current = (selectedIndex >= 0 && selectedIndex < mods.Count) ? mods[selectedIndex] : null;
                SaveManager.OpenSavesFolder(current != null ? current.Id : null);
            }
            else if (wasPressed == btnCloseRect && btnCloseRect.Contains(e.Location))
            {
                this.Close();
            }

            this.Invalidate();
        }

        private void CycleLanguage()
        {
            if (selectedIndex < 0 || selectedIndex >= mods.Count) return;
            ModEntry mod = mods[selectedIndex];

            LanguageOption next = LanguageManager.CycleNextLanguage(mod.Id);
            this.Invalidate();
        }

        private void LaunchOrInstallSelectedMod()
        {
            if (selectedIndex < 0 || selectedIndex >= mods.Count) return;
            ModEntry mod = mods[selectedIndex];

            // 1. Se NÃO estiver instalado, baixa e instala de forma 100% autônoma!
            if (!mod.IsInstalled)
            {
                if (DownloaderManager.IsDownloading) return;
                DownloaderManager.DownloadAndInstallMod(mod);
                this.Invalidate();
                return;
            }

            // 2. Se já estiver instalado, executa o jogo
            try
            {
                LanguageManager.ApplyLanguageForMod(mod);
                LanguageOption lang = LanguageManager.GetCurrentLanguage(mod.Id);

                SaveManager.PrepareSavesForMod(mod.Id);

                this.Hide();
                trayIcon.Visible = true;
                string balloonMsg = string.Format("Rodando {0} [{1}].\nHoras da Steam contabilizando!", mod.Title, lang.DisplayName);
                trayIcon.ShowBalloonTip(3000, "Plants vs. Zombies", balloonMsg, ToolTipIcon.Info);

                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = mod.ExecutablePath;
                psi.WorkingDirectory = Path.GetDirectoryName(mod.ExecutablePath);
                Process gameProc = Process.Start(psi);

                if (gameProc != null)
                {
                    gameProc.WaitForExit();
                }

                SaveManager.SyncSavesAfterModExit(mod.Id);

                trayIcon.Visible = false;
                Application.Exit();
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
            if (selectedIndex < 0 || selectedIndex >= mods.Count) return;
            ModEntry mod = mods[selectedIndex];

            if (mod.IsInstalled)
            {
                // Se instalado, abre pasta no Windows Explorer
                try
                {
                    string folder = Path.GetDirectoryName(mod.ExecutablePath);
                    if (Directory.Exists(folder)) Process.Start("explorer.exe", folder);
                }
                catch { }
            }
            else
            {
                // Se não instalado, baixa autonomamente também!
                if (!DownloaderManager.IsDownloading)
                {
                    DownloaderManager.DownloadAndInstallMod(mod);
                    this.Invalidate();
                }
            }
        }
    }
}
