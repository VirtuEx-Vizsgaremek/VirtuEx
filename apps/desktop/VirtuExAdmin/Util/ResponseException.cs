using VirtuExAdmin.Serializables;

namespace VirtuExAdmin.Util;

public class ResponseException(ErrorResponse response) : Exception(response.Message) {
    public int StatusCode { get; } = response.Error;
}