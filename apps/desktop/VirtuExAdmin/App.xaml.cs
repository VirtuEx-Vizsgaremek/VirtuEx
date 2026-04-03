using System.Configuration;
using System.Data;
using System.Windows;
using System.Windows.Navigation;
using System.Windows.Threading;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using VirtuExAdmin.Pages;
using VirtuExAdmin.Util;
using VirtuExAdmin.ViewModels.Pages;
using VirtuExAdmin.ViewModels.Windows;
using VirtuExAdmin.Windows;
using Wpf.Ui;
using Wpf.Ui.Abstractions;
using Wpf.Ui.Appearance;
using Wpf.Ui.Controls;
using Wpf.Ui.DependencyInjection;
using MessageBox = System.Windows.MessageBox;
using MessageBoxButton = System.Windows.MessageBoxButton;
using NavigationService = Wpf.Ui.NavigationService;

namespace VirtuExAdmin;

/// <summary>
/// Interaction logic for App.xaml
/// </summary>
public partial class App : Application {
    private static readonly IHost _host = Host.CreateDefaultBuilder()
        .ConfigureAppConfiguration(c =>
        {
            _ = c.SetBasePath(AppContext.BaseDirectory);
        }).ConfigureServices((_2, services) => {
        // Singletons
        _ = services.AddSingleton<ApiClient>();
        _ = services.AddSingleton<UserService>();
        
        _ = services.AddNavigationViewPageProvider();
        _ = services.AddSingleton<INavigationService, NavigationService>();
        
        // ViewModels
        _ = services.AddTransient<AuthViewModel>();
        
        _ = services.AddTransient<AccountPageViewModel>();
        _ = services.AddTransient<CurrenciesPageViewModel>();
        _ = services.AddTransient<TransactionsPageViewModel>();
        
        // Windows
        _ = services.AddSingleton<AuthWindow>();
        _ = services.AddSingleton<MainWindow>();
        
        // Pages
        _ = services.AddScoped<AccountPage>();
        _ = services.AddScoped<AuditLogPage>();
        _ = services.AddScoped<CurrenciesPage>();
        _ = services.AddScoped<DetailedCurrencyPage>();
        _ = services.AddScoped<SettingsPage>();
        _ = services.AddScoped<TransactionsPage>();
        _ = services.AddScoped<UsersPage>();
        _ = services.AddScoped<WebPage>();
    }).Build();

    public App() {
        // TODO: Get User Auth
        Current.MainWindow = _host.Services.GetRequiredService<AuthWindow>();
        Current.MainWindow.Show();
    }
    
    public static T GetRequiredService<T>() where T : class {
        return _host.Services.GetRequiredService<T>();
    }
    
    private void OnStartup(object sender, StartupEventArgs e) {
        _host.Start();
    }

    private void OnExit(object sender, ExitEventArgs e) {
        _host.StopAsync().Wait();
        _host.Dispose();
    }
    
    private void OnDispatcherUnhandledException(object sender, DispatcherUnhandledExceptionEventArgs e) {
        var msgBox = new Wpf.Ui.Controls.MessageBox {
            Title   = "Very Big Hiba",
            Content = e.Exception,
            IsPrimaryButtonEnabled = true,
            IsCloseButtonEnabled = true,
            PrimaryButtonText = "Report",
            CloseButtonText = "Close",
        };
        _ = msgBox.ShowDialogAsync();
        
        e.Handled = true;
    }
}