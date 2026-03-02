using VirtuExAdmin.Enums;

namespace VirtuExAdmin.Serializables;

public class User {
    public          ulong      Id           { get; set; }
    public required string     FullName     { get; set; }
    public required string     Username     { get; set; }
    public required string     Email        { get; set; }
    public required string     Bio          { get; set; }
    public required string     Avatar       { get; set; }
    public          ulong      Wallet       { get; set; }
    public          Permission Permissions  { get; set; }
    public          ulong      Subscription { get; set; }
    public          bool       Activated    { get; set; }
}