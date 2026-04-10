using System.Windows.Controls;
using VirtuExAdmin.ViewModels.Pages;

namespace VirtuExAdmin.Pages;

public partial class TransactionsPage : Page {
    public TransactionsPage() {
        InitializeComponent();
        var vm = App.GetRequiredService<TransactionsPageViewModel>();
        DataContext = vm;
        Loaded += async (_, _) => await vm.LoadAsync();
    }
}