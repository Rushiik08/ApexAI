# ApexAI — AI-Powered SaaS Platform

An AI-powered content generation platform built with **Next.js, TypeScript, Prisma, PostgreSQL, and Google Gemini**. ApexAI provides a workspace for generating AI content, managing generation history, and tracking usage through a dashboard.

**Live Demo:** [https://apex-ai-steel.vercel.app](https://apex-ai-steel.vercel.app)  
**GitHub Repository:** [https://github.com/Rushiik08/ApexAI](https://github.com/Rushiik08/ApexAI)

---

## Overview

ApexAI is a full-stack SaaS application designed to simplify AI-powered content creation through a single, easy-to-use interface.

Users can create an account, access an AI workspace, generate content, view previous generations, and manage their profile and settings.

The application uses PostgreSQL for persistent data storage and integrates with Google Gemini for AI-powered generation.

## Features

- **User Authentication** — Registration, login, logout, and password-reset functionality.
- **AI Content Generation** — Generate content through an AI-powered workspace.
- **Generation History** — Access previously generated content.
- **Dashboard** — View usage statistics and generation activity.
- **Usage Limits** — Track generation usage against account limits.
- **User Profile and Settings** — Manage user information and preferences.
- **Email Integration** — Send password-reset emails using Resend.
- **Rate Limiting** — Limit repeated API requests to help protect application endpoints.
- **Responsive UI** — A modern interface designed for different screen sizes.
- **Production Deployment** — Hosted on Vercel with a PostgreSQL database on Neon.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | CSS |
| Backend | Next.js Route Handlers |
| Database | PostgreSQL, Neon |
| ORM | Prisma |
| AI Integration | Google Gemini API |
| Authentication | JWT, Jose, bcryptjs |
| Email | Resend |
| Rate Limiting | Upstash Redis |
| Hosting | Vercel |
| Version Control | Git, GitHub |

## Application Architecture

```text
                    User
                     |
                     v
              Next.js Application
                     |
          +----------+-----------+
          |          |           |
          v          v           v
     Authentication  AI APIs   Dashboard
          |          |           |
          |          v           |
          |     Google Gemini    |
          |                      |
          +----------+-----------+
                     |
                     v
               Prisma ORM
                     |
                     v
              Neon PostgreSQL

       Additional Integrations
       +-----------------------+
       | Resend - Email        |
       | Upstash - Rate Limits |
       +-----------------------+
```

## Project Structure

```text
ApexAI/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   └── user/
│   │   ├── history/
│   │   ├── reset-password/
│   │   └── ...
│   ├── components/
│   ├── lib/
│   │   ├── ai/
│   │   ├── auth/
│   │   ├── email.ts
│   │   ├── prisma.ts
│   │   └── rate-limit.ts
│   └── proxy.ts
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

Install or create the following before running the project:

- Node.js and npm
- A PostgreSQL database, such as Neon
- A Google AI Studio API key for Gemini
- A Resend account for email functionality
- An Upstash Redis database for distributed rate limiting

### 1. Clone the repository

```bash
git clone https://github.com/Rushiik08/ApexAI.git
cd ApexAI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root using `.env.example` as a reference.

Configure the following variables:

```dotenv
DATABASE_URL="your-neon-pooled-connection-string"
DIRECT_URL="your-neon-direct-connection-string"

AUTH_SECRET="your-secure-random-secret"

AI_PROVIDER="gemini"
AI_API_KEY="your-gemini-api-key"
AI_MODEL="your-supported-gemini-model"

RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="ApexAI <noreply@your-verified-domain.com>"
APP_URL="http://localhost:3000"

UPSTASH_REDIS_REST_URL="your-upstash-redis-rest-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-rest-token"
```

**Important:**
- Replace the example values with your own credentials.
- Generate a strong `AUTH_SECRET` of at least 32 characters.
- Use a Gemini model supported by your API account.
- Configure a verified sender address in Resend for production email delivery.
- Keep `.env` private. Never commit API keys, database credentials, or authentication secrets to GitHub.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Apply database migrations

Make sure `DATABASE_URL` and `DIRECT_URL` point to the intended database before running:

```bash
npx prisma migrate deploy
```

This applies pending migrations to the configured database. Do not use this command against an unintended database.

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment

ApexAI is deployed using Vercel, with Neon PostgreSQL for database hosting.

To deploy your own instance:

1. Fork or clone the GitHub repository.
2. Import the repository into Vercel.
3. Configure the required production environment variables.
4. Verify the production database connection and apply pending Prisma migrations.
5. Deploy the application.
6. Test authentication, AI generation, database operations, email delivery, and rate limiting.

The application uses environment variables for external service configuration. Production credentials should be stored in the hosting platform's environment settings rather than committed to the repository.

## Security Considerations

- Authentication tokens are managed using secure cookie-based session handling.
- Passwords are hashed before storage.
- Sensitive configuration is supplied through environment variables.
- API endpoints use rate limiting to reduce repeated requests.
- Password-reset tokens are hashed and time-limited.
- Production deployments should use HTTPS and secure cookie settings.
- Database access and user-specific records should be protected with server-side authorization checks.

## Pricing and Billing

The application includes a pricing page for Free, Pro Creator, and Enterprise plans.

**Payment processing is not yet implemented.** Paid-plan checkout and subscription enforcement should be added before offering paid subscriptions to users.

## Future Improvements

- Payment gateway integration and subscription management.
- Additional AI models and generation options.
- Enhanced usage analytics.
- Automated testing and continuous integration.
- Improved monitoring and production error reporting.

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test your changes.
5. Submit a pull request.

## License

No license has been specified yet. Add a `LICENSE` file before explicitly granting others permission to reuse, modify, or distribute this project.

---

**Developed by Rushikesh Kurukale**

GitHub: [Rushiik08](https://github.com/Rushiik08)