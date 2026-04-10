using Newtonsoft.Json;
using VirtuExAdmin.Util;

namespace VirtuExAdmin.Serializables;

public class AuditLog {
    public ulong Id   { get; set; }
    public ulong User { get; set; }
    
    public required LogData Data { get; set; }

    public class LogData {
        public int Action { get; set; }
        
        public ulong Amount { get; set; }
        public ulong Currency { get; set; }
    }
    
    [JsonConverter(typeof(UnixMillisConverter))]
    public DateTime CreatedAt { get; set; }
    [JsonConverter(typeof(UnixMillisConverter))]
    public DateTime UpdatedAt { get; set; }
}