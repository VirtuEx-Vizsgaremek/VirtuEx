using System.Collections.Generic;

namespace VirtuExAdmin.Serializables;

public class AdminWalletHistoryResponse
{
    public List<WalletTransaction> Transactions { get; set; } = new();
}
