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
wget https://nodejs.org/dist/v26.4.0/node-v26.4.0-linux-x64.tar.xz
```

> Extracting the files and put the executable absolute path in the environment variable.

1. Installing NestJS.

```sh
npm i -g @nestjs/cli
nest new project-name
```

## Part 1 : Backend development.

### 1. Creating the project.

> Go to the directory where to create the project (ex: /home/as-rakot/my-app) and run :

```sh
nest new project-name
```

### 2. Basic definitions.

- **MODULE**

  > A module is a TypeScript class annotated with the **@Module()** decorator. It serves as **_a container that groups related components—such as controllers, services, and providers—into a single, cohesive unit_** to organize the application's architecture.

  Every NestJS application has at least one module, known as the **root module** (typically AppModule). NestJS uses this root module as the entry point to build an internal dependency graph, which helps it resolve how different parts of the code interact and share data.
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

  > A controller is a TypeScript class annotated with the **@Controller()** decorator. It is responsible for **_<u>handling</u> incoming HTTP requests from the client_** and **_<u>returning</u> the appropriate HTTP responses back to them_**. While modules act as **structural containers**, controllers serve as the **<u>public routing layer and entry point</u>** for the application's API.

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

- **test/app.e2e-spec.ts**

  In NestJS, `app.e2e-spec.ts` **is a test file automatically generated by the Nest CLI that contains End-to-End (E2E) tests for the root application**.

  Unlike unit tests that isolate a single function or service, E2E tests validate how the entire application works together as a whole unit, tracking a request from the initial network entry point all the way down to the database and back.
  - #### Purpose

    When we create a new NestJS project, this file is placed inside the test/ directory at the root of the workspace. Its primary job is to spin up a lightweight, virtual version of the NestJS application in memory and simulate real HTTP traffic (like a user hitting a / web endpoint) to ensure the routes, modules, and dependencies are wired correctly.

  - #### Key Components Inside the File

    If we open a standard `app.e2e-spec.ts` file, we will find three main parts:
    - **Test.createTestingModule():** A utility provided by NestJS that sets up a mock runtime environment, pulling in your main `AppModule` just like the real application does.

    - **app.init():** The command that initializes the NestJS execution context, bootstrapping your HTTP servers, routes, and middleware in memory.

    - **supertest:** A library imported automatically to simulate HTTP requests (like `.get('/')`) and assert that the server returns the expected status codes (e.g., 200 OK) and body data (e.g., `"Hello World!"`).

  - #### Standard Code Example

  ```ts
  import { Test, TestingModule } from "@nestjs/testing";
  import { INestApplication } from "@nestjs/common";
  import * as request from "supertest";
  import { AppModule } from "./../src/app.module";

  describe("AppController (e2e)", () => {
    let app: INestApplication;

    // 1. Setup: Runs before the tests to spin up the entire application
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule], // Imports your actual codebase
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init(); // Starts the HTTP listener context
    });

    // 2. Test Case: Simulates an HTTP GET request to the root URL
    it("/ (GET)", () => {
      return request(app.getHttpServer())
        .get("/")
        .expect(200) // Asserts the HTTP status code is 200
        .expect("Hello World!"); // Asserts the exact string body returned
    });

    // 3. Teardown: Shuts down the application safely after tests finish
    afterAll(async () => {
      await app.close();
    });
  });
  ```

  - #### How to Run It

  ```bash
  npm run test:e2e
  ```

### 3. Designing the Data Model & Integrating Prisma ORM.

  - #### 1. Installing prisma ORM.

      ```bash
      npm i prisma@latest @prisma/client@latest @prisma/config @prisma/adapter-pg pg
      ```

  - #### 2. Getting prisma properties and version.

    ```bash
    npx prisma -v
    ```

  - #### 3. Initializing prisma configuration.

    ```bash
    npx prisma init

    ✔ Skills installed

    Initialized Prisma in your project

      prisma/
        schema.prisma
      prisma.config.ts
      .env
      .claude/skills/
      .windsurf/skills/
      .agents/skills/
      skills-lock.json

    warn You already have a .gitignore file. Don t forget to add .env in it to not commit any private information.

    Next, choose how you want to set up your database:

    CONNECT EXISTING DATABASE:
      1. Configure your DATABASE_URL in prisma.config.ts
      2. Run prisma db pull to introspect your database.

    CREATE NEW DATABASE:
      Local: npx prisma dev (runs Postgres locally in your terminal)
      Cloud: npx create-db (creates a free Prisma Postgres database)

    Then, define your models in prisma/schema.prisma and run prisma migrate dev to apply your schema.

    Learn more: https://pris.ly/getting-started
    ```

  - #### 4. Creating database schema model.

    - prisma/schema.prisma :

    ```ts
    ...
    enum ERole {
     USER
     ADMIN 
    }

    enum EOrderStatus {
      PENDING
      PROCESSING
      SHIPPED
      DELIVERED
      CANCELLED
    }

    enum EPaymentStatus {
      PENDING,
      COMPLETED,
      FAILED,
      REFUNDED
    }

    model User {
      id            String    @id @default(uuid())
      email         String    @unique
      password      String
      firstName     String?
      lastName      String?
      role          ERole     @default(USER)
      refreshToken  String?

      // OneToMany
      orders        Order[] // OneToMany : One User can have Many Orders.
      carts         Cart[] // OneTomany : One User can have Many Cards.
      payments      Payment[]

      // Timestamps
      createdAt     DateTime  @default(now())
      updatedAt     DateTime  @updatedAt

      // TO LEARN DEEPER....
      @@index([email]) // For Performance Purpose.

      @@map("users") // The name of the table.
    }

    model Order {
      id              String        @id @default(uuid())
      orderNumber     String        @unique @default(cuid())
      status          EOrderStatus
      totalAmount     Decimal       @db.Decimal(10, 2)
      shippingAddress String?
      createdAt       DateTime      @default(now())
      updatedAt       DateTime      @updatedAt

      // OneToMany
      orderItems      OrderItem[]

      // ManyToOne
      userId      String
      user        User          @relation(fields: [userId], references: [id], onDelete: Cascade) // ManyToOne : Many Orders can be owned by One User => One Order is only owned by One User.
      cartId      String?
      cart        Cart?         @relation(fields: [cartId], references: [id]) // ManyToOne : Many Orders can be linked to One Cart => One Order is only linked to zero or one Cart.
    
      // OneToOne
      payment     Payment?

      // TO LEARN DEEPER....
      @@index([userId])
      @@index([orderNumber])
      @@index([status])

      @@map("orders")
    }

    model Cart {
      id        String      @id @default(uuid())
      isChecked Boolean     @default(false)
      createdAt DateTime    @default(now())
      updatedAt DateTime    @updatedAt

      // OneToMany
      orders    Order[]
      cartItems CartItem[]

      // ManyToOne
      userId    String
      user      User        @relation(fields: [userId], references: [id], onDelete: Cascade) // ManyToOne : Many Cards can be owned by One User => One Card is only owned by One User.
    
      // TO LEARN DEEPER....
      @@index([userId])

      @@map("carts")
    }

    model Payment {
      id            String          @id @default(uuid())
      amount        Decimal         @db.Decimal(10, 2)
      status        EPaymentStatus  @default(PENDING)
      currency      String          @default("usd")
      paymentMethod String? // For Payment Providers like : Strippe, PayPal, ...
      transactionId String? // The Transaction ID is generated by the payment provider used.

      // ManyToOne
      userId  String
      user    User    @relation(fields: [userId], references: [id], onDelete: Cascade) // ManyToOne : Many Payments can be owned by one User => One Payment is only done by One User.
    
      // OneToOne
      orderId String  @unique
      order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)

      // TO LEARN DEEPER....
      @@index([orderId])
      @@index([userId])
      @@index([transactionId])

      @@map("payments")
    }

    model Category {
      id          String    @id @default(uuid())
      name        String
      description String?
      slug        String    @unique
      imageUrl    String?
      isActive    Boolean   @default(true)
      createdAt   DateTime  @default(now())
      updatedAt   DateTime  @updatedAt

      //OneToMany
      products    Product[]

      // TO LEARN DEEPER....
      @@index([slug])
      @@index([isActive])

      @@map("categories")
    }

    model Product {
      id          String  @id @default(uuid())
      name        String
      description String?
      price       Decimal @db.Decimal(10, 2)
      stock       Int     @default(0)
      sku         String  @unique
      imageUrl    String?
      isActive    Boolean @default(true)

      // OneToMany
      orderItems  OrderItem[]
      cartItems   CartItem[]

      // ManyToOne
      categoryId  String
      category    Category  @relation(fields: [categoryId], references: [id])

      // Timestamps
      createdAt   DateTime  @default(now())
      updatedAt   DateTime  @updatedAt

      // TO LEARN DEEPER....
      @@index([sku]) // For Performance Purpose.
      @@index([categoryId]) // For Performance Purpose.
      @@index([isActive]) // For Performance Purpose.

      @@map("products") // The name of the table.
    }

    model OrderItem {
      id        String    @id @default(uuid())
      quantity  Int
      price     Decimal   @db.Decimal(10, 2)
      createdAt DateTime  @default(now())
      updatedAt DateTime  @updatedAt

      // ManyToOne
      productId String
      product   Product @relation(fields: [productId], references: [id])
      orderId   String
      order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)

      // TO LEARN DEEPER....
      @@index([orderId])
      @@index([productId])

      @@map("order_items")
    }

    model CartItem {
      id        String    @id @default(uuid())
      quantity  Int       @default(1)
      createdAt DateTime  @default(now())
      updatedAt DateTime  @updatedAt

      // ManyToOne
      productId String
      product   Product @relation(fields: [productId], references: [id])
      cartId    String
      cart      Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)

      @@unique([cartId, productId]) // The combination of cartId and productId must be UNIQUE.

      // TO LEARN DEEPER....
      @@index([cartId])
      @@index([productId])

      @@map("cart_items")
    }
    ```

  - ### 5. Migrating Database.

    ```bash
    npx prisma migrate dev --name init
    ```

  - ### 6. Creating a MODULE called PRISMA.

    ```bash
    npx nest g module prisma
    or
    npx nest generate module prisma

    CREATE src/prisma/prisma.module.ts (83 bytes)
    UPDATE src/app.module.ts (316 bytes)
    ```

    - **src/app.module.ts** is updated by adding PrismaModule inside **imports array**.

    - **src/prisma/prisma.module.ts** is created :

      ```ts
      import { Module } from '@nestjs/common';

      @Module({})
      export class PrismaModule {}
      ```

  - ### 7. Creating PRISMA SERVICE.

    ```bash
    npx nest g service prisma

    CREATE src/prisma/prisma.service.spec.ts (460 bytes)
    CREATE src/prisma/prisma.service.ts (90 bytes)
    UPDATE src/prisma/prisma.module.ts (163 bytes)
    ```

    - **src/prisma/prisma.service.spec.ts** :

      ```ts
      import { Test, TestingModule } from '@nestjs/testing';
      import { PrismaService } from './prisma.service';

      describe('PrismaService', () => {
        let service: PrismaService;

        beforeEach(async () => {
          const module: TestingModule = await Test.createTestingModule({
            providers: [PrismaService],
          }).compile();

          service = module.get<PrismaService>(PrismaService);
        });

        it('should be defined', () => {
          expect(service).toBeDefined();
        });
      });
      ```

    - **src/prisma/prisma.service.ts** :

      ```ts
      import { Injectable } from '@nestjs/common';

      @Injectable()
      export class PrismaService {}
      ```

    - **src/prisma/prisma.module.ts** is updated by adding `PrismaService` in the **providers array** in the object argument of the `@Module` decorator.

      ```ts
      @Module({
        providers: [PrismaService]
      })
      ```

    > **NOTE :** It's necessary to extends PrismaService with PrismaClient, so we can have access to all methods allowed by PrismaClient.

  - ### 8. Updating PRISMA SERVICE in src/prisma/prisma.service.ts and run generating prisma.

    ```ts
    import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
    import { PrismaPg } from '@prisma/adapter-pg';
    import { PrismaClient } from '@prisma/client';
    import { Pool } from 'pg';

    /**
     * @extends PrismaClient : To allow access all methods allowed by this class.
     * @implements OnModuleInit : It will run automatically when Prisma Module Loads.
     * @implements OnModuleDestroy : It will run when the module Stops.
     */
    @Injectable()
    export class PrismaService
      extends PrismaClient
      implements OnModuleInit, OnModuleDestroy
    {
      constructor() {
        super({
          adapter: new PrismaPg(
            new Pool({
              connectionString: process.env.DATABASE_URL,
            }),
          ),
          log:
            process.env.NODE_ENV === 'development'
              ? ['query', 'error', 'warn']
              : ['error'],
        });
      }

      async onModuleInit() {
        await this.$connect();
        console.log('Database connected successfully!');
      }

      async onModuleDestroy() {
        await this.$disconnect();
        console.log('Database disconnected!');
      }
      async cleanDatabase() {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Cannot clean database in production.');
        }

        // Get model keys on the Prisma instance
        const models = Object.keys(this).filter(
          (key) => !key.startsWith('_') && !key.startsWith('$'),
        );

        // Cast `this` as Record<string, any> so TS allows string indexing
        const prismaInstance = this as unknown as Record<string, any>;

        return Promise.all(
          models.map((modelKey) => {
            if (typeof prismaInstance[modelKey]?.deleteMany === 'function') {
              return prismaInstance[modelKey].deleteMany();
            }
          }),
        );
      }
    }
    ```

    ```bash
    npx prisma generate
    ```

    This command just reads the `schema.prisma` file and **generates a custome, type-safe database client (Prisma Client)** specifically tailored to the **data models**.

    When we run it, it :

      - **Creates Prisma Client :** It builds the programmatic interface we use to query our database (e.g., `prisma.user.findMany()`).

      - **Generates TypeScript types :** It generates exact Typescript types for our models, giving us full autocomplete and compile-time error checking in our code editor.

      - **Saves to node_modules :** By default, it outputs this custom code into `node_modules/.prisma/client` so it can be imported seamlessly into our project.

    It is necessary to run it :

      - **After schema changes :** Run it every time we **add, delete or modify** a field or model in our `schema.prisma` file.

      - **After installing dependencies :** Run it after running `npm install` on a fresh project clone, as the generated client is not tracked by Git.

      - **During deployment :** Run it in the **CI/CD build pipeline** before building the application code.

    Now, it's time to start the server in development mode :

    ```bash
    npm run dev
    ```

  - ### 9. Make environment variable accessible :

    ```bash
    npm i @nestjs/config
    ```

    - Inside the src/app.module.ts :

    ```ts
    // ...
    import { ConfigModule } from '@nestjs/config';
    // ...
    @Module({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        // ...
      ],
      controllers: [AppController],
      providers: [AppService],
    })
    export class AppModule {}
    ```