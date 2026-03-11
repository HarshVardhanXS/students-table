# Students Table

## Project Overview
Students Table is a dual-mode application that supports frontend-only CRUD (in-memory + localStorage) and a full backend API powered by NestJS and PostgreSQL. It is designed to satisfy assignments that require both a standalone frontend and a real database-backed backend.

## Specifications

### Frontend (React + Vite)
- Student list columns: Name, Email, Age, Actions (Edit/Delete)
- Add Student form with validation (all fields mandatory, valid email format)
- Edit Student with pre-filled data and same validation rules
- Delete Student with confirmation dialog
- Simulated loading state
- Excel download for filtered rows or full dataset
- Frontend-only CRUD using local state/localStorage
- Optional toggle to use backend API when available

### Backend (NestJS + PostgreSQL)
- CRUD REST endpoints for students
- Validation for name, email, age
- PostgreSQL persistence
- CORS support for frontend
- Consistent response shape: `{ data, meta }`

## Architecture Diagram
```mermaid
flowchart LR
  subgraph Frontend
    UI[React UI]
    LS[Local State + localStorage]
  end

  subgraph Backend
    API[NestJS API]
    DB[(PostgreSQL)]
  end

  UI -->|Frontend-only mode| LS
  UI -->|API mode| API
  API --> DB
```

## Flowchart
```mermaid
flowchart TD
  Start([Start]) --> Toggle{Use backend API?}
  Toggle -- No --> LocalLoad[Load from localStorage]
  Toggle -- Yes --> ApiLoad[Fetch from API]
  ApiLoad --> ApiOk{API reachable?}
  ApiOk -- Yes --> Show[Show students]
  ApiOk -- No --> LocalFallback[Fallback to localStorage]
  LocalLoad --> Show
  LocalFallback --> Show

  Show --> Action{User action}
  Action -->|Add/Edit| Validate[Validate form]
  Validate --> Valid{Valid?}
  Valid -- No --> Show
  Valid -- Yes --> Save

  Save --> SaveMode{Mode}
  SaveMode -- Local --> PersistLocal[Update local state + localStorage]
  SaveMode -- API --> PersistApi[POST/PUT to API]
  PersistLocal --> Show
  PersistApi --> Show

  Action -->|Delete| Confirm{Confirm delete?}
  Confirm -- No --> Show
  Confirm -- Yes --> DeleteMode{Mode}
  DeleteMode -- Local --> RemoveLocal[Remove from local state + localStorage]
  DeleteMode -- API --> RemoveApi[DELETE to API]
  RemoveLocal --> Show
  RemoveApi --> Show
```
