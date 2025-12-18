# Altius Global Inc – Full‑Stack Credential Management & Site Crawler

Welcome to **Altius Global Inc**, a full‑stack application for managing user accounts and credentials and securely interacting with external websites.  The system combines a modern React front‑end with a FastAPI back‑end to provide user authentication, role‑based access control, credential storage and retrieval, and automated scraping of external sites.  This repository contains both the front‑end (under `frontend`) and the back‑end (under `backend`), along with services for scraping supported sites.

![System Architecture]({{file:file-EwdCQSRqbFQghfGM5fNcbS}})

## Table of Contents

- [About the Project](#about-the-project)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## About the Project

Altius provides a secure environment for users and administrators to store website credentials and interact with two external “Forex Option” sites.  It uses a **React** front‑end with Vite and Tailwind to deliver a responsive UI, and a **FastAPI** back‑end to provide RESTful APIs, user management and session handling.  The back‑end integrates with PostgreSQL via SQLAlchemy and Pydantic for data validation.

Current functionality includes:

- **User authentication and roles:** The back‑end exposes `/api/users` endpoints for creating, updating and deleting users, retrieving users by ID or role, and logging in【109116684652786†L21-L82】.  Roles such as `admin` determine access rights.
- **Website login & scraping:** The `/login` API accepts a website identifier and user credentials, verifies support, and uses a scraper service to log into the site and return available deals and user data【231846439426346†L17-L20】【231846439426346†L54-L67】.
- **Session & download management:** Successful logins return a `session_id`.  Files associated with deals can be downloaded via `/download?url=…&session_id=…`, which validates sessions and proxies the download【231846439426346†L152-L229】.
- **Health and connectivity checks:** On startup the back‑end tests connectivity to the supported sites (`fo1.altius.finance`, `fo2.altius.finance`)【823418169494717†L62-L75】.  A `/health` endpoint reports service status【231846439426346†L260-L269】.
- **Front‑end user interface:** The React app includes pages for login, profile and website credentials.  Auth state is stored in local storage; routes are protected based on authentication state【400258156771434†L36-L59】.

## Architecture Overview

The diagram below illustrates the high‑level architecture.  Users interact with the **React** front‑end, which sends requests to the **FastAPI** server.  The server persists user data in a PostgreSQL database, manages sessions and roles, and delegates website scraping to a scraper service.  It also proxies file downloads from the external Forex Option sites.  The front‑end never directly connects to the external sites—everything flows through the back‑end for security and auditing.

*(If viewing the Markdown on GitHub, ensure you have downloaded the image assets or replace `ARCH_IMAGE` with a real asset path.)*

## Tech Stack

| Layer        | Tools & Libraries                                                                                                                                                                        | Evidence |
|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| Front‑end   | [React 19](https://react.dev/), TypeScript and [Vite](https://vitejs.dev/) build tool; CSS via [Tailwind CSS](https://tailwindcss.com/).  Major dependencies include React Router, Axios for HTTP requests and React Hook Form with Zod for validation【207596798674123†L11-L20】. | package.json【207596798674123†L11-L20】 |
| Back‑end    | [FastAPI](https://fastapi.tiangolo.com/) for building the REST API, with [Pydantic](https://docs.pydantic.dev/) models, [SQLAlchemy](https://www.sqlalchemy.org/) for DB access and [Uvicorn](https://www.uvicorn.org/) as the ASGI server.  The `main.py` sets up CORS, includes routes and performs connectivity checks【823418169494717†L27-L43】.  Dependency versions are defined in `backend/requirements.txt`【669186602284379†L0-L10】. | requirements.txt【669186602284379†L0-L10】 |
| Scraping    | Custom scraper service under `backend/credentials/services/website_scraper.py` (not shown here) handles logging into supported sites and retrieving available deals【231846439426346†L76-L87】. | login_routes.py【231846439426346†L76-L87】 |
| Database    | Intended to use PostgreSQL (see `psycopg2-binary` in requirements【669186602284379†L4-L6】).  Connection details are provided via environment variables. | requirements.txt【669186602284379†L4-L6】 |
| Utilities   | Authentication tokens via Python‑Jose and password hashing via Passlib; cross‑origin support via CORS middleware【823418169494717†L27-L35】. | main.py【823418169494717†L27-L35】 |

## Getting Started

Follow these steps to run the project locally.  The instructions assume **Python 3.10+** and **Node.js 18+**.  You will also need a PostgreSQL server.

1. **Clone the repository:**

   ```bash
   git clone https://github.com/MichaelLifs/Altius.git
   cd Altius
   ```

2. **Back‑end setup:**

   ```bash
   cd backend
   # install Python dependencies
   pip install -r requirements.txt
   # copy environment template and configure database settings
   cp .env.example .env  # fill in DB credentials, JWT secret, etc.
   # run migrations (optional depending on ORM setup)
   # alembic upgrade head
   ```

3. **Front‑end setup:**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Running the servers:**

   Open two terminals:

   - **Back‑end:**

     ```bash
     cd backend
     uvicorn main:app --reload --host 0.0.0.0 --port 8000
     ```

   - **Front‑end:**

     ```bash
     cd frontend
     npm run dev
     ```

   The API will be available at `http://localhost:8000` and the React app at `http://localhost:3000` (or the port printed by Vite).  You can access interactive API docs at `http://localhost:8000/docs`.

5. **Database:**

   Create a PostgreSQL database and configure the connection string in `.env`.  The back‑end uses SQLAlchemy, so a typical connection string looks like:

   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/altius_db
   JWT_SECRET=your-secret-key
   JWT_ALGORITHM=HS256
   ```

## Configuration

- **Environment variables:** Use the `.env.example` file as a starting point.  At minimum you need database connection details, a JWT secret key, allowed CORS origins and the base URLs of the supported external sites (e.g. `FO1_URL`, `FO2_URL`).  The back‑end loads these settings via [python-dotenv](https://pypi.org/project/python-dotenv/).

- **CORS configuration:** The back‑end enables CORS for common development URLs such as `localhost:3000`【823418169494717†L27-L43】.  Adjust `allow_origins` in `main.py` if your front‑end runs on a different host.

- **Supported websites:** The system currently supports two sites – “Forex Option 1” and “Forex Option 2” – defined in `SUPPORTED_WEBSITES`【231846439426346†L17-L20】.  To add new sites, extend this mapping and implement corresponding scraping logic.

## Usage

1. **Create an admin account:** Use the `/api/users` endpoint or a database migration script to create an initial administrator.  Example request (JSON body):

   ```json
   {
     "email": "admin@admin.com",
     "password": "123456",
     "role": "admin"
   }
   ```

   By default the repository documents an admin user with these credentials【177434173768423†L55-L59】; replace them in production.

2. **Login:** Launch the front‑end and navigate to the login page.  Enter your email and password.  Successful authentication will redirect you to the website credentials page.  Alternatively, call the `/api/users/login` endpoint with JSON containing `email` and `password`【109116684652786†L27-L33】.

3. **Website Credentials:** Use the credentials form to select a supported website and provide its username and password.  Example test accounts (from the original README) include:

   | Site        | Username                       | Password  |
   |-------------|--------------------------------|-----------|
   | `fo1.altius.finance` | `fo1_test_user@whatever.com` | `Test123!`【177434173768423†L65-L70】 |
   | `fo2.altius.finance` | `fo2_test_user@whatever.com` | `Test223!`【177434173768423†L71-L75】 |

   The `/login` API verifies the website is supported【231846439426346†L58-L65】 and returns a `session_id`, user info and a list of deals【231846439426346†L94-L126】.

4. **Downloading files:** Each deal may include associated files.  Use the **Download** button in the UI or call `/download?url=<download_url>&session_id=<your_session_id>`【231846439426346†L152-L229】.  Sessions expire after one hour (see `SESSION_TIMEOUT`).

5. **Health check:** To verify the service is running, call `/health`【231846439426346†L260-L269】.

6. **Important:**  The system connects to live external sites and uses real credentials.  Use test accounts and sample data only; avoid inputting production credentials.  See the warning in the original README【177434173768423†L45-L47】.

## API Reference

### User endpoints (`/api/users`)

| Method & Path         | Description                                 |
|-----------------------|---------------------------------------------|
| `POST /api/users/login` | Authenticate user with email and password; returns JWT/session. |
| `GET /api/users`       | List all users (requires admin).            |
| `GET /api/users/{id}`  | Get a user by ID.                          |
| `POST /api/users`      | Create a new user.                         |
| `PUT /api/users/{id}`  | Update an existing user.                   |
| `DELETE /api/users/{id}` | Soft-delete a user.                      |
| `GET /api/users/role/{role}` | List users by role【109116684652786†L21-L82】. |

### Website endpoints

| Method & Path     | Description                                   |
|-------------------|-----------------------------------------------|
| `POST /login`     | Log into a supported website; requires `website`, `username` and `password` in the body.  Returns `session_id`, user info and deals【231846439426346†L54-L87】【231846439426346†L94-L126】. |
| `GET /download`   | Download a file from a deal; requires `url` and optional `session_id`【231846439426346†L152-L229】. |
| `GET /health`     | Service health check【231846439426346†L260-L269】. |

See the auto‑generated OpenAPI documentation at `/docs` for detailed schemas and response examples.

## Project Structure

```
Altius/
├── backend/               # FastAPI application
│   ├── main.py           # Application entry point and configuration【823418169494717†L27-L43】
│   ├── login_routes.py   # Routes for website login and file download【231846439426346†L54-L126】【231846439426346†L152-L229】
│   ├── routers/          # API router definitions
│   ├── users/            # User controllers, routes and schemas【109116684652786†L21-L82】
│   └── requirements.txt  # Backend dependencies【669186602284379†L0-L10】
├── frontend/             # React application
│   ├── src/
│   │   ├── App.tsx       # Root component and routing【400258156771434†L36-L59】
│   │   ├── pages/        # Login, Profile, WebsiteCredentials pages【371062065251803†L40-L174】
│   │   └── services/     # HTTP clients and auth service
│   └── package.json      # Front‑end dependencies【207596798674123†L11-L20】
└── README.md             # Repository overview (this document)
```

## Contributing

Contributions are welcome!  To report bugs or request features, please open an issue.  If you plan to submit code:

1. Fork the repository and create a new branch (`git checkout -b feature/your-feature`).
2. Make your changes and ensure the front‑end and back‑end both build and tests pass.
3. Update documentation as necessary.
4. Submit a pull request describing your changes.

Consider adding unit tests for new functionality and following the existing code style.  A `CONTRIBUTING.md` file and GitHub issue/PR templates would further improve collaboration.

## License

No license file is currently present, which means others do not have permission to reuse or distribute this code.  Adding an explicit license such as MIT or Apache 2.0 will clarify usage rights.

## Contact

For questions or support, please open an issue on GitHub or contact the repository maintainer.
