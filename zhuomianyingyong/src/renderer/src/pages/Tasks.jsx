import { useMemo, useState } from 'react'
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons'
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Dropdown,
  Empty,
  Flex,
  Form,
  Input,
  Modal,
  Progress,
  Select,
  Space,
  Table,
  Tag,
  Typography
} from 'antd'
import dayjs from 'dayjs'
import PageHeading from '../components/PageHeading'
import { daysFromNow, formatDate, priorityMeta, projectStats } from '../utils/appData'
import PropTypes from 'prop-types'

const { Text, Title, Paragraph } = Typography
const statusOptions = [
  { label: '全部任务', value: 'all' },
  { label: '待完成', value: 'pending' },
  { label: '已完成', value: 'completed' }
]

export default function Tasks({
  projects,
  initialProjectId,
  searchTerm,
  onAddTask,
  onUpdateTask,
  onToggleTask,
  onDeleteTask
}) {
  const initial = projects.some((project) => project.id === initialProjectId)
    ? initialProjectId
    : projects[0]?.id
  const [selectedProjectId, setSelectedProjectId] = useState(initial)
  const [status, setStatus] = useState('all')
  const [query, setQuery] = useState('')
  const [priority, setPriority] = useState('all')
  const [taskInput, setTaskInput] = useState('')
  const [editing, setEditing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form] = Form.useForm()

  const project = projects.find((item) => item.id === selectedProjectId) || projects[0]
  const stats = projectStats(project)
  const keyword = (searchTerm || query).trim().toLowerCase()

  const tasks = useMemo(() => {
    return (project?.tasks || [])
      .filter((task) => {
        if (status === 'pending') return !task.completed
        if (status === 'completed') return task.completed
        return true
      })
      .filter((task) => priority === 'all' || task.priority === priority)
      .filter((task) => `${task.title} ${task.category}`.toLowerCase().includes(keyword))
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1
        return String(a.dueDate).localeCompare(String(b.dueDate))
      })
  }, [project, status, priority, keyword])

  const openEdit = (task) => {
    setEditing(task)
    form.setFieldsValue({
      ...task,
      dueDate: task.dueDate ? dayjs(task.dueDate) : null
    })
    setFormOpen(true)
  }

  const saveTask = (values) => {
    onUpdateTask(project.id, editing.id, {
      ...values,
      dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null
    })
    setFormOpen(false)
    setEditing(null)
    form.resetFields()
  }

  const addQuickTask = () => {
    if (!taskInput.trim()) return
    onAddTask(project.id, { title: taskInput, priority: 'medium', category: '其他', estimate: 2 })
    setTaskInput('')
  }

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'title',
      render: (value, task) => (
        <Flex align="center" gap={10}>
          <Checkbox
            checked={task.completed}
            onChange={() => onToggleTask(project.id, task.id)}
            aria-label={`切换任务状态：${task.title}`}
          />
          <Flex vertical gap={2}>
            <Text delete={task.completed} strong={!task.completed}>
              {value}
            </Text>
            <Text type="secondary">
              {task.category} · 预计 {task.estimate || 2} 小时
            </Text>
          </Flex>
        </Flex>
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 120,
      render: (value) => {
        const meta = priorityMeta[value || 'medium']
        return <Tag color={meta.color}>{meta.label}</Tag>
      }
    },
    {
      title: '截止时间',
      dataIndex: 'dueDate',
      width: 130,
      render: (value) => (
        <Text type={value && daysFromNow(value) < 0 ? 'danger' : 'secondary'}>
          <CalendarOutlined /> {formatDate(value)}
        </Text>
      )
    },
    {
      title: '状态',
      dataIndex: 'completed',
      width: 110,
      render: (completed) => (
        <Tag
          icon={completed ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
          color={completed ? 'success' : 'processing'}
        >
          {completed ? '已完成' : '进行中'}
        </Tag>
      )
    },
    {
      title: '',
      width: 50,
      render: (_, task) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              { key: 'edit', label: '编辑任务', icon: <EditOutlined /> },
              { key: 'delete', label: '删除任务', icon: <DeleteOutlined />, danger: true }
            ],
            onClick: ({ key }) => {
              if (key === 'edit') openEdit(task)
              if (key === 'delete') onDeleteTask(project.id, task.id)
            }
          }}
        >
          <Button type="text" icon={<MoreOutlined />} aria-label="任务操作" />
        </Dropdown>
      )
    }
  ]

  if (!project)
    return (
      <Flex justify="center" className="page-shell">
        <Empty description="暂无项目，请先创建项目" />
      </Flex>
    )

  return (
    <Flex vertical gap={20} className="page-shell">
      <PageHeading
        eyebrow="TASK WORKSPACE"
        title="任务中心"
        description="任务、进度和项目数据自动同步。"
        extra={
          <Select
            value={project.id}
            onChange={setSelectedProjectId}
            style={{ width: 280 }}
            options={projects.map((item) => ({ value: item.id, label: item.name }))}
          />
        }
      />

      <Card>
        <Flex justify="space-between" align="center" wrap="wrap" gap={20}>
          <Flex vertical gap={5}>
            <Space wrap>
              <Title level={3} style={{ margin: 0 }}>
                {project.name}
              </Title>
              <Tag color="blue">{project.course}</Tag>
            </Space>
            <Paragraph type="secondary" style={{ margin: 0 }}>
              {project.description}
            </Paragraph>
            <Space wrap>
              <Text type="secondary">
                <CalendarOutlined /> {formatDate(project.deadline)} 截止
              </Text>
              <Text type="secondary">
                <CheckCircleOutlined /> {stats.done} 项已完成
              </Text>
            </Space>
          </Flex>
          <Flex align="center" gap={22}>
            <Progress
              type="circle"
              percent={stats.percent}
              size={96}
              strokeColor={project.coverColor}
              format={(percent) => (
                <Flex vertical align="center">
                  <Text strong>{percent}%</Text>
                  <Text type="secondary">完成度</Text>
                </Flex>
              )}
            />
            <Flex vertical gap={4}>
              <Text type="secondary">
                总任务 <Text strong>{stats.total}</Text>
              </Text>
              <Text type="secondary">
                待完成 <Text strong>{stats.pending}</Text>
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Card>

      <Card>
        <Flex gap={8} wrap="wrap">
          <Input
            value={taskInput}
            onChange={(event) => setTaskInput(event.target.value)}
            onPressEnter={addQuickTask}
            prefix={<PlusOutlined />}
            placeholder="添加一个任务，按 Enter 快速创建"
            style={{ flex: 1, minWidth: 240 }}
          />
          <Button type="primary" onClick={addQuickTask}>
            添加任务
          </Button>
        </Flex>
      </Card>

      <Card>
        <Flex
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={12}
          style={{ marginBottom: 16 }}
        >
          <Space wrap>
            {statusOptions.map((item) => (
              <Button
                key={item.value}
                type={status === item.value ? 'primary' : 'default'}
                onClick={() => setStatus(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </Space>
          <Space wrap>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="搜索任务"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              style={{ width: 180 }}
            />
            <Select
              value={priority}
              onChange={setPriority}
              style={{ width: 135 }}
              options={[
                { value: 'all', label: '全部优先级' },
                ...Object.entries(priorityMeta).map(([value, item]) => ({
                  value,
                  label: item.label
                }))
              ]}
            />
          </Space>
        </Flex>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={tasks}
          pagination={false}
          locale={{ emptyText: <Empty description="没有符合条件的任务" /> }}
          scroll={{ x: 720 }}
        />
      </Card>

      <Modal
        title="编辑任务"
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={saveTask}>
          <Form.Item
            name="title"
            label="任务内容"
            rules={[{ required: true, message: '请输入任务内容' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Space size={12} style={{ display: 'flex' }} align="start">
            <Form.Item name="priority" label="优先级" style={{ flex: 1 }}>
              <Select
                options={Object.entries(priorityMeta).map(([value, item]) => ({
                  value,
                  label: item.label
                }))}
              />
            </Form.Item>
            <Form.Item name="dueDate" label="截止日期" style={{ flex: 1 }}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Space size={12} style={{ display: 'flex' }} align="start">
            <Form.Item name="category" label="任务类别" style={{ flex: 1 }}>
              <Select
                options={['开发', '文档', '设计', '调研', '测试', '其他'].map((value) => ({
                  value,
                  label: value
                }))}
              />
            </Form.Item>
            <Form.Item name="estimate" label="预计耗时（小时）" style={{ flex: 1 }}>
              <Input type="number" min={1} max={100} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </Flex>
  )
}

Tasks.propTypes = {
  projects: PropTypes.array.isRequired,
  initialProjectId: PropTypes.string,
  searchTerm: PropTypes.string,
  onAddTask: PropTypes.func.isRequired,
  onUpdateTask: PropTypes.func.isRequired,
  onToggleTask: PropTypes.func.isRequired,
  onDeleteTask: PropTypes.func.isRequired
}
