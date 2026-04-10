#define MyAppName "VirtuEx Admin"
#define MyAppPublisher "VirtuEx"
#define MyAppExeName "VirtuExAdmin.exe"
#define MyAppVersion "1.0.0"

[Setup]
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}
DefaultDirName={autopf}\{#MyAppPublisher}\{#MyAppName}
DefaultGroupName={#MyAppName}
OutputBaseFilename=VirtuExAdminSetup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
UninstallDisplayIcon={app}\{#MyAppExeName}
UninstallDisplayName={#MyAppName}

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[CustomMessages]
english.ApiUrlPageTitle=API Configuration
english.ApiUrlPageDesc=Enter the backend API server address
english.ApiUrlLabel=API Base URL:

[Files]
Source: "VirtuExAdmin\bin\Release\net8.0-windows\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
; Start menu
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"
; Desktop
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"

[Registry]
; Auto-start on Windows login
Root: HKLM; Subkey: "SOFTWARE\Microsoft\Windows\CurrentVersion\Run"; \
  ValueType: string; ValueName: "{#MyAppName}"; \
  ValueData: """{app}\{#MyAppExeName}"""; \
  Flags: uninsdeletevalue

[Run]
; Offer to launch after install
Filename: "{app}\{#MyAppExeName}"; Description: "Launch {#MyAppName}"; \
  Flags: nowait postinstall skipifsilent

[Code]
var
  ApiUrlPage: TInputQueryWizardPage;

procedure InitializeWizard;
begin
  ApiUrlPage := CreateInputQueryPage(
    wpSelectDir,
    CustomMessage('ApiUrlPageTitle'),
    CustomMessage('ApiUrlPageDesc'),
    ''
  );
  ApiUrlPage.Add(CustomMessage('ApiUrlLabel'), False);
  ApiUrlPage.Values[0] := 'http://localhost:3001';
end;

function NextButtonClick(CurPageID: Integer): Boolean;
var
  Url: String;
begin
  Result := True;
  if CurPageID = ApiUrlPage.ID then
  begin
    Url := Trim(ApiUrlPage.Values[0]);
    if (Pos('http://', Url) <> 1) and (Pos('https://', Url) <> 1) then
    begin
      MsgBox('Please enter a valid URL starting with http:// or https://', mbError, MB_OK);
      Result := False;
    end;
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssInstall then
    SaveStringToFile(
      ExpandConstant('{app}\api_url.txt'),
      Trim(ApiUrlPage.Values[0]),
      False
    );
end;
