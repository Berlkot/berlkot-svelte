# Blogging site project

> [!WARNING]
> This project is in WIP state. Planning to finish it in some state 'till end of this year

> [!CAUTION]
> Bun is required to run this project

This site intended for blogging and showcasing artwork for public. For now most of the strings and configuration is hard-coded. However im planning on changing this in the future<sup>TM</sup>

## Setup

### Setting env

1. Install dependencies

```bash
bun install
```

2. Create .env file and set `DATABASE_URL=""` (project uses sqlite) and `ADMIN_SECRET=""` varaibles

### Running dev

```bash
bun run dev
```

### Building

```bash
bun run build
```

### Prisma studio

```bash
# bun still cannot run prisma fully and just hangs
npx prisma studio
```

## Features

Site comes (or for now "will come") with:

- built-in cms for managing content
- gallery
- inline blog editing
- other blog starter features (like about page)
- Text formatting with markdown
