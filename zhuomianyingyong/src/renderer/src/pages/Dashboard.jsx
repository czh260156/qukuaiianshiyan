import { useMemo } from 'react'
import {
  ArrowRightOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  ProjectOutlined,
  RightOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Empty,
  Flex,
  List,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  theme,
  Typography
} from 'antd'
import PageHeading from '../components/PageHeading'
import {
  allProjectStats,
  daysFromNow,
  formatDate,
  priorityMeta,
  projectStats
} from '../utils/appData'
import PropTypes from 'prop-types'

const { Text, Title, Paragraph } = Typography

export default function Dashboard({
  projects = [],
  projectList,
  profile,
  onNavigate,
  onSelectProject,
  onToggleTask,
  onCreateProject
}) {
  const projectData = useMemo(
    () => (Array.isArray(projects) ? projects : projectList || []),
    [projects, projectList]
  )
  const { token } = theme.useToken()
  const stats = useMemo(() => allProjectStats(projectData), [projectData])
  const upcoming = useMemo(
    () =>
      projectData
        .flatMap((project) =>
          (project.tasks || []).map((task) => ({
            ...task,
            projectName: project.name,
            projectId: project.id
          }))
        )
        .filter((task) => !task.completed)
        .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))
        .slice(0, 4),
    [projectData]
  )

  const statCards = [
    {
      title: '实训项目总数',
      value: stats.projectCount,
      suffix: '个',
      icon: <ProjectOutlined style={{ color: token.colorInfo }} />,
      color: token.colorInfo
    },
    {
      title: '实训任务总数',
      value: stats.taskCount,
      suffix: '项',
      icon: <ThunderboltOutlined style={{ color: '#722ed1' }} />,
      color: '#722ed1'
    },
    {
      title: '已完成任务',
      value: stats.done,
      suffix: '项',
      icon: <CheckCircleOutlined style={{ color: token.colorSuccess }} />,
      color: token.colorSuccess
    },
    {
      title: '整体完成率',
      value: stats.percent,
      suffix: '%',
      icon: <ClockCircleOutlined style={{ color: token.colorWarning }} />,
      color: token.colorWarning
    }
  ]

  return (
    <Flex vertical gap={20} className="page-shell">
      <PageHeading
        eyebrow="WORKSPACE OVERVIEW"
        title={`${profile?.name || '同学'}的实训教学工作台`}
        description="数据直接来自项目模拟数据，项目、任务与完成率保持实时联动。"
        extra={
          <Space>
            <Button icon={<CalendarOutlined />} onClick={() => onNavigate('calendar')}>
              学习日历
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreateProject}>
              新建项目
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]}>
        {statCards.map((item) => (
          <Col xs={24} sm={12} xl={6} key={item.title}>
            <Card className="dashboard-stat-card">
              <Statistic
                title={item.title}
                value={item.value}
                suffix={item.suffix}
                prefix={item.icon}
                styles={{ content: { color: item.color, fontWeight: 600 } }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card
            title="实训项目推进进度"
            extra={
              <Button type="link" onClick={() => onNavigate('projects')}>
                全部项目 <ArrowRightOutlined />
              </Button>
            }
          >
            {projectData.length ? (
              <List
                dataSource={projectData}
                renderItem={(project) => {
                  const info = projectStats(project)
                  const remaining = daysFromNow(project.deadline)
                  return (
                    <List.Item
                      actions={[
                        <Button key="open" type="text" onClick={() => onSelectProject(project.id)}>
                          查看任务 <RightOutlined />
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <ProjectOutlined style={{ fontSize: 22, color: project.coverColor }} />
                        }
                        title={
                          <Space wrap>
                            <Text strong>{project.name}</Text>
                            <Tag color="blue">{project.course}</Tag>
                            {remaining !== null && remaining <= 7 && (
                              <Tag color="error">临近截止</Tag>
                            )}
                          </Space>
                        }
                        description={
                          <Flex vertical gap={6} style={{ width: '100%' }}>
                            <Flex justify="space-between" wrap="wrap" gap={8}>
                              <Text type="secondary">
                                已完成 {info.done} / {info.total} 项任务
                              </Text>
                              <Text type="secondary">
                                {project.deadline
                                  ? `${formatDate(project.deadline)} 截止`
                                  : '未设置截止日期'}
                              </Text>
                            </Flex>
                            <Progress
                              percent={info.percent}
                              status={info.percent === 100 ? 'success' : 'active'}
                              strokeColor={{ '0%': '#1677ff', '100%': '#52c41a' }}
                            />
                          </Flex>
                        }
                      />
                    </List.Item>
                  )
                }}
              />
            ) : (
              <Empty description="暂无实训项目，请先创建项目" />
            )}
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Flex vertical gap={16}>
            <Card
              title="接下来要做"
              extra={
                <Button type="link" onClick={() => onNavigate('tasks')}>
                  任务中心
                </Button>
              }
            >
              <List
                dataSource={upcoming}
                locale={{ emptyText: <Empty description="暂无待推进任务" /> }}
                renderItem={(task) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Button
                          type="text"
                          shape="circle"
                          icon={<CheckCircleOutlined />}
                          aria-label={`完成任务：${task.title}`}
                          onClick={() => onToggleTask(task.projectId, task.id)}
                        />
                      }
                      title={task.title}
                      description={
                        <Space wrap size={[4, 4]}>
                          <Text type="secondary">{task.projectName}</Text>
                          <Tag color={priorityMeta[task.priority || 'medium'].color}>
                            {priorityMeta[task.priority || 'medium'].short}
                          </Tag>
                          <Text type="secondary">{formatDate(task.dueDate)}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>

            <Card title="快捷入口">
              <Flex vertical gap={10}>
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={onCreateProject}
                >
                  创建新实训项目
                </Button>
                <Button
                  block
                  size="large"
                  icon={<RightOutlined />}
                  onClick={() => onNavigate('tasks')}
                >
                  进入任务清单管理
                </Button>
                <Button
                  block
                  size="large"
                  icon={<CalendarOutlined />}
                  onClick={() => onNavigate('analytics')}
                >
                  查看学习数据分析
                </Button>
              </Flex>
            </Card>
          </Flex>
        </Col>
      </Row>

      <Card className="dashboard-tip-card" variant="borderless">
        <Flex align="flex-start" gap={12}>
          <ThunderboltOutlined style={{ fontSize: 20, color: '#6558f5' }} />
          <Flex vertical gap={3}>
            <Title level={5} style={{ margin: 0 }}>
              项目制实训小贴士
            </Title>
            <Paragraph style={{ margin: 0 }} type="secondary">
              在任务中心勾选任务后，工作台的项目完成数、完成率和数据分析会同步刷新。
            </Paragraph>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  )
}

Dashboard.propTypes = {
  projects: PropTypes.array.isRequired,
  projectList: PropTypes.array,
  profile: PropTypes.object,
  onNavigate: PropTypes.func.isRequired,
  onSelectProject: PropTypes.func.isRequired,
  onToggleTask: PropTypes.func.isRequired,
  onCreateProject: PropTypes.func.isRequired
}
