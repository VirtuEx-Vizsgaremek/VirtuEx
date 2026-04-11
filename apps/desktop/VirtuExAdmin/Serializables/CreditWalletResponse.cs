using Newtonsoft.Json;

namespace VirtuExAdmin.Serializables;

public class CreditWalletResponse
{
    [JsonProperty("asset_id")]
    public string AssetId { get; set; } = string.Empty;

    [JsonProperty("wallet_id")]
    public string WalletId { get; set; } = string.Empty;

    [JsonProperty("currency_id")]
    public string CurrencyId { get; set; } = string.Empty;

    [JsonProperty("credited")]
    public string Credited { get; set; } = string.Empty;

    [JsonProperty("balance")]
    public string Balance { get; set; } = string.Empty;
}
