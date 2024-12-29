using Avalonia.Controls;
using Avalonia.Interactivity;

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
        #region Resolution

        Structures.ScreenInfo _SelectedScreen = Memory.SelectedScreen;

        #endregion
    }

    #endregion
}