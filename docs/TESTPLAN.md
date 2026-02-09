# Test Plan - Account Management System

## Document Information

**Application:** Student Account Management System  
**Version:** 1.0 (COBOL Legacy)  
**Target Migration:** Node.js  
**Date Created:** February 9, 2026  
**Test Environment:** COBOL on Linux/GnuCOBOL  

---

## Purpose

This test plan validates the business logic and functionality of the current COBOL Account Management System. It will serve as:
1. Validation criteria with business stakeholders
2. Acceptance criteria for the Node.js migration
3. Foundation for unit and integration test development

---

## Test Coverage

- ✅ Initial System State
- ✅ View Balance Operations
- ✅ Credit Account Operations
- ✅ Debit Account Operations
- ✅ Insufficient Funds Validation
- ✅ Boundary Value Testing
- ✅ Menu Navigation
- ✅ Data Persistence (within session)
- ✅ Sequential Operations
- ✅ Error Handling

---

## Test Cases

### 1. Initial System State Tests

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-001 | Verify default account balance | Application freshly started | 1. Start application<br>2. Select option 1 (View Balance) | System displays: "Current balance: 1000.00" | | | Initial balance per business rule |
| TC-002 | Verify menu displays correctly | Application started | 1. Start application | System displays menu with options 1-4 and labels correctly formatted | | | User interface validation |
| TC-003 | Verify storage initialization | Application started | 1. Start application<br>2. Verify STORAGE-BALANCE in DataProgram | STORAGE-BALANCE initialized to 1000.00 | | | Internal state validation |

---

### 2. View Balance Operation Tests

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-004 | View balance on fresh start | Balance = 1000.00 | 1. Select option 1 | Display: "Current balance: 1000.00"<br>Menu redisplays | | | Read-only operation |
| TC-005 | View balance after credit | Balance = 1000.00 | 1. Credit 250.00<br>2. Select option 1 | Display: "Current balance: 1250.00" | | | Verify persistence after credit |
| TC-006 | View balance after debit | Balance = 1000.00 | 1. Debit 300.00<br>2. Select option 1 | Display: "Current balance: 700.00" | | | Verify persistence after debit |
| TC-007 | Multiple balance views | Balance = 1000.00 | 1. Select option 1<br>2. Select option 1<br>3. Select option 1 | Each view shows same balance: 1000.00 | | | Read-only does not modify balance |

---

### 3. Credit Account Operation Tests

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-008 | Credit small amount | Balance = 1000.00 | 1. Select option 2<br>2. Enter 50.00 | Display: "Amount credited. New balance: 1050.00" | | | Basic credit operation |
| TC-009 | Credit large amount | Balance = 1000.00 | 1. Select option 2<br>2. Enter 500000.00 | Display: "Amount credited. New balance: 501000.00" | | | Test within PIC 9(6)V99 limit |
| TC-010 | Credit with decimal precision | Balance = 1000.00 | 1. Select option 2<br>2. Enter 123.45 | Display: "Amount credited. New balance: 1123.45" | | | Verify decimal handling |
| TC-011 | Credit minimum amount | Balance = 1000.00 | 1. Select option 2<br>2. Enter 0.01 | Display: "Amount credited. New balance: 1000.01" | | | Boundary value test |
| TC-012 | Credit zero amount | Balance = 1000.00 | 1. Select option 2<br>2. Enter 0.00 | Display: "Amount credited. New balance: 1000.00" | | | Edge case validation |
| TC-013 | Multiple sequential credits | Balance = 1000.00 | 1. Credit 100.00<br>2. Credit 200.00<br>3. Credit 300.00<br>4. View balance | Final balance: 1600.00 | | | Cumulative credit validation |
| TC-014 | Credit near maximum balance | Balance = 1000.00 | 1. Select option 2<br>2. Enter 998999.99 | Display: "Amount credited. New balance: 999999.99" | | | Maximum balance test |

---

### 4. Debit Account Operation Tests (Sufficient Funds)

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-015 | Debit small amount | Balance = 1000.00 | 1. Select option 3<br>2. Enter 50.00 | Display: "Amount debited. New balance: 950.00" | | | Basic debit operation |
| TC-016 | Debit large amount | Balance = 1000.00 | 1. Select option 3<br>2. Enter 800.00 | Display: "Amount debited. New balance: 200.00" | | | Significant withdrawal |
| TC-017 | Debit with decimal precision | Balance = 1000.00 | 1. Select option 3<br>2. Enter 123.45 | Display: "Amount debited. New balance: 876.55" | | | Verify decimal handling |
| TC-018 | Debit exact balance | Balance = 1000.00 | 1. Select option 3<br>2. Enter 1000.00 | Display: "Amount debited. New balance: 0.00" | | | Boundary: zero balance |
| TC-019 | Debit minimum amount | Balance = 1000.00 | 1. Select option 3<br>2. Enter 0.01 | Display: "Amount debited. New balance: 999.99" | | | Boundary value test |
| TC-020 | Multiple sequential debits | Balance = 1000.00 | 1. Debit 100.00<br>2. Debit 200.00<br>3. Debit 300.00<br>4. View balance | Final balance: 400.00 | | | Cumulative debit validation |

