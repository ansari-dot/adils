# Bakery Application Backend — Monolithic Modular Architecture

Production-ready RESTful API backend for a Bakery Mobile Application built with Node.js, Express.js, and MongoDB.

## Features

- **Auth & Security**: JWT Authentication, Bcrypt Password Hashing, RBAC (User, Staff, Admin), Rate Limiting, Helmet, Input Validation with Joi.
- **Product Management**: Category filtering, price filtering, text search, pagination, stock management.
- **Orders**: Cart checkout, stock reduction, order status pipeline, order history.
- **Custom Cake Requests**: Custom cake submission, admin price quoting & approval lifecycle.
- **AI Bakery Cost Calculator**: Calculates ingredients, labor, overheads, profit margins, and suggested pricing.
- **Baking Courses**: Course listings, enrollments, lesson progress tracking.
- **File Uploads**: Modular storage support for local filesystem and Cloudinary.
- **API Documentation**: Interactive Swagger UI (`/api-docs`).

## Directory Structure

```text
src/
├── app.js
├── server.js
├── config/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── products/
│   ├── orders/
│   ├── customizations/
│   ├── calculator/
│   ├── courses/
│   └── uploads/
├── middlewares/
├── utils/
├── routes/
└── docs/
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB instance (local or MongoDB Atlas)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### Running Tests

```bash
npm test
```

### API Documentation

Access Swagger UI documentation at:
`http://localhost:5000/api-docs`
