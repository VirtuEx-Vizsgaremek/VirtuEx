using System;
using Newtonsoft.Json;
using VirtuExAdmin.Util;

namespace VirtuExAdmin.Serializables;

public class Subscription {
    public required string Id { get; set; }
    public required string PlanId { get; set; }
    public required string PlanName { get; set; }
    public int MonthlyAiCredits { get; set; }
    public int AssetsMax { get; set; }
    public bool StopLoss { get; set; }
    public bool RealTime { get; set; }
    public bool TradingView { get; set; }
    public decimal Price { get; set; }

    // Use string for dates to match User.RegistrationDate approach and avoid Json converter issues
    public string StartedAt { get; set; } = string.Empty;
    public string? ExpiresAt { get; set; }
}