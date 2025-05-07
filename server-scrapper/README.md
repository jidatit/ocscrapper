# Legal Case Management Backend

A Node.js backend system for managing legal case data and associated files.

## Features

- Store, retrieve, and delete legal case information
- Upload and manage PDF files using Amazon S3
- MongoDB integration with flexible schema for case data
- Complete API suite for case management operations
- Error handling and validation
- Logging system

## API Endpoints

### Store PDF

- **URL:** POST /api/store-pdf
- **Description:** Upload a PDF file and create a basic case entry
- **Request Body:** multipart/form-data with fields:
  - `caseNumber`: Unique identifier for the case
  - `pdfFile`: PDF or TIFF file to upload

### Store Detailed Case Info

- **URL:** POST /api/store-detailed-case-info
- **Description:** Store detailed information for a case
- **Request Body:** JSON with fields:
  - `caseNumber`: Unique identifier for the case
  - `plaintiffs`: Array of plaintiff names
  - `defendants`: Array of defendant names
  - `judgmentDetails`: Array of objects with `name` and `date` fields
  - `caseType`: Type of case
  - `dateFiled`: Date the case was filed
  - `pdfUrl`: URL of the associated PDF file

### Get Case Details

- **URL:** GET /api/case/:caseNumber
- **Description:** Get detailed information for a specific case
- **URL Parameters:** `caseNumber` - The case number to retrieve

### Get All Cases

- **URL:** GET /api/cases
- **Description:** Get a list of all cases with basic details

### Delete Case

- **URL:** DELETE /api/case/:caseNumber
- **Description:** Delete a case and optionally its associated PDF file
- **URL Parameters:** `caseNumber` - The case number to delete
- **Query Parameters:** `deleteFile` - Set to 'true' to also delete the PDF file

## Setup and Configuration

1. Clone this repository
2. Copy `.env.example` to `.env` and configure the environment variables
3. Install dependencies with `npm install`
4. Start the server with `npm start` or `npm run dev` for development

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `MONGODB_URI`: MongoDB connection string
- `AWS_ACCESS_KEY_ID`: AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key
- `AWS_REGION`: AWS region
- `AWS_S3_BUCKET_NAME`: S3 bucket name for file storage