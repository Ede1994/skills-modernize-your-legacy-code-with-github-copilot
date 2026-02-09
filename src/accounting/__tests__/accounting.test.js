const { DataProgram, Operations, MainProgram } = require('../index');

const createMockRl = (inputs = []) => ({
    question: jest.fn((prompt, callback) => {
        const value = inputs.length > 0 ? inputs.shift() : '';
        callback(value);
    }),
    close: jest.fn()
});

const createConsoleSpy = () => {
    const logs = [];
    const spy = jest.spyOn(console, 'log').mockImplementation((...args) => {
        logs.push(args.join(' '));
    });
    return { logs, spy };
};

describe('Account Management System - Unit Tests (COBOL Test Plan Mirror)', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Initial System State Tests', () => {
        test('TC-001 Verify default account balance', () => {
            const dataProgram = new DataProgram();
            expect(dataProgram.getBalance()).toBe(1000.00);
        });

        test('TC-002 Verify menu displays correctly', () => {
            const { logs } = createConsoleSpy();
            const app = new MainProgram();
            app.displayMenu();

            expect(logs).toEqual([
                '--------------------------------',
                'Account Management System',
                '1. View Balance',
                '2. Credit Account',
                '3. Debit Account',
                '4. Exit',
                '--------------------------------'
            ]);
            app.rl.close();
        });

        test('TC-003 Verify storage initialization', () => {
            const dataProgram = new DataProgram();
            expect(dataProgram.getBalance()).toBe(1000.00);
        });
    });

    describe('View Balance Operation Tests', () => {
        test('TC-004 View balance on fresh start', async () => {
            const dataProgram = new DataProgram();
            const { logs } = createConsoleSpy();
            const ops = new Operations(dataProgram, createMockRl());

            await ops.viewBalance();

            expect(logs).toContain('Current balance: 1000.00');
        });

        test('TC-005 View balance after credit', async () => {
            const dataProgram = new DataProgram();
            dataProgram.storageBalance = 1250.00;
            const { logs } = createConsoleSpy();
            const ops = new Operations(dataProgram, createMockRl());

            await ops.viewBalance();

            expect(logs).toContain('Current balance: 1250.00');
        });

        test('TC-006 View balance after debit', async () => {
            const dataProgram = new DataProgram();
            dataProgram.storageBalance = 700.00;
            const { logs } = createConsoleSpy();
            const ops = new Operations(dataProgram, createMockRl());

            await ops.viewBalance();

            expect(logs).toContain('Current balance: 700.00');
        });

        test('TC-007 Multiple balance views', async () => {
            const dataProgram = new DataProgram();
            const { logs } = createConsoleSpy();
            const ops = new Operations(dataProgram, createMockRl());

            await ops.viewBalance();
            await ops.viewBalance();
            await ops.viewBalance();

            expect(logs).toEqual([
                'Current balance: 1000.00',
                'Current balance: 1000.00',
                'Current balance: 1000.00'
            ]);
        });
    });

    describe('Credit Account Operation Tests', () => {
        const creditCases = [
            { id: 'TC-008', amount: '50.00', start: 1000.00, expected: 1050.00 },
            { id: 'TC-009', amount: '500000.00', start: 1000.00, expected: 501000.00 },
            { id: 'TC-010', amount: '123.45', start: 1000.00, expected: 1123.45 },
            { id: 'TC-011', amount: '0.01', start: 1000.00, expected: 1000.01 },
            { id: 'TC-012', amount: '0.00', start: 1000.00, expected: 1000.00 },
            { id: 'TC-014', amount: '998999.99', start: 1000.00, expected: 999999.99 }
        ];

        test.each(creditCases)('$id Credit amount $amount', async ({ amount, start, expected }) => {
            const dataProgram = new DataProgram();
            dataProgram.storageBalance = start;
            const { logs } = createConsoleSpy();
            const ops = new Operations(dataProgram, createMockRl([amount]));

            await ops.creditAccount();

            expect(dataProgram.getBalance()).toBe(expected);
            expect(logs[logs.length - 1]).toBe(`Amount credited. New balance: ${expected.toFixed(2)}`);
        });

        test('TC-013 Multiple sequential credits', async () => {
            const dataProgram = new DataProgram();
            const { logs } = createConsoleSpy();
            const ops = new Operations(dataProgram, createMockRl(['100.00', '200.00', '300.00']));

            await ops.creditAccount();
            await ops.creditAccount();
            await ops.creditAccount();

            expect(dataProgram.getBalance()).toBe(1600.00);
            expect(logs[logs.length - 1]).toBe('Amount credited. New balance: 1600.00');
        });
    });

    describe('Debit Account Operation Tests (Sufficient Funds)', () => {
        const debitCases = [
            { id: 'TC-015', amount: '50.00', start: 1000.00, expected: 950.00 },
            { id: 'TC-016', amount: '800.00', start: 1000.00, expected: 200.00 },
            { id: 'TC-017', amount: '123.45', start: 1000.00, expected: 876.55 },
            { id: 'TC-018', amount: '1000.00', start: 1000.00, expected: 0.00 },
            { id: 'TC-019', amount: '0.01', start: 1000.00, expected: 999.99 }
        ];

        test.each(debitCases)('$id Debit amount $amount', async ({ amount, start, expected }) => {
            const dataProgram = new DataProgram();
            dataProgram.storageBalance = start;
            const { logs } = createConsoleSpy();
            const ops = new Operations(dataProgram, createMockRl([amount]));

            await ops.debitAccount();

            expect(dataProgram.getBalance()).toBe(expected);
            expect(logs[logs.length - 1]).toBe(`Amount debited. New balance: ${expected.toFixed(2)}`);
        });

        test('TC-020 Multiple sequential debits', async () => {
            const dataProgram = new DataProgram();
            const { logs } = createConsoleSpy();
            const ops = new Operations(dataProgram, createMockRl(['100.00', '200.00', '300.00']));

            await ops.debitAccount();
            await ops.debitAccount();
            await ops.debitAccount();

            expect(dataProgram.getBalance()).toBe(400.00);
            expect(logs[logs.length - 1]).toBe('Amount debited. New balance: 400.00');
        });
    });

    describe('Debit Account Operation Tests (Insufficient Funds)', () => {
        const insufficientCases = [
            { id: 'TC-021', amount: '1000.01', start: 1000.00 },
            { id: 'TC-022', amount: '5000.00', start: 1000.00 },
            { id: 'TC-023', amount: '0.01', start: 0.00 },
            { id: 'TC-024', amount: '100.01', start: 100.00 },
            { id: 'TC-025', amount: '600.00', start: 500.00 }
        ];

        test.each(insufficientCases)('$id Insufficient funds for amount $amount', async ({ amount, start }) => {
            const dataProgram = new DataProgram();
            dataProgram.storageBalance = start;
            const { logs } = createConsoleSpy();
            const ops = new Operations(dataProgram, createMockRl([amount]));

            await ops.debitAccount();

            expect(dataProgram.getBalance()).toBe(start);
            expect(logs[logs.length - 1]).toBe('Insufficient funds for this debit.');
        });
    });

    describe('Mixed Operations Tests', () => {
        test('TC-026 Credit then debit', async () => {
            const dataProgram = new DataProgram();
            const ops = new Operations(dataProgram, createMockRl(['500.00', '300.00']));
            const { logs } = createConsoleSpy();

            await ops.creditAccount();
            await ops.debitAccount();

            expect(dataProgram.getBalance()).toBe(1200.00);
            expect(logs[logs.length - 1]).toBe('Amount debited. New balance: 1200.00');
        });

        test('TC-027 Debit then credit', async () => {
            const dataProgram = new DataProgram();
            const ops = new Operations(dataProgram, createMockRl(['400.00', '250.00']));
            const { logs } = createConsoleSpy();

            await ops.debitAccount();
            await ops.creditAccount();

            expect(dataProgram.getBalance()).toBe(850.00);
            expect(logs[logs.length - 1]).toBe('Amount credited. New balance: 850.00');
        });

        test('TC-028 Multiple mixed operations', async () => {
            const dataProgram = new DataProgram();
            const ops = new Operations(dataProgram, createMockRl(['500.00', '200.00', '100.00', '50.00']));
            const { logs } = createConsoleSpy();

            await ops.creditAccount();
            await ops.debitAccount();
            await ops.creditAccount();
            await ops.debitAccount();

            expect(dataProgram.getBalance()).toBe(1350.00);
            expect(logs[logs.length - 1]).toBe('Amount debited. New balance: 1350.00');
        });

        test('TC-029 Failed debit followed by credit', async () => {
            const dataProgram = new DataProgram();
            const ops = new Operations(dataProgram, createMockRl(['2000.00', '500.00', '1200.00']));
            const { logs } = createConsoleSpy();

            await ops.debitAccount();
            await ops.creditAccount();
            await ops.debitAccount();

            expect(dataProgram.getBalance()).toBe(300.00);
            expect(logs[logs.length - 1]).toBe('Amount debited. New balance: 300.00');
        });

        test('TC-030 Credit enabling debit', async () => {
            const dataProgram = new DataProgram();
            const ops = new Operations(dataProgram, createMockRl(['1500.00', '1000.00', '1500.00']));
            const { logs } = createConsoleSpy();

            await ops.debitAccount();
            await ops.creditAccount();
            await ops.debitAccount();

            expect(dataProgram.getBalance()).toBe(500.00);
            expect(logs[logs.length - 1]).toBe('Amount debited. New balance: 500.00');
        });
    });

    describe('Menu Navigation Tests', () => {
        test('TC-031 Select option 1 triggers view balance', async () => {
            const app = new MainProgram();
            const processSpy = jest.spyOn(app.operations, 'process').mockResolvedValue();

            await app.processChoice('1');

            expect(processSpy).toHaveBeenCalledWith('TOTAL ');
            app.rl.close();
        });

        test('TC-032 Select option 2 triggers credit', async () => {
            const app = new MainProgram();
            const processSpy = jest.spyOn(app.operations, 'process').mockResolvedValue();

            await app.processChoice('2');

            expect(processSpy).toHaveBeenCalledWith('CREDIT');
            app.rl.close();
        });

        test('TC-033 Select option 3 triggers debit', async () => {
            const app = new MainProgram();
            const processSpy = jest.spyOn(app.operations, 'process').mockResolvedValue();

            await app.processChoice('3');

            expect(processSpy).toHaveBeenCalledWith('DEBIT ');
            app.rl.close();
        });

        test('TC-034 Select option 4 exits', async () => {
            const app = new MainProgram();
            await app.processChoice('4');

            expect(app.continueFlag).toBe('NO');
            app.rl.close();
        });

        test('TC-035 Invalid menu choice - zero', async () => {
            const app = new MainProgram();
            const { logs } = createConsoleSpy();

            await app.processChoice('0');

            expect(logs[logs.length - 1]).toBe('Invalid choice, please select 1-4.');
            app.rl.close();
        });

        test('TC-036 Invalid menu choice - high number', async () => {
            const app = new MainProgram();
            const { logs } = createConsoleSpy();

            await app.processChoice('9');

            expect(logs[logs.length - 1]).toBe('Invalid choice, please select 1-4.');
            app.rl.close();
        });

        test('TC-037 Menu redisplays after operation (continue flag remains YES)', async () => {
            const app = new MainProgram();
            await app.processChoice('1');

            expect(app.continueFlag).toBe('YES');
            app.rl.close();
        });
    });

    describe('Data Persistence Tests (Within Session)', () => {
        test('TC-038 Balance persists across operations', async () => {
            const dataProgram = new DataProgram();
            const ops = new Operations(dataProgram, createMockRl(['200.00']));
            const { logs } = createConsoleSpy();

            await ops.creditAccount();
            await ops.viewBalance();
            await ops.viewBalance();

            expect(logs).toContain('Current balance: 1200.00');
            expect(dataProgram.getBalance()).toBe(1200.00);
        });

        test('TC-039 Read operation does not modify balance', async () => {
            const dataProgram = new DataProgram();
            const ops = new Operations(dataProgram, createMockRl(['100.00']));
            const { logs } = createConsoleSpy();

            await ops.viewBalance();
            await ops.viewBalance();
            await ops.viewBalance();
            await ops.viewBalance();
            await ops.viewBalance();
            await ops.creditAccount();

            expect(logs.filter((log) => log === 'Current balance: 1000.00').length).toBe(5);
            expect(dataProgram.getBalance()).toBe(1100.00);
        });

        test('TC-040 Write operation updates storage', async () => {
            const dataProgram = new DataProgram();
            const ops = new Operations(dataProgram, createMockRl(['300.00']));

            await ops.creditAccount();

            expect(dataProgram.getBalance()).toBe(1300.00);
        });

        test('TC-041 Failed debit preserves original balance', async () => {
            const dataProgram = new DataProgram();
            dataProgram.storageBalance = 500.00;
            const ops = new Operations(dataProgram, createMockRl(['600.00']));

            await ops.debitAccount();

            expect(dataProgram.getBalance()).toBe(500.00);
        });
    });

    describe('Boundary Value Tests', () => {
        test('TC-042 Maximum balance representation', async () => {
            const dataProgram = new DataProgram();
            const ops = new Operations(dataProgram, createMockRl(['998999.99']));

            await ops.creditAccount();

            expect(dataProgram.getBalance()).toBe(999999.99);
        });

        test('TC-043 Minimum non-zero balance', async () => {
            const dataProgram = new DataProgram();
            const ops = new Operations(dataProgram, createMockRl(['999.99']));

            await ops.debitAccount();

            expect(dataProgram.getBalance()).toBeCloseTo(0.01, 2);
        });

        test('TC-044 Zero balance operations', async () => {
            const dataProgram = new DataProgram();
            dataProgram.storageBalance = 0.00;
            const ops = new Operations(dataProgram, createMockRl(['0.01']));
            const { logs } = createConsoleSpy();

            await ops.viewBalance();
            await ops.debitAccount();

            expect(logs).toContain('Current balance: 0.00');
            expect(logs[logs.length - 1]).toBe('Insufficient funds for this debit.');
            expect(dataProgram.getBalance()).toBe(0.00);
        });

        test('TC-045 Decimal precision - two places', async () => {
            const dataProgram = new DataProgram();
            const ops = new Operations(dataProgram, createMockRl(['123.45', '67.89']));

            await ops.creditAccount();
            await ops.debitAccount();

            expect(dataProgram.getBalance()).toBe(1055.56);
        });

        test('TC-046 Large transaction amount', async () => {
            const dataProgram = new DataProgram();
            const ops = new Operations(dataProgram, createMockRl(['100000.00', '50000.00']));

            await ops.creditAccount();
            await ops.debitAccount();

            expect(dataProgram.getBalance()).toBe(51000.00);
        });
    });

    describe('Business Rules Validation Tests', () => {
        test('TC-047 Initial balance rule', () => {
            const dataProgram = new DataProgram();
            expect(dataProgram.getBalance()).toBe(1000.00);
        });

        test('TC-048 No negative balance rule', async () => {
            const dataProgram = new DataProgram();
            dataProgram.storageBalance = 0.00;
            const ops = new Operations(dataProgram, createMockRl(['1.00']));

            await ops.debitAccount();

            expect(dataProgram.getBalance()).toBe(0.00);
        });

        test('TC-049 Credit has no upper limit (within data type)', async () => {
            const dataProgram = new DataProgram();
            const ops = new Operations(dataProgram, createMockRl(['500000.00']));

            await ops.creditAccount();

            expect(dataProgram.getBalance()).toBe(501000.00);
        });

        test('TC-050 Debit requires validation', async () => {
            const dataProgram = new DataProgram();
            const ops = new Operations(dataProgram, createMockRl(['1000.01']));
            const { logs } = createConsoleSpy();

            await ops.debitAccount();

            expect(dataProgram.getBalance()).toBe(1000.00);
            expect(logs[logs.length - 1]).toBe('Insufficient funds for this debit.');
        });

        test('TC-051 Transaction atomicity', async () => {
            const dataProgram = new DataProgram();
            const ops = new Operations(dataProgram, createMockRl(['2000.00']));

            await ops.debitAccount();

            expect(dataProgram.getBalance()).toBe(1000.00);
        });

        test('TC-052 Balance format and precision', async () => {
            const dataProgram = new DataProgram();
            const { logs } = createConsoleSpy();
            const ops = new Operations(dataProgram, createMockRl(['1.23']));

            await ops.creditAccount();

            expect(logs[logs.length - 1]).toBe('Amount credited. New balance: 1001.23');
        });
    });

    describe('Error Handling Tests', () => {
        test('TC-053 Invalid menu selection', async () => {
            const app = new MainProgram();
            const { logs } = createConsoleSpy();

            await app.processChoice('0');

            expect(logs[logs.length - 1]).toBe('Invalid choice, please select 1-4.');
            app.rl.close();
        });

        test('TC-054 Insufficient funds error message', async () => {
            const dataProgram = new DataProgram();
            dataProgram.storageBalance = 500.00;
            const ops = new Operations(dataProgram, createMockRl(['600.00']));
            const { logs } = createConsoleSpy();

            await ops.debitAccount();

            expect(logs[logs.length - 1]).toBe('Insufficient funds for this debit.');
        });

        test('TC-055 Error recovery', async () => {
            const dataProgram = new DataProgram();
            const ops = new Operations(dataProgram, createMockRl(['2000.00', '100.00']));
            const { logs } = createConsoleSpy();

            await ops.debitAccount();
            await ops.creditAccount();

            expect(logs[logs.length - 1]).toBe('Amount credited. New balance: 1100.00');
        });
    });

    describe('Integration Tests', () => {
        test('TC-056 MainProgram to Operations call', async () => {
            const app = new MainProgram();
            const processSpy = jest.spyOn(app.operations, 'process').mockResolvedValue();

            await app.processChoice('1');

            expect(processSpy).toHaveBeenCalledWith('TOTAL ');
            app.rl.close();
        });

        test('TC-057 Operations to DataProgram call', async () => {
            const dataProgram = new DataProgram();
            const ops = new Operations(dataProgram, createMockRl());
            const readSpy = jest.spyOn(dataProgram, 'execute');

            await ops.viewBalance();

            expect(readSpy).toHaveBeenCalledWith('READ');
        });

        test('TC-058 Complete call chain', async () => {
            const dataProgram = new DataProgram();
            const ops = new Operations(dataProgram, createMockRl());
            const { logs } = createConsoleSpy();

            await ops.viewBalance();

            expect(logs[logs.length - 1]).toBe('Current balance: 1000.00');
        });

        test('TC-059 Data passing accuracy', async () => {
            const dataProgram = new DataProgram();
            const ops = new Operations(dataProgram, createMockRl(['250.00']));

            await ops.creditAccount();

            expect(dataProgram.getBalance()).toBe(1250.00);
        });

        test('TC-060 Return value handling', async () => {
            const dataProgram = new DataProgram();
            const { logs } = createConsoleSpy();
            const ops = new Operations(dataProgram, createMockRl());

            await ops.viewBalance();

            expect(logs[logs.length - 1]).toBe('Current balance: 1000.00');
        });
    });

    describe('User Experience Tests', () => {
        test('TC-061 Menu clarity', () => {
            const { logs } = createConsoleSpy();
            const app = new MainProgram();

            app.displayMenu();

            expect(logs[0]).toBe('--------------------------------');
            expect(logs[1]).toBe('Account Management System');
            app.rl.close();
        });

        test('TC-062 Confirmation messages', async () => {
            const dataProgram = new DataProgram();
            const ops = new Operations(dataProgram, createMockRl(['100.00', '50.00']));
            const { logs } = createConsoleSpy();

            await ops.creditAccount();
            await ops.debitAccount();

            expect(logs).toContain('Amount credited. New balance: 1100.00');
            expect(logs).toContain('Amount debited. New balance: 1050.00');
        });

        test('TC-063 Error messages are clear', async () => {
            const dataProgram = new DataProgram();
            dataProgram.storageBalance = 500.00;
            const ops = new Operations(dataProgram, createMockRl(['600.00']));
            const { logs } = createConsoleSpy();

            await ops.debitAccount();

            expect(logs[logs.length - 1]).toBe('Insufficient funds for this debit.');
        });

        test('TC-064 Exit message', async () => {
            const { logs } = createConsoleSpy();
            const app = new MainProgram();

            app.continueFlag = 'NO';
            console.log('Exiting the program. Goodbye!');

            expect(logs[logs.length - 1]).toBe('Exiting the program. Goodbye!');
            app.rl.close();
        });

        test('TC-065 Continuous operation loop', async () => {
            const app = new MainProgram();
            await app.processChoice('1');
            await app.processChoice('1');

            expect(app.continueFlag).toBe('YES');
            app.rl.close();
        });
    });
});
