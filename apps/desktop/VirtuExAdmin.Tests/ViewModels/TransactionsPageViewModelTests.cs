using System.Net;
using System.Net.Http;
using System.Text;
using FluentAssertions;
using Newtonsoft.Json;
using VirtuExAdmin.Serializables;
using VirtuExAdmin.Util;
using VirtuExAdmin.ViewModels.Pages;
using Xunit;

namespace VirtuExAdmin.Tests.ViewModels;

/// <summary>
/// Tests for <see cref="TransactionsPageViewModel"/> — covers filter row logic
/// and pagination.
///
/// NOTE: <c>CollectionViewSource.GetDefaultView</c> requires a WPF STA thread.
/// Every test that instantiates the ViewModel is dispatched via
/// <see cref="RunOnSta"/> to satisfy that requirement.
/// </summary>
public class TransactionsPageViewModelTests
{
    // ── Helpers ───────────────────────────────────────────────────────────────

    /// <summary>Runs <paramref name="action"/> on a dedicated STA thread.</summary>
    private static void RunOnSta(Action action)
    {
        Exception? caught = null;
        var thread = new Thread(() =>
        {
            try { action(); }
            catch (Exception ex) { caught = ex; }
        });
        thread.SetApartmentState(ApartmentState.STA);
        thread.Start();
        thread.Join();
        if (caught is not null) throw caught;
    }

    private static async Task RunOnStaAsync(Func<Task> action)
    {
        Exception? caught = null;
        var thread = new Thread(() =>
        {
            try { action().GetAwaiter().GetResult(); }
            catch (Exception ex) { caught = ex; }
        });
        thread.SetApartmentState(ApartmentState.STA);
        thread.Start();
        thread.Join();
        if (caught is not null) throw caught;
    }

    // ── Test data ─────────────────────────────────────────────────────────────

    private static Transaction[] SampleTransactions() =>
    [
        MakeTx("alice",   "Alice Smith",  "BTC", "Bitcoin",  "100",  "In",  "Completed"),
        MakeTx("alice",   "Alice Smith",  "USD", "US Dollar","200",  "Out", "Completed"),
        MakeTx("bob",     "Bob Jones",    "ETH", "Ethereum", "50",   "In",  "Pending"),
        MakeTx("bob",     "Bob Jones",    "USD", "US Dollar","75",   "Out", "Failed"),
        MakeTx("charlie", "Charlie Brown","AAPL","Apple Inc.","10",  "In",  "Completed"),
    ];

    private static Transaction MakeTx(
        string username, string fullName,
        string symbol, string name,
        string amount, string direction, string status) => new()
    {
        User           = new TransactionUser { Username = username, FullName = fullName },
        CurrencySymbol = symbol,
        CurrencyName   = name,
        Amount         = amount,
        Direction      = direction,
        Status         = status,
    };

