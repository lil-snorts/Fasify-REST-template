import { expect } from 'chai';
import customerDatabase from '../../src/customerDatabaseUtil.js';

describe('Database Util', () => {
	describe('getCustomerDataAsync', () => {
		it('should return customer data for a valid id', async () => {
			const mockCustomerData = { content: { id: 1, firstName: 'John', lastName: 'Doe' } };
			// Mock the database call
			const customerId = 1;
			const result = await databaseUtil.getCustomerDataAsync(customerId);
			expect(result).to.deep.equal(mockCustomerData);
		});

		it('should return null for an invalid id', async () => {
			const customerId = 999; // Non-existent ID
			const result = await databaseUtil.getCustomerDataAsync(customerId);
			expect(result).to.be.null;
		});
	});
});
