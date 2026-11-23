import {
  Avatar,
  Button,
  ColorPicker,
  Flex,
  Form,
  Input,
  Modal,
  Progress,
  Switch,
  Typography
} from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { allProjectStats } from '../utils/appData'
import PropTypes from 'prop-types'

const { Text, Title } = Typography

export default function SettingsModal({
  open,
  onClose,
  profile,
  projects,
  onSaveProfile,
  onReset
}) {
  const [form] = Form.useForm()
  const stats = allProjectStats(projects)

  const save = async () => {
    const values = await form.validateFields()
    onSaveProfile({
      ...profile,
      ...values,
      avatarColor:
        typeof values.avatarColor === 'string'
          ? values.avatarColor
          : values.avatarColor?.toHexString() || profile.avatarColor
    })
    onClose()
  }

  return (
    <Modal
      title="偏好设置"
      open={open}
      onCancel={onClose}
      onOk={save}
      okText="保存设置"
      cancelText="取消"
      width={680}
      destroyOnHidden
      afterOpenChange={(isOpen) =>
        isOpen && form.setFieldsValue({ ...profile, notifications: true, weeklySummary: true })
      }
    >
      <Flex
        align="center"
        gap={16}
        style={{ padding: 16, background: '#f7f5ff', borderRadius: 12, marginBottom: 20 }}
      >
        <Avatar size={62} style={{ background: profile?.avatarColor }}>
          {profile?.name?.slice(0, 1)}
        </Avatar>
        <Flex vertical flex={1}>
          <Title level={4} style={{ margin: 0 }}>
            {profile?.name}
          </Title>
          <Text type="secondary">
            {profile?.major} · {profile?.studentId}
          </Text>
          <Text type="secondary">
            {stats.projectCount} 个项目 · {stats.done}/{stats.taskCount} 个任务 · {stats.percent}%
            完成率
          </Text>
        </Flex>
        <Progress type="circle" percent={stats.percent} size={60} />
      </Flex>
      <Form form={form} layout="vertical">
        <Flex gap={12}>
          <Form.Item
            name="name"
            label="显示名称"
            rules={[{ required: true, message: '请输入名称' }]}
            style={{ flex: 1 }}
          >
            <Input />
          </Form.Item>
          <Form.Item name="major" label="专业 / 方向" style={{ flex: 1 }}>
            <Input />
          </Form.Item>
        </Flex>
        <Flex gap={12}>
          <Form.Item name="studentId" label="年级 / 学院" style={{ flex: 1 }}>
            <Input />
          </Form.Item>
          <Form.Item name="avatarColor" label="头像标识色" style={{ flex: 1 }}>
            <ColorPicker showText />
          </Form.Item>
        </Flex>
        <Flex
          justify="space-between"
          align="center"
          style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}
        >
          <Text>截止日期提醒</Text>
          <Form.Item name="notifications" valuePropName="checked" noStyle>
            <Switch />
          </Form.Item>
        </Flex>
        <Flex
          justify="space-between"
          align="center"
          style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12, marginTop: 12 }}
        >
          <Text>每周学习摘要</Text>
          <Form.Item name="weeklySummary" valuePropName="checked" noStyle>
            <Switch />
          </Form.Item>
        </Flex>
        <Flex justify="space-between" align="center" style={{ marginTop: 20 }}>
          <Text type="secondary">数据仅保存在本机，恢复会覆盖当前修改。</Text>
          <Button danger icon={<ReloadOutlined />} onClick={onReset}>
            恢复模拟数据
          </Button>
        </Flex>
      </Form>
    </Modal>
  )
}

SettingsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  profile: PropTypes.object,
  projects: PropTypes.array.isRequired,
  onSaveProfile: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired
}
