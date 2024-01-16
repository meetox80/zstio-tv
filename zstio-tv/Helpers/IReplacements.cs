using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Shapes;
using System.Linq;

namespace zstio_tv.Helpers
{

    /*
     * 
     * See the deprecated API from zstio-substitutions: https://github.com/rvyk/zstio-substitutions/blob/main/src/pages/api/getSubstitutions.ts
     *      -> Archived, and moved into an one repo (rvyk/zstio-timetable)
     * 
     */
    internal class IReplacementsAPI
    {
        public static string GetReplacements()
        {
            using (var Client = new HttpClient())
            {
                try
                {
                    var RawContent = Client.GetStringAsync(Config.ReplacementsAPI).Result;
                    var Document = new HtmlAgilityPack.HtmlDocument();
                    Document.LoadHtml(RawContent);

                    var TimeNode = Document.DocumentNode.SelectSingleNode("//h2");
                    var Time = TimeNode?.InnerText.Trim();
                    var TableNodes = Document.DocumentNode.SelectNodes("//table");

                    var Tables = TableNodes?.Select(table => new
                    {
                        Time = table.SelectSingleNode(".//tr[1]")?.InnerText.Trim(),
                        Zastepstwa = table.SelectNodes(".//tr[position()>1]")
                            ?.Select(row => row.SelectNodes(".//td")?.Select(td => td.InnerText.Trim()).ToArray())
                            ?.Where(cols => cols != null && !string.IsNullOrEmpty(cols[0]))
                            ?.Select(cols => new
                            {
                                lesson = cols[0],
                                teacher = cols[1],
                                branch = cols[2],
                                subject = cols[3],
                                @class = cols[4],
                                @case = cols[5],
                                message = cols[6]
                            })
                            ?.ToList()
                    })?.ToList();

                    if (Tables != null)
                    {
                        var Result = new { time = Time, tables = Tables };
                        var JsonResult = JsonConvert.SerializeObject(Result);

                        return JsonResult;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex);
                }
            }

            return "{}";
        }
    }

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

        public static int SpacingWidth = 2;
        // When theres an break, it clears the lesson. There is an backup to still display the replacements no matter if theres an lesson or not.
        public static int CurrentLessonIndexBackup;
        public static void ConfigureReplacements()
        {
            LocalMemory.ReplacementsAPIResponse = IReplacementsAPI.GetReplacements();

            try
            {
                if (LocalMemory.ReplacementsAPIResponse != "")
                {
                    if (ILesson.CurrentLessonIndex > CurrentLessonIndexBackup)
                    {
                        CurrentLessonIndexBackup = ILesson.CurrentLessonIndex;
                    }

                    Root root = JsonConvert.DeserializeObject<Root>(LocalMemory.ReplacementsAPIResponse);
                    MainWindow._Instance.handler_content_tabcontrol_replacements_fields.Children.Clear();

                    foreach (var table in root.tables)
                    {
                        int TableNum = 0; TableNum++;
                        if (TableNum == 1)
                        {
                            foreach (var substitution in table.zastepstwa)
                            {
                                // Forgot to tag this as an line for development/debugging.
                                // Console.WriteLine(ILesson.CurrentLessonIndex + 1);
                                if (CurrentLessonIndexBackup < Int32.Parse(substitution.lesson.Split(',')[0]))
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

                                    replacement = replacement.Split(new String[] { " - " }, StringSplitOptions.None)[0]; // 

                                    if (substitution.@class == "")
                                    {
                                        substitution.@class = "-";
                                    }

                                    substitution.branch = substitution.branch.Replace("|", " - ");

                                    PlaceElement(substitution.lesson.Split(',')[0], substitution.branch, substitution.subject, replacement, substitution.@class);
                                }
                            }
                        }

                        MainWindow._Instance.handler_content_tabcontrol_replacements_titledate.Text = $"Zastępstwa na dzień {table.time.Substring(7)}";
                    }
                }
            } catch (Exception ex)
            {
                Console.WriteLine(ex);
            }

