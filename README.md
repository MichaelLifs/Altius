# Altius Global Inc – Full‑Stack Credential Management & Site Crawler

Welcome to **Altius Global Inc**, a full‑stack application for managing user accounts and credentials and securely interacting with external websites.  The system combines a modern React front‑end with a FastAPI back‑end to provide user authentication, role‑based access control, credential storage and retrieval, and automated scraping of external sites.  This repository contains both the front‑end (under `frontend`) and the back‑end (under `backend`), along with services for scraping supported sites.

 :agentCitation{citationIndex='0' label='System Architecture'}


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

- **User authentication and roles:** The back‑end exposes `/api/users` endpoints for creating, updating and deleting users, retrieving users by ID or role, and logging in:contentReference[oaicite:0]{index=0}.  Roles such as `admin` determine access rights.
- **Website login & scraping:** The `/login` API accepts a website identifier and user credentials, verifies support, and uses a scraper service to log into the site and return available deals and user data:contentReference[oaicite:1]{index=1}:contentReference[oaicite:2]{index=2}.
- **Session & download management:** Successful logins return a `session_id`.  Files associated with deals can be downloaded via `/download?url=…&session_id=…`, which validates sessions and proxies the download:contentReference[oaicite:3]{index=3}.
- **Health and connectivity checks:** On startup the back‑end tests connectivity to the supported sites (`fo1.altius.finance`, `fo2.altius.finance`):contentReference[oaicite:4]{index=4}.  A `/health` endpoint reports service status:contentReference[oaicite:5]{index=5}.
- **Front‑end user interface:** The React app includes pages for login, profile and website credentials.  Auth state is stored in local storage; routes are protected based on authentication state:contentReference[oaicite:6]{index=6}.

## Architecture Overview

The diagram below illustrates the high‑level architecture.  Users interact with the **React** front‑end, which sends requests to the **FastAPI** server.  The server persists user data in a PostgreSQL database, manages sessions and roles, and delegates website scraping to a scraper service.  It also proxies file downloads from the external Forex Option sites.  The front‑end never directly connects to the external sites—everything flows through the back‑end for security and auditing.

*(If viewing the Markdown on GitHub, ensure you have downloaded the image assets or replace `ARCH_IMAGE` with a real asset path.)*

## Tech Stack

| Layer        | Tools & Libraries                                                                                                                                                                        | Evidence |
|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| Front‑end   | [React 19](https://react.dev/), TypeScript and [Vite](https://vitejs.dev/) build tool; CSS via [Tailwind CSS](https://tailwindcss.com/).  Major dependencies include React Router, Axios for HTTP requests and React Hook Form with Zod for validation:contentReference[oaicite:7]{index=7}. | package.json:contentReference[oaicite:8]{index=8} |
| Back‑end    | [FastAPI](https://fastapi.tiangolo.com/) for building the REST API, with [Pydantic](https://docs.pydantic.dev/) models, [SQLAlchemy](https://www.sqlalchemy.org/) for DB access and [Uvicorn](https://www.uvicorn.org/) as the ASGI server.  The `main.py` sets up CORS, includes routes and performs connectivity checks:contentReference[oaicite:9]{index=9}.  Dependency versions are defined in `backend/requirements.txt`:contentReference[oaicite:10]{index=10}. | requirements.txt:contentReference[oaicite:11]{index=11} |
| Scraping    | Custom scraper service under `backend/credentials/services/website_scraper.py` (not shown here) handles logging into supported sites and retrieving available deals:contentReference[oaicite:12]{index=12}. | login_routes.py:contentReference[oaicite:13]{index=13} |
| Database    | Intended to use PostgreSQL (see `psycopg2-binary` in requirements:contentReference[oaicite:14]{index=14}).  Connection details are provided via environment variables. | requirements.txt:contentReference[oaicite:15]{index=15} |
| Utilities   | Authentication tokens via Python‑Jose and password hashing via Passlib; cross‑origin support via CORS middleware:contentReference[oaicite:16]{index=16}. | main.py:contentReference[oaicite:17]{index=17} |

## Getting Started

Follow these steps to run the project locally.  The instructions assume **Python 3.10+** and **Node.js 18+**.  You will also need a PostgreSQL server.

1. **Clone the repository:**

   ```bash
   git clone https://github.com/MichaelLifs/Altius.git
   cd Altius
