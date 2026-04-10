namespace VirtuExAdmin.Serializables;

public class AppSettings {
    public int  ThemeIndex       { get; set; } = 2;
    public bool StartWithWindows { get; set; } = true;
    public bool MinimizeToTray   { get; set; } = false;

    public string Token { get; set; } = "";
}