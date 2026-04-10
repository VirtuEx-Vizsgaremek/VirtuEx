using System.Windows;
using CommunityToolkit.Mvvm.ComponentModel;
using VirtuExAdmin.Serializables;
using VirtuExAdmin.Util;
using Wpf.Ui.Appearance;

namespace VirtuExAdmin.ViewModels.Pages;

public partial class SettingsViewModel : ObservableObject {
    private readonly SettingsService _settingsService;
    
    [ObservableProperty]
    private bool _startWithWindows = true;

    [ObservableProperty]
    private bool _minimizeToTray = false;
    
    [ObservableProperty]
    private int _themeIndex = 0;

    public SettingsViewModel() {
        ThemeIndex = 2;
    }
    
    public SettingsViewModel(SettingsService settingsService) {
        _settingsService = settingsService;
        
        var settings = _settingsService.Load();
        
        ThemeIndex       = settings.ThemeIndex;
        StartWithWindows = settings.StartWithWindows;
        MinimizeToTray   = settings.MinimizeToTray;
    }
    
    partial void OnThemeIndexChanged(int value) {
        Console.WriteLine($"Theme changed to {value}");
        
        switch (value) {
            case 0:
                ApplicationThemeManager.Apply(ApplicationTheme.Light);
                break;
            case 1:
                ApplicationThemeManager.Apply(ApplicationTheme.Dark);
                break;
            case 2:
                SystemThemeWatcher.Watch(Application.Current.MainWindow, updateAccents: true);
                break;
        }
    }
    
    protected override void OnPropertyChanged(System.ComponentModel.PropertyChangedEventArgs e) {
        base.OnPropertyChanged(e);
        
        var settings = _settingsService.Load();
        
        settings.ThemeIndex       = ThemeIndex;
        settings.StartWithWindows = StartWithWindows;
        settings.MinimizeToTray   = MinimizeToTray;
        
        _settingsService.Save(settings);
    }
}