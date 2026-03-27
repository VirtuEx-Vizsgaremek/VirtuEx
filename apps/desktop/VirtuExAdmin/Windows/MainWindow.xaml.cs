using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using Microsoft.Extensions.DependencyInjection;
using Wpf.Ui;
using Wpf.Ui.Abstractions;
using Wpf.Ui.Appearance;
using Wpf.Ui.Controls;

namespace VirtuExAdmin.Windows;

/// <summary>
/// Interaction logic for MainWindow.xaml
/// </summary>
public partial class MainWindow : FluentWindow {
    public MainWindow(INavigationService navigationService) {
        SystemThemeWatcher.Watch(this, updateAccents: true);
        
        InitializeComponent();
        
        var pageProvider = App.GetRequiredService<INavigationViewPageProvider>();

        DataContext = this;
        
        navigationService.SetNavigationControl(NavigationView);
        NavigationView.SetPageProviderService(pageProvider);
    }
}