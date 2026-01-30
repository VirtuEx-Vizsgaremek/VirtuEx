enum Permissions {
  Admin = 1 << 0,

  EditUser = 1 << 1,
  DeleteUser = 1 << 2
}

export default Permissions;
