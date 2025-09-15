# cu.rl (Custom URL Shortener)

**cu.rl** is a custom URL shortener service built with Django and React. It allows users to generate short and customized URLs from long ones, making it easier to share links across various platforms.

## Live Application

*   **Frontend:** [https://cu-rl.vercel.app/](https://cu-rl.vercel.app/)
*   **Backend API Docs (Swagger):** [https://cu-rl.onrender.com/api/v1/swagger/](https://cu-rl.onrender.com/api/v1/swagger/)

## Key Features

*   **Guest URL Shortening:** Start shortening URLs instantly without an account.
*   **Seamless Account Migration:** Sign up and all your guest-created URLs are automatically migrated to your new account.
*   **Custom Slugs:** Registered users can create personalized, easy-to-remember short links.
*   **Click Analytics:** Track the performance of your links with detailed analytics.

---

## Table of Contents

1.  [Deployment](#deployment)
2.  [Guest User Feature](#guest-user-feature)
3.  [Project Status](#project-status)
4.  [Project Structure](#project-structure)
5.  [Prerequisites](#prerequisites)
6.  [Backend Setup (Django)](#backend-setup-django)
7.  [Frontend Setup (React)](#frontend-setup-react)
8.  [Running the Application](#running-the-application)
9.  [Contributing](#contributing)
10. [License](#license)

---

## Deployment

The application is deployed across multiple services:

-   **Frontend:** Hosted on [Vercel](https://vercel.com/).
-   **Backend:** Hosted on [Render](https://render.com/).
-   **Database:** Hosted on [Supabase](https://supabase.io/).

**Important Performance Note:** The backend is deployed on Render's free tier, which spins down the service after 15 minutes of inactivity. If you are the first visitor after a period of downtime, **the initial page load may take up to 50 seconds**. If the app seems unresponsive, please be patient or try refreshing after a minute. Subsequent requests will be fast.

## Guest User Feature

This application includes a custom guest user implementation to provide a seamless experience.

-   **How it Works:** For any visitor who is not logged in, a temporary guest account is automatically created in the background. This allows new users to begin creating shortened URLs immediately, without the friction of a sign-up form.
-   **Data Migration:** When a guest user decides to register or log in, the application intelligently migrates all the URLs they created as a guest to their permanent account. If any of the guest's URLs are duplicates of links already in the permanent account, the system merges the click analytics and deletes the redundant entry.
-   **Limitations:** Guest users can only generate random short URLs; creating custom slugs and viewing analytics are features reserved for registered users.

## Project Status

This project is currently an **MVP (Minimum Viable Product)**. The core features are functional, but there may be bugs or incomplete sections.

## Project Structure

The project is a monorepo containing two main parts:

-   `curl_project/backend`: The Django REST Framework API.
-   `curl_project/frontend`: The React frontend application.

## Prerequisites

Before you begin, ensure you have the following installed:

-   [Python](https://www.python.org/downloads/) (3.8+)
-   [Node.js](https://nodejs.org/en/download/) (18.x or later)
-   [npm](https://www.npmjs.com/get-npm)
-   [PostgreSQL](https://www.postgresql.org/download/)

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
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure environment variables:**
    Create a `.env` file in the `backend` directory by copying the `.env.ref` file.
    ```bash
    cp .env.ref .env
    ```
    This file is used to configure the application settings. Provide values for the env variables now in you `.env ` file. The `API_ENV` variable determines which settings file to use (`dev` or `prod`). For local development, it defaults to `dev`. You should also add your own `API_SECRET_KEY`.

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

## Contributing

Contributions are welcome! If you find any bugs or issues that are not already in the [GitHub Issues](https://github.com/alemyaobed/cu.rl/issues) section, please create a new issue with detailed context. Your help is greatly appreciated!

When you're ready to contribute code, please follow these steps:

1.  Fork the repository and create your branch: `git checkout -b feature/my-feature`
2.  Commit your changes: `git commit -am 'Add some feature'`
3.  Push to your branch: `git push origin feature/my-feature`
4.  Submit a pull request detailing your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
