# ALTIUS Global Inc

Full-stack application with React frontend and FastAPI backend for managing website credentials and user access control.

## 🚀 Quick Start

1. **Install backend dependencies:**

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Install frontend dependencies:**

   ```bash
   cd frontend
   npm install
   ```

3. **Setup database connection:**

   - Go to `backend` folder
   - Copy `.env.example` to `.env` (remove EXAMPLE)
   - Edit `.env` and add your database connection details:
     - `DATABASE_URL` - PostgreSQL connection string
     - `SECRET_KEY` - JWT secret key for authentication

4. **Setup database:**

   - Make sure PostgreSQL is running
   - Create a database named `altius_db` (or update `DATABASE_URL` in `.env`)
   - Run database migrations/schema if needed

5. **Run the project:**

   **Terminal 1 - Backend:**

   ```bash
   cd backend
   npm run dev
   ```

   This will start the FastAPI server on `http://localhost:8000`

   **Terminal 2 - Frontend:**

   ```bash
   cd frontend
   npm run dev
   ```

   This will start the React development server on `http://localhost:3000`

**Important:** This system uses real database connections with real data. If you modify or edit anything, please take this into account.

## 🔐 Login Credentials

After starting the application and creating users in the database, you can log in using your registered credentials.

### Default Test Users

You can create test users through the API or directly in the database. Example users:

#### Admin User

- **Email:** `admin@admin.com`
- **Password:** `123456`
- **Role:** `admin`

### Website Credentials

These are the website credentials required for testing the credentials submission feature. These credentials are used to authenticate with the external websites:

#### Website 1: Forex Option 1

- **Website:** `fo1.altius.finance`
- **Username:** `fo1_test_user@whatever.com`
- **Password:** `Test123!`

#### Website 2: Forex Option 2

- **Website:** `fo2.altius.finance`
- **Username:** `fo2_test_user@whatever.com`
- **Password:** `Test223!`

**Note:** These credentials are required as per system requirements for testing the website credentials submission functionality.
