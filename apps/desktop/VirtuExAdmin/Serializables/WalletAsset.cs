namespace VirtuExAdmin.Serializables;

public class WalletAsset
{
    public string Id { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Amount { get; set; } = "0";
    public int Precision { get; set; }
    public decimal Price { get; set; }
    public string Type { get; set; } = string.Empty;
}
