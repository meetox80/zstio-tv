using System;
using System.Windows;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using System.Windows.Threading;
using zstio_tv.Helpers;

namespace zstio_tv
{
    public partial class MainWindow : Window
    {
        public static MainWindow _Instance;
        public MainWindow()
        {
            InitializeComponent();
            _Instance = this;
        }

        private void WindowLoaded(object sender, RoutedEventArgs e)
        {
            // Reload the API in order to start Lesson dispatcher
            IDateTime.ReloadDateAPI();

            // Setup the warning display, if the warning string is empty; then hide.
            if (Config.Warning == "")
                handler_content_description_warning_label.Visibility = Visibility.Hidden;
            handler_content_description_warning_label.Text = Config.Warning;

            // Setup the display height and width, make it fullscreen
            this.Height = LocalMemory.Display[0];
            this.Width = LocalMemory.Display[1];
            this.Top = 0;
            this.Left = 0;

            if (!Config.Developer)
            {
                this.Topmost = true;
                developerbadge.Visibility = Visibility.Hidden;
            } else
            {
                developerbadge.Visibility = Visibility.Visible;
            }

            // Setup the scaling - fit on every tv without knowing the size.
            float DisplayScaleFactor = Math.Min(LocalMemory.Display[1] / 1366.0f, LocalMemory.Display[0] / 768.0f);
            handler_scale.ScaleX = DisplayScaleFactor;
            handler_scale.ScaleY = DisplayScaleFactor;

            // Setup the clock dispatcher
            DispatcherTimer ClockTimer = new DispatcherTimer();
            ClockTimer.Interval = TimeSpan.FromSeconds(10);
            ClockTimer.Tick += ClockTimerTick;
            ClockTimer.Start();

            // Setup the lesson/session dispatcher
            DispatcherTimer LessonTimer = new DispatcherTimer();
            LessonTimer.Interval = TimeSpan.FromSeconds(1);
            LessonTimer.Tick += LessonTimerTick;
            LessonTimer.Start();

            // Setup the tabchanger
            DispatcherTimer TabTimer = new DispatcherTimer();
            TabTimer.Interval = TimeSpan.FromSeconds(1);
            TabTimer.Tick += TabTimerTick;
            TabTimer.Start();
        }

        int PageTime = 0; int PageIndex = 0;
        private void TabTimerTick(object sender, EventArgs e)
        {
            // 30 Seconds
            if (PageTime == 30)
            {
                PageIndex++;
                // 5 Pages
                if (PageIndex > 5)
                {
                    PageIndex = 0;
                }
                PageTime = 0;
                handler_content_tabcontrol.SelectedIndex = PageIndex;

                // Set the pages_display
                for (int i = 0; i < handler_content_description_pages_display.Children.Count; i++)
                {
                    if (handler_content_description_pages_display.Children[i] is Ellipse ellipse)
                    {
                        if (i == PageIndex)
                        {
                            ellipse.Opacity = 1.0;
                        }
                        else
                        {
                            ellipse.Opacity = 0.5;
                        }
                    }
                }

                DoubleAnimation widthAnimation = new DoubleAnimation();
                widthAnimation.From = handler_content_tabchangeprogress.ActualWidth;
                widthAnimation.To = 15;
                widthAnimation.Duration = TimeSpan.FromSeconds(1);
                QuadraticEase EaseOut = new QuadraticEase();
                EaseOut.EasingMode = EasingMode.EaseOut;
                widthAnimation.EasingFunction = EaseOut;
                handler_content_tabchangeprogress.BeginAnimation(WidthProperty, widthAnimation);
            } else
            {
                DoubleAnimation widthAnimation = new DoubleAnimation();
                widthAnimation.From = handler_content_tabchangeprogress.ActualWidth;
                widthAnimation.To = handler_content_tabchangeprogress.ActualWidth + 35;
                widthAnimation.Duration = TimeSpan.FromSeconds(1);
                handler_content_tabchangeprogress.BeginAnimation(WidthProperty, widthAnimation);
            }
            PageTime++;
        }

        private void LessonTimerTick(object sender, EventArgs e)
        {
            string[] GetLessonsOutput = ILesson.GetLessons();

            handler_bar_lessonwidget_title.Text = GetLessonsOutput[0];
            handler_bar_lessonwidget_timer.Text = GetLessonsOutput[1];
        }

        private void ClockTimerTick(object sender, EventArgs e)
        {
            IDateTime.ReloadDateAPI();

            handler_bar_clock.Text = IDateTime.CalculateClock();
            handler_bar_date.Text = IDateTime.CalculateDate();
        }

        private void developerbadgeMD(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            this.Close();
        }

        private void TabControl_SelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs e)
        {
        }
    }
}
