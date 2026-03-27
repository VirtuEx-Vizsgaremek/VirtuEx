using System.Configuration;
using System.Data;
using System.Windows;
using Microsoft.Extensions.DependencyInjection;
using VirtuExAdmin.Util;
using VirtuExAdmin.ViewModels.Pages;
using VirtuExAdmin.ViewModels.Windows;
using VirtuExAdmin.Windows;
using Wpf.Ui.Appearance;
using Wpf.Ui.Controls;

namespace VirtuExAdmin;

/// <summary>
/// Interaction logic for App.xaml
/// </summary>
public partial class App : Application {
    public static IServiceProvider Services { get; private set; }
    public static ApiClient ApiClient { get; private set; } = new ApiClient();


    public App() {
        var collection = new ServiceCollection();
        
        // Singletons
        collection.AddSingleton<ApiClient>();
        collection.AddSingleton<UserService>();
        
        // ViewModels
        collection.AddTransient<AuthViewModel>();
        
        collection.AddTransient<AccountPageViewModel>();
        collection.AddTransient<CurrenciesPageViewModel>();
        
        // Windows
        collection.AddSingleton<AuthWindow>();
        collection.AddSingleton<MainWindow>();
        
        Services = collection.BuildServiceProvider();
        
        // TODO: Get User Auth
        Current.MainWindow = Services.GetRequiredService<AuthWindow>();
        Current.MainWindow.Show();
    }
}