# Setup Guide (expanded — includes WPF / Desktop specifics)

This guide helps you set up the VirtuEx monorepo for local development. It replaces and expands the previous `SETUP.md` with explicit WPF / Windows desktop instructions, recommended versions, and troubleshooting tips.

IMPORTANT: when you see a reference to a file or folder, it will be formatted like `apps/desktop` or `VirtuExAdmin.sln`. Use the referenced files/paths from the repo when following the steps.

Table of contents

- Project structure
- Supported / recommended versions
- Prerequisites (global)
- Quick start (Docker)
- Manual setup (non-Docker)
  - 1. API (backend)
  - 2. Web (frontend)
  - 3. Desktop (WPF / admin application) — full WPF instructions
- Common commands
- Troubleshooting (desktop + WPF specific)
- FAQ & notes

Project structure

- `apps/api` — Backend (Node.js + TypeScript)
- `apps/web` — Frontend (Next.js)
- `apps/desktop` — Desktop Admin App (WPF / C# / .NET)
- `packages` — Shared packages and configs

Supported / recommended versions (tested/recommended)

- Node.js: >= 25.0.0 (use latest v25.x)
- pnpm: >= 10.25.0
- PostgreSQL: >= 14 (Postgres 14/15/16 are generally fine)
- Docker & Docker Compose: latest stable (compose v2+)
- .NET SDK: 8.0.x (recommended). The project targets .NET 8; older SDKs (e.g., 7.0, 6.0) may work only if solution/projects are retargeted.
- Visual Studio: Visual Studio 2022 (latest update) with the "Desktop development with .NET" workload installed. If you use Rider or VS Code, ensure the .NET SDK 8.0 is installed and available to the IDE.
- Windows: Windows 10 (build 1809+) or Windows 11 for WPF development and running WPF apps.

Prerequisites (global)

- Install Node.js and pnpm
  ```VirtuEx/SETUP.md#L1-5
  node --version    # should be >= 25.0.0
  pnpm --version    # should be >= 10.25.0
  ```
- Install PostgreSQL (local or via Docker)
- Install Docker (optional but recommended)
- Install .NET SDK 8.0.x
  ```VirtuEx/SETUP.md#L6-10
  dotnet --info
  dotnet --list-sdks
  ```
- For WPF desktop development on Windows:
  - Visual Studio 2022 (latest update) with:
    - "Desktop development with .NET" workload
    - Optional: "Windows 10 SDK" / "Windows 11 SDK" (install the recommended SDK during installer)
  - If you prefer CLI: install .NET SDK 8.0 and use `dotnet` commands.

Quick start (recommended: Docker)

1. Copy env

```VirtuEx/SETUP.md#L11-13
cp .env.example .env
```

2. Start containers

```VirtuEx/SETUP.md#L14-16
docker compose up -d
```

3. Stop containers

```VirtuEx/SETUP.md#L17-17
docker compose down
```

Manual setup (without Docker)
This section describes how to set up each component manually when you want to develop locally without containers.

Root: install Node dependencies

```VirtuEx/SETUP.md#L18-21
pnpm install
```

1. API (backend)

- Copy env and edit:
  ```VirtuEx/SETUP.md#L22-24
  cp apps/api/.env.example apps/api/.env
  # then open apps/api/.env and fill in your DB and API credentials
  ```
- Database:
  - Ensure PostgreSQL is running and reachable.
  - Create database and run migrations/sync depending on project scripts.
  - Project provides helper commands:

    ```VirtuEx/SETUP.md#L25-29
    # Preview SQL (if scripts exist)
    pnpm --filter @virutex/api db:create:dump

    # Or update an existing schema
    pnpm --filter @virutex/api db:update:dump
    ```

- Start API
  ```VirtuEx/SETUP.md#L30-31
  pnpm --filter @virutex/api dev
  ```

2. Web (frontend)

- Copy env and edit:
  ```VirtuEx/SETUP.md#L32-34
  cp apps/web/.env.example apps/web/.env
  # configure API endpoint and public keys
  ```
- Start dev server:
  ```VirtuEx/SETUP.md#L35-35
  pnpm --filter @virutex/web dev
  ```
- Default Next.js dev URL: `http://localhost:3000` (unless overridden in `.env`)

3. Desktop (WPF / Admin Application) — full instructions
   This repo's desktop app is a Windows WPF app using .NET (projects in `apps/desktop`). The steps below assume you are on Windows. You can still build on CI or via `dotnet` on non-Windows, but WPF UI requires Windows to run (and the designer works in Visual Studio on Windows).

A) Windows + Visual Studio (recommended)

1. Install prerequisites
   - .NET SDK 8.0.x (download from dotnet.microsoft.com)
   - Visual Studio 2022 (latest update). During installation select:
     - Workload: "Desktop development with .NET" (this provides WPF/.NET tooling)
     - Optional: ".NET Core cross-platform development" is not necessary for WPF but ok to have
     - Windows SDK (10.0.19041.0 or later) — install as recommended by VS installer