            try
            {

            } catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
        }

        public static void PlaceElement(string LessonNumber, string branch, string teacher, string replacement, string classroom)
        {
            Grid HandlerGrid = new Grid();
            HandlerGrid.VerticalAlignment = System.Windows.VerticalAlignment.Top;
            HandlerGrid.Margin = new Thickness(0, 10, 0, 0);

            Rectangle HandlerRectangle = new Rectangle();
            HandlerRectangle.Height = 45;
            HandlerRectangle.Width = 1000;
            HandlerRectangle.Fill = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF0A0A0A"));
            HandlerRectangle.RadiusX = 5;
            HandlerRectangle.RadiusY = 5;
            HandlerGrid.Children.Add(HandlerRectangle);

            StackPanel HandlerPanel = new StackPanel();
            HandlerPanel.Orientation = System.Windows.Controls.Orientation.Horizontal;

            Grid LessonNumberGrid = new Grid();
            LessonNumberGrid.Width = 45;
            LessonNumberGrid.Margin = new Thickness(30, 0, 0, 0);
            Rectangle LessonNumberRectangle = new Rectangle();
            LessonNumberRectangle.Height = 45;
            LessonNumberRectangle.Width = 45;
            LessonNumberRectangle.RadiusX = 5;
            LessonNumberRectangle.RadiusY = 5;
            LessonNumberRectangle.Fill = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF151515"));
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
            BranchGrid.Width = 190 - SpacingWidth;
            TextBlock BranchTextBlock = new TextBlock();


            BranchTextBlock.Text = $"{branch}";
            BranchTextBlock.Text = BranchTextBlock.Text.Replace("+", Environment.NewLine);
            BranchTextBlock.FontFamily = new FontFamily(new Uri("pack://application:,,,/"), "./Font/InterBold/#Inter");
            BranchTextBlock.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFFFFFFF"));
            BranchTextBlock.FontSize = 16;
            BranchTextBlock.TextAlignment = TextAlignment.Center;
            BranchTextBlock.VerticalAlignment = System.Windows.VerticalAlignment.Center;
            BranchGrid.Children.Add(BranchTextBlock);
            HandlerPanel.Children.Add(BranchGrid);
            Rectangle BranchSpacingRectangle = new Rectangle();
            BranchSpacingRectangle.Width = SpacingWidth;
            BranchSpacingRectangle.Fill = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF202020"));
            HandlerPanel.Children.Add(BranchSpacingRectangle);

            Grid TeacherGrid = new Grid();
            TeacherGrid.Width = 300 - SpacingWidth;
            TextBlock TeacherTextBlock = new TextBlock();
            TeacherTextBlock.Text = $"{teacher}";
            TeacherTextBlock.FontFamily = new FontFamily(new Uri("pack://application:,,,/"), "./Font/InterBold/#Inter");
            TeacherTextBlock.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFFFFFFF"));
            TeacherTextBlock.FontSize = 16;
            TeacherTextBlock.TextAlignment = TextAlignment.Center;
            TeacherTextBlock.VerticalAlignment = System.Windows.VerticalAlignment.Center;
            TeacherGrid.Children.Add(TeacherTextBlock);
            HandlerPanel.Children.Add(TeacherGrid);
            Rectangle TeacherSpacingRectangle = new Rectangle();
            TeacherSpacingRectangle.Width = SpacingWidth;
            TeacherSpacingRectangle.Fill = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF202020"));
            HandlerPanel.Children.Add(TeacherSpacingRectangle);
            if (TeacherTextBlock.Text.Length > 23)
            {
                double TempSize = (TeacherTextBlock.Text.Length - 23) * 0.25;
                TeacherTextBlock.FontSize = TeacherTextBlock.FontSize - TempSize;
            }

            Grid ReplacementGrid = new Grid();
            ReplacementGrid.Width = 300 - SpacingWidth;
            TextBlock ReplacementTextBlock = new TextBlock();
            ReplacementTextBlock.Text = $"{replacement}";
            ReplacementTextBlock.FontFamily = new FontFamily(new Uri("pack://application:,,,/"), "./Font/InterBold/#Inter");
            ReplacementTextBlock.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFFFFFFF"));
            ReplacementTextBlock.FontSize = 16;
            ReplacementTextBlock.TextAlignment = TextAlignment.Center;
            ReplacementTextBlock.VerticalAlignment = System.Windows.VerticalAlignment.Center;
            ReplacementGrid.Children.Add(ReplacementTextBlock);
            HandlerPanel.Children.Add(ReplacementGrid);

            Grid ClassroomGrid = new Grid();
            ClassroomGrid.Width = 180;
            TextBlock ClassroomTextBlock = new TextBlock();
            ClassroomTextBlock.Text = $"{classroom}";
            ClassroomTextBlock.FontFamily = new FontFamily(new Uri("pack://application:,,,/"), "./Font/InterBold/#Inter");
            ClassroomTextBlock.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FFFFFFFF"));
            ClassroomTextBlock.FontSize = 16;
            ClassroomTextBlock.TextAlignment = TextAlignment.Center;
            ClassroomTextBlock.VerticalAlignment = System.Windows.VerticalAlignment.Center;
            Rectangle ClassroomBackground = new Rectangle();
            ClassroomBackground.RadiusX = 5;
            ClassroomBackground.RadiusY = 5;
            ClassroomBackground.Fill = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#FF151515"));
            ClassroomGrid.Children.Add(ClassroomBackground);
            ClassroomGrid.Children.Add(ClassroomTextBlock);
            HandlerPanel.Children.Add(ClassroomGrid);

            HandlerGrid.Children.Add(HandlerPanel);
            MainWindow._Instance.handler_content_tabcontrol_replacements_fields.Children.Add(HandlerGrid);
        }
    }
}
