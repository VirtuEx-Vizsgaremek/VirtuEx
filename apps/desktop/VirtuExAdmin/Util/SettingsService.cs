using System.IO;
using Newtonsoft.Json;
using VirtuExAdmin.Serializables;

namespace VirtuExAdmin.Util;


public class SettingsService {
    private static readonly string FolderPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "VirtuExAdmin");
    private static readonly string FilePath = Path.Combine(FolderPath, "settings.json");

    public void Save(AppSettings settings) {
        if (!Directory.Exists(FolderPath)) Directory.CreateDirectory(FolderPath);
        
        var json = JsonConvert.SerializeObject(settings);
        File.WriteAllText(FilePath, json);
    }

    public AppSettings Load() {
        if (!File.Exists(FilePath)) return new AppSettings();

        try {
            var json = File.ReadAllText(FilePath);
            return JsonConvert.DeserializeObject<AppSettings>(json) ?? new AppSettings();
        } catch {
            return new AppSettings();
        }
    }
}