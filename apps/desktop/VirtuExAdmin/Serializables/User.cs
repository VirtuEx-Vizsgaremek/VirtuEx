using VirtuExAdmin.Enums;
using Newtonsoft.Json;

namespace VirtuExAdmin.Serializables;

public class User {
    public          ulong      Id           { get; set; }
    public required string     FullName     { get; set; }
    public required string     Username     { get; set; }
    public          string?    Email        { get; set; }
    public          string?    Bio          { get; set; }
    public          string?    Avatar       { get; set; }
    public          ulong      Wallet       { get; set; }
    public          Permission Permissions  { get; set; }
    public          ulong?      Subscription { get; set; }
    public          bool       Activated    { get; set; }

    public string RegistrationDate { get; set; } = string.Empty;
    public string Role             { get; set; } = "user";
    public string Status           { get; set; } = "Active";
}