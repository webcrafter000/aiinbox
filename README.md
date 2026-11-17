# AI Knowledge Inbox

A minimal, production-style web application for saving notes and web pages, embedding them into vector chunks, and asking questions answered with verifiable source citations via RAG (Retrieval-Augmented Generation).

---

## Features

- **Multi-Source Content Ingestion**:
  - **Text Notes**: Ingest raw markdown, meeting notes, research snippets, or memos.
  - **Web URLs**: Server-side webpage scraping with HTML boilerplate removal (`<script>`, `<style>`, `<nav>`, `<footer>`) and title extraction.
- **Intentional Chunking**:
  - Boundary-aware sliding window (~600 characters with 100 character overlap) that splits across paragraphs and sentences rather than cutting mid-sentence.
- **Vector Storage & Cosine Similarity**:
  - Embedded using Google Gemini `text-embedding-004` (768 dimensions).
  - Stored in SQLite with embedded float vectors.
  - In-process cosine similarity ranking with confidence score thresholds.
- **Cited RAG Pipeline**:
  - Context synthesis using `gemini-3.6-flash`.
  - Inline source citations (`[Source 1]`, `[Source 2]`) referencing original text snippets, titles, URLs, and similarity scores.
- **Clean Two-Column UI**:
  - React + Vite + Tailwind CSS with responsive layout, real-time status indicators, and expandable source snippets.

---

## Architecture & Directory Structure

```text
busy-faraday/
├── server/
│   ├── src/
│   │   ├── config.ts              # Typed environment config validation
│   │   ├── db/
│   │   │   ├── connection.ts      # SQLite connection & schema initialization
│   │   │   └── repository.ts      # Data access layer for items and chunks
│   │   ├── services/
│   │   │   ├── scraper.ts         # Server-side URL fetching & HTML clean-up
│   │   │   ├── chunker.ts         # Boundary-aware sliding window chunking
│   │   │   ├── embedding.ts       # Gemini text-embedding-004 client
│   │   │   ├── vectorStore.ts     # Cosine similarity ranking & search
│   │   │   └── rag.ts             # RAG prompt assembly & Gemini 3.6 Flash client
│   │   ├── routes/
│   │   │   ├── ingest.ts          # POST /api/ingest
│   │   │   ├── items.ts           # GET /api/items, DELETE /api/items/:id
│   │   │   └── query.ts           # POST /api/query
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts    # Centralized HTTP error handler
│   │   │   └── logger.ts          # Structured JSON request logger
│   │   └── index.ts               # Express bootstrap
│   ├── package.json
│   └── tsconfig.json
├── client/
│   ├── src/
│   │   ├── api.ts                 # Typed fetch client
│   │   ├── components/
│   │   │   ├── Header.tsx         # App header with status badge
│   │   │   ├── IngestForm.tsx     # Note / URL ingestion form
│   │   │   ├── ItemsList.tsx      # Saved items with chunk counts & delete action
│   │   │   ├── QuerySection.tsx   # Search input & sample queries
│   │   │   └── AnswerCard.tsx     # Answer display with cited source snippets
│   │   ├── App.tsx                # Two-pane layout & state coordination
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── .env.example
├── .gitignore
└── README.md
```

---

## Setup & Running

### 1. Requirements
- Node.js 18+ (tested on Node v25)
- Free-tier [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 2. Configure Environment
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Open `.env` and insert your Gemini API key:
```env
GEMINI_API_KEY=AIzaSy...
PORT=3001
```

### 3. Install Dependencies
```bash
# In server directory
cd server
npm install

# In client directory
cd ../client
npm install
```

### 4. Start the Application
Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
# Starts on http://localhost:3001
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Starts on http://localhost:5173
```
Visit **`http://localhost:5173`** in your browser.

---

## API Reference

### 1. Ingest Note or URL
- **Endpoint**: `POST /api/ingest`
- **Request Body (Text Note)**:
  ```json
  {
    "type": "text",
    "title": "Project Requirements",
    "content": "The application must support offline sync and export data to JSON."
  }
  ```
- **Request Body (Web URL)**:
  ```json
  {
    "type": "url",
    "content": "https://en.wikipedia.org/wiki/Retrieval-augmented_generation"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "item": {
      "id": "e6fbbda8-7cfa-40ef-867c-6d2716b0bbcb",
      "type": "text",
      "title": "Project Requirements",
      "source_url": null,
      "created_at": "2026-11-17T06:00:00.000Z",
      "chunk_count": 1
    }
  }
  ```

### 2. List Saved Items
- **Endpoint**: `GET /api/items`
- **Response (`200 OK`)**:
  ```json
  {
    "items": [
      {
        "id": "e6fbbda8-7cfa-40ef-867c-6d2716b0bbcb",
        "type": "text",
        "title": "Project Requirements",
        "raw_content": "The application must support offline sync...",
        "source_url": null,
        "created_at": "2026-11-17T06:00:00.000Z",
        "chunk_count": 1
      }
    ]
  }
  ```

### 3. Ask a Question (RAG)
- **Endpoint**: `POST /api/query`
- **Request Body**:
  ```json
  {
    "query": "What export format does the project require?"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "answer": "According to [Source 1], the project requires data to be exported to JSON.",
    "sources": [
      {
        "sourceNumber": 1,
        "chunkId": "1b080ff6-4e56-4c4f-a7e8-e564d6db8f01",
        "itemId": "e6fbbda8-7cfa-40ef-867c-6d2716b0bbcb",
        "title": "Project Requirements",
        "type": "text",
        "sourceUrl": null,
        "snippet": "The application must support offline sync and export data to JSON.",
        "score": 0.88
      }
    ]
  }
  ```

### 4. Delete an Item
- **Endpoint**: `DELETE /api/items/:id`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Item deleted successfully"
  }
  ```

---

## Non-Functional Tradeoffs & Production Considerations

1. **Chunking Strategy**:
   - *Current*: Boundary-aware sliding window (~600 chars with 100 char overlap) preserving paragraph and sentence boundaries.
   - *Tradeoff*: Very fast and works across arbitrary text, but lacks semantic understanding of document hierarchy (e.g. nested tables, markdown header levels).
   - *Production*: Implement hierarchical chunking (preserving parent section metadata) and specialized markdown/DOM tree extractors.

2. **Vector Store**:
   - *Current*: SQLite storing float vector arrays with in-process cosine similarity calculations.
   - *Tradeoff*: Zero external database dependencies, zero Windows native compile issues, instant persistence for $< 50,000$ chunks.
   - *What breaks at scale*: At $>100,000$ chunks, scanning all chunk vectors sequentially ($O(N)$) will bottleneck CPU and increase latency.
   - *Production*: Migrate to `pgvector` or `Qdrant` using HNSW or IVF indices for sub-millisecond approximate nearest neighbor (ANN) lookups.

3. **Web Ingestion**:
   - *Current*: Server-side fetch with cheerio HTML sanitization.
   - *What breaks at scale*: Fails on Client-Side Rendered (CSR / Single Page Apps) pages requiring JavaScript execution, and gets blocked by bot detection (e.g. Cloudflare).
   - *Production*: Dispatch ingestion jobs to a background queue (e.g. BullMQ) using a headless browser pool (Playwright) and readability extractors.

4. **Synchronous Ingestion vs Async Queues**:
   - *Current*: Ingestion is handled synchronously within the HTTP request cycle for immediate UI feedback.
   - *Tradeoff*: Large documents or slow URLs can risk HTTP connection timeouts.
   - *Production*: Return `202 Accepted` with a job ID, process chunking and embedding asynchronously in background workers, and notify frontend via WebSockets or polling.
