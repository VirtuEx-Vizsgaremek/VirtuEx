using System.Net;
using System.Net.Http;
using System.Text;
using FluentAssertions;
using Moq;
using Newtonsoft.Json;
using VirtuExAdmin.Serializables;
using VirtuExAdmin.Util;
using VirtuExAdmin.ViewModels.Pages;
using Wpf.Ui;
using Xunit;

namespace VirtuExAdmin.Tests.ViewModels;

/// <summary>
/// Tests for <see cref="CurrenciesPageViewModel"/> — covers filtering,
/// pagination, sorting, and command CanExecute logic.
/// No live server required: responses are served by a <see cref="FakeHandler"/>.
/// </summary>
public class CurrenciesPageViewModelTests
{
    // ── Test data ─────────────────────────────────────────────────────────────

    private static Currency[] SampleCurrencies() =>
    [
        MakeCurrency("AAPL", "Apple Inc.",     "Stock"),
        MakeCurrency("MSFT", "Microsoft Corp.","Stock"),
        MakeCurrency("SPY",  "S&P 500 ETF",    "ETF"),
        MakeCurrency("BTC",  "Bitcoin",        "Crypto"),
        MakeCurrency("ETH",  "Ethereum",       "Crypto"),
        MakeCurrency("USD",  "US Dollar",      "Fiat"),
    ];

    private static Currency MakeCurrency(string symbol, string name, string type) => new()
    {
        Symbol         = symbol,
        Name           = name,
        Type           = type,
        UpdateFreqency = "1m",
    };

    // ── Infrastructure ────────────────────────────────────────────────────────

