using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Media;
using System.Windows.Shapes;

namespace zstio_tv.Helpers
{

    internal class IReplacements
    {
        public class Substitution
        {
            public string lesson { get; set; }
            public string branch { get; set; }
            public string subject { get; set; }
            public string @class { get; set; }
            public string @case { get; set; }
            public string message { get; set; }
        }

        public class Table
        {
            public string time { get; set; }
            public List<Substitution> zastepstwa { get; set; }
        }

        public class Root
        {
            public List<Table> tables { get; set; }
        }
        public static void ConfigureReplacements()
        {
            Root root = JsonConvert.DeserializeObject<Root>(LocalMemory.ReplacementsAPIResponse);

            foreach (var table in root.tables)
            {
                foreach (var substitution in table.zastepstwa)
                {
                    string replacement;
                    if (substitution.message == "")
                    {
                        replacement = substitution.@case;
                    }
                    else
                    {
                        replacement = substitution.message;
                    }

                    if (substitution.@class == "")
                    {
                        substitution.@class = "-";
                    }

                    substitution.branch = substitution.branch.Replace("|", " - ");

                    PlaceElement(substitution.lesson.Split(',')[0], substitution.branch, substitution.subject, replacement, substitution.@class);
                }

                MainWindow._Instance.handler_content_tabcontrol_replacements_titledate.Text = $"Zastępstwa na dzień {table.time.Substring(7)}";
            }
        }

        public static void PlaceElement(string LessonNumber, string branch, string teacher, string replacement, string classroom)
        {
            Grid HandlerGrid = new Grid();
            HandlerGrid.VerticalAlignment = VerticalAlignment.Top;
            HandlerGrid.Margin = new Thickness(0, 10, 0, 0);

            Rectangle HandlerRectangle = new Rectangle();
            HandlerRectangle.Height = 45;
            HandlerRectangle.Width = 1000;
            HandlerRectangle.Fill = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF0E0B0B"));
            HandlerRectangle.RadiusX = 5;
            HandlerRectangle.RadiusY = 5;
            HandlerGrid.Children.Add(HandlerRectangle);

            StackPanel HandlerPanel = new StackPanel();
            HandlerPanel.Orientation = Orientation.Horizontal;


            Grid LessonNumberGrid = new Grid();
            LessonNumberGrid.Width = 45;
            LessonNumberGrid.Margin = new Thickness(30, 0, 0, 0);
            Rectangle LessonNumberRectangle = new Rectangle();
            LessonNumberRectangle.Height = 45;
            LessonNumberRectangle.Width = 45;
            LessonNumberRectangle.RadiusX = 5;
            LessonNumberRectangle.RadiusY = 5;
            LessonNumberRectangle.Fill = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF111010"));
            LessonNumberRectangle.Stroke = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF271E1E"));
            LessonNumberGrid.Children.Add(LessonNumberRectangle);
            TextBlock LessonNumberTextBlock = new TextBlock();
            LessonNumberTextBlock.Text = $"{LessonNumber}";
            LessonNumberTextBlock.FontFamily = new FontFamily(new Uri("pack://application:,,,/"), "./Font/InterBold/#Inter");
            LessonNumberTextBlock.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFFFFFFF"));
            LessonNumberTextBlock.TextAlignment = TextAlignment.Center;
            LessonNumberTextBlock.FontSize = 24;
            LessonNumberTextBlock.Margin = new Thickness(0, 7.5f, 0, 0);
            LessonNumberGrid.Children.Add(LessonNumberTextBlock);
            HandlerPanel.Children.Add(LessonNumberGrid);

            Grid BranchGrid = new Grid();
            BranchGrid.Width = 175;
            TextBlock BranchTextBlock = new TextBlock();
            BranchTextBlock.Text = $"{branch}";
            BranchTextBlock.FontFamily = new FontFamily(new Uri("pack://application:,,,/"), "./Font/InterBold/#Inter");
            BranchTextBlock.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFFFFFFF"));
            BranchTextBlock.FontSize = 16;
            BranchTextBlock.TextAlignment = TextAlignment.Center;
            BranchTextBlock.VerticalAlignment = VerticalAlignment.Center;
            BranchGrid.Children.Add(BranchTextBlock);
            HandlerPanel.Children.Add(BranchGrid);

            Grid TeacherGrid = new Grid();
            TeacherGrid.Width = 300;
            TextBlock TeacherTextBlock = new TextBlock();
            TeacherTextBlock.Text = $"{teacher}";
            TeacherTextBlock.FontFamily = new FontFamily(new Uri("pack://application:,,,/"), "./Font/InterBold/#Inter");
            TeacherTextBlock.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFFFFFFF"));
            TeacherTextBlock.FontSize = 16;
            TeacherTextBlock.TextAlignment = TextAlignment.Center;
            TeacherTextBlock.VerticalAlignment = VerticalAlignment.Center;
            TeacherGrid.Children.Add(TeacherTextBlock);
            HandlerPanel.Children.Add(TeacherGrid);

            Grid ReplacementGrid = new Grid();
            ReplacementGrid.Width = 300;
            TextBlock ReplacementTextBlock = new TextBlock();
            ReplacementTextBlock.Text = $"{replacement}";
            ReplacementTextBlock.FontFamily = new FontFamily(new Uri("pack://application:,,,/"), "./Font/InterBold/#Inter");
            ReplacementTextBlock.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFFFFFFF"));
            ReplacementTextBlock.FontSize = 16;
            ReplacementTextBlock.TextAlignment = TextAlignment.Center;
            ReplacementTextBlock.VerticalAlignment = VerticalAlignment.Center;
            ReplacementGrid.Children.Add(ReplacementTextBlock);
            HandlerPanel.Children.Add(ReplacementGrid);

            Grid ClassroomGrid = new Grid();
            ClassroomGrid.Width = 150;
            TextBlock ClassroomTextBlock = new TextBlock();
            ClassroomTextBlock.Text = $"{classroom}";
            ClassroomTextBlock.FontFamily = new FontFamily(new Uri("pack://application:,,,/"), "./Font/InterBold/#Inter");
            ClassroomTextBlock.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFFFFFFF"));
            ReplacementTextBlock.FontSize = 16;
            ClassroomTextBlock.TextAlignment = TextAlignment.Center;
            ClassroomTextBlock.VerticalAlignment = VerticalAlignment.Center;
            ClassroomGrid.Children.Add(ClassroomTextBlock);
            HandlerPanel.Children.Add(ClassroomGrid);

            HandlerGrid.Children.Add(HandlerPanel);
            MainWindow._Instance.handler_content_tabcontrol_replacements_fields.Children.Add(HandlerGrid);
        }
    }
}
