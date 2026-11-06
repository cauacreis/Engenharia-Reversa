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

        // Assets
        private Bitmap bmpTopLeft, bmpTopMiddle, bmpTopRight;
        private Bitmap bmpCenterLeft, bmpCenterMiddle, bmpCenterRight;
        private Bitmap bmpBottomLeft, bmpBottomMiddle, bmpBottomRight;
        private Bitmap bmpHeader;
        private Bitmap bmpBtnLeft, bmpBtnMiddle, bmpBtnRight;

        // UI Rectangles
        private Rectangle listRect;
        private Rectangle btnPlayRect;
        private Rectangle btnActionRect;
        private Rectangle btnSavesRect;
        private Rectangle btnCloseRect;

        // Fonts
        private Font titleFont;
        private Font itemFont;
        private Font descFont;
        private Font btnFont;
        private Font statusFont;

        // Window drag state
        private bool isDragging = false;
        private Point dragCursorPoint;
        private Point dragFormPoint;

        private NotifyIcon trayIcon;

        public PvZLauncherForm()
        {
            this.Text = "Plants vs. Zombies - Mod Launcher";
            this.FormBorderStyle = FormBorderStyle.None;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.Size = new Size(720, 530);
            this.DoubleBuffered = true;
            this.SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.UserPaint | ControlStyles.OptimizedDoubleBuffer, true);

            LoadAssets();
            LoadMods();
            InitFonts();
            SetupLayout();
            SetupTrayIcon();
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
            // Default select DLC Edition if installed, otherwise Vanilla
            selectedIndex = 0;
            for (int i = 0; i < mods.Count; i++)
            {
                if (mods[i].Id == "dlc_edition" && mods[i].IsInstalled)
                {
                    selectedIndex = i;
                    break;
                }
            }
        }

        private void InitFonts()
        {
            try { titleFont = new Font("Arial", 16, FontStyle.Bold); } catch { titleFont = SystemFonts.DefaultFont; }
            try { itemFont = new Font("Arial", 12, FontStyle.Bold); } catch { itemFont = SystemFonts.DefaultFont; }
            try { descFont = new Font("Arial", 9, FontStyle.Regular); } catch { descFont = SystemFonts.DefaultFont; }
            try { btnFont = new Font("Arial", 11, FontStyle.Bold); } catch { btnFont = SystemFonts.DefaultFont; }
            try { statusFont = new Font("Arial", 9, FontStyle.Bold); } catch { statusFont = SystemFonts.DefaultFont; }
        }

        private void SetupLayout()
        {
            listRect = new Rectangle(50, 115, 450, 310);
            int btnX = 520;
            int btnW = 150;
            int btnH = bmpBtnLeft.Height > 0 ? bmpBtnLeft.Height : 46;

            btnPlayRect = new Rectangle(btnX, 130, btnW, btnH);
            btnActionRect = new Rectangle(btnX, 195, btnW, btnH);
            btnSavesRect = new Rectangle(btnX, 260, btnW, btnH);
            btnCloseRect = new Rectangle(btnX, 325, btnW, btnH);
        }

        private void SetupTrayIcon()
        {
            trayIcon = new NotifyIcon();
            trayIcon.Text = "Plants vs. Zombies - Mod Manager";
            try
            {
                trayIcon.Icon = SystemIcons.Application;
            }
            catch { }
            trayIcon.Visible = false;
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            Graphics g = e.Graphics;
            g.SmoothingMode = SmoothingMode.HighQuality;
            g.InterpolationMode = InterpolationMode.Bilinear;

            // 1. Draw 9-slice stone dialog border
            Draw9SliceDialog(g, 0, 0, this.Width, this.Height);

            // 2. Draw Header Banner
            int hw = bmpHeader.Width;
            int hx = (this.Width - hw) / 2;
            g.DrawImage(bmpHeader, hx, -5);

            // Header Text
            string titleText = "QUAL VERSAO VAI JOGAR?";
            SizeF titleSize = g.MeasureString(titleText, titleFont);
            float tx = (this.Width - titleSize.Width) / 2f;
            float ty = 28f;
            g.DrawString(titleText, titleFont, Brushes.Black, tx + 1, ty + 1);
            using (Brush goldBrush = new SolidBrush(Color.FromArgb(250, 230, 140)))
            {
                g.DrawString(titleText, titleFont, goldBrush, tx, ty);
            }

            // 3. Draw Inset Mod List Box (Stone sunken look)
            using (SolidBrush bgBrush = new SolidBrush(Color.FromArgb(240, 35, 25, 18)))
            using (Pen borderPen = new Pen(Color.FromArgb(90, 70, 45), 3))
            using (Pen innerPen = new Pen(Color.FromArgb(20, 15, 10), 1))
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
                if (isSelected)
                {
                    using (SolidBrush selBg = new SolidBrush(Color.FromArgb(210, 85, 65, 40)))
                    using (Pen selPen = new Pen(Color.FromArgb(240, 210, 100), 2))
                    {
                        g.FillRectangle(selBg, rowRect);
                        g.DrawRectangle(selPen, rowRect);
                    }
                }

                // Title
                Brush textBrush = isSelected ? Brushes.White : new SolidBrush(Color.FromArgb(215, 200, 175));
                g.DrawString(mod.Title, itemFont, Brushes.Black, rowRect.X + 8, rowRect.Y + 6);
                g.DrawString(mod.Title, itemFont, textBrush, rowRect.X + 7, rowRect.Y + 5);

                // Status Badge (Instalado / Disponível)
                string statusText = mod.IsInstalled ? "INSTALADO" : "BAIXAR";
                Color badgeColor = mod.IsInstalled ? Color.FromArgb(70, 160, 70) : Color.FromArgb(210, 140, 40);
                using (SolidBrush bBrush = new SolidBrush(badgeColor))
                using (Font badgeFont = new Font("Arial", 8, FontStyle.Bold))
                {
                    SizeF bSize = g.MeasureString(statusText, badgeFont);
                    Rectangle bRect = new Rectangle(rowRect.Right - (int)bSize.Width - 14, rowRect.Y + 7, (int)bSize.Width + 8, (int)bSize.Height + 2);
                    g.FillRectangle(bBrush, bRect);
                    g.DrawString(statusText, badgeFont, Brushes.White, bRect.X + 4, bRect.Y + 1);
                }

                // Description snippet
                string shortDesc = mod.Description;
                if (shortDesc.Length > 52) shortDesc = shortDesc.Substring(0, 50) + "...";
                Brush subBrush = isSelected ? new SolidBrush(Color.FromArgb(235, 225, 180)) : new SolidBrush(Color.FromArgb(160, 145, 125));
                g.DrawString(shortDesc, descFont, subBrush, rowRect.X + 8, rowRect.Y + 28);
            }

            // 4. Draw Authentic Buttons
            ModEntry current = (selectedIndex >= 0 && selectedIndex < mods.Count) ? mods[selectedIndex] : null;
            string playBtnText = (current != null && current.IsInstalled) ? "JOGAR" : "INSTALAR";
            string actionBtnText = (current != null && current.IsInstalled) ? "EXPLORAR" : "BAIXAR";

            DrawPvZButton(g, btnPlayRect, playBtnText, true);
            DrawPvZButton(g, btnActionRect, actionBtnText, false);
            DrawPvZButton(g, btnSavesRect, "SAVES", false);
            DrawPvZButton(g, btnCloseRect, "FECHAR", false);

            // 5. Bottom Status Bar & Steam Tracking Banner
            DrawStatusBar(g);
        }

        private void Draw9SliceDialog(Graphics g, int x, int y, int w, int h)
        {
            int tlw = bmpTopLeft.Width, tlh = bmpTopLeft.Height;
            int trw = bmpTopRight.Width, trh = bmpTopRight.Height;
            int blw = bmpBottomLeft.Width, blh = bmpBottomLeft.Height;
            int brw = bmpBottomRight.Width, brh = bmpBottomRight.Height;

            // Corners
            g.DrawImage(bmpTopLeft, x, y, tlw, tlh);
            g.DrawImage(bmpTopRight, x + w - trw, y, trw, trh);
            g.DrawImage(bmpBottomLeft, x, y + h - blh, blw, blh);
            g.DrawImage(bmpBottomRight, x + w - brw, y + h - brh, brw, brh);

            // Edges
            g.DrawImage(bmpTopMiddle, new Rectangle(x + tlw, y, w - tlw - trw, bmpTopMiddle.Height));
            g.DrawImage(bmpBottomMiddle, new Rectangle(x + blw, y + h - blh, w - blw - brw, bmpBottomMiddle.Height));
            g.DrawImage(bmpCenterLeft, new Rectangle(x, y + tlh, bmpCenterLeft.Width, h - tlh - blh));
            g.DrawImage(bmpCenterRight, new Rectangle(x + w - trw, y + trh, bmpCenterRight.Width, h - trh - brh));

            // Center Middle fill
            g.DrawImage(bmpCenterMiddle, new Rectangle(x + tlw, y + tlh, w - tlw - trw, h - tlh - blh));
        }

        private void DrawPvZButton(Graphics g, Rectangle r, string text, bool isPrimary)
        {
            int lw = bmpBtnLeft.Width;
            int rw = bmpBtnRight.Width;
            int mw = r.Width - lw - rw;

            g.DrawImage(bmpBtnLeft, r.X, r.Y, lw, r.Height);
            g.DrawImage(bmpBtnMiddle, new Rectangle(r.X + lw, r.Y, mw, r.Height));
            g.DrawImage(bmpBtnRight, r.X + lw + mw, r.Y, rw, r.Height);

            SizeF s = g.MeasureString(text, btnFont);
            float tx = r.X + (r.Width - s.Width) / 2f;
            float ty = r.Y + (r.Height - s.Height) / 2f - 2;

            g.DrawString(text, btnFont, Brushes.Black, tx + 1, ty + 1);
            Color col = isPrimary ? Color.FromArgb(255, 235, 120) : Color.FromArgb(220, 210, 180);
            using (Brush b = new SolidBrush(col))
            {
                g.DrawString(text, btnFont, b, tx, ty);
            }
        }

        private void DrawStatusBar(Graphics g)
        {
            Rectangle barRect = new Rectangle(50, 440, this.Width - 100, 45);
            using (SolidBrush sb = new SolidBrush(Color.FromArgb(180, 25, 20, 15)))
            using (Pen p = new Pen(Color.FromArgb(80, 60, 40), 1))
            {
                g.FillRectangle(sb, barRect);
                g.DrawRectangle(p, barRect);
            }

            ModEntry current = (selectedIndex >= 0 && selectedIndex < mods.Count) ? mods[selectedIndex] : null;
            string statusLine1 = "🟢 Conexao Steam: Rastreamento de Horas Ativo (AppID: 3590)";
            string statusLine2 = current != null
                ? string.Format("Saves: Sandbox Seguro Isolado | Conquistas Steam: {0}", current.SupportsSteamAchievements ? "Sim (100% Suportado)" : "Emuladas")
                : "Selecione uma versao para iniciar.";

            using (Brush textB = new SolidBrush(Color.FromArgb(140, 230, 140)))
            {
                g.DrawString(statusLine1, statusFont, textB, barRect.X + 10, barRect.Y + 6);
            }
            using (Brush textB2 = new SolidBrush(Color.FromArgb(200, 190, 170)))
            {
                g.DrawString(statusLine2, descFont, textB2, barRect.X + 10, barRect.Y + 24);
            }
        }

        protected override void OnMouseDown(MouseEventArgs e)
        {
            base.OnMouseDown(e);

            // Drag window on header area
            if (e.Button == MouseButtons.Left && e.Y < 80)
            {
                isDragging = true;
                dragCursorPoint = Cursor.Position;
                dragFormPoint = this.Location;
                return;
            }

            // Click list items
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

            // Click buttons
            if (btnPlayRect.Contains(e.Location))
            {
                LaunchSelectedMod();
            }
            else if (btnActionRect.Contains(e.Location))
            {
                ActionSelectedMod();
            }
            else if (btnSavesRect.Contains(e.Location))
            {
                ModEntry current = (selectedIndex >= 0 && selectedIndex < mods.Count) ? mods[selectedIndex] : null;
                SaveManager.OpenSavesFolder(current != null ? current.Id : null);
            }
            else if (btnCloseRect.Contains(e.Location))
            {
                this.Close();
            }
        }

        protected override void OnMouseMove(MouseEventArgs e)
        {
            base.OnMouseMove(e);
            if (isDragging)
            {
                Point diff = Point.Subtract(Cursor.Position, new Size(dragCursorPoint));
                this.Location = Point.Add(dragFormPoint, new Size(diff));
            }
        }

        protected override void OnMouseUp(MouseEventArgs e)
        {
            base.OnMouseUp(e);
            isDragging = false;
        }

        private void LaunchSelectedMod()
        {
            if (selectedIndex < 0 || selectedIndex >= mods.Count) return;
            ModEntry mod = mods[selectedIndex];

            if (!mod.IsInstalled)
            {
                ActionSelectedMod();
                return;
            }

            try
            {
                // 1. Prepara e isola os saves
                SaveManager.PrepareSavesForMod(mod.Id);

                // 2. Esconde o launcher e ativa o tray icon
                this.Hide();
                trayIcon.Visible = true;
                trayIcon.ShowBalloonTip(3000, "Plants vs. Zombies", "Rodando " + mod.Title + ".\nHoras da Steam contabilizando!", ToolTipIcon.Info);

                // 3. Inicia o processo do mod
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = mod.ExecutablePath;
                psi.WorkingDirectory = Path.GetDirectoryName(mod.ExecutablePath);
                Process gameProc = Process.Start(psi);

                if (gameProc != null)
                {
                    // Fica aguardando o processo do jogo encerrar para manter as horas contando na Steam!
                    gameProc.WaitForExit();
                }

                // 4. Jogo fechou: sincroniza os saves de volta
                SaveManager.SyncSavesAfterModExit(mod.Id);

                // 5. Encerra o launcher para que a Steam encerre a sessão de jogo
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
                // Abre a pasta do executável
                try
                {
                    string folder = Path.GetDirectoryName(mod.ExecutablePath);
                    if (Directory.Exists(folder)) Process.Start("explorer.exe", folder);
                }
                catch { }
            }
            else
            {
                // Abre a página oficial de download/repositório
                if (!string.IsNullOrEmpty(mod.DownloadUrl))
                {
                    try
                    {
                        Process.Start(mod.DownloadUrl);
                    }
                    catch { }
                }
            }
        }
    }
}
