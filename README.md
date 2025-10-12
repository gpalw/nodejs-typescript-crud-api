# Goldenset API Home Assignment - [Wen Liang]

This project is a complete CRUD API for a user management system, built with Node.js, TypeScript, Express, Prisma, and PostgreSQL. It also includes a comprehensive test suite and a simple React-based UI for demonstration.


##  Quick Start

### Run in CodeSandbox
This CodeSandbox project is fully pre-configured and runs automatically with one click — no additional database setup is required.

1. Open this project in **[CodeSandbox](https://codesandbox.io/p/github/gpalw/nodejs-typescript-crud-api/main?embed=1&import=true&showConsole=true)**.  
2. You only need to open the shared sandbox link — no manual setup required.
   e.g. using a free [Neon](https://neon.tech) PostgreSQL instance.)
3. CodeSandbox will automatically:
   - Install dependencies  
   - Generate Prisma client (`postinstall`)  
   - Apply migrations (`prestart`)  
   - Launch the server (`npm start`)

Once the project starts, visit:

```
https://<sandbox-id>--3000.app.codesandbox.io/health
```
If you see `{ "status": "ok" }`, the API is running successfully.

## Run Locally

1. Clone this repository:
   ```bash
   git clone https://github.com/gpalw/nodejs-typescript-crud-api.git
   cd nodejs-typescript-crud-api
   ```
2. Create `.env` from the example:
   ```bash
   cp .env.example .env
   ```
   Fill in your PostgreSQL connection:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require&schema=public"
   ```
3. Install and start:
   ```bash
   npm install
   npm run migrate:deploy
   npm start
   ```
4. The API runs on `http://localhost:3000`.



## Example API Endpoints

| Method | Endpoint | Description |
|---------|-----------|-------------|
| `POST` | `/users` | Create a new user (password validation + unique email) |
| `GET` | `/users` | Retrieve all non-deleted users |
| `GET` | `/users/:email` | Retrieve a single user by email |
| `PATCH` | `/users/:email` | Update first/last name or unique email |
| `DELETE` | `/users` | Soft delete by setting `deletedAt` (requires password) |

Example health check:
```bash
curl https://<sandbox-id>--3000.app.codesandbox.io/health
# → { "status": "ok" }
```

## Approach to Solving the Problem

My approach was to build a robust, scalable, and maintainable API by following modern development best practices.

* **Layered Architecture:** The application is structured into distinct layers (Routes, Controllers, Services) to ensure a clear separation of concerns. This makes the code easier to read, debug, and extend.
* **Centralized Error Handling:** I implemented a centralized error handling strategy using an `asyncHandler` wrapper and a global `errorHandler` middleware. This keeps the controller logic clean and ensures all API errors are handled consistently and gracefully.
* **Schema Validation:** I used **Zod** for data validation at the service layer. This ensures that all incoming data conforms to the required schema before it reaches the database logic, providing an early layer of protection and clear error messages.
* **Database & ORM:** I chose **Prisma** as the ORM for its excellent TypeScript support and type safety, which significantly reduces runtime errors. It also simplifies database migrations and queries.
* **Security:** Security was a key consideration. All user passwords are encrypted using **bcrypt** before being stored. The API also sanitizes user data before sending it to the client, ensuring sensitive information like password hashes is never exposed.
* **Testing Strategy:** I wrote a comprehensive test suite using **Jest** and **Supertest**.
    * **Integration Tests:** The primary focus was on integration tests that simulate real API calls, covering every endpoint for both successful ("happy path") and failing ("sad path") scenarios.
    * **Test Isolation:** All tests are fully independent, using a `beforeEach` hook to reset the database. This ensures reliability and prevents tests from interfering with one another.
    * **High Coverage:** The test suite achieves 100% branch and line coverage for all critical business logic in the controllers and services.

## How much AI did you use?

I used an AI assistant (ChatGPT/Gemini) as a **pair programming helper**, mainly for:
- Debugging issues such as Prisma migrations or Jest coverage setup
- Refactoring repetitive logic into cleaner abstractions
- Clarifying best practices (test isolation, environment configuration)
- Generating boilerplate for the simple React UI

All architecture, schema design, and business logic were independently written and verified by me.

## Where are the places you could do better?

Given more time, I would improve the project in the following areas:

* **More Granular Unit Tests:** While the integration tests are comprehensive, I would add more specific unit tests for each service function, mocking the database layer (Prisma). This would make the tests run even faster and be completely independent of the database.
* **Frontend Framework:** The current UI is a simple, single-file React app for quick demonstration. For a real-world application, I would build it using a proper framework like **Next.js** or a build tool like **Vite**. This would provide better performance, code splitting, and a superior developer experience.
* **Configuration Management:** For a production environment, I would use a library like `dotenv` to manage environment variables (like database connection strings and secrets) securely, rather than potentially having them in the codebase.
* **UI Testing:** The UI does not have its own tests. I would add unit and integration tests using **Jest** and **React Testing Library** to cover component rendering and user interactions.