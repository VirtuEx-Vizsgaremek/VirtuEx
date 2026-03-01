using System.Configuration;
using System.Data;
using System.Windows;
using VirtuExAdmin.Windows;

namespace VirtuExAdmin;

/// <summary>
/// Interaction logic for App.xaml
/// </summary>
public partial class App : Application {
    public App() {
        Current.MainWindow = new AuthWindow();

        // Show main window.
        Current.MainWindow.Show();
    }
}