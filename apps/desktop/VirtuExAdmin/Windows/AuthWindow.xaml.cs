using System.Windows;
using VirtuExAdmin.Util;

namespace VirtuExAdmin.Windows;

public partial class AuthWindow : Window {
    private ApiClient _apiClient;
    
    public AuthWindow() {
        InitializeComponent();

        _apiClient = ApiClient.Instance;
    }
    
    private async void Login_Click(object sender, RoutedEventArgs e) {
        var res = await _apiClient.Login(UsernameBox.Text, PasswordBox.Password);

        if (res.HasMfa) {
            LoginPanel.Visibility     = Visibility.Collapsed;
            TwoFactorPanel.Visibility = Visibility.Visible;
            return;
        }
        
        MessageBox.Show(res.Token, "It Works!!", MessageBoxButton.OK, MessageBoxImage.Information);
        // TODO: LOGIN!
    }
}