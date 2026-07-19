# STACK : Next.js, NestJS, postgreSQL, Docker, AWS.

## Part 1 : Backend development.

> Build a production-ready monolithic API using NestJS.

1. Authentication and Authorization.

2. Modules, Controllers and Services.

3. Dependency Ingection.

4. Pipes, DTOs and Validation.

5. Database Integration with Prisma.

6. Swagger Documentation.

7. Security with CORS.

8. Guards.

## Part 2 : Frontend development.

> Build the frontend of the e-commerce app using Next.js, Sass, Redux Toolkit.

1. React & Next.js Fundamentals.

2. TypeScript.

3. State Management with Redux Toolkit.

4. Sass & CSS Styling.

5. Connecting to the Backend API.

6. Authentication Flow.

7. Form Handling and Validation.

8. Component Architecture.

## Part 3 : DevOps Deployment.

> Deploy the full application to the cloud and automate the entire deployment workflow.

1. Containerize Backend with Docker.

2. Push Images to AWS ECR (Ellastic Container Registry).

3. Deploy to AWS EC2.

4. Connect Frontend & Backend in Production.

5. Automate Deployments with CI/CD Pipelines.

6. Environment Variables & Secrets Management.

7. Logging & Monitoring Basics.

---

## PREREQUISITES.

1. Installing Node.js.

```sh
~$ wget https://nodejs.org/dist/v26.4.0/node-v26.4.0-linux-x64.tar.xz
```

> Extracting the files and put the executable absolute path in the environment variable.

1. Installing NestJS.

```sh
~$ npm i -g @nestjs/cli
~$ nest new project-name
```

## Part 1 : Backend development.

### 1. Creating the project.

> Go to the directory where to create the project (ex: /home/as-rakot/my-app) and run :

```sh
~$ nest new project-name
```

### 2. Basic definitions.

- **MODULE**

  > A module is a TypeScript class annotated with the **@Module()** decorator. It serves as **_a container that groups related components—such as controllers, services, and providers—into a single, cohesive unit_** to organize your application's architecture.

  Every NestJS application has at least one module, known as the **root module** (typically AppModule). NestJS uses this root module as the entry point to build an internal dependency graph, which helps it resolve how different parts of your code interact and share data.
  - **Key Types of Modules.**
    - **Feature Modules:** Used to encapsulate specific domain or feature area (like `AuthModule` or `Productsmodule`).

    - **Shared modules:** By default, NestJS modules are <u>**_singleton_**</u>. Once created, a module can be **_imported and shared across multiple other modules_** seamlessly.

    - **Global Modules:** Annotated with `@Global()`, these modules provide components that are automatically <u>**available everywhere in the application**</u> without needing to be explicitly imported into other <u>feature modules</u>.
    - **Dynamic Modules:** Highly customizable modules that **_accept configuration parameters_** when imported (often used of **database config** or **environmental variables**, like `ConfigModule.forRoot()`).

  - **Code example.**

    ```ts
    import { Module } from "@nestjs/common";
    import { UsersController } from "./users.controller";
    import { UsersService } from "./users.service";

    @Module({
      imports: [], // Other modules needed here
      controllers: [UsersController], // Registers HTTP routes
      providers: [UsersService], // Registers business logic
      exports: [UsersService], // Allows other modules to use the UsersService
    })
    export class UsersModule {}
    ```

- **CONTROLLER**

  > A controller is a TypeScript class annotated with the **@Controller()** decorator. It is responsible for **_<u>handling</u> incoming HTTP requests from the client_** and **_<u>returning</u> the appropriate HTTP responses back to them_**. While modules act as **structural containers**, controllers serve as the **<u>public routing layer and entry point</u>** for your application's API.

  A controller's main job is to route incoming requests to specific functions based on the HTTP method (GET, POST, PUT, DELETE) and the URL path.

  To keep code maintainable and clean, controllers should **only handle the request-response cycle**. They should never contain heavy business logic or database queries; instead, they delegate those tasks to a **Service** via <u>**dependency injection**</u>.
  - **Key Concepts and Decorators.**

    NestJS relies heavily on decorators to define how a controller behaves:
    - **Routing:** The `@Controller('path')` decorator defines the base route for all endpoints inside that class (e.g., `@Controller('users')`).

    - **HTTP Methods:** Method decorators like `@Get()`, `@Post()`, `@Put()`, and `@Delete()` map specific functions to HTTP actions.

    - **Request Payloads:** Decorators extract data directly from the client's request:

    - `@Body()` to read incoming JSON data.

    - `@Param('id')` to capture URL route parameters (e.g., `/users/42`).

    - `@Query()` to access URL query parameters (e.g., `/users?role=admin`).

  - **Code Example.**

    ```ts
    import { Controller, Get, Post, Body, Param } from "@nestjs/common";
    import { UsersService } from "./users.service";

    @Controller("users") // Base route: /users
    export class UsersController {
      // Injecting the service via the constructor
      constructor(private readonly usersService: UsersService) {}

      @Get() // Handles GET /users
      findAll() {
        return this.usersService.getAllUsers();
      }

      @Get(":id") // Handles GET /users/:id (e.g., /users/12)
      findOne(@Param("id") id: string) {
        return this.usersService.getUserById(id);
      }

      @Post() // Handles POST /users
      create(@Body() createUserDto: any) {
        return this.usersService.createNewUser(createUserDto);
      }
    }
    ```

  - How it integrates with a Module.

    For NestJS to recognize a controller and register its routes, it must be listed in the `controllers` array of its accompanying module:

    ```ts
    @Module({
      controllers: [UsersController], // Tells Nest to listen to /users routes
      providers: [UsersService],
    })
    export class UsersModule {}
    ```

- **SERVICE**

  > A service is a TypeScript class annotated with the **@Injectable()** decorator. It is responsible for **_housing your application's business logic, data processing, and interactions with databases or external APIs_**.

  While controllers handle routing and HTTP requests, services do the actual underlying work.
  - **The Core Purpose of a Service.**

    A service acts as a **provider** in NestJS. Its primary goal is **_to isolate complex code away from the delivery layer (like HTTP or WebSockets)_** so that your logic is <u>**_reusable_**</u>, <u>**_maintainable_**</u>, and <u>**_easy to isolate_**</u> for <u>**unit testing**</u>.

  - **Dependency Injection.**

    To use a service inside a controller (or inside another service), you do not instantiate it manually using the `new` keyword. Instead, you utilize NestJS's built-in **Dependency Injection (DI)** system by <u>**declaring it inside the constructor**</u>.

  - **Code Example.**

    ```ts
    import { Injectable, NotFoundException } from "@nestjs/common";

    @Injectable() // Marks the class so NestJS can manage its lifecycle
    export class UsersService {
      // Mock data array acting as a database
      private users = [
        { id: "1", name: "Alice" },
        { id: "2", name: "Bob" },
      ];

      getAllUsers() {
        return this.users;
      }

      getUserById(id: string) {
        const user = this.users.find((u) => u.id === id);
        if (!user) {
          throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
      }

      createNewUser(dto: { name: string }) {
        const newUser = { id: Date.now().toString(), ...dto };
        this.users.push(newUser);
        return newUser;
      }
    }
    ```

  - **Connecting the Pieces (Module Registration).**

    For a service to be injectable, NestJS needs to know it exists. You must **register it in the <u>_providers array_</u> of a module**:

    ```ts
    @Module({
      controllers: [UsersController],
      providers: [UsersService], // Registering the service here makes it available
      exports: [UsersService], // Optional: Exporting it lets   OTHER modules use it
    })
    export class UsersModule {}
    ```
