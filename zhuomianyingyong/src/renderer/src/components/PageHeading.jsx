import { Flex, Typography } from 'antd'
import PropTypes from 'prop-types'

const { Title, Text } = Typography

export default function PageHeading({ eyebrow, title, description, extra }) {
  return (
    <Flex align="center" justify="space-between" gap={24} wrap="wrap" style={{ marginBottom: 24 }}>
      <Flex vertical gap={5}>
        <Text type="secondary" className="eyebrow">
          {eyebrow}
        </Text>
        <Title level={2} style={{ margin: 0 }}>
          {title}
        </Title>
        <Text type="secondary">{description}</Text>
      </Flex>
      {extra}
    </Flex>
  )
}

PageHeading.propTypes = {
  eyebrow: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  extra: PropTypes.node
}
