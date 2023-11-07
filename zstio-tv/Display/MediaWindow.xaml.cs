using System;
using System.Windows;
using System.Drawing;
using System.Windows.Media.Imaging;
using System.IO;
using System.Windows.Media;
using System.Runtime.InteropServices;
using System.Windows.Interop;

namespace zstio_tv
{
    public partial class MediaWindow : Window
    {
        public MediaWindow()
        {
            InitializeComponent();
        }

        private const int GWL_STYLE = -16;
        private const int WS_SYSMENU = 0x80000;
        [DllImport("user32.dll", SetLastError = true)]
        private static extern int GetWindowLong(IntPtr hWnd, int nIndex);
        [DllImport("user32.dll")]
        private static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

        private void Rectangle_Drop(object sender, DragEventArgs e)
        {
            try
            {
                var DropData = e.Data.GetData(DataFormats.FileDrop);
                if (DropData != null)
                {
                    var DropDataFilenames = DropData as string[];
                    if (DropDataFilenames.Length > 0)
                    {
                        Image image = Image.FromFile(DropDataFilenames[0]);

                        using (MemoryStream stream = new MemoryStream())
                        {
                            image.Save(stream, System.Drawing.Imaging.ImageFormat.Png);
                            stream.Seek(0, SeekOrigin.Begin);

                            BitmapImage bitmapImage = new BitmapImage();
                            bitmapImage.BeginInit();
                            bitmapImage.StreamSource = stream;
                            bitmapImage.CacheOption = BitmapCacheOption.OnLoad;
                            bitmapImage.EndInit();

                            previewsource.ImageSource = bitmapImage;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
        }

        ImageSource NoImage;
        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            var hwnd = new WindowInteropHelper(this).Handle;
            SetWindowLong(hwnd, GWL_STYLE, GetWindowLong(hwnd, GWL_STYLE) & ~WS_SYSMENU);

            NoImage = previewsource.ImageSource;
        }

        private void ApplyButton(object sender, RoutedEventArgs e)
        {
            if (previewsource.ImageSource == NoImage)
            {
                MessageBox.Show("Prosze wrzucic obrazek.");
                return;
            }

            MainWindow._Instance.handler_bar_banner_panel_image.ImageSource = previewsource.ImageSource;
            MainWindow._Instance.handler_bar_banner.Visibility = Visibility.Visible;
            this.Hide();
        }

        private void HideButton(object sender, RoutedEventArgs e)
        {
            this.Hide();
            MainWindow._Instance.handler_bar_banner.Visibility = Visibility.Collapsed;
        }
    }
}
