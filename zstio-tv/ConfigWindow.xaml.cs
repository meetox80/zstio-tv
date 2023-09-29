using System.Runtime.InteropServices;
using System;
using System.Windows;
using System.Windows.Interop;

namespace zstio_tv
{
    internal class Win32
    {
        public const int GWL_STYLE = -16;
        public const int WS_SYSMENU = 0x80000;
        [DllImport("user32.dll", SetLastError = true)]
        public static extern int GetWindowLong(IntPtr hWnd, int nIndex);
        [DllImport("user32.dll")]
        public static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);
    }

    public partial class ConfigWindow : Window
    {
        public ConfigWindow()
        {
            InitializeComponent();
        }

        public static string[] TempLessonTimes = { }, TempBreakTimes = { };
        private void Button_Click(object sender, RoutedEventArgs e)
        {
            if (input_warning.Text != null && input_warning.Text != "...")
            {
                Config.Warning = input_warning.Text;
                MainWindow._Instance.handler_content_description_warning_label.Text = Config.Warning;
            }

            // Reload the break times if its set on short lesson times
            if (checkbox_short.IsChecked == true)
            {
                Config.LessonTimes = Config.ShortLessonTimes;
                Config.BreakTimes = Config.ShortBreakTimes;
            } else
            {
                Config.LessonTimes = TempLessonTimes;
                Config.BreakTimes = TempBreakTimes;
            }

            ReloadReplacements();
        }

        public static void ReloadReplacements()
        {
            MainWindow.ReplacementsGETAPI_Tick(null, null);
            MainWindow.ReplacementsCALC_Tick(null, null);
        }

        private void WindowLoaded(object sender, RoutedEventArgs e)
        {
            TempLessonTimes = Config.LessonTimes;
            TempBreakTimes = Config.BreakTimes;

            var hwnd = new WindowInteropHelper(this).Handle;
            Win32.SetWindowLong(hwnd, Win32.GWL_STYLE, Win32.GetWindowLong(hwnd, Win32.GWL_STYLE) & ~Win32.WS_SYSMENU);
        }

        private void Button_Click_1(object sender, RoutedEventArgs e)
        {
            this.WindowState = WindowState.Minimized;
        }
    }
}
