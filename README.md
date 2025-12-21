# Exam Project

## Introduction

### Task Description
For those wishing to navigate the financial space, prior knowledge is essential. Therefore, a risk-free, realistic environment is important for practice, where users can learn about market mechanisms, practice trading, and receive feedback on their decisions. Using real platforms carries financial risk, while a completely synthetic test environment models live situations with dynamic behavior based on real data. The proposed solution is to create a hybrid simulator that behaves similarly to real markets yet maintains a risk-free nature.

The task is divided into two main parts. On the web interface, users can enjoy the opportunities provided by the application, while the desktop application provides admin-level access to the project's background.

### Project Goal
The project serves several interconnected goals. The applications provide users with the opportunity to learn the principles of the stock market and trading for educational purposes, all in a safe, risk-free environment. Additionally, they allow users to test their existing knowledge and various trading strategies based on real exchange rate data without real financial risk.

Regarding the professional quality of the project, we will be able to present documentation, test results, and both the desktop and web applications.

## System Overview

### System Architecture and Components
The system is built on three layers: front-end (web React), backend (Node.js REST API), and the database (PostgreSQL). The administration interface connects to the same REST API as a separate WPF desktop application. External APIs: CoinMarketCap for market data; Stripe test API for financial simulations; optionally OAuth providers (Google, GitHub) for authentication.

### Web Application

| Features                                                | Free      | Standard | Pro  |
| :------------------------------------------------------ | :-------: | :------: | :--: |
| Chart view (candle/line)                                |    ✅     |    ✅    |  ✅  |
| Wallet (Stripe test API)                                |    ✅     |    ✅    |  ✅  |
| Balance + transactions display                          |    ✅     |    ✅    |  ✅  |
| Asset (coin) listing                                    |    ✅     |    ✅    |  ✅  |
| Swap crypto <-> crypto                                  |    ✅     |    ✅    |  ✅  |
| User data editing                                       |    ✅     |    ✅    |  ✅  |
| Buy/Sell (Spot[^1])                                     |    ✅     |    ✅    |  ✅  |
| Margin[^3] trading                                      |    ✅     |    ✅    |  ✅  |
| Limit[^2] trading                                       |    ✅     |    ✅    |  ✅  |
| AI (simulated) trading                                  |    ✅     |    ✅    |  ✅  |
| AI chatbot credits                                      |    5      |    30    |  100 |
| 2FA + profile + social accounts + payment + OAuth       |    ❌     |    ✅    |  ✅  |
| Real-time trading                                       |    ❌     |    ✅    |  ✅  |
| Unlimited portfolio size                                |    ❌     |    ❌    |  ✅  |
| Stop‑loss                                               |    ❌     |    ❌    |  ✅  |
| TradingView chart                                       |    ❌     |    ❌    |  ✅  |
| Subscription fee                                        |   FREE    |    $35   |  $49 |

### Desktop Application

| Features                                               | Admin  |
| :----------------------------------------------------- | :----: |
| Display and edit user data                             |   ✅   |
| Punishment for rule violations (Wash trading, spoofing)|   ✅   |
| Display transaction details                            |   ✅   |
| Full user account management                           |   ✅   |
| Create account (with web + desktop permissions)        |   ✅   |

### Technologies Used
1. React
2. WPF .NET Framework
3. Node.js
4. REST API
5. Git

## Roles and Permissions

| Role           | Functions                                                                       |
| :------------- | :------------------------------------------------------------------------------ |
| Admin          | * Manage desktop application functions<br>* Manage web-accessible functions     |
| End User       | * Manage web-accessible functions                                               |

## Functional Requirements

### Web Application

