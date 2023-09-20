using System;
using System.Windows;
using System.Windows.Threading;
using zstio_tv.Helpers;

namespace zstio_tv
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }

        private void WindowLoaded(object sender, RoutedEventArgs e)
        {
            // Setup the display height and width, make it fullscreen
            this.Height = LocalMemory.Display[0];
            this.Width = LocalMemory.Display[1];
            this.Top = 0;
            this.Left = 0;

            if (!Config.Developer)
                this.Topmost = true;

            // Setup the scaling - fit on every tv without knowing the size.
            float DisplayScaleFactor = Math.Min(LocalMemory.Display[1] / 1366.0f, LocalMemory.Display[0] / 768.0f);
            handler_scale.ScaleX = DisplayScaleFactor;
            handler_scale.ScaleY = DisplayScaleFactor;

            // Setup the clock dispatcher
            DispatcherTimer ClockTimer = new DispatcherTimer();
            ClockTimer.Interval = TimeSpan.FromSeconds(10);
            ClockTimer.Tick += ClockTimerTick;
            ClockTimer.Start();
        }

        private void ClockTimerTick(object sender, EventArgs e)
        {
            IDateTime.ReloadDateAPI();

            handler_bar_clock.Text = IDateTime.CalculateClock();
            handler_bar_date.Text = IDateTime.CalculateDate();
        }
    }
}
