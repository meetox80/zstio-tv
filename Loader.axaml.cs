using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Avalonia;
using Avalonia.Animation.Easings;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;
using Avalonia.Layout;
using Avalonia.Media;
using Avalonia.Platform;
using zstio_tv.UI;
using zstio_tv.UI.Controls;
using zstio_tv.UI.Functions;

namespace zstio_tv;

public partial class Loader : Window
{
    #region Initialization

    public static Loader _Instance;
    public Loader()
    {
        InitializeComponent();
        _Instance = this;
    }

    #endregion

    #region Animations
    
    private async void LoadAnimations()
    {
        #region Animation:Background

        Control _HandlerBackgroundStyling = this.FindControl<TextBlock>("HandlerBackgroundStyling");
        if (_HandlerBackgroundStyling != null)
        {
            _HandlerBackgroundStyling.Opacity = 0.0f;

            await Task.WhenAll(
                AnimationManager.Animate(
                    _Delay: TimeSpan.FromSeconds(1),
                    _Duration: TimeSpan.FromSeconds(2.5),
                    _Property: PaddingProperty,
                    _FromValue: new Thickness(-275, 0, 0, 0),
                    _ToValue: new Thickness(-275, -250, 0, 0),
                    _Element: _HandlerBackgroundStyling,
                    _Easing: new CubicEaseOut()
                ),
                AnimationManager.Animate(
                    _Delay: TimeSpan.FromSeconds(1),
                    _Duration: TimeSpan.FromSeconds(2.5),
                    _Property: OpacityProperty,
                    _FromValue: 0.0,
                    _ToValue: 1.0,
                    _Element: _HandlerBackgroundStyling,
                    _Easing: new CubicEaseOut()
                )
            );

            _HandlerBackgroundStyling.Opacity = 1.0;
        }

        #endregion

        #region Animation:Displays

        Control _HandlerUIDisplays = this.FindControl<StackPanel>("HandlerUIDisplays");

        #endregion
    }

    #endregion

    #region Window
    
    private void RenderScreens()
    {
        HandlerUIDisplays.Children.Clear();
        foreach (Structures.ScreenInfo _CurrentScreen in Memory.Screens)
        {
            Border _ScreenBorder = new Border
            {
                Width = _CurrentScreen.Width / 8,
                Height = _CurrentScreen.Height / 8,
                MaxWidth = 300,
                MaxHeight = 300,
                CornerRadius = new CornerRadius(20),
                Background = new SolidColorBrush(Color.Parse("#1C1C1C")),
                BorderThickness = new Thickness(1),
                Cursor = Cursor.Parse("Hand"),
                Margin = new Thickness(5)
            };

            if (_CurrentScreen == Memory.SelectedScreen)
            {
                _ScreenBorder.BorderBrush = new SolidColorBrush(Colors.White);
            }
            else
            {
                _ScreenBorder.BorderBrush = new SolidColorBrush(Color.Parse("#6E6E6E"));
            }

            _ScreenBorder.PointerPressed += (sender, e) =>
            {
                Memory.SelectedScreen = _CurrentScreen;
                RenderScreens();
            };

            _ScreenBorder.Effect = new DropShadowEffect
            {
                Color = Color.Parse("#40FFFFFF"),
                BlurRadius = 10,
                OffsetX = 0,
                OffsetY = 0
            };

            TextBlock _ScreenTextBlock = new TextBlock
            {
                Text = _CurrentScreen.Index.ToString(),
                FontSize = 24,
                FontFamily = (FontFamily)Application.Current.Resources["SemiBold-Inter"],
                Foreground = new SolidColorBrush(Color.Parse("#C1C1C1")),
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center
            };

            _ScreenBorder.Child = _ScreenTextBlock;
            HandlerUIDisplays.Children.Add(_ScreenBorder);
        }
    }
    
    private async void OnLoaded(object? sender, RoutedEventArgs e)
    {
        #region Animations

        LoadAnimations();

        #endregion

        #region ScreenInfo:GET

        IReadOnlyList<Screen> _AllScreens = Screens.All;
        for (int i = 0; i < _AllScreens.Count; i++)
        {
            Screen _CurrentScreen = _AllScreens[i];

            Memory.Screens.Add(new Structures.ScreenInfo
            {
                Index = i,
                X = _CurrentScreen.Bounds.X,
                Y = _CurrentScreen.Bounds.Y,
                Width = _CurrentScreen.Bounds.Width,
                Height = _CurrentScreen.Bounds.Height
            });
        }

        #endregion

        #region ScreenInfo:PUT

        RenderScreens();

        #endregion
    }

    private void WindowMove_Pressed(object? sender, PointerPressedEventArgs e)
    {
        if (e.GetCurrentPoint(this).Properties.IsLeftButtonPressed)
        {
            this.BeginMoveDrag(e);
        }
    }

    #endregion

    #region ContinueButton
    
    private void ContinueButton_Clicked(object? sender, RoutedEventArgs e)
    {
        if (Memory.SelectedScreen == null)
        {
            MessageBox.ShowAsync(this.GetType().Name, "Please select a Display.");
            return;
        }
        
        Window Interface = new Interface();
        Interface.Show();
        
        this.Close();
    }

    private void ContinueButton_OnPointerEntered(object? sender, PointerEventArgs e)
    {
        ContinueButtonTextBlock.Foreground = new SolidColorBrush(Color.Parse("#E3E3E3"));
    }

    private void ContinueButton_OnPointerExited(object? sender, PointerEventArgs e)
    {
        ContinueButtonTextBlock.Foreground = new SolidColorBrush(Color.Parse("#282828"));
    }
    
    #endregion
}