# DevTrack — Issue & Bug Tracking System

DevTrack is an **industry-grade Issue Tracking & Project Management system** inspired by **Jira, Linear, and ClickUp**. It is built with a **FastAPI backend** and a **React + Tailwind frontend**, focusing on clean architecture, secure APIs, and real-world backend practices.

---

## 🚀 What is DevTrack?

DevTrack helps development teams:

* Organize work into projects
* Track bugs, tasks, and feature requests
* Assign tickets to team members
* Visualize progress using a Kanban board
* Collaborate via comments 
* Securely manage access using roles

---

## ✨ Core Features

* 🔐 JWT-based authentication (Access & Refresh tokens)
* 👤 User management & secure password hashing
* 📁 Project creation & ownership
* 👥 Project members with role-based access
* 🐛 Ticket management (Bug / Task / Feature)
* 🧩 Ticket assignment & priority handling
* 📊 Kanban board with drag-and-drop
* 💬 Comments on tickets
* 🔎 Filtering & search across tickets
* 🛡️ Permission checks for edit/delete actions

---

## 🧰 Tech Stack

### 🔹 Frontend

* **React.js** – Component-driven UI
* **Tailwind CSS** – Modern SaaS styling
* **dnd-kit / react-beautiful-dnd** – Kanban drag & drop
* **Axios** – API communication
* **React Router** – Routing & layouts

### 🔸 Backend

* **FastAPI** – High-performance Python backend
* **JWT Authentication** – Secure access control
* **SQLAlchemy** – ORM & database models
* **PostgreSQL** – Relational database
* **Pydantic** – Request/response validation
* **Alembic** – Database migrations

### 🛠️ Tooling

* **Swagger UI** – Auto-generated API docs
* **WebSockets** (planned) – Real-time updates
* **Celery** (optional) – Background jobs

---

## 🗂️ Domain Models

* **User** – Authentication & identity
* **Project** – Container for tickets
* **ProjectMember** – User roles per project
* **Ticket** – Bug / Task / Feature
* **Comment** – Ticket discussion
* **Attachment** – Screenshots & files

---

## 🔐 Roles & Permissions

| Role          | Permissions                           |
| ------------- | ------------------------------------- |
| **Admin**     | Full access, manage members & tickets |
| **Developer** | Create/update assigned tickets        |
| **Viewer**    | Read-only access                      |

---

## 📦 API Documentation

Once the backend is running:

* **Swagger UI**:
  `/docs`

* **OpenAPI JSON**:
  `/openapi.json`

---

## 🛠️ Local Setup

### Backend

```bash
# Clone repository
git clone https://github.com/yourusername/devtrack.git
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🧠 What This Project Teaches

* Designing scalable REST APIs
* JWT authentication & security patterns
* Database modeling with relationships
* Clean backend architecture
* Kanban & Agile workflow design
* Production deployment basics

---

## 🚀 Future Improvements

* Real-time updates with WebSockets
* Notifications & activity logs
* CI/CD pipeline
* Organization-level projects
* Audit & analytics dashboards

---

## 📄 License

MIT License

---

⭐ If DevTrack helped you learn something, consider starring the repo!
