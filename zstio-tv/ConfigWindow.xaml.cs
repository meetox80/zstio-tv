using System.Threading;
using System.Windows;
using System.Windows.Input;
using zstio_tv.Modules;

namespace zstio_tv
{
    public partial class ConfigWindow : Window
    {
        public static ConfigWindow _Instance;
        public ConfigWindow()
        {
            InitializeComponent();
            _Instance = this;
        }

        public static string[] TempLessonTimes = { }, TempBreakTimes = { };
        private void Button_Click(object sender, RoutedEventArgs e)
        {
            if (input_warning.Text != null && input_warning.Text != Config.Warning)
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

        public void ReloadReplacements()
        {
            if (checkbox_short.IsChecked == true)
            {
                MainWindow.ReplacementsGETAPI_Tick(null, null);
                MainWindow.ReplacementsCALC_Tick(null, null);
            }
        }

        private void Button_Click_1(object sender, RoutedEventArgs e)
        {
            SpotifyAuth.AuthorizeSpotify();
        }

        private void Window_KeyDownConfig(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Escape)
            {
                this.Close();
                MainWindow.ConfigWindowState = false;
                Thread.Sleep(250);
            }
        }

        private void WindowLoaded(object sender, RoutedEventArgs e)
        {
            TempLessonTimes = Config.LessonTimes;
            TempBreakTimes = Config.BreakTimes;

            input_warning.Text = Config.Warning;
            modulescount.Content = $"Zaladowane moduly: {ModulesManager.ModulesCount()}";
        }
    }
}
