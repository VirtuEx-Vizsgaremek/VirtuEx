using Newtonsoft.Json;
using VirtuExAdmin.Util;

namespace VirtuExAdmin.Serializables;

public class Transaction {
    public string          Id             { get; set; } = string.Empty;
    public required TransactionUser User  { get; set; }
    public required string CurrencySymbol { get; set; }
    public required string CurrencyName   { get; set; }
    public required string Amount         { get; set; }
    public required string Direction      { get; set; }
    public required string Status         { get; set; }

    [JsonConverter(typeof(UnixMillisConverter))]
    public DateTime CreatedAt { get; set; }
    [JsonConverter(typeof(UnixMillisConverter))]
    public DateTime UpdatedAt { get; set; }
}

public class TransactionUser {
    public string          Id       { get; set; } = string.Empty;
    public required string Username { get; set; }
    public required string FullName { get; set; }
}
