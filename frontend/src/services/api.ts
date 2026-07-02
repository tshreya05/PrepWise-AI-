import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

export const authApi = {
  register: (data: { email: string; full_name: string; password: string }) =>
    api.post('/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/login', data),
  me: () => api.get('/me'),
}

export const resumeApi = {
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/resume', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  get: () => api.get('/resume'),
  analyze: () => api.get('/resume/analysis'),
}

export const jdApi = {
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/job-description', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  paste: (text: string) => api.post('/job-description/text', { text }),
}

export const interviewApi = {
  start: (interview_type: string) =>
    api.post('/interview/start', { interview_type }),
  answer: (interview_id: number, audio?: Blob, answer_text?: string) => {
    const form = new FormData()
    form.append('interview_id', String(interview_id))
    if (audio) form.append('audio', audio, 'answer.webm')
    if (answer_text) form.append('answer_text', answer_text)
    return api.post('/interview/answer', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  history: () => api.get('/history'),
  report: (id: number) => api.get(`/report/${id}`),
}

export const dashboardApi = {
  get: () => api.get('/dashboard'),
}

export const learnApi = {
  getCards: () => api.get('/learn'),
}

export const practiceApi = {
  generate: (data: { topic: string; difficulty: string; num_questions?: number }) =>
    api.post('/practice', data),
}