    /// <summary>
    /// Simple <see cref="HttpMessageHandler"/> that always returns the same
    /// JSON payload for GET /v1/currency.
    /// </summary>
    private sealed class FakeHandler(Currency[] currencies) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var json    = JsonConvert.SerializeObject(currencies);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content = content });
        }
    }

    private static async Task<CurrenciesPageViewModel> BuildVmAsync(Currency[]? currencies = null)
    {
        var data    = currencies ?? SampleCurrencies();
        var client  = new HttpClient(new FakeHandler(data)) { BaseAddress = new Uri("http://localhost") };
        var api     = new ApiClient(client);
        var navMock = new Mock<INavigationService>();
        var state   = new CurrencyNavigationState();

        var vm = new CurrenciesPageViewModel(api, navMock.Object, state);
        await vm.LoadAsync();
        return vm;
    }

    // ── Filter: TypeFilter ────────────────────────────────────────────────────

    [Fact]
    public async Task FilterByType_Stock_ShowsOnlyStocks()
    {
        var vm = await BuildVmAsync();
        vm.TypeFilter = "Stock";

        vm.PagedCurrencies!.Should().OnlyContain(c => c.Type == "Stock");
        vm.PagedCurrencies!.Length.Should().Be(2);
    }

    [Fact]
    public async Task FilterByType_Crypto_ShowsOnlyCrypto()
    {
        var vm = await BuildVmAsync();
        vm.TypeFilter = "Crypto";

        vm.PagedCurrencies!.Should().OnlyContain(c => c.Type == "Crypto");
        vm.PagedCurrencies!.Length.Should().Be(2);
    }

    [Fact]
    public async Task FilterByType_All_ShowsAllCurrencies()
    {
        var vm = await BuildVmAsync();
        vm.TypeFilter = "Crypto";  // first narrow it down
        vm.TypeFilter = "All";     // then reset

        vm.PagedCurrencies!.Length.Should().Be(6);
    }

    // ── Filter: SearchText ────────────────────────────────────────────────────

    [Fact]
    public async Task SearchBySymbol_ExactMatch_ReturnsSingleResult()
    {
        var vm = await BuildVmAsync();
        vm.SearchText = "AAPL";

        vm.PagedCurrencies!.Should().ContainSingle()
            .Which.Symbol.Should().Be("AAPL");
    }

    [Fact]
    public async Task SearchByName_CaseInsensitive_Matches()
    {
        var vm = await BuildVmAsync();
        vm.SearchText = "apple";

        vm.PagedCurrencies!.Should().ContainSingle()
            .Which.Symbol.Should().Be("AAPL");
    }

    [Fact]
    public async Task SearchWithNoResults_ReturnsEmptyPage()
    {
        var vm = await BuildVmAsync();
        vm.SearchText = "ZZZZZZ";

        vm.PagedCurrencies!.Should().BeEmpty();
    }

    [Fact]
    public async Task SearchByPartialSymbol_ReturnsMatchingResults()
    {
        var vm = await BuildVmAsync();
        vm.SearchText = "MS";   // matches MSFT

        vm.PagedCurrencies!.Should().ContainSingle()
            .Which.Symbol.Should().Be("MSFT");
    }

    // ── ClearFilters ──────────────────────────────────────────────────────────

    [Fact]
    public async Task ClearFilters_ResetsTypeAndSearchText()
    {
        var vm = await BuildVmAsync();
        vm.TypeFilter = "Crypto";
        vm.SearchText = "BTC";

        vm.ClearFiltersCommand.Execute(null);

        vm.TypeFilter.Should().Be("All");
        vm.SearchText.Should().Be(string.Empty);
        vm.PagedCurrencies!.Length.Should().Be(6);
    }

    // ── Pagination ────────────────────────────────────────────────────────────

    [Fact]
    public async Task Pagination_PageSizeTwo_FirstPageHasTwoItems()
    {
        var vm = await BuildVmAsync();
        vm.PageSize = 2;

        vm.PagedCurrencies!.Length.Should().Be(2);
        vm.PageInfo.Should().StartWith("Page 1 of");
    }

    [Fact]
    public async Task Pagination_NextPage_AdvancesToSecondPage()
    {
        var vm = await BuildVmAsync();
        vm.PageSize = 2;

        vm.NextPageCommand.Execute(null);

        vm.CurrentPage.Should().Be(2);
        vm.PagedCurrencies!.Length.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task Pagination_FirstPage_PrevAndFirstCommandsDisabled()
    {
        var vm = await BuildVmAsync();
        // At page 1 with all 6 items in one page (default page size 25)
        vm.CurrentPage.Should().Be(1);
        vm.PrevPageCommand.CanExecute(null).Should().BeFalse();
        vm.FirstPageCommand.CanExecute(null).Should().BeFalse();
    }

    [Fact]
    public async Task Pagination_LastPage_NextAndLastCommandsDisabled()
    {
        var vm = await BuildVmAsync();
        vm.PageSize = 2;
        vm.LastPageCommand.Execute(null);

        vm.NextPageCommand.CanExecute(null).Should().BeFalse();
        vm.LastPageCommand.CanExecute(null).Should().BeFalse();
    }

    [Fact]
    public async Task Pagination_PageInfo_FormattedCorrectly()
    {
        var vm = await BuildVmAsync();
        vm.PageSize = 2;

        vm.PageInfo.Should().Be("Page 1 of 3");
    }

    [Fact]
    public async Task Pagination_PaginationSummary_ShowsCorrectRange()
    {
        var vm = await BuildVmAsync();
        vm.PageSize = 2;

        vm.PaginationSummary.Should().Be("Showing 1–2 of 6");
    }

    // ── Sort order ────────────────────────────────────────────────────────────

    [Fact]
    public async Task SortOrder_StocksFirstThenEtfThenCryptoThenFiat()
    {
        var vm = await BuildVmAsync();

        var types = vm.PagedCurrencies!.Select(c => c.Type).ToList();
        var firstStock  = types.IndexOf("Stock");
        var firstEtf    = types.IndexOf("ETF");
        var firstCrypto = types.IndexOf("Crypto");
        var firstFiat   = types.IndexOf("Fiat");

        firstStock.Should().BeLessThan(firstEtf);
        firstEtf.Should().BeLessThan(firstCrypto);
        firstCrypto.Should().BeLessThan(firstFiat);
    }
}
