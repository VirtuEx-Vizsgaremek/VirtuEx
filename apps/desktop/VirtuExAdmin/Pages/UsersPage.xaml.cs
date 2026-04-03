using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
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

    // track last requested subscription user id to avoid races
    private ulong? _lastRequestedSubscriptionUserId;

    private bool _isCreateMode;
    public bool IsCreateMode
    {
        get => _isCreateMode;
        set
        {
            if (_isCreateMode == value) return;
            _isCreateMode = value;
            OnPropertyChanged();
        }
    }

    private User? _selectedUser;
    public User? SelectedUser {
        get => _selectedUser;
        set {
            _selectedUser = value;
            OnPropertyChanged();

            // switching selection implies edit mode
            if (_selectedUser is not null)
            {
                IsCreateMode = false;
            }

            PopulateEditableFieldsFromSelected();
            _ = LoadSubscriptionForSelected();
        }
    }

    // Editable placeholder properties
    private string _editableFullName = string.Empty;
    public string EditableFullName {
        get => _editableFullName;
        set { _editableFullName = value; OnPropertyChanged(); }
    }

    private string _editableUsername = string.Empty;
    public string EditableUsername
    {
        get => _editableUsername;
        set { _editableUsername = value; OnPropertyChanged(); }
    }

    private string _editablePassword = string.Empty;
    public string EditablePassword
    {
        get => _editablePassword;
        set { _editablePassword = value; OnPropertyChanged(); }
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

    // Subscription display properties
    private string _subscriptionPlanName = string.Empty;
    public string SubscriptionPlanName {
        get => _subscriptionPlanName;
        set { _subscriptionPlanName = value; OnPropertyChanged(); }
    }

    private int _subscriptionCredits;
    public int SubscriptionCredits {
        get => _subscriptionCredits;
        set { _subscriptionCredits = value; OnPropertyChanged(); }
    }

    private string _subscriptionPrice = string.Empty;
    public string SubscriptionPrice {
        get => _subscriptionPrice;
        set { _subscriptionPrice = value; OnPropertyChanged(); }
    }

    private string _subscriptionStarted = string.Empty;
    public string SubscriptionStarted {
        get => _subscriptionStarted;
        set { _subscriptionStarted = value; OnPropertyChanged(); }
    }

    private string _subscriptionExpires = string.Empty;
    public string SubscriptionExpires {
        get => _subscriptionExpires;
        set { _subscriptionExpires = value; OnPropertyChanged(); }
    }

    // New: derived subscription user type (e.g. "Free user" or "Paid user")
    private string _subscriptionUserType = string.Empty;
    public string SubscriptionUserType {
        get => _subscriptionUserType;
        set { _subscriptionUserType = value; OnPropertyChanged(); }
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
        await ReloadUsersAndSelectFirstIfAny();
    }

    private async Task ReloadUsersAndSelectFirstIfAny()
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
            else
            {
                SelectedUser = null;
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

    private async Task ReloadUsersAndSelectCreated(string username, string email)
    {
        var users = await _apiClient.Users();
        Users = new ObservableCollection<User>(users);
        OnPropertyChanged(nameof(Users));

        var created = Users.FirstOrDefault(u =>
            (!string.IsNullOrWhiteSpace(username) && string.Equals(u.Username, username, StringComparison.OrdinalIgnoreCase)) ||
            (!string.IsNullOrWhiteSpace(email) && string.Equals(u.Email, email, StringComparison.OrdinalIgnoreCase)));

        SelectedUser = created ?? Users.FirstOrDefault();
        IsCreateMode = false;
    }

    private async Task LoadSubscriptionForSelected()
    {
        if (SelectedUser is null) {
            SubscriptionPlanName = string.Empty;
            SubscriptionCredits = 0;
            SubscriptionPrice = string.Empty;
            SubscriptionStarted = string.Empty;
            SubscriptionExpires = string.Empty;
            SubscriptionUserType = string.Empty;
            return;
        }

        // capture id and record it as the latest requested
        var requestedId = SelectedUser.Id;
        _lastRequestedSubscriptionUserId = requestedId;

        try
        {
            var sub = await _apiClient.GetSubscription(requestedId);

            // if selection changed while we were waiting, ignore this result
            if (_lastRequestedSubscriptionUserId != requestedId)
            {
                Debug.WriteLine($"[UsersPage] Ignoring subscription result for {requestedId} because selection changed");
                return;
            }

            Debug.WriteLine($"[UsersPage] SelectedUser.Id={SelectedUser.Id}, subscription.plan={sub.PlanName}, credits={sub.MonthlyAiCredits}, price={sub.Price}, started={sub.StartedAt}, expires={sub.ExpiresAt}");
            SubscriptionPlanName = sub.PlanName ?? string.Empty;
            SubscriptionCredits = sub.MonthlyAiCredits;
            SubscriptionPrice = sub.Price.ToString("C");

            if (DateTime.TryParse(sub.StartedAt, out var startedAt))
                SubscriptionStarted = startedAt.ToLocalTime().ToString("yyyy-MM-dd");
            else
                SubscriptionStarted = string.Empty;

            if (!string.IsNullOrEmpty(sub.ExpiresAt) && DateTime.TryParse(sub.ExpiresAt, out var expiresAt))
                SubscriptionExpires = expiresAt.ToLocalTime().ToString("yyyy-MM-dd");
            else
                SubscriptionExpires = "Never";

            // Derive a simple subscription type for display in the UI
            if (string.IsNullOrEmpty(SubscriptionPlanName) || SubscriptionPlanName == "No plan" || SubscriptionPlanName.Equals("Free", StringComparison.OrdinalIgnoreCase))
            {
                SubscriptionUserType = "Free user";
            }
            else
            {
                SubscriptionUserType = "Paid user";
            }
        }
        catch (ResponseException ex)
        {
            // if selection changed, don't overwrite UI with error for an older request
            if (_lastRequestedSubscriptionUserId != requestedId)
            {
                Debug.WriteLine($"[UsersPage] Ignoring subscription error for {requestedId} because selection changed");
                return;
            }

            if (ex.StatusCode == 404)
            {
                SubscriptionPlanName = "No plan";
                SubscriptionCredits = 0;
                SubscriptionPrice = string.Empty;
                SubscriptionStarted = string.Empty;
                SubscriptionExpires = string.Empty;
                SubscriptionUserType = "Free user";
            }
            else
            {
                MessageBox.Show($"Subscription API error: {ex.Message} (Status: {ex.StatusCode})", "API Error", MessageBoxButton.OK, MessageBoxImage.Warning);
                SubscriptionPlanName = string.Empty;
                SubscriptionCredits = 0;
                SubscriptionPrice = string.Empty;
                SubscriptionStarted = string.Empty;
                SubscriptionExpires = string.Empty;
                SubscriptionUserType = string.Empty;
            }
        }
        catch (Exception ex)
        {
            if (_lastRequestedSubscriptionUserId != requestedId)
            {
                Debug.WriteLine($"[UsersPage] Ignoring subscription exception for {requestedId} because selection changed");
                return;
            }

            MessageBox.Show($"Failed to fetch subscription: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            SubscriptionPlanName = string.Empty;
            SubscriptionCredits = 0;
            SubscriptionPrice = string.Empty;
            SubscriptionStarted = string.Empty;
            SubscriptionExpires = string.Empty;
            SubscriptionUserType = string.Empty;
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

    private void EnterCreateMode()
    {
        IsCreateMode = true;

        // clear create fields
        EditableUsername = string.Empty;
        EditablePassword = string.Empty;

        // clear shared editable fields
        EditableFullName = string.Empty;
        EditableEmail = string.Empty;
        EditableRegistrationDate = string.Empty;
        EditableRole = string.Empty;
        EditableStatus = "Active";

        // Preferably set SelectedUser to null so subscription panel is cleared
        SelectedUser = null;
    }

    private void AddNewUser_Click(object sender, RoutedEventArgs e)
    {
        EnterCreateMode();
    }

    private void Cancel_Click(object sender, RoutedEventArgs e) {
        if (IsCreateMode)
        {
            // exit create mode and re-select first user (or keep null)
            IsCreateMode = false;
            if (Users.Any())
                SelectedUser = Users.First();
            else
                SelectedUser = null;
            return;
        }

        // revert changes by re-populating from selected user
        PopulateEditableFieldsFromSelected();
    }

    private async void SaveChanges_Click(object sender, RoutedEventArgs e) {
        if (IsCreateMode)
        {
            // basic validation
            if (string.IsNullOrWhiteSpace(EditableFullName))
            {
                MessageBox.Show("Full name is required.", "Validation", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            if (string.IsNullOrWhiteSpace(EditableEmail) || !EditableEmail.Contains('@'))
            {
                MessageBox.Show("Valid email is required.", "Validation", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            if (string.IsNullOrWhiteSpace(EditableUsername))
            {
                MessageBox.Show("Username is required.", "Validation", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            if (string.IsNullOrWhiteSpace(EditablePassword))
            {
                MessageBox.Show("Password is required.", "Validation", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                await _apiClient.RegisterUser(EditableFullName, EditableUsername, EditableEmail, EditablePassword);

                await ReloadUsersAndSelectCreated(EditableUsername, EditableEmail);

                // clear password from memory/UI after successful create
                EditablePassword = string.Empty;

                MessageBox.Show("User successfully created.", "Success",
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (ResponseException ex)
            {
                MessageBox.Show($"API error while creating user: {ex.Message} (Status: {ex.StatusCode})",
                    "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Unexpected error while creating user: {ex.Message}",
                    "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }

            return;
        }

        if (SelectedUser is null) return;

        // apply editable values
        SelectedUser.FullName           = EditableFullName;
        SelectedUser.Email              = EditableEmail;
        SelectedUser.RegistrationDate   = EditableRegistrationDate;
        SelectedUser.Status             = EditableStatus;

        try
        {
            await _apiClient.UpdateUser(SelectedUser);
            MessageBox.Show("User successfully updated.", "Success",
                MessageBoxButton.OK, MessageBoxImage.Information);

            // ensure details view stays in sync
            PopulateEditableFieldsFromSelected();
        }
        catch (ResponseException ex)
        {
            MessageBox.Show($"API error while saving user: {ex.Message} (Status: {ex.StatusCode})",
                "Error", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Unexpected error while saving user: {ex.Message}",
                "Error", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    public event PropertyChangedEventHandler? PropertyChanged;
    private void OnPropertyChanged([CallerMemberName] string? name = null) => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}