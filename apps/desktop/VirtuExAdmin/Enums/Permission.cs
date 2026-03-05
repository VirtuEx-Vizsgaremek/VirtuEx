namespace VirtuExAdmin.Enums;

[Flags]
public enum Permission {
    Admin = 1 << 0,

    EditUser   = 1 << 1,
    DeleteUser = 1 << 2
}