/**
 * Account Management System - Node.js Implementation
 * Modernized from COBOL legacy application
 * Preserves original business logic, data integrity, and menu options
 */

const readline = require('readline');

/**
 * DataProgram - Data Access Layer
 * Equivalent to data.cob
 * Manages persistent storage of account balance
 */
class DataProgram {
    constructor() {
        // Initialize storage balance to 1000.00 (default per business rule BR-001)
        this.storageBalance = 1000.00;
    }

    /**
     * Executes READ or WRITE operations on storage
     * @param {string} operationType - 'READ' or 'WRITE'
     * @param {number} balance - Balance value (used for WRITE)
     * @returns {number} Current balance (for READ operation)
     */
    execute(operationType, balance = null) {
        if (operationType === 'READ') {
            // Return current stored balance
            return this.storageBalance;
        } else if (operationType === 'WRITE') {
            // Update stored balance with new value
            this.storageBalance = balance;
            return balance;
        }
    }

    /**
     * Get current balance
     * @returns {number} Current stored balance
     */
    getBalance() {
        return this.storageBalance;
    }
}

/**
 * Operations - Business Logic Layer
 * Equivalent to operations.cob
 * Processes account operations and enforces business rules
 */
class Operations {
    constructor(dataProgram, rl) {
        this.dataProgram = dataProgram;
        this.rl = rl;
    }

    /**
     * Processes the requested operation
     * @param {string} operationType - 'TOTAL', 'CREDIT', or 'DEBIT'
     * @returns {Promise<void>}
     */
    async process(operationType) {
        if (operationType === 'TOTAL ') {
            // View Balance Operation
            await this.viewBalance();
        } else if (operationType === 'CREDIT') {
            // Credit Account Operation
            await this.creditAccount();
        } else if (operationType === 'DEBIT ') {
            // Debit Account Operation
            await this.debitAccount();
        }
    }

    /**
     * View Balance Operation
     * Reads current balance from storage and displays it
     */
    async viewBalance() {
        // Call DataProgram with READ operation
        const finalBalance = this.dataProgram.execute('READ');
        console.log(`Current balance: ${this.formatBalance(finalBalance)}`);
    }

    /**
     * Credit Account Operation
     * Accepts credit amount, adds to balance, and updates storage
     */
    async creditAccount() {
        // Prompt for credit amount
        const amount = await this.promptForAmount('Enter credit amount: ');
        
        if (amount === null) {
            return; // Invalid input
        }

        // Read current balance from storage
        const currentBalance = this.dataProgram.execute('READ');
        
        // Add amount to balance
        const newBalance = currentBalance + amount;
        
        // Validate maximum balance (PIC 9(6)V99 = 999999.99)
        if (newBalance > 999999.99) {
            console.log('Error: Balance would exceed maximum allowed value of $999,999.99');
            return;
        }
        
        // Write new balance to storage
        this.dataProgram.execute('WRITE', newBalance);
        
        // Display confirmation
        console.log(`Amount credited. New balance: ${this.formatBalance(newBalance)}`);
    }

    /**
     * Debit Account Operation
     * Accepts debit amount, validates sufficient funds, and updates balance
     */
    async debitAccount() {
        // Prompt for debit amount
        const amount = await this.promptForAmount('Enter debit amount: ');
        
        if (amount === null) {
            return; // Invalid input
        }

        // Read current balance from storage
        const currentBalance = this.dataProgram.execute('READ');
        
        // Validate sufficient funds (Business Rule BR-002: No negative balances)
        if (currentBalance >= amount) {
            // Subtract amount from balance
            const newBalance = currentBalance - amount;
            
            // Write new balance to storage
            this.dataProgram.execute('WRITE', newBalance);
            
            // Display confirmation
            console.log(`Amount debited. New balance: ${this.formatBalance(newBalance)}`);
        } else {
            // Insufficient funds - reject transaction
            console.log('Insufficient funds for this debit.');
        }
    }

    /**
     * Prompts user for an amount
     * @param {string} prompt - Prompt message
     * @returns {Promise<number|null>} Amount entered or null if invalid
     */
    promptForAmount(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, (input) => {
                const amount = parseFloat(input);
                
                // Validate numeric input
                if (isNaN(amount) || amount < 0) {
                    console.log('Invalid amount. Please enter a positive number.');
                    resolve(null);
                    return;
                }
                
                // Round to 2 decimal places for currency precision
                resolve(Math.round(amount * 100) / 100);
            });
        });
    }

    /**
     * Formats balance for display (2 decimal places)
     * @param {number} balance - Balance amount
     * @returns {string} Formatted balance
     */
    formatBalance(balance) {
        return balance.toFixed(2);
    }
}

/**
 * MainProgram - Presentation Layer
 * Equivalent to main.cob
 * Entry point and user interface for the account management system
 */
class MainProgram {
    constructor() {
        // Initialize readline interface for user input
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        // Initialize data and operations layers
        this.dataProgram = new DataProgram();
        this.operations = new Operations(this.dataProgram, this.rl);
        
        // Continue flag for main loop
        this.continueFlag = 'YES';
    }

    /**
     * Displays the main menu
     */
    displayMenu() {
        console.log('--------------------------------');
        console.log('Account Management System');
        console.log('1. View Balance');
        console.log('2. Credit Account');
        console.log('3. Debit Account');
        console.log('4. Exit');
        console.log('--------------------------------');
    }

    /**
     * Processes user menu choice
     * @param {string} choice - User's menu selection
     * @returns {Promise<void>}
     */
    async processChoice(choice) {
        const userChoice = parseInt(choice);

        switch (userChoice) {
            case 1:
                // View Balance
                await this.operations.process('TOTAL ');
                break;
            case 2:
                // Credit Account
                await this.operations.process('CREDIT');
                break;
            case 3:
                // Debit Account
                await this.operations.process('DEBIT ');
                break;
            case 4:
                // Exit
                this.continueFlag = 'NO';
                break;
            default:
                // Invalid choice
                console.log('Invalid choice, please select 1-4.');
                break;
        }
    }

    /**
     * Main program logic - menu loop
     */
    async run() {
        while (this.continueFlag === 'YES') {
            this.displayMenu();
            
            // Prompt for user choice
            const choice = await new Promise((resolve) => {
                this.rl.question('Enter your choice (1-4): ', resolve);
            });
            
            // Process the choice
            await this.processChoice(choice);
        }
        
        // Exit message
        console.log('Exiting the program. Goodbye!');
        
        // Close readline interface
        this.rl.close();
    }

    /**
     * Start the application
     */
    static start() {
        const app = new MainProgram();
        app.run().catch((error) => {
            console.error('An error occurred:', error);
            process.exit(1);
        });
    }
}

// Entry point - start the application
if (require.main === module) {
    MainProgram.start();
}

// Export for testing
module.exports = {
    DataProgram,
    Operations,
    MainProgram
};
