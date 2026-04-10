using System.Windows;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using VirtuExAdmin.Enums;
using VirtuExAdmin.Util;

namespace VirtuExAdmin.ViewModels.Windows;

public partial class AuthViewModel : ObservableObject {
    private readonly ApiClient       _api;
    private readonly SettingsService _settingsService;
    
    [ObservableProperty] private string _email    = "admin@example.com";
    [ObservableProperty] private string _password = "SecurePassword123";
    [ObservableProperty] private string _mfa      = "";
    
    [ObservableProperty] private bool   _showMfa;
    
    [ObservableProperty] private bool   _rememberMe;
    
    public event Action? LoginSuccess;
    public event Action? NotAdmin;
    
    public AuthViewModel(ApiClient api, SettingsService settingsService) {
        _api = api;
        _settingsService = settingsService;
    }

    public AuthViewModel() { }

    public async void AutoLogin() {
        var settings = _settingsService.Load();
        if (settings.Token is not { Length: > 0 }) return;
        
        _api.Token = settings.Token;
        
        Console.WriteLine($"Token loaded from settings {settings.Token}");
            
        var user = await _api.User();
            
        Console.WriteLine($"{user.FullName}");
                
        if (user.Permissions.HasFlag(Permission.Admin))
            LoginSuccess?.Invoke();
        else
            NotAdmin?.Invoke();
    }
    
    [RelayCommand]
    private async Task Login() {
        try
        {
            var res = await _api.Login(Email, Password);

            if (res.HasMfa) { ShowMfa = true; return; }

            _api.Token = res.Token;
            var user = await _api.User();

            if (user.Permissions.HasFlag(Permission.Admin)) {
                LoginSuccess?.Invoke();

                if (RememberMe) {
                    var settings = _settingsService.Load();
                    settings.Token = res.Token;
                    _settingsService.Save(settings);
                }
            } else
                NotAdmin?.Invoke();
        } catch (ResponseException err) {
            var msgBox = new Wpf.Ui.Controls.MessageBox {
                Title   = err.StatusCode.ToString(),
                Content = err.Message,
            };
            _ = msgBox.ShowDialogAsync();
        }
    }
}