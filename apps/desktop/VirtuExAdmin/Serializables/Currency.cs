using Newtonsoft.Json;
using VirtuExAdmin.Util;

namespace VirtuExAdmin.Serializables;

public class Currency {
    public          ulong  Id             { get; set; }
    public required string Symbol         { get; set; }
    public required string Name           { get; set; }
    public          uint   Precision      { get; set; }
    public required string UpdateFreqency { get; set; }
    public required string Type           { get; set; }
    
    [JsonConverter(typeof(UnixMillisConverter))]
    public DateTime CreatedAt { get; set; }
    [JsonConverter(typeof(UnixMillisConverter))]
    public DateTime UpdatedAt { get; set; }
}