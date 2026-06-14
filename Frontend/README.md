# Sid's Automations Contact Manager

A fullstack SaaS contact management application built with React, Node.js, Express, MongoDB Atlas, JWT Authentication, and n8n automation.

## Overview

Sid's Automations Contact Manager is a modern fullstack web application designed to manage contacts securely and efficiently. The application includes user authentication, protected routes, contact management features, and automation-ready integrations for future WhatsApp and workflow automations.

## Features

### Authentication & Security

* User Registration
* User Login
* JWT Authentication
* Password Hashing with bcryptjs
* Protected API Routes
* User-Isolated Contact Data

### Contact Management

* Create Contacts
* View Contacts
* Edit Contacts
* Delete Contacts
* Search Contacts
* Contact Counter Dashboard
* International Phone Number Support

### Database

* MongoDB Atlas
* Mongoose ODM
* Cloud Database Storage

### Automation

* n8n Webhook Integration
* Automation-Ready Architecture
* WhatsApp Integration Structure (Z-API Ready)

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* Tailwind CSS
* React Phone Input 2

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT (jsonwebtoken)
* bcryptjs
* dotenv

### Automation & Integrations

* n8n
* Webhooks
* Z-API (planned integration)

## Project Structure

```bash
Frontend/
├── src/
├── public/
├── package.json

Backend/
├── server.js
├── .env
├── package.json
```

## Installation

### Clone Repository

```bash
git clone <repository-url>
```

### Backend

```bash
cd Backend
npm install
node server.js
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

## Environment Variables

Create a .env file inside the Backend folder:

```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key
N8N_WEBHOOK_URL=your_n8n_webhook_url
```

## Future Improvements

* Contact Categories
* Notes and Tags
* File Uploads
* User Profile Management
* WhatsApp Automation
* Email Automation
* Dashboard Analytics
* Contact Export (CSV / Excel)

## Author

Renan Melo de Oliveira Cardoso

Fullstack Developer

* React
* Node.js
* Express
* MongoDB
* APIs
* Automation
* n8n
