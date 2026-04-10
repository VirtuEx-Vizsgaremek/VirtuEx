using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using VirtuExAdmin.Serializables;
using VirtuExAdmin.Util;
using Wpf.Ui;

namespace VirtuExAdmin.ViewModels.Pages;

public partial class DetailedCurrencyViewModel : ObservableObject
{
    private readonly Currency          _original;
    private readonly ApiClient         _api;
    private readonly INavigationService _navigationService;
    private readonly Func<Task>        _onSaved;

    [ObservableProperty] private ulong  _id;
    [ObservableProperty] private string _symbol        = string.Empty;
    [ObservableProperty] private string _name          = string.Empty;
    [ObservableProperty] private uint   _precision;
    [ObservableProperty] private string _updateFreqency = string.Empty;
    [ObservableProperty] private string _type          = string.Empty;

    public ObservableCollection<uint>   PrecisionOptions        { get; } = [0, 2, 4, 6, 8];
    public ObservableCollection<string> UpdateFrequencyOptions  { get; } =
        ["1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h", "1d", "5d", "1wk", "1mo", "3mo"];
    public ObservableCollection<string> CurrencyTypeOptions     { get; } =
        ["fiat", "crypto", "stock", "etf"];

    public DetailedCurrencyViewModel(Currency currency, ApiClient api, INavigationService navigationService, Func<Task> onSaved)
    {
        _original          = currency;
        _api               = api;
        _navigationService = navigationService;
        _onSaved           = onSaved;

        Id             = currency.Id;
        Symbol         = currency.Symbol;
        Name           = currency.Name;
        Precision      = currency.Precision;
        UpdateFreqency = currency.UpdateFreqency;
        Type           = currency.Type;
    }

    [RelayCommand]
    private void Cancel() {
        _navigationService.GoBack();
    }

    [RelayCommand]
    private void ResetFields()
    {
        // Write directly to backing fields and notify manually so PropertyChanged
        // always fires, even when the value is identical to the current one.
        _symbol         = _original.Symbol;
        _name           = _original.Name;
        _precision      = _original.Precision;
        _updateFreqency = _original.UpdateFreqency;
        _type           = _original.Type;

        OnPropertyChanged(nameof(Symbol));
        OnPropertyChanged(nameof(Name));
        OnPropertyChanged(nameof(Precision));
        OnPropertyChanged(nameof(UpdateFreqency));
        OnPropertyChanged(nameof(Type));
    }

    [RelayCommand]
    private async Task Save()
    {
        await _api.UpdateCurrency(Id, Symbol, Name, Precision, UpdateFreqency, Type);
        await _onSaved();
        _navigationService.GoBack();
    }
}
