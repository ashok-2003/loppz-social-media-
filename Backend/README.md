# Project Name

A robust backend API for LOOPZ built with TypeScript, Node.js, Express, and Prisma ORM.

## 🚀 Features

- **TypeScript** - Type-safe development
- **Express.js** - Fast and minimalist web framework
- **Prisma ORM** - Modern database toolkit
- **Environment Configuration** - Secure configuration management
- **RESTful API** - Clean and intuitive API design

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- Database (PostgreSQL, MySQL, or SQLite based on your configuration)

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd <project-name>
```

### 2. Install dependencies

```bash
npm install
```



### 3. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Open `.env` and update the following variables:

```env
# Database
DATABASE_URL="your-database-connection-string"

# Server
PORT=3000

```

### 4. Start the server

Build the project and setup the database:

```bash
# This will run migrations and compile TypeScript
npm run build

# (Optional) Seed the database with sample data
npm run db:seed
```

### 5. Start the server

```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).


## 🔧 Database Management

### Prisma Commands

```bash
# View your data
npx prisma studio

# Generate migration
npx prisma migrate dev --name migration-name

# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Seed database
npm run db:seed
```

## 🌐 API Endpoints

### Base URL
```
http://localhost:5000/
```


### Build and Start

```bash
# Build the project (runs migrations and compiles TypeScript)
npm run build

# Start the server
npm start
```



## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


**Happy coding! 🎉**