    private sealed class FakeHandler(Transaction[] transactions) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var json    = JsonConvert.SerializeObject(transactions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content = content });
        }
    }

    private static TransactionsPageViewModel BuildVm(Transaction[]? transactions = null)
    {
        var data   = transactions ?? SampleTransactions();
        var client = new HttpClient(new FakeHandler(data)) { BaseAddress = new Uri("http://localhost") };
        var api    = new ApiClient(client);
        return new TransactionsPageViewModel(api);
    }

    // Convenience: build + load on STA, then return observable properties.
    private static async Task<TransactionsPageViewModel> BuildAndLoadAsync(Transaction[]? data = null)
    {
        TransactionsPageViewModel? vm = null;
        await RunOnStaAsync(async () =>
        {
            vm = BuildVm(data);
            await vm.LoadAsync();
        });
        return vm!;
    }

    // ── Filter: StatusFilter ──────────────────────────────────────────────────

    [Fact]
    public async Task FilterByStatus_Completed_ShowsOnlyCompleted()
    {
        await RunOnStaAsync(async () =>
        {
            var vm = BuildVm();
            await vm.LoadAsync();
            vm.StatusFilter = "Completed";

            vm.PageInfo.Should().Contain("of 1");  // 1 page
            vm.PaginationSummary.Should().Contain("of 3"); // 3 completed
        });
    }

    [Fact]
    public async Task FilterByStatus_Pending_ShowsOnlyPending()
    {
        await RunOnStaAsync(async () =>
        {
            var vm = BuildVm();
            await vm.LoadAsync();
            vm.StatusFilter = "Pending";

            vm.PaginationSummary.Should().Contain("of 1");
        });
    }

    [Fact]
    public async Task FilterByStatus_Failed_ShowsOnlyFailed()
    {
        await RunOnStaAsync(async () =>
        {
            var vm = BuildVm();
            await vm.LoadAsync();
            vm.StatusFilter = "Failed";

            vm.PaginationSummary.Should().Contain("of 1");
        });
    }

    // ── Filter: DirectionFilter ───────────────────────────────────────────────

    [Fact]
    public async Task FilterByDirection_In_ShowsOnlyInTransactions()
    {
        await RunOnStaAsync(async () =>
        {
            var vm = BuildVm();
            await vm.LoadAsync();
            vm.DirectionFilter = "In";

            vm.PaginationSummary.Should().Contain("of 3");
        });
    }

    [Fact]
    public async Task FilterByDirection_Out_ShowsOnlyOutTransactions()
    {
        await RunOnStaAsync(async () =>
        {
            var vm = BuildVm();
            await vm.LoadAsync();
            vm.DirectionFilter = "Out";

            vm.PaginationSummary.Should().Contain("of 2");
        });
    }

    // ── Filter: combined Status + Direction ───────────────────────────────────

    [Fact]
    public async Task FilterBothStatusCompleted_DirectionOut_ShowsIntersection()
    {
        await RunOnStaAsync(async () =>
        {
            var vm = BuildVm();
            await vm.LoadAsync();
            vm.StatusFilter    = "Completed";
            vm.DirectionFilter = "Out";

            // Only alice/USD Completed+Out matches
            vm.PaginationSummary.Should().Contain("of 1");
        });
    }

    // ── Filter: SearchText ────────────────────────────────────────────────────

    [Fact]
    public async Task SearchByUsername_Matches()
    {
        await RunOnStaAsync(async () =>
        {
            var vm = BuildVm();
            await vm.LoadAsync();
            vm.SearchText = "alice";

            vm.PaginationSummary.Should().Contain("of 2");
        });
    }

    [Fact]
    public async Task SearchByCurrencySymbol_Matches()
    {
        await RunOnStaAsync(async () =>
        {
            var vm = BuildVm();
            await vm.LoadAsync();
            vm.SearchText = "BTC";

            vm.PaginationSummary.Should().Contain("of 1");
        });
    }

    [Fact]
    public async Task SearchByCurrencyName_CaseInsensitive()
    {
        await RunOnStaAsync(async () =>
        {
            var vm = BuildVm();
            await vm.LoadAsync();
            vm.SearchText = "bitcoin";

            vm.PaginationSummary.Should().Contain("of 1");
        });
    }

    // ── ClearFilters ──────────────────────────────────────────────────────────

    [Fact]
    public async Task ClearFilters_ResetsAllFiltersAndShowsAll()
    {
        await RunOnStaAsync(async () =>
        {
            var vm = BuildVm();
            await vm.LoadAsync();
            vm.StatusFilter    = "Completed";
            vm.DirectionFilter = "Out";
            vm.SearchText      = "alice";

            vm.ClearFiltersCommand.Execute(null);

            vm.StatusFilter.Should().Be("All");
            vm.DirectionFilter.Should().Be("All");
            vm.SearchText.Should().Be(string.Empty);
            vm.PaginationSummary.Should().Contain("of 5");
        });
    }

    // ── Pagination ────────────────────────────────────────────────────────────

    [Fact]
    public async Task Pagination_PageSizeTwo_PageInfoCorrect()
    {
        await RunOnStaAsync(async () =>
        {
            var vm = BuildVm();
            await vm.LoadAsync();
            vm.PageSize = 2;

            vm.PageInfo.Should().Be("Page 1 of 3");
        });
    }

    [Fact]
    public async Task Pagination_NextPage_AdvancesCurrentPage()
    {
        await RunOnStaAsync(async () =>
        {
            var vm = BuildVm();
            await vm.LoadAsync();
            vm.PageSize = 2;

            vm.NextPageCommand.Execute(null);

            vm.CurrentPage.Should().Be(2);
        });
    }
}
