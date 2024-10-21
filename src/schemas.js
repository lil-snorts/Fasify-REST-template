
export const postCustomerSchema = {
    body: {
        type: 'object',
        required: ['firstName', 'lastName', 'address', 'employeeId'],
        properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            address: { type: 'string' },
            employeeId: { type: 'integer' }
        }
    }
}

export const getCustomerIdSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'integer' }
        }
    }

}