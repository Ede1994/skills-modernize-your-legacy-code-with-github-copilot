# Account Management System - Node.js

Modern Node.js implementation of the legacy COBOL Account Management System.

## About

This application has been modernized from three separate COBOL files (`main.cob`, `operations.cob`, `data.cob`) into a single Node.js application while preserving:
- Original business logic
- Data integrity
- Menu options and user experience
- Business rules for student accounts

## Business Rules Preserved

- **BR-001:** Initial account balance: $1,000.00
- **BR-002:** No negative balances (overdraft protection)
- **BR-003:** Credits have no upper limit (within system constraints)
- **BR-004:** Debits require sufficient funds validation
- **BR-005:** Transactions are atomic (all-or-nothing)
- **BR-006:** Balance format: up to $999,999.99 with 2 decimal places

## Architecture

The application follows a three-layer architecture:

1. **DataProgram** - Data Access Layer
   - Manages persistent storage of account balance
   - Handles READ/WRITE operations

2. **Operations** - Business Logic Layer
   - Processes account operations (View, Credit, Debit)
   - Enforces business rules and validation

3. **MainProgram** - Presentation Layer
   - User interface and menu system
   - Input handling and flow control

## Installation

```bash
# Install dependencies
npm install
```

## Running the Application

```bash
# Start the application
npm start

# Or run directly with Node.js
node index.js
```

## Usage

When you start the application, you'll see a menu with four options:

```
--------------------------------
Account Management System
1. View Balance
2. Credit Account
3. Debit Account
4. Exit
--------------------------------
Enter your choice (1-4):
```

### Option 1: View Balance
Displays the current account balance.

### Option 2: Credit Account
Adds funds to the account. You'll be prompted to enter the credit amount.

### Option 3: Debit Account
Withdraws funds from the account if sufficient funds are available. You'll be prompted to enter the debit amount.

### Option 4: Exit
Exits the application.

## Testing

```bash
# Run tests (when test suite is created)
npm test

# Run tests in watch mode
npm run test:watch
```

## Debugging

Use the VS Code debugger:
1. Open the Debug panel (Ctrl+Shift+D / Cmd+Shift+D)
2. Select "Launch Account Management System"
3. Press F5 to start debugging

## Differences from COBOL Version

While the business logic is identical, the Node.js version offers:
- Better error handling for invalid inputs
- Modern JavaScript syntax and patterns
- Object-oriented architecture
- Easy testing with Jest
- Better maintainability and extensibility

## Future Enhancements

Potential improvements that maintain backward compatibility:
- Transaction history logging
- Multiple account support
- File-based or database persistence
- REST API interface
- Web-based UI
- Interest calculation
- Account limits and daily caps
