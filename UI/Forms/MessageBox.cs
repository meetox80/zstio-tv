using System.Threading.Tasks;
using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Layout;
using Avalonia.Media;

namespace zstio_tv.UI.Controls;

public class MessageBox
{
    public static async Task<bool> ShowAsync(string Title, string Message, string ConfirmButton = "OK")
    {
        var _Window = new Window
        {
            WindowStartupLocation = WindowStartupLocation.CenterScreen,
            Title = Title,
            MinWidth = 200,
            MinHeight = 150,
            SizeToContent = SizeToContent.WidthAndHeight,
        };

        var _Grid = new Grid
        {
            Margin = new Thickness(20),
            Children =
            {
                new TextBlock
                {
                    Text = Message,
                    FontSize = 16,
                    TextWrapping = TextWrapping.Wrap,
                    MaxWidth = 550
                },
                new Button
                {
                    Content = ConfirmButton,
                    Width = 100,
                    HorizontalAlignment = HorizontalAlignment.Right,
                    VerticalAlignment = VerticalAlignment.Bottom,
                }.Apply(_Button =>
                {
                    _Button.Click += (sender, e) => _Window.Close(true);
                })
            }
        };

        _Window.Content = _Grid;

        if (Application.Current?.ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop && desktop.MainWindow is Window parentWindow)
        {
            return await _Window.ShowDialog<bool>(parentWindow);
        }

        return await _Window.ShowDialog<bool>(_Window);
    }
}

public static class ControlExtensions
{
    public static T Apply<T>(this T Control, System.Action<T> Action) where T : AvaloniaObject
    {
        Action(Control);
        return Control;
    }
}