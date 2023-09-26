using Newtonsoft.Json.Linq;
using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http;
using System.Text;
using System.Collections.Generic;
using System.Windows;

namespace zstio_tv.Modules
{
    internal class SpotifyAuth
    {
        public static void AuthorizeSpotify()
        {
            string clientId = Config.SpotifyID;
            string clientSecret = Config.SpotifyAuth;

            string authorizeUrl = "https://accounts.spotify.com/authorize";
            string tokenUrl = "https://accounts.spotify.com/api/token";
            string redirectUri = "http://localhost:2137/callback";

            string state = Guid.NewGuid().ToString("N");

            // Construct the authorization URL
            string authUrl = $"{authorizeUrl}?client_id={clientId}&response_type=code&redirect_uri={redirectUri}&state={state}&scope=user-read-playback-state";

            // Open the spotify authorization page with the authorization url
            Process.Start(new ProcessStartInfo(authUrl)
            {
                UseShellExecute = true,
                Verb = "open"
            });

            // Start a local HTTP server to handle the callback
            var listener = new HttpListener();
            listener.Prefixes.Add(redirectUri + "/");
            listener.Start();

            Console.WriteLine($"Waiting for the Spotify authorization callback at server: {redirectUri}...");
            var context = listener.GetContext();

            string code = context.Request.QueryString["code"];
            string receivedState = context.Request.QueryString["state"];

            if (receivedState != state)
            {
                Console.WriteLine("State parameter mismatch. Exiting.");
                return;
            }

            // Authorization code to authorization token.
            var tokenRequest = (HttpWebRequest)WebRequest.Create(tokenUrl);
            tokenRequest.Method = "POST";
            tokenRequest.ContentType = "application/x-www-form-urlencoded";

            string tokenRequestBody = $"grant_type=authorization_code&code={code}&redirect_uri={redirectUri}";
            byte[] tokenRequestBodyBytes = Encoding.UTF8.GetBytes(tokenRequestBody);
            tokenRequest.ContentLength = tokenRequestBodyBytes.Length;
            tokenRequest.Headers.Add("Authorization", "Basic " + Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}")));

            using (Stream stream = tokenRequest.GetRequestStream())
            {
                stream.Write(tokenRequestBodyBytes, 0, tokenRequestBodyBytes.Length);
            }

            try
            {
                var tokenResponse = (HttpWebResponse)tokenRequest.GetResponse();
                using (var reader = new StreamReader(tokenResponse.GetResponseStream()))
                {
                    string responseText = reader.ReadToEnd();
                    var tokenData = JObject.Parse(responseText);

                    string accessToken = tokenData["access_token"].ToString();
                    string refreshToken = tokenData["refresh_token"].ToString();
                    LocalMemory.SpotifyToken = accessToken;
                    LocalMemory.SpotifyRefreshToken = refreshToken;
                    Console.WriteLine($"Successfully Received AccessToken: {accessToken}");
                    Console.WriteLine($"Refresh Token: {refreshToken}");

                    // Send the html repsonse that it is successfully authorized.
                    var ListenerResponse = context.Response;
                    ListenerResponse.ContentType = "text/html";
                    string ListenerResponseContent = "<head><meta charset='UTF-8'></head><center><h1>Successfully authorized with spotify!</h1><p style='opacity:0.5;margin-top:-10px;'>Made by lemonek.</p><button onclick='window.close();'>Close</button></center><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap'); body{color:white;background-color:#101010;font-family: 'Inter', sans-serif;}</style>";
                    byte[] ListenerResponseBytes =  Encoding.UTF8.GetBytes(ListenerResponseContent);

                    ListenerResponse.ContentLength64 = ListenerResponseBytes.Length;
                    ListenerResponse.OutputStream.Write(ListenerResponseBytes, 0, ListenerResponseBytes.Length);
                    ListenerResponse.Close();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting access token: {ex.Message}");
            }

            // Close the HTTP listener. Recieved the shit successfully! 🔥
            listener.Stop();

            Console.WriteLine(SpotifyAuth.GetAPI("/me/player/currently-playing"));
        }

        public static string GetAPI(string APIPoint)
        {
            try
            {
                using (var httpClient = new HttpClient())
                {
                    httpClient.BaseAddress = new Uri("https://api.spotify.com/v1/");
                    httpClient.DefaultRequestHeaders.Accept.Clear();
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", LocalMemory.SpotifyToken);

                    HttpResponseMessage response = httpClient.GetAsync(APIPoint).Result;

                    if (response.StatusCode == HttpStatusCode.Unauthorized)
                    {
                        Console.WriteLine("Token expired. Making a new one!");
                        RefreshToken();
                        return GetAPI(APIPoint);
                    }

                    if (response.IsSuccessStatusCode)
                    {
                        string json = response.Content.ReadAsStringAsync().Result;
                        return json;
                    }
                    else
                    {
                        Console.WriteLine($"Error getting currently playing track: {response.StatusCode}");
                        return "ERRinternal";
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting currently playing track: {ex.Message}");
                return "ERRinternal";
            }
        }

        public static void RefreshToken()
        {
            try
            {
                using (var httpClient = new HttpClient())
                {
                    var tokenRequest = new Dictionary<string, string>
                    {
                        {"grant_type", "refresh_token"},
                        {"refresh_token", LocalMemory.SpotifyRefreshToken}
                    };

                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(Encoding.ASCII.GetBytes($"{Config.SpotifyID}:{Config.SpotifyAuth }")));

                    var content = new FormUrlEncodedContent(tokenRequest);
                    var response = httpClient.PostAsync("https://accounts.spotify.com/api/token", content).Result;

                    if (response.IsSuccessStatusCode)
                    {
                        string json = response.Content.ReadAsStringAsync().Result;
                        var tokenData = JObject.Parse(json);

                        string accessToken = tokenData["access_token"].ToString();
                        LocalMemory.SpotifyToken = accessToken;
                        Console.WriteLine($"Successfully Refreshed AccessToken: {accessToken}");
                    }
                    else
                    {
                        Console.WriteLine($"Error refreshing access token: {response.StatusCode}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error refreshing access token: {ex.Message}");
            }
        }
    }
}
