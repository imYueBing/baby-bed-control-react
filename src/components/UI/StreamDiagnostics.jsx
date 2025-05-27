import React, { useState } from 'react'

const StreamDiagnostics = ({ streamUrl }) => {
  const [testResults, setTestResults] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const runDiagnostics = async () => {
    setIsLoading(true)
    setTestResults({})

    const results = {}

    // 测试1: 基本网络连接
    console.log('🔍 开始诊断网络连接...')
    try {
      const baseUrl = streamUrl.split('/api')[0]
      const response = await fetch(baseUrl, { method: 'HEAD', mode: 'no-cors' })
      results.networkConnection = { status: 'success', message: '网络连接正常' }
    } catch (error) {
      results.networkConnection = {
        status: 'error',
        message: `网络连接失败: ${error.message}`
      }
    }

    // 测试2: 流地址可访问性
    console.log('🔍 测试流地址可访问性...')
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      const loadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve('success')
        img.onerror = e => reject(e)
        setTimeout(() => reject(new Error('超时')), 10000)
      })

      img.src = streamUrl
      await loadPromise
      results.streamAccess = { status: 'success', message: 'MJPEG流可以访问' }
    } catch (error) {
      results.streamAccess = {
        status: 'error',
        message: `流访问失败: ${error.message}`
      }
    }

    // 测试3: CORS检查
    console.log('🔍 检查CORS配置...')
    try {
      const response = await fetch(streamUrl, { method: 'HEAD' })
      results.corsCheck = { status: 'success', message: 'CORS配置正确' }
    } catch (error) {
      if (error.message.includes('CORS')) {
        results.corsCheck = {
          status: 'warning',
          message: 'CORS限制，但流可能仍可工作'
        }
      } else {
        results.corsCheck = {
          status: 'error',
          message: `CORS检查失败: ${error.message}`
        }
      }
    }

    setTestResults(results)
    setIsLoading(false)
  }

  const getStatusColor = status => {
    switch (status) {
      case 'success':
        return '#28a745'
      case 'warning':
        return '#ffc107'
      case 'error':
        return '#dc3545'
      default:
        return '#6c757d'
    }
  }

  const getStatusIcon = status => {
    switch (status) {
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return '⏳'
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        maxWidth: '300px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000
      }}
    >
      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
        🔧 流连接诊断
      </h4>

      <button
        onClick={runDiagnostics}
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '8px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '12px',
          marginBottom: '12px'
        }}
      >
        {isLoading ? '诊断中...' : '开始诊断'}
      </button>

      {Object.keys(testResults).length > 0 && (
        <div>
          <div
            style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}
          >
            诊断结果:
          </div>

          {Object.entries(testResults).map(([test, result]) => (
            <div
              key={test}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '6px',
                fontSize: '11px'
              }}
            >
              <span style={{ marginRight: '6px' }}>
                {getStatusIcon(result.status)}
              </span>
              <span style={{ color: getStatusColor(result.status) }}>
                {result.message}
              </span>
            </div>
          ))}

          <div
            style={{
              marginTop: '12px',
              padding: '8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              fontSize: '10px'
            }}
          >
            <strong>建议:</strong>
            <br />
            • 确保摄像头服务运行在 192.168.0.92:5000
            <br />
            • 检查防火墙设置
            <br />• 验证设备在同一网络
          </div>
        </div>
      )}
    </div>
  )
}

export default StreamDiagnostics
