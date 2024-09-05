using System.Collections.Generic;
using System.Windows;
using System.Windows.Forms;

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
            #region Display selection

            List<Screen> _AllScreens = new List<Screen>();
            foreach (Screen CurrentScreen in Screen.AllScreens)
            {
                _AllScreens.Add(CurrentScreen);
            }

            LocalMemory.CurrentScreen = _AllScreens[_AllScreens.Count - 1];

            this.Height = LocalMemory.CurrentScreen.Bounds.Height;
            this.Width = LocalMemory.CurrentScreen.Bounds.Width;
            this.Left = LocalMemory.CurrentScreen.Bounds.Left;
            this.Top = LocalMemory.CurrentScreen.Bounds.Top;

            #endregion
        }
    }
}