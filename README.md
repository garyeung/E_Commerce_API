# E-commerce API
(https://roadmap.sh/projects/ecommerce-api)  
This project outlines the development of a RESTful API for an e-commerce platform.  
The API is designed to handle user authentication, product management, shopping cart functionality, and payment processing through Stripe.  

## Prerequisites
- Node.js (latest)
- npm or yarn
- PostgreSQL database
- TypeScript
- Stripe API

## Installation
```sh
git clone https://github.com/garyeung/E_Commerce_API.git
cd E_Commerce_API

npm install 
```
Creating your .env file according to the .env.example file  

### Usage
```bash
npm run dev
npm run build
npm run test
npm run test:watch
```

## API Endpoints:

### User Oriented:
```sh
    POST /user/login
    POST /user/signup
    POST /user/checkout
    GET /user/cart/all
    POST /user/cart/add
    PUT /user/cart/update
    DELETE /user/cart/remove
```
### Products Oriented:
```sh
    GET /products?search=
    GET /products/:id
```
### Admin Oriented:
```sh
    POST /admin/login
    GET /admin/products
    GET /admin/products/:id
    POST /admin/products/add
    PUT /admin/products/update/:id
    DELETE /admin/products/remove/:id
```
### Stripe Webhook:
```sh
    POST /webhook
```

### Testing:
    Comprehensive unit and integration tests for all API endpoints.

### Advancement  
- Upload and store images
- Order processing and delivery 
- Better database manipulation 