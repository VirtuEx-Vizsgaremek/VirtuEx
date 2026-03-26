using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows;
using System.Windows.Controls;
using VirtuExAdmin.Serializables;

namespace VirtuExAdmin.Pages;

public partial class UsersPage : Page, INotifyPropertyChanged {
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

        Users = new ObservableCollection<User> {
            new User {
                FullName = "John Doe",
                Username = "jhon.doe12",
                Email    = "john.doe@example.com",
                Bio      = "",
                Avatar   = "",
                RegistrationDate = "2024-01-01",
                Role = "user",
                Status = "Active"
            },
            new User {
                FullName = "William Woodless",
                Username = "wwless16773",
                Email    = "william.woodless@example.com",
                Bio      = "bleh :3",
                Avatar   = "",
                RegistrationDate = "2023-02-14",
                Role = "admin",
                Status = "Pending"
            }
        };
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