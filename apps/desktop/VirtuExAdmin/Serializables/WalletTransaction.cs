namespace VirtuExAdmin.Serializables;

public class WalletTransaction
{
    public string Symbol { get; set; } = string.Empty;
    public string Direction { get; set; } = string.Empty; // IN / OUT
    public string Amount { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
}
