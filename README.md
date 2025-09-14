# cu.rl (Custom URL Shortener)

**cu.rl** is a custom URL shortener service built with Django and React. It allows users to generate short and customized URLs from long ones, making it easier to share links across various platforms.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Prerequisites](#prerequisites)
3. [Backend Setup (Django)](#backend-setup-django)
4. [Frontend Setup (React)](#frontend-setup-react)
5. [Running the Application](#running-the-application)
6. [API Documentation](#api-documentation)
7. [Contributing](#contributing)
8. [License](#license)

## Project Structure

The project is a monorepo containing two main parts:

- `curl_project/backend`: The Django REST Framework API.
- `curl_project/frontend`: The React frontend application.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Python](https://www.python.org/downloads/) (3.8+)
- [Node.js](https://nodejs.org/en/download/) (18.x or later)
- [npm](https://www.npmjs.com/get-npm)
- [PostgreSQL](https://www.postgresql.org/download/)

## Backend Setup (Django)

1.  **Navigate to the backend directory:**
    ```bash
    cd curl_project/backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```
    *On Windows, use `venv\Scripts\activate`*

3.  **Install dependencies:**
    This project separates dependencies into production and development files.

    For a full local development setup (including dev tools), run:
    ```bash
    pip install -r requirements-dev.txt
    ```
    This will install everything from both `requirements.txt` and `requirements-dev.txt`.

4.  **Configure environment variables:**
    Create a `.env` file in the `backend` directory by copying the `.env.ref` file.
    ```bash
    cp .env.ref .env
    ```
    You should add your own `API_SECRET_KEY` to this file.

5.  **Set up the database:**
    By default, the development environment is configured to use **SQLite**, which requires no additional setup.

    If you wish to use **PostgreSQL** for local development, you must first create the database and a user manually. Then, set the `DATABASE_URL` in your `.env` file with your database credentials. For example:
    ```
    DATABASE_URL=postgres://YOUR_USER:YOUR_PASSWORD@localhost/YOUR_DB_NAME
    ```

6.  **Run database migrations:**
    ```bash
    python manage.py migrate
    ```

## Frontend Setup (React)

1.  **Navigate to the frontend directory:**
    ```bash
    cd curl_project/frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Create a `.env` file in the `frontend` directory by copying the `.env.ref` file.
    ```bash
    cp .env.ref .env
    ```
    Update the `.env` file with the URL of your backend server (e.g., `VITE_BACKEND_URL=http://localhost:8000`).

## Running the Application

-   **Run the backend server:**
    From the `curl_project/backend` directory:
    ```bash
    python manage.py runserver
    ```
    The backend will be available at `http://localhost:8000`.

-   **Run the frontend server:**
    From the `curl_project/frontend` directory:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173` (or another port if 5173 is in use).

## API Documentation

The API documentation is automatically generated and can be accessed at `http://localhost:8000/api/v1/swagger/` when the backend server is running.

## Contributing

Contributions are welcome! Please refer to the [GitHub Issues](https://github.com/alemyaobed/cu.rl/issues) for areas where you can contribute. When you're ready to contribute, please follow these steps:

1.  Fork the repository and create your branch: `git checkout -b feature/my-feature`
2.  Commit your changes: `git commit -am 'Add some feature'`
3.  Push to your branch: `git push origin feature/my-feature`
4.  Submit a pull request detailing your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.