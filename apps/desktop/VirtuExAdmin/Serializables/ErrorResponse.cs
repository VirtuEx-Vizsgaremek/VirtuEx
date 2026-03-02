namespace VirtuExAdmin.Serializables;

public class ErrorResponse {
    public int Error { get; set; }
    public required string Message { get; set; }
}