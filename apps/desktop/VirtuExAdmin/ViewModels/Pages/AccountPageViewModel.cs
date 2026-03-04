using CommunityToolkit.Mvvm.ComponentModel;
using VirtuExAdmin.Serializables;
using VirtuExAdmin.Util;

namespace VirtuExAdmin.ViewModels.Pages;

public partial class AccountPageViewModel : ObservableObject {
    private readonly ApiClient   _api;

    [ObservableProperty]
    private User? _user;
    
    public AccountPageViewModel(ApiClient api) {
        _api = api;
    }
    
    public async Task LoadAsync() {
        User = await _api.User();
    }
}