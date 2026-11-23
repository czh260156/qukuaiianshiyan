import { useMemo } from 'react'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  ProjectOutlined,
  RiseOutlined
} from '@ant-design/icons'
import { Card, Col, Flex, List, Progress, Row, Statistic, Tag, theme, Typography } from 'antd'
import PageHeading from '../components/PageHeading'
import { allProjectStats, daysFromNow, projectStats } from '../utils/appData'
import PropTypes from 'prop-types'

const { Text, Title } = Typography

export default function Analytics({ projects }) {
  const { token } = theme.useToken()
  const stats = allProjectStats(projects)
  const tasks = useMemo(() => projects.flatMap((project) => project.tasks), [projects])
  const overdue = tasks.filter((task) => !task.completed && daysFromNow(task.dueDate) < 0).length
  const avgHours = tasks.length
    ? (
        tasks.reduce((total, task) => total + (Number(task.estimate) || 2), 0) / tasks.length
      ).toFixed(1)
    : '0.0'
  const categoryCount = tasks.reduce((result, task) => {
    result[task.category || '其他'] = (result[task.category || '其他'] || 0) + 1
    return result
  }, {})

  const cards = [
    {
      title: '项目总数',
      value: stats.projectCount,
      suffix: '个',
      icon: <ProjectOutlined style={{ color: token.colorPrimary }} />,
      color: token.colorPrimary
    },
    {
      title: '任务完成',
      value: stats.done,
      suffix: `/ ${stats.taskCount}`,
      icon: <CheckCircleOutlined style={{ color: token.colorSuccess }} />,
      color: token.colorSuccess
    },
    {
      title: '平均耗时',
      value: avgHours,
      suffix: 'h',
      icon: <FieldTimeOutlined style={{ color: token.colorWarning }} />,
      color: token.colorWarning
    },
    {
      title: '逾期任务',
      value: overdue,
      suffix: '项',
      icon: <ClockCircleOutlined style={{ color: token.colorError }} />,
      color: token.colorError
    }
  ]

  return (
    <Flex vertical gap={20} className="page-shell">
      <PageHeading
        eyebrow="LEARNING INSIGHTS"
        title="数据分析"
        description="全部指标由项目模拟数据实时计算。"
      />
      <Row gutter={[16, 16]}>
        {cards.map((item) => (
          <Col xs={24} sm={12} xl={6} key={item.title}>
            <Card>
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
            title="项目完成情况"
            extra={
              <Tag icon={<RiseOutlined />} color="success">
                实时统计
              </Tag>
            }
          >
            <List
              dataSource={projects}
              renderItem={(project) => {
                const info = projectStats(project)
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <ProjectOutlined style={{ fontSize: 22, color: project.coverColor }} />
                      }
                      title={
                        <Flex justify="space-between" gap={12}>
                          <Text strong>{project.name}</Text>
                          <Text strong>{info.percent}%</Text>
                        </Flex>
                      }
                      description={
                        <Flex vertical gap={5}>
                          <Flex justify="space-between">
                            <Text type="secondary">{project.course}</Text>
                            <Text type="secondary">
                              {info.done}/{info.total} 任务
                            </Text>
                          </Flex>
                          <Progress
                            percent={info.percent}
                            showInfo={false}
                            strokeColor={project.coverColor}
                          />
                        </Flex>
                      }
                    />
                  </List.Item>
                )
              }}
            />
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="任务类型分布">
            <Flex vertical gap={14}>
              {Object.entries(categoryCount).map(([category, count]) => (
                <Flex key={category} justify="space-between" align="center">
                  <Text>{category}</Text>
                  <Tag color="purple">{count} 项</Tag>
                </Flex>
              ))}
            </Flex>
          </Card>
        </Col>
      </Row>
      <Card>
        <Title level={5} style={{ marginTop: 0 }}>
          学习建议
        </Title>
        <Text type="secondary">
          当前共有 {stats.taskCount} 项任务，已完成 {stats.done} 项，仍有 {stats.pending}{' '}
          项待推进；整体完成率为 {stats.percent}%。
        </Text>
      </Card>
    </Flex>
  )
}

Analytics.propTypes = {
  projects: PropTypes.array.isRequired
}
