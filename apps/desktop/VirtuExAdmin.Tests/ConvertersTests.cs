using System.Globalization;
using System.Windows;
using FluentAssertions;
using Newtonsoft.Json;
using VirtuExAdmin.Util;
using Xunit;

namespace VirtuExAdmin.Tests;

// ── BoolToVisibilityConverter ─────────────────────────────────────────────────

public class BoolToVisibilityConverterTests
{
    private readonly BoolToVisibilityConverter _sut = new();

    [Fact]
    public void Convert_True_NoParameter_ReturnsVisible()
    {
        var result = _sut.Convert(true, typeof(Visibility), null!, CultureInfo.InvariantCulture);
        result.Should().Be(Visibility.Visible);
    }

    [Fact]
    public void Convert_False_NoParameter_ReturnsCollapsed()
    {
        var result = _sut.Convert(false, typeof(Visibility), null!, CultureInfo.InvariantCulture);
        result.Should().Be(Visibility.Collapsed);
    }

    [Fact]
    public void Convert_True_InverseParameter_ReturnsCollapsed()
    {
        var result = _sut.Convert(true, typeof(Visibility), "Inverse", CultureInfo.InvariantCulture);
        result.Should().Be(Visibility.Collapsed);
    }

    [Fact]
    public void Convert_False_InverseParameter_ReturnsVisible()
    {
        var result = _sut.Convert(false, typeof(Visibility), "Inverse", CultureInfo.InvariantCulture);
        result.Should().Be(Visibility.Visible);
    }

    [Fact]
    public void ConvertBack_Visible_ReturnsTrue()
    {
        var result = _sut.ConvertBack(Visibility.Visible, typeof(bool), null!, CultureInfo.InvariantCulture);
        result.Should().Be(true);
    }

    [Fact]
    public void ConvertBack_Collapsed_ReturnsFalse()
    {
        var result = _sut.ConvertBack(Visibility.Collapsed, typeof(bool), null!, CultureInfo.InvariantCulture);
        result.Should().Be(false);
    }
}

// ── NullToVisibilityConverter ─────────────────────────────────────────────────

public class NullToVisibilityConverterTests
{
    private readonly NullToVisibilityConverter _sut = new();

    [Fact]
    public void Convert_Null_NoParameter_ReturnsCollapsed()
    {
        var result = _sut.Convert(null!, typeof(Visibility), null!, CultureInfo.InvariantCulture);
        result.Should().Be(Visibility.Collapsed);
    }

    [Fact]
    public void Convert_NonNull_NoParameter_ReturnsVisible()
    {
        var result = _sut.Convert("hello", typeof(Visibility), null!, CultureInfo.InvariantCulture);
        result.Should().Be(Visibility.Visible);
    }

    [Fact]
    public void Convert_Null_InverseParameter_ReturnsVisible()
    {
        var result = _sut.Convert(null!, typeof(Visibility), "Inverse", CultureInfo.InvariantCulture);
        result.Should().Be(Visibility.Visible);
    }

    [Fact]
    public void Convert_NonNull_InverseParameter_ReturnsCollapsed()
    {
        var result = _sut.Convert("hello", typeof(Visibility), "Inverse", CultureInfo.InvariantCulture);
        result.Should().Be(Visibility.Collapsed);
    }

    [Fact]
    public void Convert_Zero_NoParameter_ReturnsVisible()
    {
        // 0 is not null — should be treated as non-null
        var result = _sut.Convert(0, typeof(Visibility), null!, CultureInfo.InvariantCulture);
        result.Should().Be(Visibility.Visible);
    }
}

// ── UnixMillisConverter ───────────────────────────────────────────────────────

public class UnixMillisConverterTests
{
    private readonly JsonSerializerSettings _settings = new()
    {
        Converters = { new UnixMillisConverter() }
    };

    private record Wrapper([property: JsonConverter(typeof(UnixMillisConverter))] DateTime Ts);

    [Fact]
    public void Roundtrip_preserves_DateTime_to_millisecond_precision()
    {
        var original = new DateTime(2024, 6, 15, 12, 30, 45, DateTimeKind.Utc);
        var json     = JsonConvert.SerializeObject(new Wrapper(original), _settings);
        var restored = JsonConvert.DeserializeObject<Wrapper>(json, _settings)!;

        restored.Ts.Should().BeCloseTo(original, TimeSpan.FromMilliseconds(1));
    }

    [Fact]
    public void Deserialize_known_epoch_ms_to_correct_DateTime()
    {
        // 0 ms = 1970-01-01 00:00:00 UTC
        const string json = """{"Ts":0}""";
        var result = JsonConvert.DeserializeObject<Wrapper>(json, _settings)!;

        result.Ts.Should().Be(new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc));
    }
}
