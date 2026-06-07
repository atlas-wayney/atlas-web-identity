# Atlas Access Matrix

Web application for managing user access control across Atlas applications.

## Tech Stack

- **Framework**: Next.js 16 (Pages Router)
- **UI**: HeroUI, Tailwind CSS 4
- **Icons**: Heroicons
- **Data Grid**: AG Grid
- **Forms**: React Hook Form
- **Charts**: Nivo

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
  components/     # Reusable UI components
  lib/            # Configuration and utilities
  pages/          # Next.js pages
    access-matrix/  # Access matrix management
    cases/          # Change request cases
    client-groups/  # Client group management
    clients/        # Client management
    users/          # User management
  types/          # TypeScript type definitions
```

## Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

