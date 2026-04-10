using System.IO;
using System.Net.Http;
using CommunityToolkit.Mvvm.ComponentModel;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using VirtuExAdmin.Serializables;

namespace VirtuExAdmin.Util;

public class ApiClient : IDisposable {
    private string _token;
    public string Token {
        get => _token;
        set {
            _token = value ?? throw new ArgumentNullException(nameof(value));
            
            _httpClient.DefaultRequestHeaders.Remove("Authorization");
            _httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer " + _token);
        }
    }

    private readonly HttpClient _httpClient;
    private DefaultContractResolver _contractResolver = new() {
        NamingStrategy = new SnakeCaseNamingStrategy()
    };

    public ApiClient() {
        _httpClient = new HttpClient();
        
        var configPath = Path.Combine(AppContext.BaseDirectory, "api_url.txt");
        var baseAddress = File.Exists(configPath)
            ? File.ReadAllText(configPath).Trim()
            : "http://localhost:3001";
        
        _httpClient.BaseAddress = new Uri(baseAddress);
        _httpClient.DefaultRequestHeaders.UserAgent.Clear();
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "VirtuExAdmin/1.0.0");
    }

    public async Task<LoginResponse> Login(string email, string password) {
        var res = await _httpClient.PostAsync("/v1/auth/login", new FormUrlEncodedContent(new Dictionary<string, string> {
            { "email", email },
            { "password", password }
        }));

        if (res.IsSuccessStatusCode)
            return JsonConvert.DeserializeObject<LoginResponse>(await res.Content.ReadAsStringAsync())!;
            
        var err = JsonConvert.DeserializeObject<ErrorResponse>(await res.Content.ReadAsStringAsync())!;
        throw new ResponseException(err);
    }

    /// <summary>
    /// The currently logged-in user.
    /// </summary>
    /// <returns></returns>
    public async Task<User> User() {
        var res = await _httpClient.GetAsync("/v1/user/@me");
        
        if (res.IsSuccessStatusCode)
            return JsonConvert.DeserializeObject<User>(await res.Content.ReadAsStringAsync())!;
        
        var err = JsonConvert.DeserializeObject<ErrorResponse>(await res.Content.ReadAsStringAsync())!;
        throw new ResponseException(err);
    }
    
    public async Task<User[]> Users() {
        var res = await _httpClient.GetAsync("/v1/user");
        
        if (res.IsSuccessStatusCode)
            return JsonConvert.DeserializeObject<User[]>(await res.Content.ReadAsStringAsync())!;
        
        var err = JsonConvert.DeserializeObject<ErrorResponse>(await res.Content.ReadAsStringAsync())!;
        throw new ResponseException(err);
    }
    
    public async Task<Currency> Currency(ulong id) {
        var res = await _httpClient.GetAsync($"/v1/currency/{id}");
        
        if (res.IsSuccessStatusCode)
            return JsonConvert.DeserializeObject<Currency>(await res.Content.ReadAsStringAsync())!;
        
        var err = JsonConvert.DeserializeObject<ErrorResponse>(await res.Content.ReadAsStringAsync())!;
        throw new ResponseException(err);
    }
    
    public async Task<Currency> Currency(string symbol) {
        var res = await _httpClient.GetAsync($"/v1/currency/{symbol}");
        
        if (res.IsSuccessStatusCode)
            return JsonConvert.DeserializeObject<Currency>(await res.Content.ReadAsStringAsync())!;
        
        var err = JsonConvert.DeserializeObject<ErrorResponse>(await res.Content.ReadAsStringAsync())!;
        throw new ResponseException(err);
    }

    public async Task<Currency[]> Currencies() {
        var res = await _httpClient.GetAsync("/v1/currency");
        
        if (res.IsSuccessStatusCode)
            return JsonConvert.DeserializeObject<Currency[]>(await res.Content.ReadAsStringAsync())!;
        
        var err = JsonConvert.DeserializeObject<ErrorResponse>(await res.Content.ReadAsStringAsync())!;
        throw new ResponseException(err);
    }

    public async Task<AuditLog[]> AuditLog() {
        var res = await _httpClient.GetAsync("/v1/auditlog");
        
        if (res.IsSuccessStatusCode)
            return JsonConvert.DeserializeObject<AuditLog[]>(await res.Content.ReadAsStringAsync())!;
        
        var err = JsonConvert.DeserializeObject<ErrorResponse>(await res.Content.ReadAsStringAsync())!;
        throw new ResponseException(err);
    }

    public void Dispose() {
        _httpClient.Dispose();
    }
}