Project Overview
The Customer Management API provides two main endpoints:

/customers (POST) - Save customer details to the database.
/customers/{id} (GET) - Retrieve customer details by ID.
Prerequisites
Node.js v14 or higher
npm
Installation
Clone the repository:
bash
Copy code
git clone https://github.com/your-username/customer-management-api.git
Navigate to the project directory:
bash
Copy code
cd customer-management-api
Install dependencies:
bash
Copy code
npm install
Running the API
To start the API server locally, run the following command:

bash
Copy code
npm start
By default, the server will run on http://localhost:3000.

API Documentation
This API follows the OpenAPI 3.0.2 specification. The detailed API documentation can be accessed via Swagger UI once the server is running. You can visit the Swagger UI at:

bash
Copy code
http://localhost:3000/api-docs
Usage
1. Create a Customer
Endpoint: POST /customers

This endpoint is used to save customer details into the database.

Request
Method: POST
URL: /customers
Content-Type: application/json
Body Parameters:
json
Copy code
{
  "firstName": "Adam",
  "lastName": "Faulkner",
  "employeeId": 32,
  "address": "23 Albert Street"
}
Example cURL Command
bash
Copy code
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{
        "firstName": "Adam",
        "lastName": "Faulkner",
        "employeeId": 32,
        "address": "23 Albert Street"
      }'
Responses:
201 Created: Customer saved successfully.
400 Bad Request: Missing or invalid parameters.
500 Internal Server Error: Issue saving the customer.
2. Get Customer Details
Endpoint: GET /customers/{id}

This endpoint retrieves a customer's details by their ID.

Request
Method: GET
URL: /customers/{id}
Path Parameter:
id: Customer ID (integer)
Example cURL Command
bash
Copy code
curl -X GET http://localhost:3000/customers/1
Responses:
200 OK: Customer data retrieved successfully.
json
Copy code
{
  "firstName": "Adam",
  "lastName": "Faulkner",
  "employeeId": 32,
  "address": "23 Albert Street"
}
400 Bad Request: Invalid or missing customer ID.
500 Internal Server Error: Error retrieving customer data.