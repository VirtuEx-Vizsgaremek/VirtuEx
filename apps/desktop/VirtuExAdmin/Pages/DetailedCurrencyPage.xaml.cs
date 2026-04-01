using System.Windows.Controls;
using VirtuExAdmin.Util;

namespace VirtuExAdmin.Pages;

public partial class DetailedCurrencyPage : Page {
    public DetailedCurrencyPage(CurrencyNavigationState state) {
        InitializeComponent();
        Loaded += (_, _) => DataContext = state.ViewModel;
    }
}