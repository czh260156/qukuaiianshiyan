import { useMemo, useState } from 'react'
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LeftOutlined,
  PlusOutlined,
  RightOutlined
} from '@ant-design/icons'
import {
  Button,
  Calendar,
  Card,
  Col,
  Empty,
  Flex,
  List,
  Row,
  Select,
  Space,
  Tag,
  Typography
} from 'antd'
import dayjs from 'dayjs'
import PageHeading from '../components/PageHeading'
import { formatDate } from '../utils/appData'
import PropTypes from 'prop-types'

const { Text, Title } = Typography

export default function CalendarPage({ projects, onToggleTask, onNavigateTasks }) {
  const [projectFilter, setProjectFilter] = useState('all')
  const events = useMemo(
    () =>
      projects.flatMap((project) =>
        project.tasks
          .filter(() => projectFilter === 'all' || project.id === projectFilter)
          .map((task) => ({
            ...task,
            projectName: project.name,
            projectId: project.id,
            color: project.coverColor
          }))
      ),
    [projects, projectFilter]
  )
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const selectedEvents = events.filter((event) => event.dueDate === selectedDate)
  const upcoming = [...events]
    .filter((event) => !event.completed)
    .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))
    .slice(0, 7)

  const cellRender = (date, info) => {
    if (info.type !== 'date') return info.originNode
    const list = events.filter((event) => event.dueDate === date.format('YYYY-MM-DD'))
    if (!list.length) return null
    return (
      <Flex vertical gap={2}>
        {list.slice(0, 2).map((event) => (
          <Tag
            key={event.id}
            color={event.completed ? 'success' : 'processing'}
            className="calendar-task-tag"
          >
            {event.title}
          </Tag>
        ))}
        {list.length > 2 && <Text type="secondary">还有 {list.length - 2} 项</Text>}
      </Flex>
    )
  }

  return (
    <Flex vertical gap={20} className="page-shell">
      <PageHeading
        eyebrow="LEARNING CALENDAR"
        title="学习日历"
        description="任务截止日期来自项目模拟数据，并随任务状态同步更新。"
        extra={
          <Space wrap>
            <Select
              value={projectFilter}
              onChange={setProjectFilter}
              style={{ width: 220 }}
              options={[
                { label: '全部项目', value: 'all' },
                ...projects.map((project) => ({ label: project.name, value: project.id }))
              ]}
            />
            <Button icon={<PlusOutlined />} onClick={onNavigateTasks}>
              添加任务
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={17}>
          <Card>
            <Calendar
              fullscreen
              cellRender={cellRender}
              onSelect={(date) => setSelectedDate(date.format('YYYY-MM-DD'))}
              headerRender={({ value, onChange }) => (
                <Flex align="center" justify="space-between" style={{ padding: 8 }}>
                  <Space>
                    <Button
                      type="text"
                      icon={<LeftOutlined />}
                      onClick={() => onChange(value.clone().subtract(1, 'month'))}
                      aria-label="上个月"
                    />
                    <Button
                      type="text"
                      icon={<RightOutlined />}
                      onClick={() => onChange(value.clone().add(1, 'month'))}
                      aria-label="下个月"
                    />
                    <Title level={4} style={{ margin: 0 }}>
                      {value.format('YYYY年 M月')}
                    </Title>
                  </Space>
                  <Space>
                    <Button onClick={() => onChange(dayjs())}>今天</Button>
                    <Text type="secondary">{events.length} 个任务节点</Text>
                  </Space>
                </Flex>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} xl={7}>
          <Flex vertical gap={16}>
            <Card
              title={`${formatDate(selectedDate)} 安排`}
              extra={<Tag color="processing">{selectedEvents.length} 项</Tag>}
            >
              <List
                dataSource={selectedEvents}
                locale={{ emptyText: <Empty description="这一天还没有安排" /> }}
                renderItem={(event) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Button
                          type="text"
                          icon={event.completed ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                          onClick={() => onToggleTask(event.projectId, event.id)}
                          aria-label="切换任务状态"
                        />
                      }
                      title={event.title}
                      description={
                        <Space wrap>
                          <Tag color={event.completed ? 'success' : 'default'}>
                            {event.completed ? '已完成' : '待完成'}
                          </Tag>
                          <Text type="secondary">{event.projectName}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
            <Card title="即将到来" extra={<CalendarOutlined />}>
              <List
                dataSource={upcoming}
                locale={{ emptyText: <Empty description="暂无待完成任务" /> }}
                renderItem={(event) => (
                  <List.Item
                    onClick={() => setSelectedDate(event.dueDate)}
                    className="calendar-upcoming-item"
                  >
                    <List.Item.Meta
                      title={event.title}
                      description={
                        <Flex justify="space-between">
                          <Text type="secondary">{event.projectName}</Text>
                          <Text type="secondary">{formatDate(event.dueDate)}</Text>
                        </Flex>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Flex>
        </Col>
      </Row>
    </Flex>
  )
}

CalendarPage.propTypes = {
  projects: PropTypes.array.isRequired,
  onToggleTask: PropTypes.func.isRequired,
  onNavigateTasks: PropTypes.func.isRequired
}