| ID   | Function Name                     | Description                                                                                              | Input                                    | Output / Result                           |
| :--- | :-------------------------------- | :------------------------------------------------------------------------------------------------------- | :--------------------------------------- | :---------------------------------------- |
| F-01 | Chart View                        | The user can view cryptocurrency exchange rates on a chart.                                              | Selected asset (coin), view type         | Displayed TradingView chart               |
| F-02 | AI / Real time data selection     | The user can choose between AI-simulated data and real-time data.                                        | Mode selection                           | Display of selected data source           |
| F-03 | Account Management                | User account creation and management (according to GitHub layout).                                       | Name, email, password, profile picture   | Active user profile                       |
| F-04 | Wallet Integration                | The user can manage their wallet using Stripe API.                                                       | Deposit and withdrawal data              | Balance update based on transaction       |
| F-05 | Balance Display                   | The system displays the user's balance.                                                                  | User ID                                  | Currency, amount                          |
| F-06 | Deposit and Withdrawal            | Deposit and withdrawal of fiat and crypto assets.                                                        | Amount, type, target                     | Transaction created and logged            |
| F-07 | Asset List                        | The system displays the coins owned by the user.                                                         | User ID                                  | Own coin list                             |
| F-08 | Swapping                          | Exchange between two assets at a given rate.                                                             | Source coin, target coin, amount         | Post-swap balance, exchange executed      |
| F-09 | Subscription Management           | The user can choose "Free", "Standard", or "Pro" subscription with monthly/yearly fee.                   | Package selection                        | Subscription activation, credit allocation|
| F-10 | AI Chatbot Usage                  | The user can use credits for AI-based analysis.                                                          | Query, credit amount                     | Analysis response, credit deduction       |
| F-11 | Trading Functions                 | Buying and selling based on exchange rates, in multiple modes.                                           | Asset, amount, type (spot/limit/margin)  | Transaction executed                      |
| F-12 | Stop-loss[^4] Setting             | Premium function: setting automatic selling based on exchange rate.                                      | Asset, exchange rate                     | Automatic sale at given condition         |
| F-13 | User Profile Customization        | Profile picture, social accounts, payment methods, OAuth setup.                                          | Uploaded data                            | Updated profile information               |
| F-14 | User Portfolio                    | Unlimited coin management for Pro users. Restricted in smaller packages, max 10 currencies.              | User ID                                  | Storage of portfolio data                 |
| F-15 | Transaction Log                   | The system logs trading events and transactions.                                                         | Transaction data                         | Log entry in the database                 |

### Desktop Application

| ID   | Function Name                    | Description                                                                      | Input                               | Output / Result                   |
| ---- | -------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------- |
| F-16 | Display Users                    | The admin can see all users in the system.                                       | -                                   | User list                         |
| F-17 | Edit User Data                   | The admin can modify user data.                                                  | Selected user, new data             | Updated data saved                |
| F-18 | Handle Violations                | The admin can impose punishment for rule violations (locking, deduction).        | Wash trading[^5], spoofing[^6]      | Account locked, balance reduced   |
| F-19 | Transaction Details              | View transaction data.                                                           | Transaction ID                      | Detailed data view                |
| F-20 | Create Account from Admin        | The admin can create a new account with full permissions.                        | User data                           | New active account                |
| F-21 | Provide Full Access              | The admin has access to all web functions as well as administrative operations.  | -                                   | Admin functions available         |

## Non-functional Requirements

### Security
Password encryption (bcrypt), token-based authentication (JWT), HTTPS for all communications, database encryption.

### Performance
Chart updates and data calls should be within 1–3 seconds latency in real-time mode.

### Scalability
The backend should be containerizable (Docker), horizontally scalable API layer.

### Reliability
Consistent logging system, immediate database update upon modifications.

### Usability
Both web and desktop application UIs are responsive and accessible.

## User Interface

The user interface in both the web and desktop applications shows a clean appearance. Navigation is simple with the left-side menu bar, where we can see our current position and submenus.

### UI Proposals

#### Web Interface

