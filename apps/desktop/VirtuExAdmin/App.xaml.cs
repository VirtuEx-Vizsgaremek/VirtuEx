using System.Configuration;
using System.Data;
using System.Windows;
using VirtuExAdmin.Util;
using VirtuExAdmin.Windows;
using Wpf.Ui.Appearance;
using Wpf.Ui.Controls;

namespace VirtuExAdmin;

/// <summary>
/// Interaction logic for App.xaml
/// </summary>
public partial class App : Application {
    public App() {
        // Init Api Client
        var apiClient = ApiClient.Instance;
        
        // TODO: Get User Auth
        Current.MainWindow = new MainWindow();
        Current.MainWindow.Show();
    }
}