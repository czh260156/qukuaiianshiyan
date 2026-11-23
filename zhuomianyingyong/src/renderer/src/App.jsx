import { useCallback, useEffect, useState } from 'react'
import { App as AntApp, Layout } from 'antd'
import Sidebar from './components/Sidebar'
import PageErrorBoundary from './components/PageErrorBoundary'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Tasks from './pages/Tasks'
import { MOCK_PROJECTS } from './data/mockData.js'
import './App.css'

const { Header, Content } = Layout

function Workspace() {
  const { message } = AntApp.useApp()
  const [current, setCurrent] = useState('dashboard')
  const [projects, setProjects] = useState([])
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!window.api?.loadData) return
      try {
        const stored = await window.api.loadData()
        const nextProjects = Array.isArray(stored) && stored.length > 0 ? stored : MOCK_PROJECTS
        setProjects(nextProjects)
        if (!Array.isArray(stored) || stored.length === 0) {
          await window.api.saveData?.(nextProjects)
        }
      } catch (error) {
        message.error('读取本地项目数据失败')
        console.error(error)
      }
    }
    load()
  }, [message])

  const persist = useCallback(async (nextProjects) => {
    let result = { success: true }
    if (window.api?.saveData) {
      result = await window.api.saveData(nextProjects)
      if (!result?.success) throw new Error(result?.message || '数据保存失败')
    }
    setProjects(nextProjects)
    return result
  }, [])

  const addProject = async (project) => {
    await persist([{ ...project, tasks: project.tasks || [] }, ...projects])
  }

  const updateProject = async (projectId, changes) => {
    const next = projects.map((project) =>
      project.id === projectId
        ? {
            ...project,
            ...changes,
            id: project.id,
            createdAt: project.createdAt,
            tasks: project.tasks || []
          }
        : project
    )
    await persist(next)
  }

  const deleteProject = async (projectId) => {
    await persist(projects.filter((project) => project.id !== projectId))
  }

  const addTask = async (projectId, taskInput) => {
    const input = typeof taskInput === 'string' ? { title: taskInput } : taskInput
    const next = projects.map((project) =>
      project.id === projectId
        ? {
            ...project,
            tasks: [
              ...(project.tasks || []),
              {
                id: `t_${Date.now()}`,
                title: input.title?.trim(),
                completed: false,
                priority: input.priority || 'medium',
                dueDate: input.dueDate || null,
                category: input.category || '其他',
                estimate: Number(input.estimate) || 2
              }
            ]
          }
        : project
    )
    await persist(next)
  }

  const updateTask = async (projectId, taskId, changes) => {
    const next = projects.map((project) =>
      project.id === projectId
        ? {
            ...project,
            tasks: (project.tasks || []).map((task) =>
              task.id === taskId ? { ...task, ...changes } : task
            )
          }
        : project
    )
    await persist(next)
  }

  const toggleTask = async (projectId, taskId) => {
    const next = projects.map((project) =>
      project.id === projectId
        ? {
            ...project,
            tasks: (project.tasks || []).map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    completed: !task.completed,
                    completedAt: !task.completed ? new Date().toISOString().slice(0, 10) : null
                  }
                : task
            )
          }
        : project
    )
    await persist(next)
  }

  const deleteTask = async (projectId, taskId) => {
    const next = projects.map((project) =>
      project.id === projectId
        ? { ...project, tasks: (project.tasks || []).filter((task) => task.id !== taskId) }
        : project
    )
    await persist(next)
  }

  return (
    <Layout className="app-layout">
      <Sidebar
        current={current}
        projects={projects}
        profile={{ name: '孙同学', major: '商学院', studentId: '2024级', avatarColor: '#6558f5' }}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        onNavigate={setCurrent}
        onOpenSettings={() => message.info('偏好设置暂未开放')}
      />
      <Layout>
        <Header className="dingbutoubu">USY 项目制教学桌面工作平台</Header>
        <Content className="neirongquyu">
          <PageErrorBoundary key={current}>
            {current === 'dashboard' && (
              <Dashboard projects={projects} projectList={projects} onMenuChange={setCurrent} />
            )}
            {current === 'projects' && (
              <Projects
                projectList={projects}
                onAddProject={addProject}
                onUpdateProject={updateProject}
                onDeleteProject={deleteProject}
              />
            )}
            {current === 'tasks' && (
              <Tasks
                projects={projects}
                onAddTask={addTask}
                onUpdateTask={updateTask}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
              />
            )}
          </PageErrorBoundary>
        </Content>
      </Layout>
    </Layout>
  )
}

export default function App() {
  return (
    <AntApp>
      <Workspace />
    </AntApp>
  )
}
