# StockFlow

StockFlow is a full-stack Inventory & Order Management System built with React, FastAPI, and PostgreSQL. It helps businesses manage products, customers, orders, and inventory with automated stock tracking, order calculations, and validation. Fully containerized with Docker and Docker Compose for seamless development and deployment.

## Tech Stack
- **Backend:** FastAPI, Python 3.12+
- **Database:** PostgreSQL (pgvector)
- **ORM & Migrations:** SQLAlchemy, Alembic
- **Package Manager:** [uv](https://github.com/astral-sh/uv)
- **Containerization:** Docker, Docker Compose

---

## 🚀 Getting Started (The Easiest Way)

The quickest way to get the application running is by using Docker Compose. This will spin up both the FastAPI backend and the PostgreSQL database.

### Prerequisites
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running with Docker

1. **Clone the repository and navigate into it:**
   ```bash
   git clone https://github.com/thepratyushranjan/stockflow.git
   cd stockflow
   ```

2. **Start the services:**
   ```bash
   docker compose up -d --build
   ```

3. **Access the application:**
   - **FastAPI App / API Docs (Swagger UI):** [http://localhost:8080/docs](http://localhost:8080/docs)
   - Database migrations are run **automatically** when the container starts.

4. **Stopping the services:**
   ```bash
   docker compose down
   ```

---

## 🛠️ Local Development (Without Docker for Backend)

If you prefer to run the backend manually for development but still want to use Docker for the database, follow these steps.

### Prerequisites
- Python 3.12+
- [uv](https://docs.astral.sh/uv/getting-started/installation/)

### Setup Instructions

1. **Start the database using Docker:**
   ```bash
   docker compose up -d db
   ```

2. **Set up your environment variables:**
   Create a `.env` file in the root directory (if not present) and add your database config:
   ```env
   POSTGRES_SERVER=localhost
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=postgres
   POSTGRES_PORT=5432
   ```

3. **Install dependencies using `uv`:**
   ```bash
   uv sync
   ```

4. **Run the FastAPI server locally:**
   ```bash
   uv run uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

5. **Access the application:**
   - Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🗄️ Database Migrations

This project uses **Alembic** to manage database migrations.

### Automatic Migrations
We have configured the application `lifespan` to handle migrations automatically. When the FastAPI server starts (either via Docker or locally), it will automatically:
1. Apply any pending schema upgrades.
2. Check your SQLAlchemy models for changes.
3. Automatically generate a new migration file and apply it if changes are found.

### Manual Migrations (Optional)
If you ever need to interact with Alembic manually, you can use `uv run`:

- **Create a new migration manually:**
  ```bash
  uv run alembic revision --autogenerate -m "description_of_change"
  ```
- **Apply migrations manually:**
  ```bash
  uv run alembic upgrade head
  ```
- **Downgrade to a previous version:**
  ```bash
  uv run alembic downgrade -1
  ```
