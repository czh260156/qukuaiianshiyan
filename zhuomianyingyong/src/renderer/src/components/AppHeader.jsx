import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BellOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons'
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Flex,
  Input,
  Layout,
  List,
  Modal,
  Space,
  Tag,
  Typography
} from 'antd'
import { daysFromNow, formatDate } from '../utils/appData'
import PropTypes from 'prop-types'

const { Header } = Layout
const { Text, Title } = Typography
const titles = {
  dashboard: '工作台',
  analytics: '数据分析',
  projects: '项目管理',
  tasks: '任务中心',
  calendar: '学习日历'
}

export default function AppHeader({
  current,
  profile,
  projects,
  searchOpen,
  onSearchOpenChange,
  onSearch,
  onNavigate,
  onOpenSettings,
  onCreateProject
}) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const tasks = useMemo(
    () => projects.flatMap((project) => project.tasks.map((task) => ({ ...task, project }))),
    [projects]
  )
  const notifications = useMemo(
    () => tasks.filter((task) => !task.completed && task.dueDate && daysFromNow(task.dueDate) <= 7),
    [tasks]
  )
  const results = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return []
    return [
      ...projects
        .filter((project) => `${project.name} ${project.course}`.toLowerCase().includes(keyword))
        .map((project) => ({
          type: '项目',
          id: project.id,
          title: project.name,
          meta: project.course
        })),
      ...tasks
        .filter((task) => task.title.toLowerCase().includes(keyword))
        .map((task) => ({ type: '任务', id: task.id, title: task.title, meta: task.project.name }))
    ].slice(0, 8)
  }, [projects, tasks, query])

  useEffect(() => {
    const open = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        onSearchOpenChange(true)
      }
    }
    window.addEventListener('keydown', open)
    return () => window.removeEventListener('keydown', open)
  }, [onSearchOpenChange])

  useEffect(() => {
    if (searchOpen) window.setTimeout(() => inputRef.current?.focus(), 80)
  }, [searchOpen])

  const choose = (item) => {
    onSearch(item.title, item.type === '任务' ? 'tasks' : 'projects')
    onSearchOpenChange(false)
    setQuery('')
  }

  return (
    <>
      <Header className="app-header">
        <Flex align="center" gap={12}>
          <Text type="secondary">USY Studio</Text>
          <Text type="secondary">/</Text>
          <Text strong>{titles[current]}</Text>
        </Flex>
        <Input
          readOnly
          onClick={() => onSearchOpenChange(true)}
          prefix={<SearchOutlined />}
          suffix={<Tag>Ctrl K</Tag>}
          placeholder="搜索项目或任务"
          className="header-search"
        />
        <Space size={4}>
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={onCreateProject}
            aria-label="新建项目"
          />
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            popupRender={() => (
              <Flex
                vertical
                className="notification-panel"
                style={{
                  padding: 14,
                  width: 330,
                  background: '#fff',
                  borderRadius: 10,
                  boxShadow: '0 12px 35px rgba(25,22,60,.12)'
                }}
              >
                <Title level={5} style={{ margin: '4px 0 10px' }}>
                  待处理提醒
                </Title>
                <List
                  dataSource={notifications}
                  locale={{ emptyText: '暂无临近截止任务' }}
                  renderItem={(task) => (
                    <List.Item onClick={() => onNavigate('tasks')} className="notification-item">
                      <List.Item.Meta
                        avatar={<Tag icon={<ClockCircleOutlined />} color="warning" />}
                        title={task.title}
                        description={`${task.project.name} · ${formatDate(task.dueDate)} 截止`}
                      />
                    </List.Item>
                  )}
                />
              </Flex>
            )}
          >
            <Badge count={notifications.length} size="small">
              <Button type="text" icon={<BellOutlined />} aria-label="通知" />
            </Badge>
          </Dropdown>
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={onOpenSettings}
            aria-label="设置"
          />
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  key: 'profile',
                  icon: <UserOutlined />,
                  label: '个人设置',
                  onClick: onOpenSettings
                }
              ]
            }}
          >
            <Button
              type="text"
              icon={
                <Avatar size={28} style={{ background: profile?.avatarColor }}>
                  {profile?.name?.slice(0, 1)}
                </Avatar>
              }
            >
              <Text strong>{profile?.name}</Text>
            </Button>
          </Dropdown>
        </Space>
      </Header>

      <Modal
        open={searchOpen}
        onCancel={() => onSearchOpenChange(false)}
        footer={null}
        title={null}
        closable={false}
        width={620}
        centered
        destroyOnHidden
      >
        <Flex vertical gap={14}>
          <Input
            ref={inputRef}
            size="large"
            allowClear
            prefix={<SearchOutlined />}
            placeholder="搜索模拟数据中的项目、课程或任务"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onPressEnter={() => results[0] && choose(results[0])}
          />
          {results.length ? (
            <List
              dataSource={results}
              renderItem={(item) => (
                <List.Item onClick={() => choose(item)} className="search-result">
                  <List.Item.Meta
                    avatar={
                      <Tag color={item.type === '项目' ? 'processing' : 'success'}>{item.type}</Tag>
                    }
                    title={item.title}
                    description={item.meta}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Flex vertical gap={8}>
              <Text type="secondary">
                <SearchOutlined /> 搜索项目名称、课程、任务内容
              </Text>
              <Text type="secondary">
                <ClockCircleOutlined /> 支持 Ctrl K 快捷唤起
              </Text>
            </Flex>
          )}
        </Flex>
      </Modal>
    </>
  )
}

AppHeader.propTypes = {
  current: PropTypes.string.isRequired,
  profile: PropTypes.object,
  projects: PropTypes.array.isRequired,
  searchOpen: PropTypes.bool.isRequired,
  onSearchOpenChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onOpenSettings: PropTypes.func.isRequired,
  onCreateProject: PropTypes.func.isRequired
}
