using System.Windows.Controls;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using VirtuExAdmin.Util;
using VirtuExAdmin.ViewModels.Pages;

namespace VirtuExAdmin.Pages;

public partial class AccountPage : Page {
    public AccountPage() {
        InitializeComponent();

        var vm = App.Services.GetRequiredService<AccountPageViewModel>();

        DataContext =  vm;
        Loaded      += async (_, _) => await vm.LoadAsync();
    }
}