2. Open solution
   - Open `apps/desktop/desktop.sln` (or the solution file present, e.g., `VirtuExAdmin.sln`) in Visual Studio
     - Use the Solution Explorer to ensure all projects are loaded and there are no missing framework targets.
3. Restore NuGet packages
   - Visual Studio will normally restore on first load, or run:
     ```VirtuEx/SETUP.md#L36-38
     dotnet restore apps/desktop/desktop.sln
     ```
4. Set startup project
   - Right-click the admin project (e.g., `VirtuExAdmin`) and choose "Set as Startup Project".
5. Build & run
   - Build -> Rebuild Solution
   - Run (F5) or Start Without Debugging (Ctrl+F5)
6. If the designer fails to load:
   - Ensure the installed .NET SDK matches the target framework of the desktop projects (check csproj `TargetFramework`).
   - Close and re-open Visual Studio after SDK/VS upgrades.
   - Clean `bin`/`obj` folders and rebuild.

B) Using dotnet CLI (for builds / CI / local run)

- Restore:
  ```VirtuEx/SETUP.md#L39-41
  dotnet restore apps/desktop/desktop.sln
  ```
- Build:
  ```VirtuEx/SETUP.md#L42-44
  dotnet build apps/desktop/desktop.sln -c Debug
  ```
- Run a specific project:
  ```VirtuEx/SETUP.md#L45-47
  dotnet run --project apps/desktop/VirtuExAdmin/VirtuExAdmin.csproj
  ```
- Self-contained publish (Windows x64):
  ```VirtuEx/SETUP.md#L48-50
  dotnet publish apps/desktop/VirtuExAdmin/VirtuExAdmin.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true
  ```
  Note: publishing self-contained will bundle the runtime; ensure disk space available.

C) Additional WPF / Windows prerequisites & notes

- Target framework mismatch:
  - If your local `dotnet --list-sdks` does not include the SDK version required by the projects, install the correct SDK.
- Windows Desktop Runtime:
  - To run published builds on a machine without the SDK, install the Windows Desktop Runtime (matching your SDK/runtime).
- Architectures:
  - The solution may target `AnyCPU`, `x86`, or `x64`. If you get runtime crashes, try matching target runtime (e.g., publish for `win-x64`).
- Designer and XAML:
  - Visual Studio requires the correct Windows SDK and matching .NET SDK to show XAML designer. If designer errors persist, check Output window for the designer process exceptions.

Common commands (summary)

- Install dependencies (root):
  ```VirtuEx/SETUP.md#L51-53
  pnpm install
  ```
- Start everything with turborepo:
  ```VirtuEx/SETUP.md#L54-54
  pnpm dev
  ```
- Build all:
  ```VirtuEx/SETUP.md#L55-55
  pnpm build
  ```
- Lint / typecheck / format:
  ```VirtuEx/SETUP.md#L56-58
  pnpm lint
  pnpm check-types
  pnpm format
  ```

Troubleshooting (desktop / WPF-specific)

- Designer displays "Could not create an instance of type ..."
  - Ensure the project's `TargetFramework` matches an installed SDK/runtime.
  - Ensure Visual Studio is up-to-date and has "Desktop development with .NET" workload.
- Build errors referencing missing Windows SDK:
  - Install Windows 10/11 SDK via Visual Studio installer or the SDK installer.
- Runtime: "This application requires a newer version of the .NET runtime"
  - Run `dotnet --info` to check installed runtimes. Install the required runtime or retarget the project to an installed version (not recommended unless you understand implications).
- Native/third-party dependencies:
  - Some desktop features may rely on native libraries or Windows-only APIs — confirm the developer notes in the desktop project README (if present).
- If `pnpm install` fails:
  - Use corepack to manage pnpm:
    ```VirtuEx/SETUP.md#L59-61
    corepack enable
    corepack prepare pnpm@10.25.0 --activate
    ```

FAQ & notes

- Can I develop the WPF app on macOS / Linux?
  - You can edit the code, compile some parts, and run unit tests that don't rely on WPF, but to run or use the WPF UI you must use Windows.
- Which Visual Studio components are required?
  - Minimum: "Desktop development with .NET". Optionally install the Windows SDK if prompted.
- Which .NET SDK to install?
  - Install the SDK that matches the project's `TargetFramework`. We recommend .NET SDK 8.0.x for this repository as the projects target .NET 8. If you need a different SDK for other projects, you can install multiple SDKs and switch using `global.json` or `dotnet` tools.

If something is unclear or you want me to:

- Add exact Visual Studio installer step-by-step (with screenshots),
- Produce a small checklist for a new Windows developer,
- Or add `global.json` pinning to force the correct SDK version,
  tell me which of the above and I will update this file.

End of guide.
