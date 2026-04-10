using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Windows.Data;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using VirtuExAdmin.Serializables;
using VirtuExAdmin.Util;

namespace VirtuExAdmin.ViewModels.Pages;

public partial class TransactionsPageViewModel : ObservableObject {
    private readonly ApiClient _api;
    private List<Transaction> _all = [];
    private readonly ObservableCollection<Transaction> _paged = [];

    public ICollectionView TransactionsView { get; }

    [ObservableProperty] private string _searchText       = string.Empty;
    [ObservableProperty] private string _statusFilter     = "All";
    [ObservableProperty] private string _directionFilter  = "All";
    [ObservableProperty] private bool   _groupByUser      = false;
    [ObservableProperty] private int    _pageSize         = 25;
    [ObservableProperty] private int    _currentPage      = 1;
    [ObservableProperty] private string _pageInfo         = string.Empty;
    [ObservableProperty] private string _paginationSummary = string.Empty;

    private int _totalPages;

    public ObservableCollection<string> StatusFilterOptions    { get; } = ["All", "Pending", "Completed", "Failed"];
    public ObservableCollection<string> DirectionFilterOptions { get; } = ["All", "In", "Out"];
    public ObservableCollection<int>    PageSizeOptions        { get; } = [10, 25, 50, 100];

    public TransactionsPageViewModel(ApiClient api) {
        _api = api;
        TransactionsView = CollectionViewSource.GetDefaultView(_paged);
    }

    public async Task LoadAsync() {
        var transactions = await _api.Transactions();
        _all = [.. transactions];
        RefreshPage();

        PropertyChanged += (_, e) => {
            switch (e.PropertyName) {
                case nameof(SearchText):
                case nameof(StatusFilter):
                case nameof(DirectionFilter):
                case nameof(PageSize):
                    CurrentPage = 1;
                    RefreshPage();
                    break;
                case nameof(CurrentPage):
                    RefreshPage();
                    break;
                case nameof(GroupByUser):
                    ApplyGrouping();
                    break;
            }
        };
    }

    [RelayCommand]
    private async Task Refresh() {
        var transactions = await _api.Transactions();
        _all = [.. transactions];
        CurrentPage = 1;
        RefreshPage();
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
    private void ClearFilters() {
        SearchText     = string.Empty;
        StatusFilter   = "All";
        DirectionFilter = "All";
    }

    private bool FilterRow(Transaction tx) {
        if (!string.Equals(StatusFilter, "All") &&
            !string.Equals(tx.Status, StatusFilter, StringComparison.OrdinalIgnoreCase))
            return false;

        if (!string.Equals(DirectionFilter, "All") &&
            !string.Equals(tx.Direction, DirectionFilter, StringComparison.OrdinalIgnoreCase))
            return false;

        if (!string.IsNullOrWhiteSpace(SearchText)) {
            var s = SearchText;
            return tx.User.Username.Contains(s,  StringComparison.OrdinalIgnoreCase) ||
                   tx.User.FullName.Contains(s,  StringComparison.OrdinalIgnoreCase) ||
                   tx.CurrencySymbol.Contains(s, StringComparison.OrdinalIgnoreCase) ||
                   tx.CurrencyName.Contains(s,   StringComparison.OrdinalIgnoreCase) ||
                   tx.Status.Contains(s,         StringComparison.OrdinalIgnoreCase) ||
                   tx.Direction.Contains(s,      StringComparison.OrdinalIgnoreCase) ||
                   tx.Amount.Contains(s,         StringComparison.OrdinalIgnoreCase);
        }

        return true;
    }

    private void ApplyGrouping() {
        TransactionsView.GroupDescriptions.Clear();
        if (GroupByUser)
            TransactionsView.GroupDescriptions.Add(
                new PropertyGroupDescription(nameof(Transaction.User) + "." + nameof(TransactionUser.Username)));
    }

    private void RefreshPage() {
        var filtered = _all.Where(FilterRow).ToList();

        _totalPages = Math.Max(1, (int)Math.Ceiling(filtered.Count / (double)PageSize));

        _paged.Clear();
        foreach (var tx in filtered.Skip((CurrentPage - 1) * PageSize).Take(PageSize))
            _paged.Add(tx);

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