---

### 5. Debit Account Operation Tests (Insufficient Funds)

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-021 | Debit exceeds balance by small amount | Balance = 1000.00 | 1. Select option 3<br>2. Enter 1000.01 | Display: "Insufficient funds for this debit."<br>Balance remains: 1000.00 | | | Critical business rule |
| TC-022 | Debit exceeds balance significantly | Balance = 1000.00 | 1. Select option 3<br>2. Enter 5000.00 | Display: "Insufficient funds for this debit."<br>Balance remains: 1000.00 | | | Overdraft protection |
| TC-023 | Debit from zero balance | Balance = 0.00 | 1. Debit entire balance to 0.00<br>2. Attempt debit 0.01 | Display: "Insufficient funds for this debit."<br>Balance remains: 0.00 | | | Prevent negative balance |
| TC-024 | Debit after partial withdrawals | Balance = 100.00 | 1. Set balance to 100.00<br>2. Attempt debit 100.01 | Display: "Insufficient funds for this debit."<br>Balance remains: 100.00 | | | Validation after operations |
| TC-025 | Verify balance unchanged after failed debit | Balance = 500.00 | 1. Set balance to 500.00<br>2. Attempt debit 600.00<br>3. View balance | Balance still shows: 500.00 | | | Transaction atomicity |

---

### 6. Mixed Operations Tests

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-026 | Credit then debit | Balance = 1000.00 | 1. Credit 500.00 (Balance: 1500.00)<br>2. Debit 300.00 | Display: "Amount debited. New balance: 1200.00" | | | Sequential operations |
| TC-027 | Debit then credit | Balance = 1000.00 | 1. Debit 400.00 (Balance: 600.00)<br>2. Credit 250.00 | Display: "Amount credited. New balance: 850.00" | | | Reverse sequence |
| TC-028 | Multiple mixed operations | Balance = 1000.00 | 1. Credit 500.00<br>2. Debit 200.00<br>3. Credit 100.00<br>4. Debit 50.00<br>5. View balance | Final balance: 1350.00 | | | Complex transaction sequence |
| TC-029 | Failed debit followed by credit | Balance = 1000.00 | 1. Attempt debit 2000.00 (fails)<br>2. Credit 500.00<br>3. Debit 1200.00 | Balance after credit: 1500.00<br>Balance after debit: 300.00 | | | Recovery from failed operation |
| TC-030 | Credit enabling debit | Balance = 1000.00 | 1. Attempt debit 1500.00 (fails)<br>2. Credit 1000.00<br>3. Debit 1500.00 (succeeds) | Final balance: 500.00 | | | Business workflow validation |

---

### 7. Menu Navigation Tests

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-031 | Select option 1 | Application running | 1. Enter 1 | Executes View Balance operation | | | Menu routing validation |
| TC-032 | Select option 2 | Application running | 1. Enter 2 | Executes Credit Account operation | | | Menu routing validation |
| TC-033 | Select option 3 | Application running | 1. Enter 3 | Executes Debit Account operation | | | Menu routing validation |
| TC-034 | Select option 4 | Application running | 1. Enter 4 | Display: "Exiting the program. Goodbye!"<br>Application terminates | | | Exit functionality |
| TC-035 | Invalid menu choice - zero | Application running | 1. Enter 0 | Display: "Invalid choice, please select 1-4."<br>Menu redisplays | | | Input validation |
| TC-036 | Invalid menu choice - high number | Application running | 1. Enter 9 | Display: "Invalid choice, please select 1-4."<br>Menu redisplays | | | Input validation |
| TC-037 | Menu redisplays after operation | Application running | 1. Select any valid option (1-3)<br>2. Complete operation | Menu automatically redisplays | | | User experience validation |

---