<p>
	<p align="left">
		The website opens with the chart view. Here we have the option to choose between using real or simulated data. in Chart view, there is an option to switch between AI (credit-based advice) and real-time (CoinMarketCap) data. The free package has limited chart view (candle and line, maximum monthly view), while the pro subscription provides full functionality.
	</p>
	<img align="right" width="804" height="520" alt="Chart View" src="https://github.com/user-attachments/assets/96e9a429-6db2-44d8-9c14-8d4e6c262a3e" />
</p>
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<p>
<p align="right">
	In the left menu bar, we can select the "Profile" option, where we can view and edit our own profile. We also have the opportunity to utilize functions beyond the basic package.
</p>
<img align="left" width="45%" alt="Profile" src="https://github.com/user-attachments/assets/ec08986d-6ea4-4c8c-8abf-bc07a1f7ab89" />
</p>
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<p>
<p align="left">
	The "Wallet" is also under the profile, which shows our current assets. Under our assets, we can view our transaction history.
</p>
<img align="right" width="764" height="492" alt="Wallet_view" src="https://github.com/user-attachments/assets/5fc47ff9-f1e0-4918-adfd-80b061dfba5c" />
</p>
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<p>
<p align="right">
	On the trading interface, we can select the trading mode and other settings indispensable for trading, such as currency and amount.
</p>
<img align="left" width="45%" alt="Coins" src="https://github.com/user-attachments/assets/dadeffdd-4d9d-48f6-acbb-d25434d4cdd2" />
</p>
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<p>
<p align="left">
	Similar to the trading interface, we can swap our currencies for another one.
</p>
<img align="right" width="717" height="511" alt="Swap_view" src="https://github.com/user-attachments/assets/85042822-5b93-488c-a925-57fbb55f9520" />
</p>
<br />
<br />
<br />
<br />
<br />
<br />
<br />

#### Desktop Application

<p>
	<p align="right">
		After opening the desktop application, we find ourselves in the profiles view. We can also select this option from the left menu bar.
	</p>
	<img align="left" width="753" height="536" alt="Admin_user_list" src="https://github.com/user-attachments/assets/c22fcbe0-8ed3-4853-8b4f-47a0df54da2a" />
</p>
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<p>
	<p align="left">
		By clicking the "Edit" button on the profile label, we can edit individual profiles.
	</p>
	<img align="right" width="726" height="517" alt="Admin_profile_edit" src="https://github.com/user-attachments/assets/cbd411ff-4616-4825-8ca7-e906ecbf8701" />
</p>
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<p>
	<p align="right">
		Under "Details", we can see the profile specifics. Individual transactions, balance, and history.
	</p>
	<img align="left" width="664" height="473" alt="Admin_profile_details" src="https://github.com/user-attachments/assets/ace43a52-9666-4f27-9e7b-316ef1ed3844" />
</p>
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<p>
	<p align="left">
		The "Punishment" button serves to impose individual sanctions. During trading, there are some illegal methods used to influence market operations, thereby gaining greater profit for certain users. If we notice these patterns, we can impose a penalty. Here, besides the justification, we must select why we are imposing the punishment.
	</p>
	<img align="right" width="656" height="466" alt="Admin_punishment" src="https://github.com/user-attachments/assets/d2562cf0-c5ab-466b-bbe6-28b4d880818e" />
</p>
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<p>
	<p align="right">
		In the menu bar, the "Transactions" menu point can be found, where we can monitor all money movements as shown in the figure.
	</p>
	<img align="left" width="747" height="483" alt="Admin_transactions" src="https://github.com/user-attachments/assets/92b522dc-66a7-4434-b54f-e7c180a944e4" />
</p>

## Data Management

### Database
The database is structured according to the diagram below. Here is the ER diagram.
![ER Diagram](image.png)

### API Endpoints

#### 1. Authentication and User Management
These endpoints are responsible for registration, login, and profile management (F-03, F-13, F-16).

