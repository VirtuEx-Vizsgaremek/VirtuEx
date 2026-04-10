using System.Windows.Controls;
using VirtuExAdmin.ViewModels.Pages;

namespace VirtuExAdmin.Pages;

public partial class AuditLogPage : Page {
    public AuditLogPage(AuditLogPageViewModel vm) {
        InitializeComponent();
        
        DataContext =  vm;
        Loaded      += async (_, _) => await vm.LoadAsync();
    }
}