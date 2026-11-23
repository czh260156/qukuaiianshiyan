import { useEffect, useMemo, useState } from 'react'
import { readStoredData, resetStoredData, writeStoredData } from '../utils/storage'

const today = () => new Date().toISOString().slice(0, 10)

export default function useProjectStore() {
  const initialData = useMemo(() => readStoredData(), [])
  const [projects, setProjects] = useState(initialData.projects)
  const [profile, setProfile] = useState(initialData.profile)

  useEffect(() => {
    writeStoredData({ version: 3, profile, projects })
  }, [profile, projects])

  const addProject = (project) => {
    setProjects((current) => [{ ...project, tasks: project.tasks || [] }, ...current])
  }

  const updateProject = (projectId, changes) => {
    setProjects((current) =>
      current.map((project) => (project.id === projectId ? { ...project, ...changes } : project))
    )
  }

  const deleteProject = (projectId) => {
    setProjects((current) => current.filter((project) => project.id !== projectId))
  }

  const addTask = (projectId, input) => {
    const title = typeof input === 'string' ? input : input.title
    if (!title?.trim()) return
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? {
              ...project,
              tasks: [
                ...project.tasks,
                {
                  id: `task-${Date.now()}`,
                  title: title.trim(),
                  completed: false,
                  priority: input.priority || 'medium',
                  dueDate: input.dueDate || null,
                  category: input.category || '其他',
                  estimate: Number(input.estimate) || 2,
                  createdAt: today()
                }
              ]
            }
          : project
      )
    )
  }

  const updateTask = (projectId, taskId, changes) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? {
              ...project,
              tasks: project.tasks.map((task) =>
                task.id === taskId ? { ...task, ...changes } : task
              )
            }
          : project
      )
    )
  }

  const toggleTask = (projectId, taskId) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? {
              ...project,
              tasks: project.tasks.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      completed: !task.completed,
                      completedAt: !task.completed ? today() : null
                    }
                  : task
              )
            }
          : project
      )
    )
  }

  const deleteTask = (projectId, taskId) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? { ...project, tasks: project.tasks.filter((task) => task.id !== taskId) }
          : project
      )
    )
  }

  const resetData = () => {
    const data = resetStoredData()
    setProjects(data.projects)
    setProfile(data.profile)
  }

  return {
    projects,
    profile,
    setProfile,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    resetData
  }
}
