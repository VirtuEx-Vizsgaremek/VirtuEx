using VirtuExAdmin.ViewModels.Pages;

namespace VirtuExAdmin.Util;

/// <summary>
/// Singleton that carries the ViewModel to be displayed on DetailedCurrencyPage.
/// Needed because WPF-UI caches the page instance, so the DataContext must be
/// refreshed via the Loaded event rather than relying on NavigateWithHierarchy.
/// </summary>
public class CurrencyNavigationState {
    public DetailedCurrencyViewModel? ViewModel { get; set; }
}
