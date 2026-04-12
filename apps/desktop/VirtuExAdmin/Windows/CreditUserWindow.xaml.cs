using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Input;
using VirtuExAdmin.Serializables;
using VirtuExAdmin.Util;
using Wpf.Ui.Controls;

namespace VirtuExAdmin.Windows;

public partial class CreditUserWindow : FluentWindow
{
    private readonly ApiClient _apiClient;
    private readonly User _user;

    // TODO: replace with real currency selection when desktop exposes currencies in UI
    private const string DefaultCurrencyId = "USD";

    private bool _isSubmitting;

    public CreditUserWindow(ApiClient apiClient, User user)
    {
        _apiClient = apiClient;
        _user = user;

        InitializeComponent();

        TitleText.Text = "Add funds";
        SubtitleText.Text = $"Credit wallet for {_user.FullName} (@{_user.Username})";
    }

    private void AmountTextBox_PreviewTextInput(object sender, TextCompositionEventArgs e)
    {
        // numeric-only
        e.Handled = !Regex.IsMatch(e.Text, "^[0-9]+$");
    }

    private void Cancel_Click(object sender, RoutedEventArgs e)
    {
        DialogResult = false;
        Close();
    }

    private async void Submit_Click(object sender, RoutedEventArgs e)
    {
        if (_isSubmitting)
            return;

        var raw = AmountTextBox.Text?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(raw))
        {
            System.Windows.MessageBox.Show("Amount is required.", "Validation", System.Windows.MessageBoxButton.OK, System.Windows.MessageBoxImage.Warning);
            return;
        }

        if (!Regex.IsMatch(raw, "^[0-9]+$"))
        {
            System.Windows.MessageBox.Show("Amount must be a positive integer.", "Validation", System.Windows.MessageBoxButton.OK, System.Windows.MessageBoxImage.Warning);
            return;
        }

        if (!ulong.TryParse(raw, out var amount) || amount == 0)
        {
            System.Windows.MessageBox.Show("Amount must be greater than 0.", "Validation", System.Windows.MessageBoxButton.OK, System.Windows.MessageBoxImage.Warning);
            return;
        }

        try
        {
            SetSubmitting(true);

            await _apiClient.CreditUserWallet(_user.Id, DefaultCurrencyId, raw);

            // Success: close dialog
            DialogResult = true;
            Close();
        }
        catch (ResponseException ex)
        {
            System.Windows.MessageBox.Show($"API error while crediting funds: {ex.Message} (Status: {ex.StatusCode})",
                "Error", System.Windows.MessageBoxButton.OK, System.Windows.MessageBoxImage.Error);
        }
        catch (System.Exception ex)
        {
            System.Windows.MessageBox.Show($"Unexpected error while crediting funds: {ex.Message}",
                "Error", System.Windows.MessageBoxButton.OK, System.Windows.MessageBoxImage.Error);
        }
        finally
        {
            SetSubmitting(false);
        }
    }

    private void SetSubmitting(bool submitting)
    {
        _isSubmitting = submitting;
        SubmitButton.IsEnabled = !submitting;
        CancelButton.IsEnabled = !submitting;
        AmountTextBox.IsEnabled = !submitting;
    }
}
