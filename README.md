# User Management and Auth Service API

This project was created as part of the hiring challenge presented by the WHATEVER.WORKS team. I'd like to take a moment to extend my heartfelt
gratitude to the WHATEVER.WORKS team for offering me this incredible opportunity. Working on this
challenge has been both enlightening and rewarding, and I deeply appreciate the trust and
confidence they've placed in me.
This challenge not only allowed me to showcase my skills but also provided a platform to
learn, grow, and collaborate. I value this opportunity greatly and am excited about the
potential to contribute further to the WHATEVER.WORKS team's goals and vision.

Thank you once again to the WHATEVER.WORKS team for this amazing opportunity!

## Project Overview

This project is a User Management and Authentication Service API built using NestJS, TypeORM, SQLite, and Docker. It provides features such as user registration, authentication, and profile management. The project uses TypeORM for database operations and SQLite as the database. Docker is used to containerize the application for easy deployment and development.

## Technologies Used

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **TypeORM**: An ORM for TypeScript and JavaScript (ES7, ES6, ES5) that supports many database types.
- **SQLite**: A small, fast, self-contained, high-reliability, full-featured, SQL database engine.
- **Docker**: A tool designed to make it easier to create, deploy, and run applications by using containers.
- **Swagger**: A tool for documenting APIs.
- **Helmet**: A middleware for securing Express apps by setting various HTTP headers.
- **Winston**: A logger for Node.js applications.

## Project Structure

