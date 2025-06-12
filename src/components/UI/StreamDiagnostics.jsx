import React, { useState } from 'react'

const StreamDiagnostics = ({ streamUrl }) => {
  const [testResults, setTestResults] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const runDiagnostics = async () => {
    setIsLoading(true)
    setTestResults({})

    const results = {}

    // Test 1: Basic network connection
    console.log('🔍 Starting network connection diagnostics...')
    try {
      const baseUrl = streamUrl.split('/api')[0]
      const response = await fetch(baseUrl, { method: 'HEAD', mode: 'no-cors' })
      results.networkConnection = {
        status: 'success',
        message: 'Network connection normal'
      }
    } catch (error) {
      results.networkConnection = {
        status: 'error',
        message: `Network connection failed: ${error.message}`
      }
    }

    // Test 2: Stream URL accessibility
    console.log('🔍 Testing stream URL accessibility...')
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      const loadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve('success')
        img.onerror = e => reject(e)
        setTimeout(() => reject(new Error('Timeout')), 10000)
      })

      img.src = streamUrl
      await loadPromise
      results.streamAccess = {
        status: 'success',
        message: 'MJPEG stream accessible'
      }
    } catch (error) {
      results.streamAccess = {
        status: 'error',
        message: `Stream access failed: ${error.message}`
      }
    }

    // Test 3: CORS check
    console.log('🔍 Checking CORS configuration...')
    try {
      const response = await fetch(streamUrl, { method: 'HEAD' })
      results.corsCheck = {
        status: 'success',
        message: 'CORS configuration correct'
      }
    } catch (error) {
      if (error.message.includes('CORS')) {
        results.corsCheck = {
          status: 'warning',
          message: 'CORS restriction, but stream may still work'
        }
      } else {
        results.corsCheck = {
          status: 'error',
          message: `CORS check failed: ${error.message}`
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
        🔧 Stream Connection Diagnostics
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
        {isLoading ? 'Diagnosing...' : 'Start Diagnostics'}
      </button>

      {Object.keys(testResults).length > 0 && (
        <div>
          <div
            style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}
          >
            Diagnostic Results:
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
            <strong>Suggestions:</strong>
            <br />
            • Ensure camera service is running on 192.168.0.92:5000
            <br />
            • Check firewall settings
            <br />• Verify devices are on the same network
          </div>
        </div>
      )}
    </div>
  )
}

export default StreamDiagnostics
