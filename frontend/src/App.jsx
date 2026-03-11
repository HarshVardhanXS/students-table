import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
const STORAGE_KEY = 'students_table_data_v1'
const STORAGE_MODE_KEY = 'students_table_use_api_v1'

const seedStudents = [
  { id: 's1', name: 'Aarav Mehta', email: 'aarav@example.com', age: 20 },
  { id: 's2', name: 'Diya Shah', email: 'diya@example.com', age: 22 },
  { id: 's3', name: 'Ishaan Gupta', email: 'ishaan@example.com', age: 19 },
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const getLocalStudents = () => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return seedStudents
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : seedStudents
  } catch {
    return seedStudents
  }
}

const setLocalStudents = (students) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students))
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validate = (values) => {
  const nextErrors = {}
  if (!values.name.trim()) nextErrors.name = 'Name is required.'
  if (!values.email.trim()) {
    nextErrors.email = 'Email is required.'
  } else if (!emailRegex.test(values.email.trim())) {
    nextErrors.email = 'Enter a valid email.'
  }
  if (!values.age.toString().trim()) {
    nextErrors.age = 'Age is required.'
  } else if (Number(values.age) <= 0 || Number(values.age) > 120) {
    nextErrors.age = 'Enter a valid age.'
  }
  return nextErrors
}

const normalizeStudent = (student) => ({
  id: student.id ?? crypto.randomUUID(),
  name: student.name,
  email: student.email,
  age: Number(student.age),
})

async function apiRequest(path, options) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'API request failed')
  }

  if (response.status === 204) return null
  const payload = await response.json()
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data
  }
  return payload
}

function App() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [useApi, setUseApi] = useState(() => {
    const raw = localStorage.getItem(STORAGE_MODE_KEY)
    return raw ? raw === 'true' : true
  })
  const [filter, setFilter] = useState('')
  const [formValues, setFormValues] = useState({ name: '', email: '', age: '' })
  const [formErrors, setFormErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_MODE_KEY, String(useApi))
  }, [useApi])

  useEffect(() => {
    let ignore = false

    const load = async () => {
      setLoading(true)
      await sleep(600)

      try {
        if (useApi) {
          const data = await apiRequest('/students')
          if (!ignore) setStudents(data.map(normalizeStudent))
          return
        }
        const local = getLocalStudents()
        if (!ignore) setStudents(local.map(normalizeStudent))
      } catch (error) {
        const local = getLocalStudents()
        if (!ignore) {
          setStudents(local.map(normalizeStudent))
          setNotice('Backend unavailable. Using local demo data.')
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    load()

    return () => {
      ignore = true
    }
  }, [useApi])

  const filteredStudents = useMemo(() => {
    const term = filter.trim().toLowerCase()
    if (!term) return students
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term)
    )
  }, [filter, students])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormValues({ name: '', email: '', age: '' })
    setFormErrors({})
    setEditingId(null)
  }

  const persistLocal = (next) => {
    setStudents(next)
    setLocalStudents(next)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const errors = validate(formValues)
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    await sleep(600)

    try {
      if (editingId) {
        const payload = normalizeStudent({ ...formValues, id: editingId })

        if (useApi) {
          const updated = await apiRequest(`/students/${editingId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          })
          setStudents((prev) =>
            prev.map((student) =>
              student.id === editingId ? normalizeStudent(updated) : student
            )
          )
        } else {
          const next = students.map((student) =>
            student.id === editingId ? payload : student
          )
          persistLocal(next)
        }
        resetForm()
        setNotice('Student updated.')
        return
      }

      const payload = normalizeStudent(formValues)

      if (useApi) {
        const created = await apiRequest('/students', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setStudents((prev) => [normalizeStudent(created), ...prev])
      } else {
        const next = [payload, ...students]
        persistLocal(next)
      }
      resetForm()
      setNotice('Student added.')
    } catch (error) {
      setNotice(error.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (student) => {
    setEditingId(student.id)
    setFormValues({
      name: student.name,
      email: student.email,
      age: student.age,
    })
    setFormErrors({})
  }

  const handleDelete = async (student) => {
    const confirmed = window.confirm(
      `Delete ${student.name}? This action cannot be undone.`
    )
    if (!confirmed) return

    setLoading(true)
    await sleep(600)

    try {
      if (useApi) {
        await apiRequest(`/students/${student.id}`, { method: 'DELETE' })
        setStudents((prev) => prev.filter((item) => item.id !== student.id))
      } else {
        const next = students.filter((item) => item.id !== student.id)
        persistLocal(next)
      }
      setNotice('Student deleted.')
    } catch (error) {
      setNotice(error.message || 'Failed to delete student.')
    } finally {
      setLoading(false)
    }
  }

  const downloadExcel = (rows, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(
      rows.map(({ id, ...rest }) => rest)
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')
    XLSX.writeFile(workbook, filename)
  }

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="tag">Students Dashboard</p>
          <h1>Student Directory</h1>
          <p className="subtitle">
            Frontend-only CRUD with optional NestJS + PostgreSQL backend.
          </p>
        </div>
        <div className="hero-actions">
          <label className="toggle">
            <input
              type="checkbox"
              checked={useApi}
              onChange={(event) => setUseApi(event.target.checked)}
            />
            <span>Use backend API</span>
          </label>
          <div className="search">
            <input
              type="search"
              placeholder="Search by name or email"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
          </div>
        </div>
      </header>

      {notice && <div className="notice">{notice}</div>}

      <section className="grid">
        <div className="panel">
          <h2>{editingId ? 'Edit student' : 'Add student'}</h2>
          <form onSubmit={handleSubmit} className="form">
            <label>
              <span>Name</span>
              <input
                name="name"
                value={formValues.name}
                onChange={handleChange}
                placeholder="Full name"
              />
              {formErrors.name && <em>{formErrors.name}</em>}
            </label>
            <label>
              <span>Email</span>
              <input
                name="email"
                type="email"
                value={formValues.email}
                onChange={handleChange}
                placeholder="email@example.com"
              />
              {formErrors.email && <em>{formErrors.email}</em>}
            </label>
            <label>
              <span>Age</span>
              <input
                name="age"
                type="number"
                value={formValues.age}
                onChange={handleChange}
                placeholder="18"
                min="1"
                max="120"
              />
              {formErrors.age && <em>{formErrors.age}</em>}
            </label>
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {editingId ? 'Save changes' : 'Add student'}
              </button>
              <button type="button" onClick={resetForm} className="ghost">
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Student list</h2>
            <div className="export">
              <button
                type="button"
                onClick={() => downloadExcel(filteredStudents, 'students_filtered.xlsx')}
                className="ghost"
              >
                Download filtered
              </button>
              <button
                type="button"
                onClick={() => downloadExcel(students, 'students_all.xlsx')}
              >
                Download all
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading students...</div>
          ) : (
            <div className="table">
              <div className="row header">
                <span>Name</span>
                <span>Email</span>
                <span>Age</span>
                <span>Actions</span>
              </div>
              {filteredStudents.length === 0 ? (
                <div className="empty">No students match your search.</div>
              ) : (
                filteredStudents.map((student) => (
                  <div className="row" key={student.id}>
                    <span>{student.name}</span>
                    <span>{student.email}</span>
                    <span>{student.age}</span>
                    <span className="actions">
                      <button type="button" onClick={() => handleEdit(student)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => handleDelete(student)}
                      >
                        Delete
                      </button>
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default App
