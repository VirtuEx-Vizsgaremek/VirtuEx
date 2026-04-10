using CommunityToolkit.Mvvm.ComponentModel;
using VirtuExAdmin.Serializables;
using VirtuExAdmin.Util;

namespace VirtuExAdmin.ViewModels.Pages;

public partial class AuditLogPageViewModel(ApiClient api) : ObservableObject {
    [ObservableProperty]
    private AuditLog[]? _logs;

    public async Task LoadAsync() {
        Logs = await api.AuditLog();
        
        Console.WriteLine(Logs);
    }
}