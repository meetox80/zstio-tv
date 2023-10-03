using Aspose.Zip.SevenZip;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Windows;
using zstio_tv.Modules;

namespace zstio_tv
{
    internal class ModulesManager
    {
        public static string[] GetModules()
        {
            List<string> completeList = new List<string>();
            if (Directory.Exists(@".\modules"))
            {
                string[] modulesList = Directory.GetFiles(@".\modules");

                foreach (string module in modulesList)
                {
                    if (module.Contains("tvmodule"))
                        completeList.Add(Path.GetFileName(module));
                }
            }

            return completeList.ToArray();
        }

        public static int ModulesCount() { return GetModules().Length; }

        public static void ReloadModules()
        {
            if (!Directory.Exists(@".\modules"))
                Directory.CreateDirectory(@".\modules");

            ExecuteModules(GetModules());
        }

        public static void ExecuteModules(string[] Modules)
        {
            foreach (string Module in Modules)
            {
                try { File.Copy($@".\modules\{Module}", Path.Combine(Path.GetTempPath(), $"{Module}.7z"), true); } catch (IOException ex) { Console.WriteLine(ex); }

                if (Directory.Exists(Path.Combine(Path.GetTempPath(), "modules", $"{Module.Split('.')[0]}")))
                    Directory.Delete(Path.Combine(Path.GetTempPath(), "modules", $"{Module.Split('.')[0]}"), true);

                using (SevenZipArchive archive = new SevenZipArchive(Path.Combine(Path.GetTempPath(), $"{Module}.7z")))
                    archive.ExtractToDirectory(Path.Combine(Path.GetTempPath() + "modules"));

                string ExecutableCommand = File.ReadAllText(Path.Combine(Path.GetTempPath(), "modules", Module.Split('.')[0], "executable"));
                string AddressInfo = File.ReadAllText(Path.Combine(Path.GetTempPath(), "modules", Module.Split('.')[0], "address"));

                ProcessStartInfo LocalProcessInfo = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = $"/C {ExecutableCommand}",
                    WorkingDirectory = Path.Combine(Path.GetTempPath(), "modules", Module.Split('.')[0]),
                    RedirectStandardOutput = true,
                    UseShellExecute = false, // Required for RedirectStandardOutput to work
                    CreateNoWindow = true
                };

                Process LocalProcess = new Process
                {
                    StartInfo = LocalProcessInfo
                }; LocalProcess.Start();

                // Forward for selected modules
                if (string.Join(",", GetModules()).Contains("happynumber"))
                {
                    MainWindow._Instance.handler_bar_happynumberwidget.Visibility = Visibility.Visible;
                    Module_HappyNumber.RegisterModule(AddressInfo);
                }
            }
        }
    }
}
