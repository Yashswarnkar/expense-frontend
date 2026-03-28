# expense-frontend

A local web UI for [expense-classifier](https://github.com/Yashswarnkar/expense-classifier) — a Go CLI that parses AU Bank and HDFC CC statements, classifies transactions with Ollama (mistral), and stores everything in SQLite.

This frontend talks to the Go HTTP API served by `expense-classifier serve`.

## Prerequisites

- Node.js 18+
- [expense-classifier](https://github.com/Yashswarnkar/expense-classifier) built and running with the `serve` command (default port 8080)

## Installation and running

```bash
git clone https://github.com/Yashswarnkar/expense-frontend
cd expense-frontend
npm install
npm run dev
# Open http://localhost:5173
```

## Starting the backend

From your `expense-classifier` directory:

```bash
./expense-classifier serve
# API available at http://localhost:8080
```

## Configuration

Copy `.env.example` to `.env` and adjust if your backend runs on a different port or host:

```bash
cp .env.example .env
```

| Variable       | Default                    | Description                   |
|----------------|----------------------------|-------------------------------|
| `VITE_API_URL` | `http://localhost:8080`    | Base URL of the Go HTTP API   |

## Features

### Dashboard
- Month selector (prev/next arrows) to navigate months
- Total spend card (sum of all spending categories, CC payments excluded)
- CC payments info card (count + total, kept separate from spend charts)
- Bar chart — spending per category
- Pie chart — category distribution (top 8 + "Other")
- Loading skeletons and error messages

### Transactions
- Full paginated table (25 per page) with date, description, amount, type, category, source
- Filter bar: free-text search, category dropdown, source dropdown, date range picker
- Clear filters button
- Inline category editing — click any category badge to change it; update is optimistic (reverts on API error)
- Uncategorized rows highlighted in yellow
- Sortable columns: Date, Amount
- Transaction count ("Showing 25 of 142 transactions")

## Tech stack

- React 18 + Vite + TypeScript
- Tailwind CSS (slate palette, dark-first)
- Recharts (bar + pie charts)
- React Router v6
- Native `fetch` — no HTTP client libraries
