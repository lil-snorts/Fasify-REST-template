import Database from './database.js';
import { ClientError, ServerError } from './errors.js';


class CustomerDatabaseUtil {
	constructor(databaseFileName = 'customerDatabase.json') {
		this._database = new Database(databaseFileName)
	}

	async init() {
		await this._database.initialize()
	}

	async addNewCustomerAsync(customerDto) {
		try {
			console.debug(customerDto)
			await this._database.addNewEntityAsync(customerDto, customerDto.employeeId)
		} catch (error) {
			if (error instanceof ServerError || error instanceof ClientError) {
				throw error
			}
			// log and mask error
			console.log(error)
			throw new ServerError("Internal server error")
		}
	}

	async getCustomerAsync(customerIdentifier) {
		try {
			let customer = await this._database
				.getEntityDataAsync(customerIdentifier)
			if (!customer) {
				throw new ClientError("No customer with that id");
			}
			return customer.content
		} catch (error) {
			if (error instanceof ServerError || error instanceof ClientError) {
				throw error
			}
			// log and mask error
			console.log(error)
			throw new ServerError("Internal server error")
		}
	}
}
export default CustomerDatabaseUtil