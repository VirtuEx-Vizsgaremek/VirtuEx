using System;
using System.Collections.ObjectModel;
using System.Globalization;
using System.Threading.Tasks;
using System.Windows;
using VirtuExAdmin.Serializables;
using VirtuExAdmin.Util;

namespace VirtuExAdmin.Windows;

public partial class UserWalletWindow : Wpf.Ui.Controls.FluentWindow
{
    private readonly ApiClient _api;
    private readonly ulong _userId;

    public ObservableCollection<AssetRow> AssetRows { get; } = new();
    public ObservableCollection<WalletTransaction> Transactions { get; } = new();

    public UserWalletWindow(ApiClient apiClient, ulong userId, string displayName)
    {
        _api = apiClient;
        _userId = userId;

        InitializeComponent();

        TitleText.Text = $"Wallet — {displayName}";
        LoadingText.Text = "Loading wallet…";

        AssetsGrid.ItemsSource = AssetRows;
        HistoryGrid.ItemsSource = Transactions;

        Loaded += UserWalletWindow_Loaded;
    }

    private async void UserWalletWindow_Loaded(object sender, RoutedEventArgs e)
    {
        await LoadAsync();
    }

    private async Task LoadAsync()
    {
        try
        {
            LoadingText.Text = "Loading wallet…";

            var walletTask = _api.GetUserWallet(_userId);
            var historyTask = _api.GetUserWalletHistory(_userId);

            await Task.WhenAll(walletTask, historyTask);

            var wallet = await walletTask;
            var history = await historyTask;

            FillAssets(wallet);
            FillHistory(history);

            LoadingText.Text = string.Empty;
        }
        catch (ResponseException ex)
        {
            LoadingText.Text = string.Empty;
            System.Windows.MessageBox.Show(
                $"API error while loading wallet: {ex.Message} (Status: {ex.StatusCode})",
                "API Error",
                System.Windows.MessageBoxButton.OK,
                System.Windows.MessageBoxImage.Error);
        }
        catch (Exception ex)
        {
            LoadingText.Text = string.Empty;
            System.Windows.MessageBox.Show(
                $"Unexpected error while loading wallet: {ex.Message}",
                "Error",
                System.Windows.MessageBoxButton.OK,
                System.Windows.MessageBoxImage.Error);
        }
    }

    private void FillAssets(AdminWalletResponse wallet)
    {
        AssetRows.Clear();

        decimal estimated = 0m;

        foreach (var a in wallet.Assets)
        {
            var normalized = NormalizeAmount(a.Amount, a.Precision);
            var valueUsd = normalized * a.Price;
            estimated += valueUsd;

            AssetRows.Add(new AssetRow
            {
                Asset = string.IsNullOrWhiteSpace(a.Currency) ? a.Symbol : $"{a.Symbol} — {a.Currency}",
                PriceUsd = a.Price.ToString("C", CultureInfo.GetCultureInfo("en-US")),
                Balance = $"{normalized:N4} {a.Symbol}",
                ValueUsd = valueUsd.ToString("C", CultureInfo.GetCultureInfo("en-US"))
            });
        }

        EstimatedBalanceText.Text = estimated.ToString("C", CultureInfo.GetCultureInfo("en-US"));
    }

    private void FillHistory(AdminWalletHistoryResponse history)
    {
        Transactions.Clear();
        foreach (var t in history.Transactions)
            Transactions.Add(t);
    }

    private static decimal NormalizeAmount(string amountString, int precision)
    {
        try
        {
            if (!decimal.TryParse(amountString, NumberStyles.Any, CultureInfo.InvariantCulture, out var raw))
                return 0m;

            var divisor = (decimal)Math.Pow(10, Math.Max(0, precision));
            if (divisor == 0m) return 0m;

            return raw / divisor;
        }
        catch
        {
            return 0m;
        }
    }

    private void Close_Click(object sender, RoutedEventArgs e)
    {
        Close();
    }

    public class AssetRow
    {
        public string Asset { get; set; } = string.Empty;
        public string PriceUsd { get; set; } = string.Empty;
        public string Balance { get; set; } = string.Empty;
        public string ValueUsd { get; set; } = string.Empty;
    }
}
