import { MOCK_NOTES, MOCK_PROFILE, MOCK_PROJECTS } from '../data/mockData.js'

export const STORAGE_KEY = 'usy-project-studio-data-v3'

const clone = (value) => JSON.parse(JSON.stringify(value))

export const createInitialData = () => ({
  version: 3,
  profile: clone(MOCK_PROFILE),
  projects: clone(MOCK_PROJECTS),
  notes: clone(MOCK_NOTES)
})

export const daysFromNow = (date) => {
  if (!date) return null
  const target = new Date(`${date}T23:59:59`).getTime()
  return Math.ceil((target - Date.now()) / 86400000)
}

export const formatDate = (date, fallback = '未设置') => {
  if (!date) return fallback
  const parsed = new Date(`${date}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return fallback
  return `${parsed.getMonth() + 1}月${parsed.getDate()}日`
}

export const projectStats = (project) => {
  const tasks = project?.tasks || []
  const done = tasks.filter((task) => task.completed).length
  return {
    total: tasks.length,
    done,
    pending: tasks.length - done,
    percent: tasks.length ? Math.round((done / tasks.length) * 100) : 0
  }
}

export const allProjectStats = (projects = []) => {
  const tasks = projects.flatMap((project) => project.tasks || [])
  const done = tasks.filter((task) => task.completed).length
  return {
    projectCount: projects.length,
    taskCount: tasks.length,
    done,
    pending: tasks.length - done,
    percent: tasks.length ? Math.round((done / tasks.length) * 100) : 0
  }
}

export const getMockDataSummary = (projects = MOCK_PROJECTS) => {
  const total = allProjectStats(projects)
  return {
    ...total,
    projects: projects.map((project) => ({
      id: project.id,
      name: project.name,
      taskCount: project.tasks.length,
      doneCount: project.tasks.filter((task) => task.completed).length,
      percent: projectStats(project).percent
    }))
  }
}

export const statusMeta = {
  active: { label: '进行中', color: 'processing' },
  planning: { label: '筹备中', color: 'default' },
  completed: { label: '已完成', color: 'success' },
  paused: { label: '已暂停', color: 'warning' }
}

export const priorityMeta = {
  high: { label: '高优先级', color: 'error', short: '高' },
  medium: { label: '中优先级', color: 'warning', short: '中' },
  low: { label: '低优先级', color: 'default', short: '低' }
}
