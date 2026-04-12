using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using CommunityToolkit.Mvvm.ComponentModel;
using VirtuExAdmin.Serializables;
using VirtuExAdmin.Util;

namespace VirtuExAdmin.ViewModels.Pages;

public partial class UsersPageViewModel : ObservableObject
{
    private readonly ApiClient _apiClient;

    [ObservableProperty]
    private ObservableCollection<User> _users = new();

    [ObservableProperty]
    private User? _selectedUser;

    [ObservableProperty]
    private string _editableFullName = string.Empty;
    [ObservableProperty]
    private string _editableEmail = string.Empty;
    [ObservableProperty]
    private string _editableRegistrationDate = string.Empty;
    [ObservableProperty]
    private string _editableRole = string.Empty;
    [ObservableProperty]
    private string _editableStatus = string.Empty;

    public UsersPageViewModel(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task LoadUsersAsync()
    {
        try
        {
            var userArray = await _apiClient.Users();
            Users = new ObservableCollection<User>(userArray);
            SelectedUser = Users.FirstOrDefault();
        }
        catch (ResponseException ex)
        {
            MessageBox.Show($"API Error: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        catch (System.Exception ex)
        {
            MessageBox.Show($"An unexpected error occurred: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    partial void OnSelectedUserChanged(User? value)
    {
        PopulateEditableFieldsFromSelected();
    }

    public void SaveChanges()
    {
        if (SelectedUser is null) return;

        SelectedUser.FullName = EditableFullName;
        SelectedUser.Email = EditableEmail;
        SelectedUser.RegistrationDate = EditableRegistrationDate;
        SelectedUser.Role = EditableRole;
        SelectedUser.Status = EditableStatus;

        var index = Users.IndexOf(SelectedUser);
        if (index != -1)
        {
            Users[index] = SelectedUser;
        }
    }

    public void CancelChanges()
    {
        PopulateEditableFieldsFromSelected();
    }

    private void PopulateEditableFieldsFromSelected()
    {
        if (SelectedUser is null)
        {
            EditableFullName = string.Empty;
            EditableEmail = string.Empty;
            EditableRegistrationDate = string.Empty;
            EditableRole = string.Empty;
            EditableStatus = string.Empty;
            return;
        }

        EditableFullName = SelectedUser.FullName;
        EditableEmail = SelectedUser.Email;
        EditableRegistrationDate = SelectedUser.RegistrationDate;
        EditableRole = SelectedUser.Role;
        EditableStatus = SelectedUser.Status;
    }
}