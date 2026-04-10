using System.Windows;
using Microsoft.Extensions.DependencyInjection;
using VirtuExAdmin.Enums;
using VirtuExAdmin.Util;
using VirtuExAdmin.ViewModels.Windows;
using Wpf.Ui.Appearance;
using Wpf.Ui.Controls;
using MessageBox = System.Windows.MessageBox;
using MessageBoxButton = System.Windows.MessageBoxButton;

namespace VirtuExAdmin.Windows;

public partial class AuthWindow : FluentWindow {
    public AuthWindow(AuthViewModel vm) {
        SystemThemeWatcher.Watch(this, updateAccents: true);
        
        InitializeComponent();
        
        DataContext =  vm;
        Loaded      += (_, _) => vm.AutoLogin();
        
        vm.LoginSuccess += () => {
            Application.Current.MainWindow = App.GetRequiredService<MainWindow>();
            Application.Current.MainWindow.Show();
            
            Close();
        };

        vm.NotAdmin += () => {
            MessageBox.Show("You are not an admin, how the hell do you have access to this??????");
            Application.Current.Shutdown(-1);
        };
    }
}