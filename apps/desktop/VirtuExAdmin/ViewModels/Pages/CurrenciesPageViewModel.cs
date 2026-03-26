using System.Collections.ObjectModel;
using System.Windows;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using VirtuExAdmin.Pages;
using VirtuExAdmin.Serializables;
using VirtuExAdmin.Util;
using Wpf.Ui;
using NavigationService = System.Windows.Navigation.NavigationService;

namespace VirtuExAdmin.ViewModels.Pages;

public partial class CurrenciesPageViewModel : ObservableObject {
    private readonly ApiClient   _api;
    private readonly INavigationService  _navigationService; 

    [ObservableProperty]
    private Currency[]? _currencies;
    [ObservableProperty]
    private Currency[]? _pagedCurrencies;
    [ObservableProperty]
    private Currency? _selectedCurrency;
    
    [ObservableProperty]
    private int _pageSize = 25;
    [ObservableProperty]
    private int _currentPage = 1;
    
    [ObservableProperty]
    private string _typeFilter = "All";
    
    [ObservableProperty]
    private string _searchText = "";
    
    private int _totalPages;
    
    public ObservableCollection<int>    PageSizeOptions   { get; } = [10, 25, 50, 100];
    public ObservableCollection<string> TypeFilterOptions { get; } = ["All", "Fiat", "Crypto", "Stock", "ETF"];
    
    public CurrenciesPageViewModel(ApiClient api, INavigationService navigationService) {
        _api = api;
        _navigationService = navigationService;
    }
    
    public async Task LoadAsync() {
        Currencies = await _api.Currencies();
        RefreshPage();
        
        PropertyChanged += (_, e) => {
            switch (e.PropertyName) {
                case nameof(SearchText):
                case nameof(TypeFilter):
                case nameof(PageSize):
                    CurrentPage = 1;
                    RefreshPage();
                    break;
                case nameof(CurrentPage):
                    RefreshPage();
                    break;
            }
        };
    }
    
    [RelayCommand(CanExecute = nameof(CanGoFirst))]
    private void FirstPage() => CurrentPage = 1;
    private bool CanGoFirst() => CurrentPage > 1;

    [RelayCommand(CanExecute = nameof(CanGoPrev))]
    private void PrevPage() => CurrentPage--;
    private bool CanGoPrev() => CurrentPage > 1;

    [RelayCommand(CanExecute = nameof(CanGoNext))]
    private void NextPage() => CurrentPage++;
    private bool CanGoNext() => CurrentPage < _totalPages;

    [RelayCommand(CanExecute = nameof(CanGoLast))]
    private void LastPage() => CurrentPage = _totalPages;
    private bool CanGoLast() => CurrentPage < _totalPages;
    
    [RelayCommand]
    private void RowDoubleClick(Currency? currency) {
        if (currency is null) return;
        var page = new DetailedCurrencyPage();
        _navigationService.Navigate(typeof(CurrenciesPage), page);
    }
    
    [RelayCommand]
    private void ClearFilters() {
        SearchText = string.Empty;
        TypeFilter = "All";
    }

    private void RefreshPage() {
        var f = Currencies!
            .Where(c =>
                (string.Equals(TypeFilter, "All") ||
                 string.Equals(c.Type,     TypeFilter, StringComparison.InvariantCultureIgnoreCase)) &&
                (string.IsNullOrWhiteSpace(SearchText)                             ||
                 c.Symbol.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ||
                 c.Name.Contains(SearchText, StringComparison.OrdinalIgnoreCase))).Skip((CurrentPage - 1) * PageSize)
            .Take(PageSize).ToList();
        PagedCurrencies = f.ToArray();
        _totalPages = Math.Max(1, (int)Math.Ceiling(f.Count / (double)PageSize));
    }
}