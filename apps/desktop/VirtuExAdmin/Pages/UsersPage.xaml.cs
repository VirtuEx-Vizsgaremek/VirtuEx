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

    private User? _selectedUser;
    public User? SelectedUser {
        get => _selectedUser;
        set {
            _selectedUser = value;
            OnPropertyChanged();
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