| Method | Endpoint | Description | Permission |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Create new user account (Name, email, password). | Public |
| POST | `/api/auth/login` | Login, request JWT token. | Public |
| GET | `/api/user/profile` | Query logged-in user's data. | User |
| PUT | `/api/user/profile` | Update profile data (image, bio). | User |
| GET | `/api/admin/users` | List all users (Desktop app function). | Admin |
| PUT | `/api/admin/users/{id}` | Edit user data or set punishment/ban. | Admin |

#### 2. Wallet and Transactions
Handling financial operations, Stripe integration, and internal balance movement (F-04, F-05, F-06, F-15).

| Method | Endpoint | Description | Permission |
| :--- | :--- | :--- | :--- |
| GET | `/api/wallet/balance` | Query current balance (Fiat and Crypto). | User |
| POST | `/api/wallet/deposit` | Top up balance (Stripe API call simulation). | User |
| POST | `/api/wallet/withdraw` | Initiate withdrawal. | User |
| GET | `/api/wallet/transactions` | Query transaction log (history). | User/Admin |
| POST | `/api/wallet/swap` | Crypto-crypto exchange (Swapping). | User |

#### 3. Trading & Market Data
Querying market data and handling trading orders (F-01, F-11, F-12).

| Method | Endpoint | Description | Permission |
| :--- | :--- | :--- | :--- |
| GET | `/api/market/assets` | Query available cryptocurrencies and current rates (CoinMarketCap proxy). | User |
| GET | `/api/market/chart/{symbol}` | Query chart data (OHLC format) for TradingView. | User |
| POST | `/api/trade/order` | Create new order (Spot, Limit, Margin). | User |
| DELETE | `/api/trade/order/{id}` | Cancel open order (e.g., Limit order). | User |
| GET | `/api/trade/history` | List own trading history. | User |

#### 4. AI and Subscription
Accessing premium functions and the chatbot (F-09, F-10).

| Method | Endpoint | Description | Permission |
| :--- | :--- | :--- | :--- |
| GET | `/api/ai/analyze` | Request market analysis from AI (with credit deduction). | User (Standard/Pro) |
| POST | `/api/subscription/upgrade` | Switch subscription package (Free -> Standard/Pro). | User |

## System Requirements

### Development Environment
1. Microsoft Visual Studio Code
2. Microsoft Visual Studio
3. JetBrains Rider
4. DBeaver

### Tech Stack
1. React, WPF
2. Express.js
3. PostgreSQL

### General Expectations

#### Software
1. The project's web interface runs in any modern browser.
2. The project's desktop application runs exclusively in a Windows environment, version 10 or newer.

#### Hardware
1. Intel Core i3-540 or later
2. At least 4 GB RAM

## Summary
The functional specification of the project and the requirements recorded therein provide clear guidance for developers so that every element of the system complies with legal regulations, professional expectations, and the requirements set for the exam project. The detailed structure of the documentation ensures that the development process is transparent, traceable, and unified, thereby significantly reducing the possibility of errors and promoting the completion of a high-quality, stable, and presentable project.

The specification not only supports the developers' work but also contributes to the system's future maintainability and expandability. A well-structured documentation allows anyone in the future to easily understand the system's operation, logical structure, or potential points for further development.

A highly important aspect is that users feel safe when using the system and trust the application's operation. The documentation contributes to creating this: the transparent description of functions, the precise recording of operating principles, and consistent development practices all serve to make the application reliable, predictable, and user-friendly. This trust is a fundamental condition for users to work confidently with the system and successfully achieve their learning or practice goals.

[^1]: Spot: immediate trading at current exchange rate
[^2]: Limit: the transaction only occurs when the exchange rate reaches our designated target value
[^3]: Margin: leveraged trading
[^4]: Stop-loss: execution of a sell order at an exchange rate set by us
[^5]: Wash trading: the investor trades with themselves, thereby increasing the exchange rate/volume
[^6]: Spoofing: creating orders without the intention of execution
