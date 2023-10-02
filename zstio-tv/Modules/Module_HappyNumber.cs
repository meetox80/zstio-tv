using Newtonsoft.Json.Linq;
using System;
using System.Diagnostics;
using System.Net.Http;
using System.Windows.Threading;

namespace zstio_tv.Modules
{
    // Internal integration for happynumber.tvmodule
    internal class Module_HappyNumber
    {
        public static string Output = "", Address = "";
        public static void RegisterModule(string WorkingAddress)
        {
            Address = WorkingAddress;

            DispatcherTimer HappyNumberTimer = new DispatcherTimer();
            HappyNumberTimer.Interval = TimeSpan.FromHours(2);
            HappyNumberTimer.Tick += HappyNumberTimer_Tick;
            HappyNumberTimer.Start();
            HappyNumberTimer_Tick(null, null);
        }

        private static async void HappyNumberTimer_Tick(object sender, EventArgs e)
        {
            using (HttpClient Client = new HttpClient())
            {
                try
                {
                    string ClientResponse = await Client.GetStringAsync($"http://{Address}/");

                    //MessageBox.Show(ClientResponse);

                    if (!string.IsNullOrEmpty(ClientResponse))
                    {
                        JObject ClientObjectResponse = JObject.Parse(ClientResponse);
                        Output = ClientObjectResponse["luckNumber"].ToString();
                    }
                }
                catch (Exception ex)
                {
                    Debug.WriteLine(ex);
                }
            }

            MainWindow._Instance.handler_bar_happynumberwidget_header_content.Text = Output;
        }

    }
}
