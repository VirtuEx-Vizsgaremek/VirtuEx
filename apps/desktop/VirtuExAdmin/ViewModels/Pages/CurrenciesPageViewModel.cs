using System.Collections.ObjectModel;
using System.Windows;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using VirtuExAdmin.Pages;
using VirtuExAdmin.Serializables;
using VirtuExAdmin.Util;
using Wpf.Ui;

namespace VirtuExAdmin.ViewModels.Pages;

public partial class CurrenciesPageViewModel : ObservableObject {
    private readonly ApiClient              _api;
    private readonly INavigationService     _navigationService;
    private readonly CurrencyNavigationState _currencyState;

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

    [ObservableProperty]
    private string _pageInfo = string.Empty;

    [ObservableProperty]
    private string _paginationSummary = string.Empty;

    private int _totalPages;
    
    public ObservableCollection<int>    PageSizeOptions   { get; } = [10, 25, 50, 100];
    public ObservableCollection<string> TypeFilterOptions { get; } = ["All", "Fiat", "Crypto", "Stock", "ETF"];
    
    public CurrenciesPageViewModel(ApiClient api, INavigationService navigationService, CurrencyNavigationState currencyState) {
        _api           = api;
        _navigationService = navigationService;
        _currencyState = currencyState;
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

        _currencyState.ViewModel = new DetailedCurrencyViewModel(currency, _api, _navigationService, async () => {
            Currencies = await _api.Currencies();
            RefreshPage();
        });
        _navigationService.NavigateWithHierarchy(typeof(DetailedCurrencyPage));
    }
    
    [RelayCommand]
    private void ClearFilters() {
        SearchText = string.Empty;
        TypeFilter = "All";
    }

    private static readonly Dictionary<string, int> _typeOrder = new(StringComparer.OrdinalIgnoreCase) {
        { "stock",  0 },
        { "etf",    1 },
        { "crypto", 2 },
        { "fiat",   3 },
    };

    private void RefreshPage() {
        var filtered = Currencies!
            .Where(c =>
                (string.Equals(TypeFilter, "All") ||
                 string.Equals(c.Type,     TypeFilter, StringComparison.InvariantCultureIgnoreCase)) &&
                (string.IsNullOrWhiteSpace(SearchText)                             ||
                 c.Symbol.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ||
                 c.Name.Contains(SearchText,   StringComparison.OrdinalIgnoreCase)))
            .OrderBy(c => _typeOrder.TryGetValue(c.Type, out var o) ? o : 99)
            .ThenBy(c => c.Name)
            .ToList();

        _totalPages     = Math.Max(1, (int)Math.Ceiling(filtered.Count / (double)PageSize));
        PagedCurrencies = filtered.Skip((CurrentPage - 1) * PageSize).Take(PageSize).ToArray();

        var start = filtered.Count == 0 ? 0 : (CurrentPage - 1) * PageSize + 1;
        var end   = Math.Min(CurrentPage * PageSize, filtered.Count);
        PageInfo          = $"Page {CurrentPage} of {_totalPages}";
        PaginationSummary = $"Showing {start}–{end} of {filtered.Count}";

        FirstPageCommand.NotifyCanExecuteChanged();
        PrevPageCommand.NotifyCanExecuteChanged();
        NextPageCommand.NotifyCanExecuteChanged();
        LastPageCommand.NotifyCanExecuteChanged();
    }
}