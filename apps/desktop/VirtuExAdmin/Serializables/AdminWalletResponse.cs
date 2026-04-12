using System.Collections.Generic;

namespace VirtuExAdmin.Serializables;

public class AdminWalletResponse
{
    public string WalletId { get; set; } = string.Empty;
    public int TotalAssets { get; set; }
    public List<WalletAsset> Assets { get; set; } = new();
}
