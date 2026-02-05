# Exam Project

## Developers & roles

- Kenderesi Gábor Bánk: web- and desktop application, frontend, backend, database
- Nagy Dániel: web- and desktop application, frontend, backend, database
- Herédi Benedek: web- and desktop application, frontend, backend, database
- Turbobot-temp: Turbobot is the automated commit author used by Turborepo’s `create-turbo` tool to record the initial scaffold commits when a repository is created.

For further details visit our [Trello kanban board](https://trello.com/b/ZYBgDurZ/virtuex)

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

### Web Application Features

| Features                                          | Free | Standard | Pro |
| :------------------------------------------------ | :--: | :------: | :-: |
| Chart view (candle/line)                          |  ✅  |    ✅    | ✅  |
| Wallet (Stripe test API)                          |  ✅  |    ✅    | ✅  |
| Balance + transactions display                    |  ✅  |    ✅    | ✅  |
| Asset (coin) listing                              |  ✅  |    ✅    | ✅  |
| Swap crypto <-> crypto                            |  ✅  |    ✅    | ✅  |
| User data editing                                 |  ✅  |    ✅    | ✅  |
| Buy/Sell (Spot[^1])                               |  ✅  |    ✅    | ✅  |
| Margin[^3] trading                                |  ✅  |    ✅    | ✅  |
| Limit[^2] trading                                 |  ✅  |    ✅    | ✅  |
| AI (simulated) trading                            |  ✅  |    ✅    | ✅  |
| AI chatbot credits                                |  5   |    30    | 100 |
| 2FA + profile + social accounts + payment + OAuth |  ❌  |    ✅    | ✅  |
| Real-time trading                                 |  ❌  |    ✅    | ✅  |
| Unlimited portfolio size                          |  ❌  |    ❌    | ✅  |
| Stop‑loss                                         |  ❌  |    ❌    | ✅  |
| TradingView chart                                 |  ❌  |    ❌    | ✅  |
| Subscription fee                                  | FREE |   $35    | $49 |

### Desktop Application Features

| Features                                                | Admin |
| :------------------------------------------------------ | :---: |
| Display and edit user data                              |  ✅   |
| Punishment for rule violations (Wash trading, spoofing) |  ✅   |
| Display transaction details                             |  ✅   |
| Full user account management                            |  ✅   |
| Create account (with web + desktop permissions)         |  ✅   |

### Technologies

- React
  - We have learnt it in the school
  - Widely supported
  - Industry standard
- Node.js
  - We have learnt it in the school
  - Widely supported
  - Industry standard
- Next.js
  - File based routing
  - Server-side react component
- Express
  - We have learnt it in the school
  - Widely supported
  - Industry standard
- WPF .NET Core
  - More responsive than WinForms App
  - Easier to version control
  - Multiple application layers for cleaner code
- Git
  - Today's most used distributed version control software system
  - We have learnt it in the school
- PostgreSQL
  - Supports custom data types
  - Smaller disk size
  - Faster concurrent operation
  - Better handling of relations

#### Used APIs & Libraries

- Stripe
  - Widely used
  - Easy to use
- Yahoo-finance2
  - Fully free
  - No request limit
  - Large dataset
  - Easy to install via node.js
- Tradingview Lightweight Charts
  - Super compact (35 kB)
  - Feature rich
  - Used by multinational companies (CoinMarketCap, Revolut, Coinbase, Binance, etc)
  - Easy to customize
- Logo.dev
  - High request limit (500,000)
  - Large dataset
  - Find by domain, stock ticker or brand name
- Shadcn.ui
  - Modifiable ui library
  - Tailwind based
- Tailwind
  - Used for Shadcn.ui
  - No need for separate css files
- lucide-react
  - Easy to use
  - Tons of icons
- Recharts
  - Integrate for Shadcn
  - Fast

## Roles and Permissions

| Role     | Functions                                                                   |
| :------- | :-------------------------------------------------------------------------- |
| Admin    | _ Manage desktop application functions<br>_ Manage web-accessible functions |
| End User | \* Manage web-accessible functions                                          |

## Functional Requirements

### Web Application

| ID   | Function Name                 | Description                                                                                 | Input                                   | Output / Result                            |
| :--- | :---------------------------- | :------------------------------------------------------------------------------------------ | :-------------------------------------- | :----------------------------------------- |
| F-01 | Chart View                    | The user can view cryptocurrency exchange rates on a chart.                                 | Selected asset (coin), view type        | Displayed TradingView chart                |
| F-02 | AI / Real time data selection | The user can choose between AI-simulated data and real-time data.                           | Mode selection                          | Display of selected data source            |
| F-03 | Account Management            | User account creation and management (according to GitHub layout).                          | Name, email, password, profile picture  | Active user profile                        |
| F-04 | Wallet Integration            | The user can manage their wallet using Stripe API.                                          | Deposit and withdrawal data             | Balance update based on transaction        |
| F-05 | Balance Display               | The system displays the user's balance.                                                     | User ID                                 | Currency, amount                           |
| F-06 | Deposit and Withdrawal        | Deposit and withdrawal of fiat and crypto assets.                                           | Amount, type, target                    | Transaction created and logged             |
| F-07 | Asset List                    | The system displays the coins owned by the user.                                            | User ID                                 | Own coin list                              |
| F-08 | Swapping                      | Exchange between two assets at a given rate.                                                | Source coin, target coin, amount        | Post-swap balance, exchange executed       |
| F-09 | Subscription Management       | The user can choose "Free", "Standard", or "Pro" subscription with monthly/yearly fee.      | Package selection                       | Subscription activation, credit allocation |
| F-10 | AI Chatbot Usage              | The user can use credits for AI-based analysis.                                             | Query, credit amount                    | Analysis response, credit deduction        |
| F-11 | Trading Functions             | Buying and selling based on exchange rates, in multiple modes.                              | Asset, amount, type (spot/limit/margin) | Transaction executed                       |
| F-12 | Stop-loss[^4] Setting         | Premium function: setting automatic selling based on exchange rate.                         | Asset, exchange rate                    | Automatic sale at given condition          |
| F-13 | User Profile Customization    | Profile picture, social accounts, payment methods, OAuth setup.                             | Uploaded data                           | Updated profile information                |
| F-14 | User Portfolio                | Unlimited coin management for Pro users. Restricted in smaller packages, max 10 currencies. | User ID                                 | Storage of portfolio data                  |
| F-15 | Transaction Log               | The system logs trading events and transactions.                                            | Transaction data                        | Log entry in the database                  |

### Desktop Application

| ID   | Function Name             | Description                                                                     | Input                          | Output / Result                 |
| ---- | ------------------------- | ------------------------------------------------------------------------------- | ------------------------------ | ------------------------------- |
| F-16 | Display Users             | The admin can see all users in the system.                                      | -                              | User list                       |
| F-17 | Edit User Data            | The admin can modify user data.                                                 | Selected user, new data        | Updated data saved              |
| F-18 | Handle Violations         | The admin can impose punishment for rule violations (locking, deduction).       | Wash trading[^5], spoofing[^6] | Account locked, balance reduced |
| F-19 | Transaction Details       | View transaction data.                                                          | Transaction ID                 | Detailed data view              |
| F-20 | Create Account from Admin | The admin can create a new account with full permissions.                       | User data                      | New active account              |
| F-21 | Provide Full Access       | The admin has access to all web functions as well as administrative operations. | -                              | Admin functions available       |

## Non-functional Requirements

### Security

Password hashing (bcrypt), token-based authentication (JWT), HTTPS for all communications, 2FA.

### Performance

Chart updates and data calls should be within 1–3 seconds latency in real-time mode.

### Scalability

The backend should be containerizable (Docker), easy to scale.

### Reliability

Consistent logging system, immediate database update upon modifications.

### Usability

Both web and desktop application UIs are responsive and accessible.

## User Interface

The user interface in both the web and desktop applications shows a clean appearance. Navigation is simple with the left-side menu bar, where we can see our current position and submenus.

### UI Proposals

#### Web Interface

<p>
    <img align="right" width="45%" alt="Chart View" src="https://github.com/user-attachments/assets/96e9a429-6db2-44d8-9c14-8d4e6c262a3e" />
    <strong>Chart View & Analysis</strong><br><br>
    The website opens with the chart view. Here we have the option to choose between using real or simulated data. In Chart view, there is an option to switch between AI (credit-based advice) and real-time (Yahoo Finance) data. The free package has limited chart view (candle and line, maximum monthly view), while the pro subscription provides full functionality.
</p>
<p>
    The website opens with the chart view.

**Options available:**

- Use real or simulated data
- Switch between AI (credit-based advice) and real-time (Yahoo Finance) data

**Package limitations:**

- Free plan: limited chart view (candlestick and line, maximum monthly view)
- Pro subscription: full functionality

**Database connection:** Market and User databases

**Tables:**

- `price_history` (or external API)
- `users`
- `subscriptions`

**Fields:**

| Table         | Fields                                            |
| ------------- | ------------------------------------------------- |
| price_history | symbol, open, high, low, close, volume, timestamp |
| users         | id, ai_credits, subscription_level                |
| subscriptions | -                                                 |

**Operations:**

- `SELECT`: Fetch chart data (filtered by date and resolution based on subscription_level)
- `SELECT`: Check user AI credits and subscription
- `UPDATE`: Reduce ai_credits when AI is used

---

</p>
<br clear="right"/><br>

<p>
    <img align="left" width="45%" alt="Profile" src="https://github.com/user-attachments/assets/ec08986d-6ea4-4c8c-8abf-bc07a1f7ab89" />
    <strong>User Profile</strong><br><br>
    In the left menu bar, we can select the "Profile" option, where we can view and edit our own profile. We also have the opportunity to utilize functions beyond the basic package, managing personal details and settings.
</p>
<p>
    In the **left menu**, the "Profile" option allows viewing and editing your profile.  
It also provides access to features beyond the basic plan.

<br>
<br>

**Database connection:** User database

**Tables:**

- `users`
- `subscriptions`

**Fields:**

| Table         | Fields                                                        |
| ------------- | ------------------------------------------------------------- |
| users         | id, username, email, password_hash, profile_image, created_at |
| subscriptions | user_id, plan_type, expiry_date, credits                      |

**Operations:**

- `SELECT`: Load profile data and subscription status
- `UPDATE`: Modify profile data (e.g., password, image)
- `UPDATE`: Upgrade subscription (modify plan_type)

---

</p>
<br clear="left"/><br>

<p>
    <img align="right" width="45%" alt="Wallet_view" src="https://github.com/user-attachments/assets/5fc47ff9-f1e0-4918-adfd-80b061dfba5c" />
    <strong>Wallet & Assets</strong><br><br>
    The "Wallet" is also under the profile section, which shows our current assets. Under our assets, we can view our full transaction history, estimated total value, and individual coin balances.
</p>
<p>
    The **wallet**, under the profile, shows our assets and transaction history.

<br>

**Database connection:** Transaction database

**Tables:**

- `wallets`
- `assets`
- `transactions`
- `currencies`

**Fields:**

| Table        | Fields                                                                        |
| ------------ | ----------------------------------------------------------------------------- |
| assets       | wallet_id, currency_id, amount                                                |
| transactions | id, sender_wallet_id, receiver_wallet_id, amount, currency, timestamp, status |
| wallets      | user_id, total_estimated_value                                                |

**Operations:**

- `SELECT`: Get current balance (assets) by user_id
- `SELECT`: Retrieve transaction list related to the user

---

</p>
<br clear="right"/><br>

<p>
    <img align="left" width="45%" alt="Coins" src="https://github.com/user-attachments/assets/dadeffdd-4d9d-48f6-acbb-d25434d4cdd2" />
    <strong>Trading Interface</strong><br><br>
    On the trading interface, we can select the trading mode and other settings indispensable for trading, such as currency and amount. This allows for quick execution of market, limit, or margin orders.
</p>
<p>
    On the trading interface, users can select the trading mode and other essential settings such as currency and amount.

<br>
<br>
<br>

**Database connection:** Trading Engine

**Tables:**

- `orders`
- `assets`
- `market_prices`

**Fields:**

| Table  | Fields                                                                        |
| ------ | ----------------------------------------------------------------------------- |
| orders | id, user_id, pair (e.g., BTC/USD), type (limit/market), amount, price, status |
| assets | amount (for collateral check)                                                 |

**Operations:**

- `SELECT`: Check available balance
- `INSERT`: Create a new order
- `UPDATE`: Lock/reduce user's free balance

---

</p>
<br clear="left"/><br>

<p>
    <img align="right" width="45%" alt="Swap_view" src="https://github.com/user-attachments/assets/85042822-5b93-488c-a925-57fbb55f9520" />
    <strong>Quick Swap</strong><br><br>
    Similar to the trading interface, we can swap our currencies for another one instantly. This feature simplifies portfolio rebalancing without needing complex order books.
</p>
<p>

**Database connection:** Transaction database

**Tables:**

- `assets`
- `exchange_rates`
- `transactions`

**Fields:**

| Table          | Fields              |
| -------------- | ------------------- |
| assets         | currency_id, amount |
| exchange_rates | pair, rate          |

**Operations:**

- `SELECT`: Get exchange rate
- `UPDATE`: Decrease source currency balance
- `UPDATE`: Increase target currency balance
- `INSERT`: Log swap transaction
</p>
<br clear="right"/><br>

#### Desktop Application

Upon opening, the application defaults to the **profiles view**.

<p>
    <img align="left" width="45%" alt="Admin_user_list" src="https://github.com/user-attachments/assets/c22fcbe0-8ed3-4853-8b4f-47a0df54da2a" />
    <strong>User Management</strong><br><br>
    After opening the desktop application, we find ourselves in the profiles view. We can also select this option from the left menu bar. This provides an overview of all registered users in the system.
</p>
<br><br><br><br><br><br>

**Database connection:** Admin database  
**Tables:** `users`  
**Fields:** `id, username, full_name, status (active/banned)`

**Operations:**

- `SELECT`: List all registered users
  <br clear="left"/><br>

<p>
    <img align="right" width="45%" alt="Admin_profile_edit" src="https://github.com/user-attachments/assets/cbd411ff-4616-4825-8ca7-e906ecbf8701" />
    <strong>Profile Editing</strong><br><br>
    By clicking the "Edit" button on the profile label, admins can edit individual user profiles, including sensitive data recovery or modification requests that require higher privileges.
</p>

**Database connection:** Admin database  
**Tables:** `users`  
**Fields:** `id, email, password, card_info`
<br clear="right"/><br>

<p>
    <img align="left" width="45%" alt="Admin_profile_details" src="https://github.com/user-attachments/assets/ace43a52-9666-4f27-9e7b-316ef1ed3844" />
    <strong>Detailed User View</strong><br><br>
    Under "Details", we can see the profile specifics. This includes individual transactions, current balance, and history, allowing for deep-dive investigations into user activity.
</p>
<br><br>
<br><br>
<br><br>

**Database connection:** Transaction database  
**Tables:** `users, assets, transactions`  
**Fields:**

- `users`: username
- `assets`: currency, amount
- `transactions`: timestamp, type, amount, status

**Operations:**

- `SELECT`: Fetch specific user's balance and transaction history in admin view

---

<br clear="left"/><br>

<p>
    <img align="right" width="45%" alt="Admin_punishment" src="https://github.com/user-attachments/assets/d2562cf0-c5ab-466b-bbe6-28b4d880818e" />
    <strong>Sanctions & Punishments</strong><br><br>
    The "Punishment" button serves to impose individual sanctions. During trading, there are some illegal methods used to influence market operations (e.g., Wash Trading). If we notice these patterns, we can impose a penalty, selecting the specific reason and type of punishment.
</p>

<br>

The "Punishment" button is used to sanction illegal trading behavior.

**Database connection:** Admin database  
**Tables:** `punishments, users`

**Fields:**

| Table       | Fields                                                     |
| ----------- | ---------------------------------------------------------- |
| punishments | id, user_id, reason, punishment_type, created_at, admin_id |
| users       | status                                                     |

**Operations:**

- `INSERT`: Add a new punishment
- `UPDATE`: Change user status (e.g., suspended, banned)

---

<br clear="right"/><br>

<p>
    <img align="left" width="45%" alt="Admin_transactions" src="https://github.com/user-attachments/assets/92b522dc-66a7-4434-b54f-e7c180a944e4" />
    <strong>Transaction Monitoring</strong><br><br>
    In the menu bar, the "Transactions" menu point can be found, where we can monitor all money movements in the system. This global view helps in auditing the platform's financial health.
</p>
<br>
<br>
<br>
<br>

In the menu, the "Transactions" section allows monitoring all money movements.

**Database connection:** Transaction database (Audit log)  
**Tables:** `transactions, users`

**Fields:**

| Table        | Fields                                                  |
| ------------ | ------------------------------------------------------- |
| transactions | id, sender_id, receiver_id, amount, currency, timestamp |
| users        | username (to resolve sender and receiver IDs)           |

**Operations:**

- `SELECT`: Retrieve system-wide transaction list in chronological order
  <br clear="left"/><br>

## Data Management

### Database

The database is structured according to the diagram below.
<img width="100%" alt="ER_diagram" src="https://github.com/user-attachments/assets/85c1c3c4-f116-4515-860d-27894c3e09bf" />

### API Endpoints

#### 1. Authentication and User Management

These endpoints are responsible for registration, login, and profile management (F-03, F-13, F-16).

| Method | Endpoint                | Description                                      | Permission |
| :----- | :---------------------- | :----------------------------------------------- | :--------- |
| POST   | `/api/auth/register`    | Create new user account (Name, email, password). | Public     |
| POST   | `/api/auth/login`       | Login, request JWT token.                        | Public     |
| GET    | `/api/user/profile`     | Query logged-in user's data.                     | User       |
| PUT    | `/api/user/profile`     | Update profile data (image, bio).                | User       |
| GET    | `/api/admin/users`      | List all users (Desktop app function).           | Admin      |
| PUT    | `/api/admin/users/{id}` | Edit user data or set punishment/ban.            | Admin      |

#### 2. Wallet and Transactions

Handling financial operations, Stripe integration, and internal balance movement (F-04, F-05, F-06, F-15).

| Method | Endpoint                   | Description                                  | Permission |
| :----- | :------------------------- | :------------------------------------------- | :--------- |
| GET    | `/api/wallet/balance`      | Query current balance (Fiat and Crypto).     | User       |
| POST   | `/api/wallet/deposit`      | Top up balance (Stripe API call simulation). | User       |
| POST   | `/api/wallet/withdraw`     | Initiate withdrawal.                         | User       |
| GET    | `/api/wallet/transactions` | Query transaction log (history).             | User/Admin |
| POST   | `/api/wallet/swap`         | Crypto-crypto exchange (Swapping).           | User       |

#### 3. Trading & Market Data

Querying market data and handling trading orders (F-01, F-11, F-12).

| Method | Endpoint                     | Description                                                               | Permission |
| :----- | :--------------------------- | :------------------------------------------------------------------------ | :--------- |
| GET    | `/api/market/assets`         | Query available cryptocurrencies and current rates (CoinMarketCap proxy). | User       |
| GET    | `/api/market/chart/{symbol}` | Query chart data (OHLC format) for TradingView.                           | User       |
| POST   | `/api/trade/order`           | Create new order (Spot, Limit, Margin).                                   | User       |
| DELETE | `/api/trade/order/{id}`      | Cancel open order (e.g., Limit order).                                    | User       |
| GET    | `/api/trade/history`         | List own trading history.                                                 | User       |

#### 4. AI and Subscription

Accessing premium functions and the chatbot (F-09, F-10).

| Method | Endpoint                    | Description                                              | Permission          |
| :----- | :-------------------------- | :------------------------------------------------------- | :------------------ |
| GET    | `/api/ai/analyze`           | Request market analysis from AI (with credit deduction). | User (Standard/Pro) |
| POST   | `/api/subscription/upgrade` | Switch subscription package (Free -> Standard/Pro).      | User                |

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
