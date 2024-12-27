using System;
using System.Threading.Tasks;
using Avalonia;
using Avalonia.Animation;
using Avalonia.Animation.Easings;
using Avalonia.Styling;

namespace zstio_tv.UI.Functions;

public class AnimationManager
{
    public static async Task Animate<T>(
        TimeSpan _Delay, 
        TimeSpan _Duration,
        StyledProperty<T> _Property,
        
        T? _FromValue,
        T? _ToValue,
        
        Animatable _Element,
        Easing _Easing
    )
    {
        Animation _Animation = new Animation
        {
            Delay = _Delay,
            Duration = _Duration,
            Easing = _Easing,
            Children =
            {
                new KeyFrame
                {
                    Cue = new Cue(0),
                    Setters =
                    {
                        new Setter(_Property, _FromValue)
                    }
                },
                new KeyFrame
                {
                    Cue = new Cue(1),
                    Setters =
                    {
                        new Setter(_Property, _ToValue)
                    }
                }
            }
        };

        await _Animation.RunAsync(_Element);
    }
}