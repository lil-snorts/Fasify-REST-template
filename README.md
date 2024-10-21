# Project Overview
The Customer Management API provides two main endpoints for managing customer data. To run this project, you need to have Node.js version 22 or higher installed.

## Endpoints
The API provides the following endpoints:

* `/customers` (POST) - Save customer details to the database.
* `/customers/{id}` (GET) - Retrieve customer details by ID.

## Prerequisites
* Node.js v22 or higher
* npm

## Installation
To install the project, follow these steps:

* Clone the repository:
```bash
git clone https://github.com/lil-snorts/node-integration-engineer-technical-exam.git
```
* Navigate to the project directory:
```bash
cd node-integration-engineer-technical-exam
```
* Install dependencies:
```bash
npm install
```

## Running the API
To start the API server locally, run the following command:
```bash
npm start
```
By default, the server will run on `http://localhost:3000`.

## API Documentation
This API follows the OpenAPI 3.0.2 specification. There is no public swagger.

## Usage
### 1. Create a Customer
Endpoint: `POST /customers`

This endpoint is used to save customer details into the database.

* Request:
	+ Method: `POST`
	+ URL: `/customers`
	+ Content-Type: `application/json`
	+ Body Parameters:
```json
{
  "firstName": "Joe",
  "lastName": "Bloggs",
  "employeeId": 32,
  "address": "23 Alberta Road"
}
```
* Example cURL Command:
```bash
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{
      "firstName": "Joe",
      "lastName": "Bloggs",
      "employeeId": 32,
      "address": "23 Alberta Road"
      }'
```
* Responses:
	+ 201 Created: Customer saved successfully.
	+ 400 Bad Request: Missing or invalid parameters.
	+ 500 Internal Server Error: Issue saving the customer.

### 2. Get Customer Details
Endpoint: `GET /customers/{id}`

This endpoint retrieves a customer's details by their ID.

* Request:
	+ Method: `GET`
	+ URL: `/customers/{id}`
	+ Path Parameter:
		- `id`: Customer ID (integer)
* Example cURL Command:
```bash
curl -X GET http://localhost:3000/customers/1
```
* Responses:
	+ 200 OK: Customer data retrieved successfully.
```json
{
  "firstName": "Joe",
  "lastName": "Bloggs",
  "employeeId": 32,
  "address": "23 Alberta Road"
}
```
	+ 400 Bad Request: Invalid or missing customer ID.
	+ 500 Internal Server Error: Error retrieving customer data.