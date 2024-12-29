using System;
using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Media;

namespace zstio_tv.UI;

public partial class Interface : Window
{
    #region Initialization

    public static Interface _Instance;
    public Interface()
    {
        InitializeComponent();
        _Instance = this;
    }

    #endregion

    #region Window
    
    private void OnLoaded(object? sender, RoutedEventArgs e)
    {
        #region Positioning

        Structures.ScreenInfo _SelectedScreen = Memory.SelectedScreen;
        this.Position = new PixelPoint(
            (int)_SelectedScreen.X,
            (int)_SelectedScreen.Y
        );
        this.Width = (int)_SelectedScreen.Width;
        this.Height = (int)_SelectedScreen.Height;
        
        // 16:9 scaling
        Grid _Handler = this.FindControl<Grid>("Handler");
        double ScaleFactor = Math.Min(
            _SelectedScreen.Width / 16.0f,
            _SelectedScreen.Height / 9.0f
        );
        _Handler.RenderTransform = new ScaleTransform(
            ScaleFactor / (1280.0f / 16.0f),
            ScaleFactor / (720.0f / 9.0f)
        );

        #endregion
    }

    #endregion
}