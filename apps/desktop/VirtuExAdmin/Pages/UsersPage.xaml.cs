using System.Collections.ObjectModel;
using System.Windows.Controls;
using VirtuExAdmin.Serializables;

namespace VirtuExAdmin.Pages;

public partial class UsersPage : Page {
    public ObservableCollection<User> Users { get; set; }
    
    public UsersPage() {
        InitializeComponent();
        
        DataContext = this;

        Users = [
            new User {
                FullName = "John Doe",
                Username = "jhon.doe12",
                Email    = "john.doe@example.com",
                Bio      = "",
                Avatar   = ""
            },
            new User {
                FullName = "William Woodless",
                Username = "wwless16773",
                Email    = "william.woodless@example.com",
                Bio      = "bleh :3",
                Avatar   = ""
            }
        ];
    }
}