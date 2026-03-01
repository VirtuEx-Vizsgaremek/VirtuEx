using Newtonsoft.Json;

namespace VirtuExAdmin.Serializables;

public class LoginResponse {
    [JsonProperty(PropertyName = "jwt")]
    public required string Token { get; set; }
    
    [JsonProperty(PropertyName = "mfa")]
    public bool HasMfa { get; set; }
    
    [JsonProperty(PropertyName = "expires")]
    public ulong Expires { get; set; }
}