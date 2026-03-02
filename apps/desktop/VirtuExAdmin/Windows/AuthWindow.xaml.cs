using System.Windows;
using VirtuExAdmin.Enums;
using VirtuExAdmin.Util;
using Wpf.Ui.Controls;
using MessageBox = System.Windows.MessageBox;
using MessageBoxButton = System.Windows.MessageBoxButton;

namespace VirtuExAdmin.Windows;

public partial class AuthWindow : FluentWindow {
    public AuthWindow() {
        InitializeComponent();
    }
    
    private async void Login_Click(object sender, RoutedEventArgs e) {
        try {
            var res = await ApiClient.Instance.Login(EmailBox.Text, PasswordBox.Password);

            if (res.HasMfa) {
                LoginPanel.Visibility     = Visibility.Collapsed;
                TwoFactorPanel.Visibility = Visibility.Visible;
                return;
            }

            // Set the token.
            ApiClient.Instance.Token = res.Token;
            
            // Check if the user is an admin.
            var user = await ApiClient.Instance.User();

            if (user.Permissions.HasFlag(Permission.Admin)) {
                MessageBox.Show($"You are now logged in as {user.Username}.");
                
                Application.Current.MainWindow = new MainWindow();
                Application.Current.MainWindow.Show();
                this.Close();
            } else {
                MessageBox.Show($"You are not an admin, how the hell do you have access to this??????");
                
                MessageBox.Show("You're computer is blow up in 3...");
                MessageBox.Show("You're computer is blow up in 2...");
                MessageBox.Show("You're computer is blow up in 1...");
                
                Application.Current.Shutdown(-1);
            }
        } catch (ResponseException err) {
            MessageBox.Show(err.Message, err.StatusCode.ToString(), MessageBoxButton.OK, MessageBoxImage.Error);
        } catch (Exception err) {
            MessageBox.Show(err.Message, "Unknown Error!", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }
}