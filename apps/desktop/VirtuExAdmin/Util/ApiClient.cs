using System.Net.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using VirtuExAdmin.Serializables;

namespace VirtuExAdmin.Util;

public class ApiClient : IDisposable {
    private static ApiClient? _instance;
    public static ApiClient Instance {
        get {
            _instance ??= new ApiClient();
            return _instance;
        }
    }

    private HttpClient _httpClient;
    private DefaultContractResolver _contractResolver = new() {
        NamingStrategy = new SnakeCaseNamingStrategy()
    };

    private ApiClient() {
        _httpClient = new HttpClient();
        
        // TODO: make dynamic
        _httpClient.BaseAddress = new Uri("http://localhost:3001");
        _httpClient.DefaultRequestHeaders.UserAgent.Clear();
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "VirtuExAdmin/1.0.0");
    }

    public async Task<LoginResponse?> Login(String email, String password) {
        try {
            var p = new Dictionary<String, String>() {
                { "email", email },
                { "password", password }
            };
            var res = await _httpClient.PostAsync("/v1/auth/login", new FormUrlEncodedContent(p));
            Console.WriteLine(res.Content.ReadAsStringAsync().GetAwaiter().GetResult());
            res.EnsureSuccessStatusCode();

            return JsonConvert.DeserializeObject<LoginResponse>(await res.Content.ReadAsStringAsync());
        }
        catch (HttpRequestException e) {
            Console.WriteLine(e);
            return null;
        }
    }

    public void Dispose() {
        _instance?.Dispose();
    }
}