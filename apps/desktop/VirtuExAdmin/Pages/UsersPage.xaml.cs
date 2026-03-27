using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Windows;
using System.Windows.Controls;
using VirtuExAdmin.Serializables;
using VirtuExAdmin.Util;
using VirtuExAdmin.ViewModels.Pages;
using Microsoft.Extensions.DependencyInjection;

namespace VirtuExAdmin.Pages;

public partial class UsersPage : Page, INotifyPropertyChanged {
    private readonly ApiClient _apiClient;
    public ObservableCollection<User> Users { get; set; }

    private User? _selectedUser;
    public User? SelectedUser {
        get => _selectedUser;
        set {
            _selectedUser = value;
            OnPropertyChanged();
            PopulateEditableFieldsFromSelected();
        }
    }

    // Editable placeholder properties
    private string _editableFullName = string.Empty;
    public string EditableFullName {
        get => _editableFullName;
        set { _editableFullName = value; OnPropertyChanged(); }
    }

    private string _editableEmail = string.Empty;
    public string EditableEmail {
        get => _editableEmail;
        set { _editableEmail = value; OnPropertyChanged(); }
    }

    private string _editableRegistrationDate = string.Empty;
    public string EditableRegistrationDate {
        get => _editableRegistrationDate;
        set { _editableRegistrationDate = value; OnPropertyChanged(); }
    }

    private string _editableRole = string.Empty;
    public string EditableRole {
        get => _editableRole;
        set { _editableRole = value; OnPropertyChanged(); }
    }

    private string _editableStatus = string.Empty;
    public string EditableStatus {
        get => _editableStatus;
        set { _editableStatus = value; OnPropertyChanged(); }
    }

    public UsersPage() {
        InitializeComponent();

        DataContext = this;
        _apiClient = App.Services.GetRequiredService<ApiClient>();
        
        //Here are the users
        Users = new ObservableCollection<User>();
        this.Loaded += UsersPage_Loaded;

    }

    private async void UsersPage_Loaded(object sender, RoutedEventArgs e)
    {
        try
        {
            var users = await _apiClient.Users();
            Users = new ObservableCollection<User>(users);
            OnPropertyChanged(nameof(Users));

            if (Users.Any())
            {
                SelectedUser = Users.First();
            }
        }
        catch (ResponseException ex)
        {
            MessageBox.Show($"API error \nErr mess: {ex.Message} (Status: {ex.StatusCode})", "API Error", MessageBoxButton.OK, MessageBoxImage.Warning);
        }
        catch (Exception ex)
        {
            MessageBox.Show($"An unexepted error ocured: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private void PopulateEditableFieldsFromSelected() {
        if (SelectedUser is null) {
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

    private void Cancel_Click(object sender, RoutedEventArgs e) {
        // revert changes by re-populating from selected user
        PopulateEditableFieldsFromSelected();
    }

    private void SaveChanges_Click(object sender, RoutedEventArgs e) {
        if (SelectedUser is null) return;

        // apply editable values back to selected user
        SelectedUser.FullName = EditableFullName;
        SelectedUser.Email = EditableEmail;
        SelectedUser.RegistrationDate = EditableRegistrationDate;
        SelectedUser.Role = EditableRole;
        SelectedUser.Status = EditableStatus;

        // notify UI that the collection item changed
        OnPropertyChanged(nameof(Users));
    }

    public event PropertyChangedEventHandler? PropertyChanged;
    private void OnPropertyChanged([CallerMemberName] string? name = null) => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}