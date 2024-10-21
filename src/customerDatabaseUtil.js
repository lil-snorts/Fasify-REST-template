import { JSONFilePreset } from 'lowdb/node'
import fileService from 'fs';
import path from 'path';
import { ServerError } from './errors.js';

const DATABASE_FILE = 'customers.json';

const _database = await JSONFilePreset(DATABASE_FILE, {})

_database.read()

if (!fileService.existsSync(path.resolve(DATABASE_FILE)) || _database.data === null) {
    _database.data = { customers: [] };
    await _database.write();
    console.log(`Database ${DATABASE_FILE} initialised`)
}

const customerDatabase = {
    addNewCustomerAsync: async (customerDto) => {
        if (_database.data.customers.find((entity) => entity.id == customerDto.employeeId)) {
            throw new ServerError("Customer already in Database,\nDatabase not configured to allow duplicate employees")
        }

        _database.data
            .customers
            .push({ id: customerDto.employeeId, content: customerDto })
        _database.write()
    },
    // Returns null if the customer is not found
    getCustomerDataAsync: async (employeeId) => {
        return _database.data
            .customers
            .find((entity) => entity.id == employeeId)
    }
}

export default customerDatabase