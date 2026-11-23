import { Component } from 'react'
import { Alert, Button, Flex } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import PropTypes from 'prop-types'

export default class PageErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Page render failed', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <Flex className="page-shell" justify="center" align="center">
        <Alert
          type="error"
          showIcon
          message="页面加载遇到问题"
          description="数据已保留，可以重新加载页面后继续操作。"
          action={
            <Button icon={<ReloadOutlined />} onClick={() => this.setState({ hasError: false })}>
              重试
            </Button>
          }
        />
      </Flex>
    )
  }
}

PageErrorBoundary.propTypes = {
  children: PropTypes.node
}
