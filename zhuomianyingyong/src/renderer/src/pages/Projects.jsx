import { useMemo, useState } from 'react'
import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Dropdown,
  Empty,
  Flex,
  Form,
  Input,
  Modal,
  Progress,
  Row,
  Segmented,
  Select,
  Space,
  Tag,
  Typography,
  message
} from 'antd'
import dayjs from 'dayjs'
import PageHeading from '../components/PageHeading'
import { createEmptyProject } from '../data/mockData'
import { daysFromNow, formatDate, priorityMeta, projectStats, statusMeta } from '../utils/appData'
import PropTypes from 'prop-types'

const { Text, Paragraph } = Typography
const filters = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'active' },
  { label: '筹备中', value: 'planning' },
  { label: '已完成', value: 'completed' }
]
const colors = ['#6558f5', '#1f9d7a', '#e9a329', '#3d84e9', '#e06478']

export default function Projects({
  projectList = [],
  onAddProject,
  onUpdateProject,
  onDeleteProject
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState('grid')
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  const visibleProjects = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return projectList
      .filter((project) => filter === 'all' || project.status === filter)
      .filter((project) =>
        `${project.name} ${project.course} ${project.description}`.toLowerCase().includes(keyword)
      )
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  }, [projectList, filter, query])

  const openCreate = () => {
    setEditingProject(null)
    form.resetFields()
    form.setFieldsValue({ status: 'active', priority: 'medium', coverColor: colors[0] })
    setIsModalOpen(true)
  }

  const openEdit = (project) => {
    setEditingProject(project)
    form.setFieldsValue({
      ...project,
      deadline: project.deadline ? dayjs(project.deadline) : null,
      tags: (project.tags || []).join(', '),
      coverColor: project.coverColor || colors[0]
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProject(null)
    form.resetFields()
  }

  const selectFolder = async () => {
    if (!window.api?.selectFolder) {
      message.warning('当前运行环境不支持选择文件夹')
      return
    }
    const path = await window.api.selectFolder()
    if (path) form.setFieldValue('folderPath', path)
  }

  const openFolder = async (path) => {
    if (!window.api?.openFolder) {
      message.warning('当前运行环境不支持打开文件夹')
      return
    }
    const result = await window.api.openFolder(path)
    if (!result?.success) message.warning(result?.message || '打开文件夹失败')
  }

  const saveProject = async (values) => {
    setSaving(true)
    try {
      const payload = {
        ...values,
        name: values.name.trim(),
        course: values.course.trim(),
        description: values.description?.trim() || '暂无简介描述',
        folderPath: values.folderPath?.trim() || '待关联本地文件夹',
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : null,
        tags: (values.tags || '')
          .split(/[,，]/)
          .map((tag) => tag.trim())
          .filter(Boolean)
      }
      if (editingProject) {
        await onUpdateProject(editingProject.id, payload)
      } else {
        await onAddProject(createEmptyProject(payload))
      }
      closeModal()
      message.success(editingProject ? '项目已更新' : '项目已创建')
    } catch (error) {
      message.error(error?.message || '项目保存失败')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = (project) => {
    Modal.confirm({
      title: '删除项目',
      content: `确定删除「${project.name}」吗？项目中的 ${project.tasks?.length || 0} 个任务也会一并删除，此操作不可撤销。`,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      centered: true,
      onOk: async () => {
        try {
          await onDeleteProject(project.id)
          message.success('项目已删除')
        } catch (error) {
          message.error(error?.message || '项目删除失败')
        }
      }
    })
  }

  const projectCard = (project) => {
    const info = projectStats(project)
    const remaining = daysFromNow(project.deadline)
    const status = statusMeta[project.status || 'active']
    return (
      <Card
        key={project.id}
        hoverable
        className="project-card"
        title={
          <Space size={8} wrap>
            <Text strong>{project.name}</Text>
            <Tag color={status.color}>{status.label}</Tag>
          </Space>
        }
        extra={
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                { key: 'edit', icon: <EditOutlined />, label: '编辑项目' },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: '删除项目',
                  danger: true
                }
              ],
              onClick: ({ key }) => (key === 'edit' ? openEdit(project) : confirmDelete(project))
            }}
          >
            <Button type="text" icon={<MoreOutlined />} aria-label="项目操作" />
          </Dropdown>
        }
      >
        <Flex vertical gap={13}>
          <Paragraph ellipsis={{ rows: 2 }} className="project-description">
            {project.description}
          </Paragraph>
          <Space size={[4, 6]} wrap>
            <Tag color="blue">{project.course}</Tag>
            {(project.tags || []).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Space>
          <Flex vertical gap={6}>
            <Flex justify="space-between">
              <Text type="secondary">任务进度</Text>
              <Text strong>
                {info.done}/{info.total}
              </Text>
            </Flex>
            <Progress percent={info.percent} strokeColor={project.coverColor} showInfo={false} />
          </Flex>
          <Flex justify="space-between" wrap="wrap" gap={8}>
            <Text type={remaining !== null && remaining <= 7 ? 'danger' : 'secondary'}>
              <CalendarOutlined /> {formatDate(project.deadline)}
            </Text>
            <Tag color={priorityMeta[project.priority || 'medium'].color}>
              {priorityMeta[project.priority || 'medium'].label}
            </Tag>
          </Flex>
          <Flex justify="space-between" align="center" gap={8} className="project-folder">
            <Text type="secondary" ellipsis style={{ maxWidth: 190 }}>
              <FolderOutlined /> {project.folderPath}
            </Text>
            <Button
              type="text"
              size="small"
              icon={<FolderOpenOutlined />}
              onClick={() => openFolder(project.folderPath)}
            >
              打开
            </Button>
          </Flex>
          <Button type="primary" ghost icon={<EditOutlined />} onClick={() => openEdit(project)}>
            编辑项目
          </Button>
        </Flex>
      </Card>
    )
  }

  return (
    <Flex vertical gap={20} className="page-shell projects-page">
      <PageHeading
        eyebrow="PROJECT LIBRARY"
        title="我的教学项目"
        description={`共 ${projectList.length} 个项目，支持新建、编辑、删除与本地目录管理。`}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建项目
          </Button>
        }
      />

      <Card className="project-toolbar-card">
        <Flex justify="space-between" align="center" gap={16} wrap="wrap">
          <Segmented options={filters} value={filter} onChange={setFilter} />
          <Space wrap>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="搜索项目或课程"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="project-search"
            />
            <Segmented
              value={view}
              onChange={setView}
              options={[
                { label: '卡片', value: 'grid' },
                { label: '列表', value: 'list' }
              ]}
            />
          </Space>
        </Flex>
      </Card>

      {visibleProjects.length ? (
        view === 'grid' ? (
          <Row gutter={[16, 16]}>
            {visibleProjects.map((project) => (
              <Col xs={24} md={12} xl={8} key={project.id}>
                {projectCard(project)}
              </Col>
            ))}
          </Row>
        ) : (
          <Flex vertical gap={12}>
            {visibleProjects.map(projectCard)}
          </Flex>
        )
      ) : (
        <Card>
          <Empty
            description={
              projectList.length ? '没有符合筛选条件的项目' : '暂无项目，点击右上角创建第一个项目'
            }
          />
        </Card>
      )}

      <Modal
        title={editingProject ? '编辑项目' : '新建教学实训项目'}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText={editingProject ? '保存修改' : '创建项目'}
        cancelText="取消"
        width={640}
        centered
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={saveProject}>
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="例如：金融数据上链存证系统" maxLength={60} showCount />
          </Form.Item>
          <Row gutter={12}>
            <Col span={14}>
              <Form.Item
                name="course"
                label="所属课程"
                rules={[{ required: true, message: '请输入课程名称' }]}
              >
                <Input placeholder="例如：区块链技术原理及应用" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="deadline" label="截止日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="本地项目目录">
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item name="folderPath" noStyle>
                <Input placeholder="选择或输入项目文件夹" />
              </Form.Item>
              <Button icon={<FolderOpenOutlined />} onClick={selectFolder}>
                选择文件夹
              </Button>
            </Space.Compact>
          </Form.Item>
          <Form.Item name="description" label="项目简介">
            <Input.TextArea
              rows={3}
              maxLength={240}
              showCount
              placeholder="描述项目目标、技术栈或成果要求"
            />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="status" label="状态">
                <Select
                  options={Object.entries(statusMeta).map(([value, item]) => ({
                    value,
                    label: item.label
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="priority" label="优先级">
                <Select
                  options={Object.entries(priorityMeta).map(([value, item]) => ({
                    value,
                    label: item.label
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="coverColor" label="标识色">
                <Select
                  options={colors.map((value) => ({
                    value,
                    label: <Tag color={value}>{value}</Tag>
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="tags" label="技术标签">
            <Input placeholder="多个标签用逗号分隔" />
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  )
}

Projects.propTypes = {
  projectList: PropTypes.array.isRequired,
  onAddProject: PropTypes.func.isRequired,
  onUpdateProject: PropTypes.func.isRequired,
  onDeleteProject: PropTypes.func.isRequired
}
