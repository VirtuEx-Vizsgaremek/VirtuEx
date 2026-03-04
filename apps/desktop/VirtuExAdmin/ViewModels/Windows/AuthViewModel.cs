using System.Windows;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using VirtuExAdmin.Enums;
using VirtuExAdmin.Util;

namespace VirtuExAdmin.ViewModels.Windows;

public partial class AuthViewModel : ObservableObject {
    private readonly ApiClient   _api;
    
    [ObservableProperty] private string _email    = "admin@example.com";
    [ObservableProperty] private string _password = "SecurePassword123";
    [ObservableProperty] private string _mfa      = "";
    
    [ObservableProperty] private bool   _showMfa;
    
    public event Action? LoginSuccess;
    public event Action? NotAdmin;
    
    public AuthViewModel(ApiClient api) {
        _api = api;
    }
    
    [RelayCommand]
    private async Task Login() {
        try
        {
            var res = await _api.Login(Email, Password);

            if (res.HasMfa) { ShowMfa = true; return; }

            _api.Token = res.Token;
            var user = await _api.User();
            
            if (user.Permissions.HasFlag(Permission.Admin))
                LoginSuccess?.Invoke();
            else
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