### 8. Data Persistence Tests (Within Session)

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-038 | Balance persists across operations | Balance = 1000.00 | 1. Credit 200.00<br>2. View balance<br>3. View balance again | Both views show: 1200.00 | | | Data persistence validation |
| TC-039 | Read operation does not modify balance | Balance = 1000.00 | 1. View balance 5 times<br>2. Credit 100.00 | Each view shows 1000.00<br>After credit shows: 1100.00 | | | Read-only integrity |
| TC-040 | Write operation updates storage | Balance = 1000.00 | 1. Credit 300.00<br>2. View balance (from storage) | Balance retrieved from storage: 1300.00 | | | Storage update validation |
| TC-041 | Failed debit preserves original balance | Balance = 500.00 | 1. Attempt debit 600.00 (fails)<br>2. View balance | Balance still: 500.00 | | | Rollback on failure |

---

### 9. Boundary Value Tests

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-042 | Maximum balance representation | Balance = 1000.00 | 1. Credit 998999.99 | New balance: 999999.99<br>System handles maximum PIC 9(6)V99 | | | Data type limit test |
| TC-043 | Minimum non-zero balance | Balance = 1000.00 | 1. Debit 999.99 | New balance: 0.01 | | | Minimum balance test |
| TC-044 | Zero balance operations | Balance = 0.00 | 1. Achieve zero balance<br>2. View balance<br>3. Attempt debit | View shows: 0.00<br>Debit fails with insufficient funds | | | Zero balance handling |
| TC-045 | Decimal precision - two places | Balance = 1000.00 | 1. Credit 123.45<br>2. Debit 67.89 | Final balance: 1055.56 | | | Decimal arithmetic accuracy |
| TC-046 | Large transaction amount | Balance = 1000.00 | 1. Credit 100000.00<br>2. Debit 50000.00 | Final balance: 51000.00 | | | Large value handling |

---

### 10. Business Rules Validation Tests

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-047 | Initial balance rule | New account | 1. Start application<br>2. View balance | Balance is exactly 1000.00 | | | BR-001: Default balance |
| TC-048 | No negative balance rule | Balance = 0.00 | 1. Achieve zero balance<br>2. Attempt any debit | All debits fail | | | BR-002: Overdraft protection |
| TC-049 | Credit has no upper limit | Balance = 1000.00 | 1. Credit 500000.00 | Credit succeeds (within data type limits) | | | BR-003: Credit policy |
| TC-050 | Debit requires validation | Balance = 1000.00 | 1. Attempt debit 1000.01 | System validates and rejects | | | BR-004: Debit validation |
| TC-051 | Transaction atomicity | Balance = 1000.00 | 1. Attempt invalid debit<br>2. View balance immediately | Balance unchanged | | | BR-005: All-or-nothing |
| TC-052 | Balance format and precision | Balance = 1000.00 | 1. Credit 1.23<br>2. View balance | Display shows exactly 2 decimal places: 1001.23 | | | BR-006: Currency format |

---

### 11. Error Handling Tests

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-053 | Invalid menu selection | Application running | 1. Enter invalid choice (0, 5, 9, etc.) | Display error message<br>Menu redisplays<br>Application continues | | | Graceful error handling |
| TC-054 | Insufficient funds error message | Balance = 500.00 | 1. Attempt debit 600.00 | Display clear error: "Insufficient funds for this debit." | | | User-friendly error |
| TC-055 | Error recovery | Balance = 1000.00 | 1. Trigger error (invalid menu or insufficient funds)<br>2. Perform valid operation | System recovers and processes valid operation | | | System resilience |

---

### 12. Integration Tests

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-056 | MainProgram to Operations call | Application running | 1. Select option 1 | MainProgram successfully calls Operations with 'TOTAL' | | | Inter-program communication |
| TC-057 | Operations to DataProgram call | Application running | 1. Select option 1 | Operations successfully calls DataProgram with 'READ' | | | Inter-program communication |
| TC-058 | Complete call chain | Application running | 1. Select option 1 | MainProgram → Operations → DataProgram → return path completes | | | End-to-end integration |
| TC-059 | Data passing accuracy | Balance = 1000.00 | 1. Credit 250.00 | Amount correctly passed through all program layers | | | Parameter passing validation |
| TC-060 | Return value handling | Balance = 1000.00 | 1. View balance | Balance value correctly returned from DataProgram to user display | | | Return value integrity |

---

### 13. User Experience Tests

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|--------------|----------------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-061 | Menu clarity | Application running | 1. Start application | Menu is clearly formatted with proper labels and separators | | | Usability validation |
| TC-062 | Confirmation messages | Balance = 1000.00 | 1. Credit 100.00<br>2. Debit 50.00 | Each operation displays clear confirmation with new balance | | | User feedback |
| TC-063 | Error messages are clear | Balance = 500.00 | 1. Attempt debit 600.00 | Error message clearly states the problem | | | Error communication |
| TC-064 | Exit message | Application running | 1. Select option 4 | Display friendly goodbye message before terminating | | | Professional closure |
| TC-065 | Continuous operation loop | Application running | 1. Perform multiple operations<br>2. Verify menu redisplays each time | Menu consistently redisplays until exit selected | | | Workflow continuity |

