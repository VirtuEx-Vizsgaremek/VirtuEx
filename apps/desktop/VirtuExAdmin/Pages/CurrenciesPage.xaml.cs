using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using Microsoft.Extensions.DependencyInjection;
using VirtuExAdmin.ViewModels.Pages;

namespace VirtuExAdmin.Pages;

public partial class CurrenciesPage : Page {
    public CurrenciesPage() {
        InitializeComponent();
        
        var vm = App.GetRequiredService<CurrenciesPageViewModel>();

        DataContext =  vm;
        Loaded      += (_, _) => vm.LoadAsync();
    }
}