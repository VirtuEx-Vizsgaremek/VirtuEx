using VirtuExAdmin.Enums;
using Newtonsoft.Json;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace VirtuExAdmin.Serializables;

public class User : INotifyPropertyChanged {
    public ulong Id { get; set; }

    private string _fullName = string.Empty;
    public required string FullName {
        get => _fullName;
        set {
            if (_fullName == value) return;
            _fullName = value;
            OnPropertyChanged();
        }
    }

    private string _username = string.Empty;
    public required string Username {
        get => _username;
        set {
            if (_username == value) return;
            _username = value;
            OnPropertyChanged();
        }
    }

    private string? _email;
    public string? Email {
        get => _email;
        set {
            if (_email == value) return;
            _email = value;
            OnPropertyChanged();
        }
    }

    public string? Bio { get; set; }
    public string? Avatar { get; set; }
    public ulong Wallet { get; set; }

    private Permission _permissions;
    public Permission Permissions {
        get => _permissions;
        set {
            if (_permissions.Equals(value)) return;
            _permissions = value;
            OnPropertyChanged();
        }
    }

    public ulong? Subscription { get; set; }
    public bool Activated { get; set; }

    private string _registrationDate = string.Empty;
    public string RegistrationDate {
        get => _registrationDate;
        set {
            if (_registrationDate == value) return;
            _registrationDate = value;
            OnPropertyChanged();
        }
    }

    private string _role = "user";
    public string Role {
        get => _role;
        set {
            if (_role == value) return;
            _role = value;
            OnPropertyChanged();
        }
    }

    private string _status = "Active";
    public string Status {
        get => _status;
        set {
            if (_status == value) return;
            _status = value;
            OnPropertyChanged();
        }
    }

    public event PropertyChangedEventHandler? PropertyChanged;
    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}