---

## Test Execution Summary

### Summary Table

| Category | Total Tests | Passed | Failed | Blocked | Not Run | Pass Rate |
|----------|-------------|--------|--------|---------|---------|-----------|
| Initial State | 3 | | | | | |
| View Balance | 4 | | | | | |
| Credit Operations | 7 | | | | | |
| Debit Operations (Sufficient) | 6 | | | | | |
| Debit Operations (Insufficient) | 5 | | | | | |
| Mixed Operations | 5 | | | | | |
| Menu Navigation | 7 | | | | | |
| Data Persistence | 4 | | | | | |
| Boundary Values | 5 | | | | | |
| Business Rules | 6 | | | | | |
| Error Handling | 3 | | | | | |
| Integration | 5 | | | | | |
| User Experience | 5 | | | | | |
| **TOTAL** | **65** | | | | | |

---

## Business Rules Reference

| Rule ID | Rule Description | Test Cases |
|---------|-----------------|------------|
| BR-001 | Initial account balance is $1,000.00 | TC-001, TC-047 |
| BR-002 | No negative balances allowed (overdraft protection) | TC-021, TC-022, TC-023, TC-048 |
| BR-003 | Credits have no upper limit (within data type constraints) | TC-009, TC-014, TC-049 |
| BR-004 | Debits require sufficient funds validation | TC-021-TC-025, TC-050 |
| BR-005 | Transactions are atomic (all-or-nothing) | TC-025, TC-051 |
| BR-006 | Balance format: 9(6)V99 (up to $999,999.99 with 2 decimal places) | TC-042, TC-045, TC-052 |

---

## Test Data Requirements

### Account Balance States Required
- Balance = 0.00
- Balance = 0.01
- Balance = 100.00
- Balance = 500.00
- Balance = 1000.00 (default)
- Balance = 999999.99 (maximum)

### Transaction Amounts Required
- 0.00 (zero)
- 0.01 (minimum)
- 50.00, 100.00, 200.00, 300.00 (small to medium)
- 500.00, 800.00, 1000.00 (large)
- 123.45, 67.89 (decimal precision)
- 5000.00, 50000.00, 100000.00 (very large)
- 998999.99 (near maximum)

---

## Dependencies and Prerequisites

### Technical Dependencies
- GnuCOBOL compiler installed
- Linux/Unix environment
- Compiled executable: `accountsystem`
- Terminal access for interactive testing

### Test Environment Setup
```bash
# Compile the application
cobc -x src/cobol/main.cob src/cobol/operations.cob src/cobol/data.cob -o accountsystem

# Run the application
./accountsystem
```

### Test Data Setup
Each test should start with a fresh application instance or known balance state.

---

## Testing Notes

### Manual Testing Approach
1. Start application fresh for state-dependent tests
2. Follow test steps exactly as documented
3. Record actual results in "Actual Result" column
4. Mark status as Pass/Fail
5. Add comments for any deviations or observations

### Automated Testing Considerations (Node.js Migration)
1. All test cases can be automated using Jest or Mocha
2. Each test should have setup (initial balance) and teardown
3. Mock user input for menu selections and amount entries
4. Assert on both displayed messages and internal state
5. Integration tests should validate full call stack
6. Use test fixtures for known balance states

### Known Limitations to Test Around
1. Balance does not persist across application restarts
2. Single account only (no account ID needed)
3. No transaction history to validate
4. No concurrent access scenarios to test

---

## Acceptance Criteria

### For Business Stakeholder Approval
- ✅ All 65 test cases executed
- ✅ 100% pass rate for critical business rules (BR-001 through BR-006)
- ✅ Zero failed tests in categories: Business Rules, Insufficient Funds, Data Persistence
- ✅ All error handling tests pass
- ✅ Clear documentation of any limitations

### For Node.js Migration
- ✅ Test plan approved by business stakeholders
- ✅ All test cases translated to automated unit tests
- ✅ Integration tests cover inter-module communication
- ✅ New Node.js implementation passes all 65 test cases
- ✅ Performance benchmarks established

---

## Change Log

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-02-09 | 1.0 | Development Team | Initial test plan creation for COBOL legacy application |

---

## Approval Signatures

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Business Stakeholder | | | |
| QA Lead | | | |
| Development Lead | | | |
| Project Manager | | | |

---

*This test plan serves as the foundation for validating both the current COBOL implementation and the future Node.js migration.*
