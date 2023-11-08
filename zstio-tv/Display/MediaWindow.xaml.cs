using System;
using System.Data;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Forms;
using System.Windows.Media.Imaging;
using System.Windows.Threading;

namespace zstio_tv
{
    public partial class MediaWindow : Window
    {
        public MediaWindow()
        {
            InitializeComponent();
        }

        int SlideBackup = 0;

        DispatcherTimer BannerTimer = new DispatcherTimer();
        DispatcherTimer SlideTimer = new DispatcherTimer();
        private void WindowLoaded(object sender, RoutedEventArgs e)
        {
            SlideBackup = MainWindow.Pages;

            BannerTimer.Interval = TimeSpan.FromSeconds((int)bannerslider.Value);
            BannerTimer.Tick += BannerTimer_Tick;

            SlideTimer.Interval = TimeSpan.FromSeconds((int)slideslider.Value);
            SlideTimer.Tick += SlideTimer_Tick;
        }

        int BannerSlide = 0;
        private void BannerTimer_Tick(object sender, EventArgs e)
        {
            BannerSlide++;
            if (BannerSlide == BannerFileCount)
            {
                BannerSlide = 0;
            }
            try
            {
                string ImagePath = Path.Combine(BannerDirectory, BannerFiles[BannerSlide]);

                BitmapImage bitmapImage = new BitmapImage();
                bitmapImage.BeginInit();
                bitmapImage.UriSource = new Uri(ImagePath, UriKind.RelativeOrAbsolute);
                bitmapImage.EndInit();

                MainWindow._Instance.handler_bar_banner_panel_image.ImageSource = bitmapImage;
            } catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
        }

        int SlideSlide = 0;
        private void SlideTimer_Tick(object sender, EventArgs e)
        {
            SlideSlide++;
            if (SlideSlide == SlideFileCount)
            {
                SlideSlide = 0;
            }
            try
            {
                string ImagePath = Path.Combine(SlideDirectory, SlideFiles[SlideSlide]);

                BitmapImage bitmapImage = new BitmapImage();
                bitmapImage.BeginInit();
                bitmapImage.UriSource = new Uri(ImagePath, UriKind.RelativeOrAbsolute);
                bitmapImage.EndInit();

                MainWindow._Instance.customslideimages_image.ImageSource = bitmapImage;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
        }

        private void slidevisibility_Click(object sender, RoutedEventArgs e)
        {
            if (slidevisibility.IsChecked == true)
            {
                MainWindow.Pages = SlideBackup + 1;
                SlideTimer.Interval = TimeSpan.FromSeconds((int)slideslider.Value);
                SlideTimer.Start();
            } else
            {
                MainWindow.Pages = SlideBackup;
                SlideTimer.Interval = TimeSpan.FromSeconds((int)slideslider.Value);
                SlideTimer.Stop();
            }
        }

        private void bannervisibility_Click(object sender, RoutedEventArgs e)
        {
            if (bannervisibility.IsChecked == true)
            {
                MainWindow._Instance.handler_bar_banner.Visibility = Visibility.Visible;
                BannerTimer.Interval = TimeSpan.FromSeconds((int)bannerslider.Value);
                BannerTimer.Start();
            } else
            {
                MainWindow._Instance.handler_bar_banner.Visibility = Visibility.Collapsed;
                BannerTimer.Interval = TimeSpan.FromSeconds((int)bannerslider.Value);
                BannerTimer.Stop();
            }
        }

        int BannerFileCount = 0; string BannerDirectory; string[] BannerFiles;
        private void BannerSelectFolderClick(object sender, RoutedEventArgs e)
        {
            using (var FolderDialog = new FolderBrowserDialog())
            {
                DialogResult DialogResult = FolderDialog.ShowDialog();

                if (DialogResult == DialogResult.OK && !string.IsNullOrWhiteSpace(FolderDialog.SelectedPath))
                {
                    BannerDirectory = FolderDialog.SelectedPath;

                    BannerFiles = Directory.GetFiles(FolderDialog.SelectedPath)
                        .Where(file => Config.ImageExtensions.Contains(Path.GetExtension(file), StringComparer.OrdinalIgnoreCase))
                        .ToArray();

                    DataTable FilesDataTable = new DataTable();
                    FilesDataTable.Columns.Add("FileCount", typeof(int));
                    FilesDataTable.Columns.Add("FileName", typeof(string));

                    foreach (string FileName in BannerFiles)
                    {
                        BannerFileCount++;
                        DataRow FilesRow = FilesDataTable.NewRow();
                        FilesRow["FileCount"] = BannerFileCount;
                        FilesRow["FileName"] = Path.GetFileName(FileName);
                        FilesDataTable.Rows.Add(FilesRow);
                        bannerdata.ItemsSource = FilesDataTable.DefaultView;
                    }
                }
            }
        }

        int SlideFileCount = 0; string SlideDirectory; string[] SlideFiles;
        private void SlideSelectFolderClick(object sender, RoutedEventArgs e)
        {
            using (var FolderDialog = new FolderBrowserDialog())
            {
                DialogResult DialogResult = FolderDialog.ShowDialog();

                if (DialogResult == DialogResult.OK && !string.IsNullOrWhiteSpace(FolderDialog.SelectedPath))
                {
                    SlideDirectory = FolderDialog.SelectedPath;

                    SlideFiles = Directory.GetFiles(FolderDialog.SelectedPath)
                        .Where(file => Config.ImageExtensions.Contains(Path.GetExtension(file), StringComparer.OrdinalIgnoreCase))
                        .ToArray();

                    DataTable FilesDataTable = new DataTable();
                    FilesDataTable.Columns.Add("FileCount", typeof(int));
                    FilesDataTable.Columns.Add("FileName", typeof(string));

                    foreach (string FileName in SlideFiles)
                    {
                        SlideFileCount++;
                        DataRow FilesRow = FilesDataTable.NewRow();
                        FilesRow["FileCount"] = SlideFileCount;
                        FilesRow["FileName"] = Path.GetFileName(FileName);
                        FilesDataTable.Rows.Add(FilesRow);
                        slidedata.ItemsSource = FilesDataTable.DefaultView;
                    }
                }
            }
        }

        private void BannerSlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            if (bannerslider != null && bannerslidertext != null)
                bannerslidertext.Content = $"{(int)bannerslider.Value}s";
        }
        private void SlideSlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            if (slideslider != null && slideslidertext != null)
                slideslidertext.Content = $"{(int)slideslider.Value}s";
        }

        private void Apply(object sender, RoutedEventArgs e)
        {
            BannerTimer.Interval = TimeSpan.FromSeconds((int)bannerslider.Value);
            SlideTimer.Interval = TimeSpan.FromSeconds((int)slideslider.Value);
        }
    }
}
