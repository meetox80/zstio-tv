using System.Globalization;
using Avalonia;
using Avalonia.Controls;
using Avalonia.Media;

namespace zstio_tv.UI.Controls;

public class RadialGradientTextControl : Control
{
    #region Properties
    
    public static readonly StyledProperty<string> TextProperty = 
        AvaloniaProperty.Register<RadialGradientTextControl, string>(nameof(Text));
    
    public static readonly StyledProperty<double> FontSizeProperty = 
        AvaloniaProperty.Register<RadialGradientTextControl, double>(nameof(FontSize));
    
    public static readonly StyledProperty<FontFamily> FontFamilyProperty = 
        AvaloniaProperty.Register<RadialGradientTextControl, FontFamily>(nameof(FontFamily));
    
    public static readonly StyledProperty<Color> CenterColorProperty = 
        AvaloniaProperty.Register<RadialGradientTextControl, Color>(nameof(CenterColor));
    
    public static readonly StyledProperty<Color> EdgeColorProperty = 
        AvaloniaProperty.Register<RadialGradientTextControl, Color>(nameof(EdgeColor));
    
    public static readonly StyledProperty<double> BorderThicknessProperty = 
        AvaloniaProperty.Register<RadialGradientTextControl, double>(nameof(BorderThickness));
    
    public static readonly StyledProperty<Color> BorderColorProperty = 
        AvaloniaProperty.Register<RadialGradientTextControl, Color>(nameof(BorderColor));
    
    public static readonly StyledProperty<string> BorderAlignmentProperty = 
        AvaloniaProperty.Register<RadialGradientTextControl, string>(nameof(BorderAlignment));

    #endregion

    #region Structs

    public string Text
    {
        get => GetValue(TextProperty);
        set => SetValue(TextProperty, value);
    }

    public double FontSize
    {
        get => GetValue(FontSizeProperty);
        set => SetValue(FontSizeProperty, value);
    }

    public FontFamily FontFamily
    {
        get => GetValue(FontFamilyProperty);
        set => SetValue(FontFamilyProperty, value);
    }

    public Color CenterColor
    {
        get => GetValue(CenterColorProperty);
        set => SetValue(CenterColorProperty, value);
    }

    public Color EdgeColor
    {
        get => GetValue(EdgeColorProperty);
        set => SetValue(EdgeColorProperty, value);
    }

    public double BorderThickness
    {
        get => GetValue(BorderThicknessProperty);
        set => SetValue(BorderThicknessProperty, value);
    }

    public Color BorderColor
    {
        get => GetValue(BorderColorProperty);
        set => SetValue(BorderColorProperty, value);
    }

    public string BorderAlignment
    {
        get => GetValue(BorderAlignmentProperty);
        set => SetValue(BorderAlignmentProperty, value);
    }

    #endregion

    #region Rendering
    
    public override void Render(DrawingContext Context)
    {
        if (string.IsNullOrEmpty(Text)) return;

        FormattedText _FormattedText = new FormattedText(
            Text,
            CultureInfo.CurrentCulture,
            FlowDirection.LeftToRight,
            new Typeface(FontFamily.Name ?? "Arial"),
            FontSize,
            Brushes.Transparent
        );
        
        Size _TextBounds = new Size(
            _FormattedText.Width,
            _FormattedText.Height
        );
        
        Point _CenterPoint = new Point(
            Bounds.Width / 2 - _TextBounds.Width / 2,
            Bounds.Height / 2 - _TextBounds.Height / 2
        );
        
        Geometry TextGeometry = _FormattedText.BuildGeometry(_CenterPoint);
        if (TextGeometry == null) return;

        double Thickness = BorderAlignment switch
        {
            "Inside" => BorderThickness / 2,
            "Outside" => BorderThickness * 1.5,
            _ => BorderThickness
        };

        Pen BorderPen = new Pen(
            new SolidColorBrush(BorderColor), 
            Thickness
        );
        
        Context.DrawGeometry(
            Brushes.Transparent, 
            BorderPen, TextGeometry
        );

        var GlowBrush = new RadialGradientBrush
        {
            Center = new RelativePoint(0.5, 0.5, RelativeUnit.Relative),
            GradientOrigin = new RelativePoint(0.5, 0.5, RelativeUnit.Relative),
            RadiusX = new RelativeScalar(2, RelativeUnit.Relative),
            RadiusY = new RelativeScalar(2, RelativeUnit.Relative),
            SpreadMethod = GradientSpreadMethod.Pad,
            GradientStops =
            {
                new GradientStop(Colors.Transparent, 0),
                new GradientStop(Color.FromArgb(20, 0, 0, 0), 0.7),
                new GradientStop(Color.FromArgb(30, 0, 0, 0), 1)
            }
        };

        Context.DrawGeometry(
            GlowBrush, 
            null, 
            TextGeometry
        );
    }

    #endregion
}