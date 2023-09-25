using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Windows;
using System.Windows.Media.Animation;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;
using System.Windows.Threading;
using zstio_tv.Helpers;
using zstio_tv.Modules;

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
            // Reload the Replacements functionality, start the replacements scrolling
            ReplacementsGETAPI_Tick(null, null);
            ReplacementsCALC_Tick(null, null);

            SpotifyAuth.AuthorizeSpotify();

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

            // Dispatcher for substitutions/replacements
            DispatcherTimer ReplacementsGETAPI = new DispatcherTimer();
            ReplacementsGETAPI.Interval = TimeSpan.FromHours(1);
            ReplacementsGETAPI.Tick += ReplacementsGETAPI_Tick;
            ReplacementsGETAPI.Start();
            DispatcherTimer ReplacementsCALC = new DispatcherTimer();
            ReplacementsCALC.Interval = TimeSpan.FromSeconds(10);
            ReplacementsCALC.Tick += ReplacementsCALC_Tick;
            ReplacementsCALC.Start();

            // Spotify integration
            DispatcherTimer SpotifyCurrentPlaying = new DispatcherTimer();
            SpotifyCurrentPlaying.Interval = TimeSpan.FromSeconds(5);
            SpotifyCurrentPlaying.Tick += SpotifyCurrentPlaying_Tick;
            SpotifyCurrentPlaying.Start();
        }

        private void SpotifyCurrentPlaying_Tick(object sender, EventArgs e)
        {
            string Response = SpotifyAuth.GetAPI("me/player/currently-playing").ToString();
            // MessageBox.Show(Response);

            if (Response.Contains("ERRinternal") || Response == null || Response == "")
            {
                LocalMemory.SongPlaying = false;
            } else
            {
                JObject SongResponse = JObject.Parse(Response);
                if (SongResponse["item"] != null)
                {
                    string SongName = SongResponse["item"]["name"].ToString();

                    JArray artistsArray = (JArray)SongResponse["item"]["artists"];
                    List<string> authors = artistsArray.Select(artist => artist["name"].ToString()).ToList();
                    string SongAuthors = string.Join(", ", authors);

                    JObject album = (JObject)SongResponse["item"]["album"];
                    string SongImage = "";
                    if (album["images"] != null)
                    {
                        JArray images = (JArray)album["images"];

                        if (images.Count > 0)
                        {
                            SongImage = images[0]["url"].ToString();
                        }
                    }

                    // Set the text, authors, image of zstiofm.
                    handler_bar_zstiofm_title.Content = SongName;
                    handler_bar_zstiom_authors.Content = SongAuthors;

                    BitmapImage SongImageBitmap = new BitmapImage(new Uri(SongImage));
                    handler_bar_zstiofm_image.Source = SongImageBitmap;

                    LocalMemory.SongPlaying = true;
                }
            }

            // InAnimation
            if (LocalMemory.SongPlaying == true && LocalMemory.SongPlayingBackup == false)
            {
                LocalMemory.SongPlayingBackup = true;

                var SongAnimationIn = new ThicknessAnimation
                {
                    From = new Thickness(-600,0,0,0),
                    To = new Thickness(0, 0, 0, 0),
                    Duration = TimeSpan.FromSeconds(1),
                    EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
                };

                var LocalStoryboard = new Storyboard();
                LocalStoryboard.Children.Add(SongAnimationIn);

                Storyboard.SetTarget(SongAnimationIn, zstiofm_movementhandler);
                Storyboard.SetTargetProperty(SongAnimationIn, new PropertyPath(MarginProperty));

                LocalStoryboard.Begin();
            }

            // OutAnimation
            if (LocalMemory.SongPlaying == false && LocalMemory.SongPlayingBackup == true)
            {
                LocalMemory.SongPlayingBackup = false;

                var SongAnimationOut = new ThicknessAnimation
                {
                    From = new Thickness(0, 0, 0, 0),
                    To = new Thickness(-600, 0, 0, 0),
                    Duration = TimeSpan.FromSeconds(1),
                    EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
                };

                var LocalStoryboard = new Storyboard();
                LocalStoryboard.Children.Add(SongAnimationOut);

                Storyboard.SetTarget(SongAnimationOut, zstiofm_movementhandler);
                Storyboard.SetTargetProperty(SongAnimationOut, new PropertyPath(MarginProperty));

                LocalStoryboard.Begin();
            }
        }

        private void ReplacementsCALC_Tick(object sender, EventArgs e) => IReplacements.ConfigureReplacements();
        
        private void ReplacementsGETAPI_Tick(object sender, EventArgs e)
        {
            // Contact with the api responsible for replacements/substitutions
            using (HttpClient Client = new HttpClient())
            {
                try
                {
                    LocalMemory.ReplacementsAPIResponse = Client.GetStringAsync(Config.ReplacementsAPI).Result;
                }
                catch (Exception ex)
                {
                    Debug.WriteLine(ex);
                }
            }
        }

        int PageTime = 0; int PageIndex = 0; public static int PageLength = 30;
        private void TabTimerTick(object sender, EventArgs e)
        {
            if (PageTime == PageLength)
            {
                // Im currently disabling this cause we aint got ideas for other pages lmao
                // PageIndex++;

                // 5 pages, but starting from 0
                if (PageIndex == 4)
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

        private void developerbadgeMD(object sender, System.Windows.Input.MouseButtonEventArgs e) => this.Close();
    }
}
