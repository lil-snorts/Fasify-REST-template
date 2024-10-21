import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import CustomerDatabase from '../../src/customerDatabase.js';

const TEST_DATABASE_FILE = 'test.json';

describe('Database Util', () => {
	let customerDatabase;

	// Before each test, initialize the database with the test file
	before(async () => {
		// Create a new instance of the database with the 'test.json' file
		customerDatabase = new CustomerDatabase(TEST_DATABASE_FILE);
		await customerDatabase.initialize();
	});

	// After all tests, delete the test database file
	after(() => {
		// Remove the 'test.json' file
		const filePath = path.resolve(TEST_DATABASE_FILE);
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
	});

	describe('getCustomerDataAsync', () => {
		it('should return customer data for a valid id', async () => {
			const mockCustomerData = { id: 1, content: { firstName: 'John', lastName: 'Doe' } };
			await customerDatabase.addNewCustomerAsync(mockCustomerData);

			const customerId = 1;
			const result = await customerDatabase.getCustomerDataAsync(customerId);
			expect(result).to.deep.equal(mockCustomerData);
		});

		it('should return null for an invalid id', async () => {
			const customerId = 999; // Non-existent ID
			const result = await customerDatabase.getCustomerDataAsync(customerId);
			expect(result).to.be.null;
		});
	});
});