- **src/**: Contains the source code of the application.
  - **users/**: Contains user-related modules, controllers, and services.
  - **auth/**: Contains authentication-related modules, controllers, and services.
  - **shared/**: Contains shared utilities, helpers, and services.
  - **config/**: Contains configuration files.
  - **main.ts**: Entry point of the application.
  - **app.module.ts**: Main application module.
- **test/**: Contains the setup env for tests for the application.
- **Dockerfile**: Docker configuration for building the application container.
- **docker-compose.yml**: Docker Compose configuration for setting up the application and database services.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed.
- **Docker**: Ensure you have Docker installed.
- **Npm**: Ensure you have npm installed (optional but recommended specially for docker).

## Getting Started

### Overview of Implemented API Functionalities

Here's a brief overview of the key functionalities i’ve implemented so far for our API:

1. **User Management**

   - **Get User Profile**: Enables users to update their profile information and change their password.
   - **update User Profile**: Enables users to update their profile information and change their password.

2. **Authentication**

   - **User Registration**: Allows users to sign up by providing their username and password. Passwords are securely hashed before storage.
   - **User Login**: Authenticates users and issues JWT access and refresh tokens for secure session management.
   - **JWT Authentication**: Utilizes JSON Web Tokens (JWT) to manage user sessions securely. Access tokens have an expiration time, and refresh tokens are used to obtain new access tokens without requiring re-login.
   - **Logout**: Ends the user session by invalidating tokens. Access tokens are marked as blacklisted to prevent further use.
   - **Token Blacklisting**: Implements token blacklisting to handle logouts and invalidate tokens, ensuring they cannot be used after logout.

3. **Database Setup and Management**

   - **SQLite Database**: Uses SQLite as the database solution for development and testing. The database is set up with TypeORM and supports user management operations.
   - **Testing Setup**: Includes scripts for setting up a test database with SQLite, clearing collections, and seeding data.

4. **Testing Strategies**

   - **Unit Testing**: Tests individual components of the application to ensure they work as expected.
   - **End-to-End (E2E) Testing**: Simulates real user scenarios to ensure the entire application functions properly.
   - **Smoke Testing**: Quickly checks key functionalities after changes to catch major issues early.
   - **Stress Testing**: Tests how the system performs under heavy load to ensure stability and performance.

5. **API Documentation**
   - **Swagger Integration**: Provides interactive API documentation using Swagger, making it easier to test and understand the API endpoints.

This setup ensures robust user management, secure authentication, and thorough testing to maintain high-quality and reliable software.

### Clone the Repository

```bash
git clone https://github.com/greenat92/user-management-api-challenge
cd user-management-api-challenge
npm install
```

### Environment Variables

Create a .env file in the root directory with the following content:

```bash

ACCESS_TOKEN_SECRET=1234
REFRESH_TOKEN_SECRET=1234
ACCESS_TOKEN_EXPIRE_TIME=15m
REFRESH_TOKEN_EXPIRE_TIME=7d
PORT=3000
HOST=localhost
APP_NAME=management and auth service api
APP_ENV=local
APP_URL=http://localhost:3000/
DB_NAME=db.sqlite
DB_URI=
DB_NAME_TESTING=dbTesting.sqlite
DB_URI_TESTING=
DATABASE_CONFIG=
LOG_LEVEL=info

```

### Running the Application

#### Without Docker

- **Setup SQLite Database**

  Ensure you have SQLite installed and create a database file localUsersDb.sqlite in the project root.

- **Run the Application**

  ```bash
  npm run start:dev
  ```

#### Using Docker

- **Build and Run the Containers**

  ```bash
  docker-compose up --build
  ```

- **Access the Application**

  The application will be running on <http://localhost:3000/api/docs>

- **Swagger Documentation**

  Access the API documentation at <http://localhost:3000/api/docs>.

### Running Tests

1. **Setup Test Database**

   ```bash
   npm run test:db-setup
   ```

2. **Run All Tests**

   ```bash
   npm run test
   ```

3. **Run Unit Tests**

   ```bash
   npm run test:unit
   ```

4. **Run smoke tests**

   ```bash
   npm run test:smoke
   ```

5. **Run smoke e2e tests**

   ```bash
   npm run test:e2e
   ```

6. **Watch Tests**

   ```bash
   npm run test:watch
   ```

7. **Run Tests with Coverage**

   ```bash
   npm run test:cov
   ```

8. **Debug Tests**

   ```bash
   npm run test:debug
   ```

### Formatting and Linting

- **Format Code**

  ```bash
  npm run format
  ```

- **Format Code**

  ```bash
  npm run lint
  ```

### Deployment

For production deployment, build the application and start using it:

```bash
  npm run build
  npm run start:prod
```

### Logs and Error Handling

The application uses Winston for logging. Logs are printed to the console in JSON format with timestamps. Custom error handling is implemented to log unhandled promise rejections and uncaught exceptions.

### Performance Measurement Using perf_hooks

In modern applications, especially those with high concurrency and complex operations, identifying performance bottlenecks and monitoring system performance is crucial. Without a systematic approach to performance measurement, it is challenging to:

- **Identify Performance Issues**: Developers often face difficulties in pinpointing which parts of the application are causing slowdowns or consuming excessive resources.
- **Maintain Performance Metrics**: Ad-hoc performance logging can be inconsistent, making it hard to compare metrics over time or across different parts of the application.
- **Debug and Optimize**: Without precise measurements, optimizing the application becomes guesswork, which is inefficient and can lead to suboptimal improvements.

**Proposal:**
I proposed the adoption of a dedicated `src/shared/helpers/PerformanceMeasureHelper` class to standardize and streamline performance measurement within our Node.js application. This class will:

- **Generate Unique Identifiers**: Ensure that parallel measurements do not interfere with each other by using ULIDS.
- **Conditional Performance Measurement**: Allow performance measurement to be enabled based on an environment variable or always enabled for specific instances.
- **Automatic Logging**: Integrate with our existing custom logger to automatically log performance data.
- **Consistent Labeling and Formatting**: Ensure that all performance measurements are consistently labeled and formatted, facilitating easier analysis.

### What Do You Think About Testing?

This section to answer the last question of the challenge based on my experience on testing and what implemented so far for this challenge, As known as Testing is key to making sure software works well and is reliable. Here’s a quick look at the different types of testing we use:

1. **Unit Testing**:

   - Tests individual parts of the code.
   - Catches bugs early and makes fixing them easier.

2. **Integration Testing**:

   - Checks how different parts of the system work together.
   - Finds issues with how modules interact.

3. **End-to-End (E2E) Testing**:

   - Simulates real user scenarios to test the whole system.
   - Ensures everything works from start to finish.

4. **Smoke Testing**:

   - Quickly checks if key features work after changes.
   - Helps catch major issues early.

5. **Regression Testing**:

   - Ensures new changes don’t break existing features.
   - Verifies that old bugs haven’t reappeared.

6. **Stress Testing**:
   - Tests how the system handles heavy loads.
   - Finds out how it behaves under extreme conditions.

### Why Testing Matters

- **Find Bugs Early**: Catches issues early, saving time and effort.
- **Better Code Quality**: Encourages clean, maintainable code.
- **Safe Changes**: Confirms that new updates don’t break anything.
- **Documentation**: Acts as a guide to how the software should work.

### Testing Summary

Testing helps us build reliable and high-quality software by finding issues early, ensuring everything works together, and verifying performance under stress. It’s essential for delivering stable and trustworthy applications.

### Watch the Demo

[![Watch the video](https://www.awesomescreenshot.com/video/29976918?key=5a0786528f0bc6095248e3fc25af794a)](docs-demo)

Also I took some notes about designing a rest api:

### REST architecture

ensures clear communication and interoperability, making it easier to
integrate and scale services.

### Caching

boosts performance by storing frequently accessed data, reducing the load on the
database and improving response times. in our case cache the user data.

### Documentation

is crucial in software development as it provides a clear understanding of
code functionality, aids in troubleshooting, and ensures maintainability for future developers.
In our case there’s 2 docs, the README file explaining how to run the project, and an
auto-generated api to explain the apis usage with examples for responses and code errors.

### Conclusion & Result

I've built a REST API with NestJS and sqlite as a database for basic user managements and auth api. with some testing cases and
define some ci-cd workflow using github actions

#### What I Learned

This project was a fantastic learning experience. I got hands-on practice with NestJS,
Sqlite some diffrent testing strategies, It taught me the importance of
good design, planning, and keeping up with best practices in software development.

### What I Would Improve

Too many things should be imporved ;)
Given more time, there are several aspects I would focus on enhancing:

1- Implementing more robust caching strategies to optimise data retrieval.

2- Refactoring and cleaning up the codebase to enhance readability, maintainability, and
overall quality.

3- Implementing a comprehensive testing framework to ensure code reliability and identify
potential issues. i have only added some test cases for unit tests and e2e test just to show you how things are in my mind.

4- As we are dealing with an sql database i wanted to decribe a plan for migrations using typeorm i started working on but Unfortunately i was not able to finish it. So i kept auto-migration `true` for developments.

5- Unfortunately my credit at GCP ended, i wanted to have a ci-cd to deploy it with diffrent env (dev, staging, production, qa, demo) i have added github actions shows that what i wanted to do. So let's disscuss it in our Meeting.

...... Indeed in our domain always there're too many things should be improved with time.

### Thank You

A big thank you to the WHATEVER.WORKS team for this opportunity. Working on this challenge has been
both fun and educational. I appreciate the chance to learn new things and contribute to your
team's goals. Thanks again!
