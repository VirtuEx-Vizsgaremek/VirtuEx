using CommunityToolkit.Mvvm.ComponentModel;
using VirtuExAdmin.Serializables;

namespace VirtuExAdmin.Util;

public partial class UserService : ObservableObject
{
    private readonly ApiClient _api;

    [ObservableProperty]
    private User? _currentUser;

    public UserService(ApiClient api) {
        _api = api;
    }

    public async Task LoadAsync() {
        CurrentUser = await _api.User();
    }
}