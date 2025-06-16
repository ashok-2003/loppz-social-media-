# Next.js Full-Stack Application

LOOPZ Frontend


## 🛠️ Technologies Used

- [Next.js 15](https://nextjs.org/docs/getting-started) - React framework with App Router
- [HeroUI v2](https://heroui.com/) - Modern React UI library
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Tailwind Variants](https://tailwind-variants.org) - Tailwind CSS variant API
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Axios](https://axios-http.com/) - HTTP client
- [Lucide React](https://lucide.dev/) - Beautiful & consistent icons

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun package manager

### Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd <project-name>
```

2. **Install dependencies:**

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Set up environment variables:**

Copy the `.env.example` file to `.env.local` and configure your environment variables:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual values:

```env
NEXTAUTH_SECRET="your-secret-key-here"
BACKEND_API_URL="http://localhost:5000"
```


4. **Start the development server:**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js session encryption | Yes |
| `BACKEND_API_URL` | URL of your backend API server | Yes |

## 🏗️ Project Structure

```
├── app/                    # Next.js App Router directory
├── components/             # Reusable React components
├── lib/                    # Utility functions and configurations
├── public/                 # Static assets
├── styles/                 # Global styles and Tailwind config
├── types/                  # TypeScript type definitions
├── .env.example           # Environment variables template
├── .eslintrc.json         # ESLint configuration
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## 📦 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint and fix issues automatically

## 🎨 UI Components

This project uses HeroUI components including:

- **Navigation**: Navbar, Dropdown, Listbox
- **Data Display**: Avatar, Badge, Card, Chip, Code, User
- **Form Controls**: Button, Input, Select, Switch
- **Feedback**: Progress, Spinner, Toast
- **Layout**: Tabs, System utilities
- **Typography**: Link, Snippet
- **Utilities**: KBD (keyboard shortcuts)

## 🔐 Authentication

NextAuth.js is configured for handling authentication. The setup supports:

- Multiple authentication providers
- Session management
- Protected routes
- Type-safe authentication with TypeScript

## 🌐 API Integration

Axios is configured for making HTTP requests to your backend API. The base URL is configurable via the `BACKEND_API_URL` environment variable.

## 🎯 Development Setup



### Code Quality

This project includes:
- **ESLint** with Next.js, React, and TypeScript rules
- **Prettier** for consistent code formatting
- **TypeScript** for type checking
- Pre-configured import sorting and unused import removal



## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

Licensed under the [MIT license](https://github.com/heroui-inc/next-app-template/blob/main/LICENSE).
