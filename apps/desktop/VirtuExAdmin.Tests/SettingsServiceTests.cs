using System.IO;
using System.Reflection;
using FluentAssertions;
using Newtonsoft.Json;
using VirtuExAdmin.Serializables;
using VirtuExAdmin.Util;
using Xunit;

namespace VirtuExAdmin.Tests;

/// <summary>
/// Overrides the private static path fields via reflection so tests write to
/// a temporary directory instead of %APPDATA%\VirtuExAdmin.
/// </summary>
public sealed class SettingsServiceTests : IDisposable
{
    private readonly string          _tempDir;
    private readonly string          _tempFile;
    private readonly SettingsService _sut;

    public SettingsServiceTests()
    {
        _tempDir  = Path.Combine(Path.GetTempPath(), "VirtuExAdminTests_" + Guid.NewGuid());
        _tempFile = Path.Combine(_tempDir, "settings.json");

        // Point the private static fields to our temp location via reflection
        SetStaticField("FolderPath", _tempDir);
        SetStaticField("FilePath",   _tempFile);

        _sut = new SettingsService();
    }

    public void Dispose()
    {
        if (Directory.Exists(_tempDir))
            Directory.Delete(_tempDir, recursive: true);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static void SetStaticField(string name, string value)
    {
        var field = typeof(SettingsService).GetField(
            name,
            BindingFlags.NonPublic | BindingFlags.Static)
            ?? throw new InvalidOperationException($"Field '{name}' not found on SettingsService.");

        field.SetValue(null, value);
    }

    // ── Tests ─────────────────────────────────────────────────────────────────

    [Fact]
    public void Save_then_Load_roundtrips_all_fields()
    {
        var settings = new AppSettings
        {
            Token            = "jwt-token-123",
            ThemeIndex       = 2,
            StartWithWindows = true,
            MinimizeToTray   = true
        };

        _sut.Save(settings);
        var loaded = _sut.Load();

        loaded.Token.Should().Be("jwt-token-123");
        loaded.ThemeIndex.Should().Be(2);
        loaded.StartWithWindows.Should().BeTrue();
        loaded.MinimizeToTray.Should().BeTrue();
    }

    [Fact]
    public void Load_returns_default_AppSettings_when_file_does_not_exist()
    {
        // No Save call — file never exists
        var result = _sut.Load();

        result.Should().NotBeNull();
        result.Token.Should().Be(new AppSettings().Token);
        result.ThemeIndex.Should().Be(new AppSettings().ThemeIndex);
    }

    [Fact]
    public void Load_returns_default_AppSettings_when_json_is_corrupt()
    {
        Directory.CreateDirectory(_tempDir);
        File.WriteAllText(_tempFile, "<<INVALID JSON>>");

        var result = _sut.Load();

        result.Should().NotBeNull();
        result.Token.Should().Be(new AppSettings().Token);
    }

    [Fact]
    public void Save_creates_directory_when_it_does_not_exist()
    {
        // Directory does not exist yet (we haven't created it)
        Directory.Exists(_tempDir).Should().BeFalse();

        _sut.Save(new AppSettings { Token = "abc" });

        Directory.Exists(_tempDir).Should().BeTrue();
        File.Exists(_tempFile).Should().BeTrue();
    }

    [Fact]
    public void Save_overwrites_existing_settings_file()
    {
        _sut.Save(new AppSettings { Token = "first" });
        _sut.Save(new AppSettings { Token = "second" });

        var loaded = _sut.Load();
        loaded.Token.Should().Be("second");
    }
}
