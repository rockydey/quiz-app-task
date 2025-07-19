## 1. Setup .env file
```bash
AUTH_SECRET="cFI2+xO9Uny+1Jb8ErhAB493xAiOrbpOSoEest0pKjE=" # Added by `npx auth`. Read more: https://cli.authjs.dev

NODE_ENV="development"
DATABASE_URL="file:./dev.db"

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

RESEND_API_KEY=

AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 2. Run the development server:
```bash
npm install
npx prisma format && npx prisma generate && npx prisma db push && npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## 3. Credential Registration: Verification link is available in console.
