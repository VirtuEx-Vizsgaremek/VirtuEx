using System.Net.Http;
using CommunityToolkit.Mvvm.ComponentModel;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using VirtuExAdmin.Serializables;
using System.Diagnostics;
using System.Text;

namespace VirtuExAdmin.Util;

public class ApiClient : IDisposable
{
    private string _token;
    public string Token
    {
        get => _token;
        set
        {
            _token = value ?? throw new ArgumentNullException(nameof(value));

            _httpClient.DefaultRequestHeaders.Remove("Authorization");
            _httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer " + _token);
        }
    }

    private readonly HttpClient _httpClient;
    private DefaultContractResolver _contractResolver = new()
    {
        NamingStrategy = new SnakeCaseNamingStrategy()
    };

    private JsonSerializerSettings _jsonSettings;

    public ApiClient()
    {
        _httpClient = new HttpClient();

        // TODO: configurable api uri
        _httpClient.BaseAddress = new Uri("http://localhost:3001");
        _httpClient.DefaultRequestHeaders.UserAgent.Clear();
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "VirtuExAdmin/1.0.0");

        _jsonSettings = new JsonSerializerSettings
        {
            ContractResolver = _contractResolver,
            NullValueHandling = NullValueHandling.Ignore
        };
    }

    public async Task<LoginResponse> Login(string email, string password)
    {
        var res = await _httpClient.PostAsync("/v1/auth/login", new FormUrlEncodedContent(new Dictionary<string, string> {
            { "email", email },
            { "password", password }
        }));

        if (res.IsSuccessStatusCode)
            return JsonConvert.DeserializeObject<LoginResponse>(await res.Content.ReadAsStringAsync(), _jsonSettings)!;

        var err = JsonConvert.DeserializeObject<ErrorResponse>(await res.Content.ReadAsStringAsync(), _jsonSettings)!;
        throw new ResponseException(err);
    }

    public async Task RegisterUser(string fullName, string username, string email, string password)
    {
        var payload = new
        {
            full_name = fullName,
            username,
            email,
            password
        };

        var json = JsonConvert.SerializeObject(payload, _jsonSettings);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var res = await _httpClient.PostAsync("/v1/auth/register", content);

        if (!res.IsSuccessStatusCode)
        {
            var err = JsonConvert.DeserializeObject<ErrorResponse>(await res.Content.ReadAsStringAsync(), _jsonSettings)!;
            throw new ResponseException(err);
        }

        // backend may return JWT or other body; we intentionally ignore it for MVP
    }

    public async Task UpdateUserRestrictions(ulong userId, int permissions, bool activated)
    {
        var payload = new
        {
            permissions,
            activated
        };

        var json = JsonConvert.SerializeObject(payload, _jsonSettings);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var res = await _httpClient.PatchAsync($"/v1/user/{userId}/restrictions", content);

        if (!res.IsSuccessStatusCode)
        {
            var err = JsonConvert.DeserializeObject<ErrorResponse>(await res.Content.ReadAsStringAsync(), _jsonSettings)!;
            throw new ResponseException(err);
        }
    }

    public async Task<Subscription> SetSubscription(ulong userId, string planName)
    {
        var payload = new
        {
            plan_name = planName
        };

        var json = JsonConvert.SerializeObject(payload, _jsonSettings);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var res = await _httpClient.PostAsync($"/v1/user/{userId}/subscription", content);
        var body = await res.Content.ReadAsStringAsync();

        if (res.IsSuccessStatusCode)
        {
            var jo = JObject.Parse(body);
            var sub = new Subscription
            {
                Id = jo["id"]?.ToString() ?? string.Empty,
                PlanId = jo["plan_id"]?.ToString() ?? string.Empty,
                PlanName = jo["plan_name"]?.ToString() ?? string.Empty,
                MonthlyAiCredits = jo["monthly_ai_credits"]?.ToObject<int>() ?? 0,
                AssetsMax = jo["assets_max"]?.ToObject<int>() ?? 0,
                StopLoss = jo["stop_loss"]?.ToObject<bool>() ?? false,
                RealTime = jo["real_time"]?.ToObject<bool>() ?? false,
                TradingView = jo["trading_view"]?.ToObject<bool>() ?? false,
                Price = jo["price"]?.ToObject<decimal>() ?? 0m,
                StartedAt = jo["started_at"] != null
                    ? (jo["started_at"].Type == JTokenType.Integer
                        ? DateTimeOffset.FromUnixTimeMilliseconds(jo["started_at"].Value<long>()).ToLocalTime().ToString("yyyy-MM-dd")
                        : jo["started_at"].ToString())
                    : string.Empty,
                ExpiresAt = jo["expires_at"] != null && jo["expires_at"].Type != JTokenType.Null
                    ? (jo["expires_at"].Type == JTokenType.Integer
                        ? DateTimeOffset.FromUnixTimeMilliseconds(jo["expires_at"].Value<long>()).ToLocalTime().ToString("yyyy-MM-dd")
                        : jo["expires_at"].ToString())
                    : null
            };

            return sub;
        }

        var err = JsonConvert.DeserializeObject<ErrorResponse>(body, _jsonSettings)!;
        throw new ResponseException(err);
    }

    public async Task<AdminWalletResponse> GetUserWallet(ulong userId)
    {
        var res = await _httpClient.GetAsync($"/v1/user/{userId}/wallet");
        var body = await res.Content.ReadAsStringAsync();

        if (res.IsSuccessStatusCode)
        {
            var jo = JObject.Parse(body);

            // Be defensive regarding response shape
            var assetsToken = (JToken?)jo["assets"] ?? jo["Assets"]; // just in case

            var resp = new AdminWalletResponse
            {
                WalletId = jo["wallet_id"]?.ToString() ?? jo["walletId"]?.ToString() ?? jo["id"]?.ToString() ?? string.Empty,
                TotalAssets = jo["total_assets"]?.ToObject<int>() ?? jo["totalAssets"]?.ToObject<int>() ?? 0,
                Assets = new List<WalletAsset>()
            };

            if (assetsToken is JArray ja)
            {
                foreach (var item in ja.OfType<JObject>())
                {
                    resp.Assets.Add(new WalletAsset
                    {
                        Id = item["id"]?.ToString() ?? string.Empty,
                        Currency = item["currency"]?.ToString() ?? item["name"]?.ToString() ?? string.Empty,
                        Symbol = item["symbol"]?.ToString() ?? string.Empty,
                        Amount = item["amount"]?.ToString() ?? "0",
                        Precision = item["precision"]?.ToObject<int>() ?? 0,
                        Price = item["price"]?.ToObject<decimal>() ?? 0m,
                        Type = item["type"]?.ToString() ?? string.Empty
                    });
                }
            }

            return resp;
        }

        var err = JsonConvert.DeserializeObject<ErrorResponse>(body, _jsonSettings)!;
        throw new ResponseException(err);
    }

    public async Task<AdminWalletHistoryResponse> GetUserWalletHistory(ulong userId)
    {
        var res = await _httpClient.GetAsync($"/v1/user/{userId}/wallet/history");
        var body = await res.Content.ReadAsStringAsync();

        if (res.IsSuccessStatusCode)
        {
            var root = JObject.Parse(body);

            // allow both { transactions: [...] } and { history: [...] } and direct array under different key
            var listToken = (JToken?)root["transactions"] ?? root["history"] ?? root["items"];
            if (listToken is null && root.First is not null && root.First is JProperty p && p.Value is JArray)
                listToken = p.Value;

            var resp = new AdminWalletHistoryResponse();

            if (listToken is JArray ja)
            {
                foreach (var t in ja)
                {
                    if (t is not JObject jo) continue;

                    // Symbol: may be in asset.symbol or currency.symbol or symbol
                    var symbol = jo["symbol"]?.ToString()
                                 ?? jo.SelectToken("asset.symbol")?.ToString()
                                 ?? jo.SelectToken("currency.symbol")?.ToString()
                                 ?? string.Empty;

                    var direction = jo["direction"]?.ToString()
                                    ?? jo["type"]?.ToString()
                                    ?? jo["flow"]?.ToString()
                                    ?? string.Empty;

                    var amount = jo["amount"]?.ToString() ?? string.Empty;
                    var status = jo["status"]?.ToString() ?? string.Empty;

                    var dateToken = (JToken?)jo["created_at"] ?? jo["createdAt"] ?? jo["timestamp"] ?? jo["date"];
                    string dateStr;
                    if (dateToken is null)
                    {
                        dateStr = string.Empty;
                    }
                    else if (dateToken.Type == JTokenType.Integer)
                    {
                        dateStr = DateTimeOffset.FromUnixTimeMilliseconds(dateToken.Value<long>()).ToLocalTime().ToString("yyyy-MM-dd");
                    }
                    else
                    {
                        dateStr = dateToken.ToString();
                    }

                    resp.Transactions.Add(new WalletTransaction
                    {
                        Symbol = symbol,
                        Direction = direction,
                        Amount = amount,
                        Status = status,
                        Date = dateStr
                    });
                }
            }

            return resp;
        }

        var err = JsonConvert.DeserializeObject<ErrorResponse>(body, _jsonSettings)!;
        throw new ResponseException(err);
    }

    /// <summary>
    /// The currently logged-in user.
    /// </summary>
    /// <returns></returns>
    public async Task<User> User()
    {
        var res = await _httpClient.GetAsync("/v1/user/@me");
        var body = await res.Content.ReadAsStringAsync();

        if (res.IsSuccessStatusCode)
        {
            var jo = JObject.Parse(body);
            var user = jo.ToObject<User>(JsonSerializer.Create(_jsonSettings))!;

            // populate RegistrationDate from created_at if present
            if (jo["created_at"] != null)
            {
                if (jo["created_at"].Type == JTokenType.Integer)
                {
                    var dt = DateTimeOffset.FromUnixTimeMilliseconds(jo["created_at"].Value<long>()).ToLocalTime();
                    user.RegistrationDate = dt.ToString("yyyy-MM-dd");
                }
                else
                {
                    user.RegistrationDate = jo["created_at"].ToString();
                }
            }

            return user;
        }

        var err = JsonConvert.DeserializeObject<ErrorResponse>(await res.Content.ReadAsStringAsync(), _jsonSettings)!;
        throw new ResponseException(err);
    }

    public async Task<User[]> Users()
    {
        var res = await _httpClient.GetAsync("/v1/user");
        var body = await res.Content.ReadAsStringAsync();

        if (res.IsSuccessStatusCode)
        {
            var ja = JArray.Parse(body);
            var list = new List<User>();
            foreach (var item in ja)
            {
                var jo = (JObject)item;
                var user = jo.ToObject<User>(JsonSerializer.Create(_jsonSettings))!;

                if (jo["created_at"] != null)
                {
                    if (jo["created_at"].Type == JTokenType.Integer)
                    {
                        var dt = DateTimeOffset.FromUnixTimeMilliseconds(jo["created_at"].Value<long>()).ToLocalTime();
                        user.RegistrationDate = dt.ToString("yyyy-MM-dd");
                    }
                    else
                    {
                        user.RegistrationDate = jo["created_at"].ToString();
                    }
                }

                list.Add(user);
            }

            return list.ToArray();
        }

        var err = JsonConvert.DeserializeObject<ErrorResponse>(await res.Content.ReadAsStringAsync(), _jsonSettings)!;
        throw new ResponseException(err);
    }

    public async Task<Currency> Currency(ulong id)
    {
        var res = await _httpClient.GetAsync($"/v1/currency/{id}");

        if (res.IsSuccessStatusCode)
            return JsonConvert.DeserializeObject<Currency>(await res.Content.ReadAsStringAsync(), _jsonSettings)!;

        var err = JsonConvert.DeserializeObject<ErrorResponse>(await res.Content.ReadAsStringAsync(), _jsonSettings)!;
        throw new ResponseException(err);
    }

    public async Task<Currency> Currency(string symbol)
    {
        var res = await _httpClient.GetAsync($"/v1/currency/{symbol}");

        if (res.IsSuccessStatusCode)
            return JsonConvert.DeserializeObject<Currency>(await res.Content.ReadAsStringAsync(), _jsonSettings)!;

        var err = JsonConvert.DeserializeObject<ErrorResponse>(await res.Content.ReadAsStringAsync(), _jsonSettings)!;
        throw new ResponseException(err);
    }

    public async Task<Currency[]> Currencies()
    {
        var res = await _httpClient.GetAsync("/v1/currency");

        if (res.IsSuccessStatusCode)
            return JsonConvert.DeserializeObject<Currency[]>(await res.Content.ReadAsStringAsync(), _jsonSettings)!;

        var err = JsonConvert.DeserializeObject<ErrorResponse>(await res.Content.ReadAsStringAsync(), _jsonSettings)!;
        throw new ResponseException(err);
    }

    /// <summary>
    /// Get subscription details for a specific user.
    /// Calls GET /v1/user/{id}/subscription
    /// </summary>
    public async Task<Subscription> GetSubscription(ulong userId)
    {
        Debug.WriteLine($"[ApiClient] Requesting subscription for userId={userId}");
        if (_httpClient.DefaultRequestHeaders.TryGetValues("Authorization", out var auth))
        {
            Debug.WriteLine($"[ApiClient] Authorization: {auth.FirstOrDefault()}");
        }
        else
        {
            Debug.WriteLine("[ApiClient] Authorization header: <missing>");
        }

        var res = await _httpClient.GetAsync($"/v1/user/{userId}/subscription");
        var body = await res.Content.ReadAsStringAsync();
        Debug.WriteLine($"[ApiClient] GET /v1/user/{userId}/subscription -> HTTP {(int)res.StatusCode}\n{body}");

        if (res.IsSuccessStatusCode)
        {
            var jo = JObject.Parse(body);
            var sub = new Subscription
            {
                Id = jo["id"]?.ToString() ?? string.Empty,
                PlanId = jo["plan_id"]?.ToString() ?? string.Empty,
                PlanName = jo["plan_name"]?.ToString() ?? string.Empty,
                MonthlyAiCredits = jo["monthly_ai_credits"]?.ToObject<int>() ?? 0,
                AssetsMax = jo["assets_max"]?.ToObject<int>() ?? 0,
                StopLoss = jo["stop_loss"]?.ToObject<bool>() ?? false,
                RealTime = jo["real_time"]?.ToObject<bool>() ?? false,
                TradingView = jo["trading_view"]?.ToObject<bool>() ?? false,
                Price = jo["price"]?.ToObject<decimal>() ?? 0m,
                StartedAt = jo["started_at"] != null
                    ? (jo["started_at"].Type == JTokenType.Integer
                        ? DateTimeOffset.FromUnixTimeMilliseconds(jo["started_at"].Value<long>()).ToLocalTime().ToString("yyyy-MM-dd")
                        : jo["started_at"].ToString())
                    : string.Empty,
                ExpiresAt = jo["expires_at"] != null && jo["expires_at"].Type != JTokenType.Null
                    ? (jo["expires_at"].Type == JTokenType.Integer
                        ? DateTimeOffset.FromUnixTimeMilliseconds(jo["expires_at"].Value<long>()).ToLocalTime().ToString("yyyy-MM-dd")
                        : jo["expires_at"].ToString())
                    : null
            };
            return sub;
        }

        var err = JsonConvert.DeserializeObject<ErrorResponse>(body, _jsonSettings)!;
        throw new ResponseException(err);
    }

    public async Task UpdateUser(User user)
    {
        // Only email and full_name update allowed yet!
        var payload = new
        {
            email = user.Email,
            full_name = user.FullName
        };

        var json = JsonConvert.SerializeObject(payload, _jsonSettings);
        var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

        var res = await _httpClient.PatchAsync($"/v1/user/{user.Id}", content);

        if (!res.IsSuccessStatusCode)
        {
            var err = JsonConvert.DeserializeObject<ErrorResponse>(await res.Content.ReadAsStringAsync(), _jsonSettings)!;
            throw new ResponseException(err);
        }
    }

    public async Task<CreditWalletResponse> CreditUserWallet(ulong userId, string currencyId, string amount)
    {
        var payload = new
        {
            currency_id = currencyId,
            amount
        };

        var json = JsonConvert.SerializeObject(payload, _jsonSettings);

        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var res = await _httpClient.PostAsync($"/v1/admin/users/{userId}/credit", content);
        var body = await res.Content.ReadAsStringAsync();

        if (res.IsSuccessStatusCode)
        {
            return JsonConvert.DeserializeObject<CreditWalletResponse>(body, _jsonSettings)!
                   ?? new CreditWalletResponse();
        }

        var err = JsonConvert.DeserializeObject<ErrorResponse>(body, _jsonSettings)!;
        throw new ResponseException(err);
    }

    // Optional helpers (minimal, non-breaking): wallet routes by walletId
    public async Task<AdminWalletResponse> GetWalletById(ulong walletId)
    {
        var res = await _httpClient.GetAsync($"/v1/wallet/{walletId}");
        var body = await res.Content.ReadAsStringAsync();

        if (res.IsSuccessStatusCode)
        {
            var jo = JObject.Parse(body);

            var assetsToken = (JToken?)jo["assets"] ?? jo["Assets"];

            var resp = new AdminWalletResponse
            {
                WalletId = jo["wallet_id"]?.ToString() ?? jo["walletId"]?.ToString() ?? jo["id"]?.ToString() ?? walletId.ToString(),
                TotalAssets = jo["total_assets"]?.ToObject<int>() ?? jo["totalAssets"]?.ToObject<int>() ?? 0,
                Assets = new List<WalletAsset>()
            };

            if (assetsToken is JArray ja)
            {
                foreach (var item in ja.OfType<JObject>())
                {
                    resp.Assets.Add(new WalletAsset
                    {
                        Id = item["id"]?.ToString() ?? string.Empty,
                        Currency = item["currency"]?.ToString() ?? item["name"]?.ToString() ?? string.Empty,
                        Symbol = item["symbol"]?.ToString() ?? string.Empty,
                        Amount = item["amount"]?.ToString() ?? "0",
                        Precision = item["precision"]?.ToObject<int>() ?? 0,
                        Price = item["price"]?.ToObject<decimal>() ?? 0m,
                        Type = item["type"]?.ToString() ?? string.Empty
                    });
                }
            }

            return resp;
        }

        var err = JsonConvert.DeserializeObject<ErrorResponse>(body, _jsonSettings)!;
        throw new ResponseException(err);
    }

    public async Task<AdminWalletHistoryResponse> GetWalletHistoryById(ulong walletId)
    {
        var res = await _httpClient.GetAsync($"/v1/wallet/{walletId}/history");
        var body = await res.Content.ReadAsStringAsync();

        if (res.IsSuccessStatusCode)
        {
            var root = JObject.Parse(body);

            var listToken = (JToken?)root["transactions"] ?? root["history"] ?? root["items"];
            if (listToken is null && root.First is not null && root.First is JProperty p && p.Value is JArray)
                listToken = p.Value;

            var resp = new AdminWalletHistoryResponse();

            if (listToken is JArray ja)
            {
                foreach (var t in ja)
                {
                    if (t is not JObject jo) continue;

                    var symbol = jo["symbol"]?.ToString()
                                 ?? jo.SelectToken("asset.symbol")?.ToString()
                                 ?? jo.SelectToken("currency.symbol")?.ToString()
                                 ?? string.Empty;

                    var direction = jo["direction"]?.ToString()
                                    ?? jo["type"]?.ToString()
                                    ?? jo["flow"]?.ToString()
                                    ?? string.Empty;

                    var amount = jo["amount"]?.ToString() ?? string.Empty;
                    var status = jo["status"]?.ToString() ?? string.Empty;

                    var dateToken = (JToken?)jo["created_at"] ?? jo["createdAt"] ?? jo["timestamp"] ?? jo["date"];
                    string dateStr;
                    if (dateToken is null)
                    {
                        dateStr = string.Empty;
                    }
                    else if (dateToken.Type == JTokenType.Integer)
                    {
                        dateStr = DateTimeOffset.FromUnixTimeMilliseconds(dateToken.Value<long>()).ToLocalTime().ToString("yyyy-MM-dd");
                    }
                    else
                    {
                        dateStr = dateToken.ToString();
                    }

                    resp.Transactions.Add(new WalletTransaction
                    {
                        Symbol = symbol,
                        Direction = direction,
                        Amount = amount,
                        Status = status,
                        Date = dateStr
                    });
                }
            }

            return resp;
        }

        var err = JsonConvert.DeserializeObject<ErrorResponse>(body, _jsonSettings)!;
        throw new ResponseException(err);
    }

    public void Dispose()
    {
        _httpClient.Dispose();
    }
}