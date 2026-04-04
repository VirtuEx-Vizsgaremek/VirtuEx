using System.Windows.Controls;
using VirtuExAdmin.ViewModels.Pages;

namespace VirtuExAdmin.Pages;

public partial class SettingsPage : Page {
    public SettingsPage() {
        InitializeComponent();
        
        var vm = App.GetRequiredService<SettingsViewModel>();
        DataContext = vm; 
    }
}