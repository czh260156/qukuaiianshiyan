import { useMemo } from 'react'
import {
  BarChartOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  DashboardOutlined,
  LeftOutlined,
  ProjectOutlined,
  RightOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { Avatar, Button, Flex, Layout, Menu, Progress, Tooltip, Typography } from 'antd'
import logoPic from '../assets/pic2.png'
import { allProjectStats } from '../utils/appData'
import PropTypes from 'prop-types'

const { Sider } = Layout
const { Text } = Typography

const menuItems = [
  {
    type: 'group',
    label: '总览',
    children: [
      { key: 'dashboard', icon: <DashboardOutlined />, label: '工作台' },
      { key: 'analytics', icon: <BarChartOutlined />, label: '数据分析' }
    ]
  },
  {
    type: 'group',
    label: '学习空间',
    children: [
      { key: 'projects', icon: <ProjectOutlined />, label: '项目管理' },
      { key: 'tasks', icon: <CheckSquareOutlined />, label: '任务中心' },
      { key: 'calendar', icon: <CalendarOutlined />, label: '学习日历' }
    ]
  }
]

export default function Sidebar({
  current,
  projects,
  profile,
  collapsed,
  onCollapse,
  onNavigate,
  onOpenSettings
}) {
  const stats = useMemo(() => allProjectStats(projects), [projects])
  return (
    <Sider
      width={248}
      collapsedWidth={78}
      collapsed={collapsed}
      theme="light"
      breakpoint="lg"
      onBreakpoint={(broken) => broken && onCollapse(true)}
      className="app-sider"
    >
      <Flex align="center" gap={11} className="brand-area">
        <Avatar shape="square" size={39} src={logoPic} className="brand-logo">
          USY
        </Avatar>
        {!collapsed && (
          <Flex vertical flex={1}>
            <Text strong>USY Studio</Text>
            <Text type="secondary" className="micro-text">
              项目制学习空间
            </Text>
          </Flex>
        )}
        <Button
          size="small"
          shape="circle"
          type="text"
          icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
          onClick={() => onCollapse(!collapsed)}
          aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
        />
      </Flex>

      <Menu
        mode="inline"
        items={menuItems}
        selectedKeys={[current]}
        onClick={({ key }) => onNavigate(key)}
        className="sider-menu"
      />

      {!collapsed && (
        <Button block className="semester-button" onClick={() => onNavigate('analytics')}>
          <Flex align="center" justify="space-between" gap={10}>
            <Flex vertical align="flex-start" gap={2}>
              <Text strong>本学期学习进度</Text>
              <Text type="secondary" className="micro-text">
                {stats.done} / {stats.taskCount} 个任务已完成
              </Text>
            </Flex>
            <Progress type="circle" percent={stats.percent} size={42} strokeWidth={7} />
          </Flex>
        </Button>
      )}

      <Flex vertical gap={6} className="sider-footer">
        <Button type="text" icon={<SettingOutlined />} onClick={onOpenSettings}>
          {!collapsed && '偏好设置'}
        </Button>
        <Tooltip title={collapsed ? profile?.name : ''} placement="right">
          <Flex align="center" gap={9} className="profile-summary">
            <Avatar style={{ background: profile?.avatarColor }}>
              {profile?.name?.slice(0, 1)}
            </Avatar>
            {!collapsed && (
              <Flex vertical flex={1}>
                <Text strong>{profile?.name}</Text>
                <Text type="secondary" className="micro-text">
                  {profile?.studentId}
                </Text>
              </Flex>
            )}
          </Flex>
        </Tooltip>
      </Flex>
    </Sider>
  )
}

Sidebar.propTypes = {
  current: PropTypes.string.isRequired,
  projects: PropTypes.array.isRequired,
  profile: PropTypes.object,
  collapsed: PropTypes.bool.isRequired,
  onCollapse: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onOpenSettings: PropTypes.func.isRequired
}
