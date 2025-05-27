import React, { useState, useEffect, useRef } from 'react'

const SimpleMjpegStream = ({
  streamUrl,
  fallbackSrc = '/assets/baby.png',
  className = '',
  style = {},
  onStreamLoad,
  onStreamError
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('连接中...')
  const [retryCount, setRetryCount] = useState(0)
  const imgRef = useRef(null)
  const retryTimeoutRef = useRef(null)
  const maxRetries = 3

  const handleLoad = () => {
    console.log('✅ MJPEG流连接成功')
    setIsLoading(false)
    setHasError(false)
    setRetryCount(0)
    setConnectionStatus('实时流正常')
    if (onStreamLoad) onStreamLoad()
  }

  const handleError = e => {
    console.error('❌ MJPEG流加载失败:', e)
    setIsLoading(false)

    if (retryCount < maxRetries) {
      const nextRetry = retryCount + 1
      setRetryCount(nextRetry)
      setConnectionStatus(`重连中... (${nextRetry}/${maxRetries})`)

      // 等待2秒后重试
      retryTimeoutRef.current = setTimeout(() => {
        console.log(`🔄 第${nextRetry}次重连尝试...`)
        if (imgRef.current) {
          // 简单地重新设置src，不添加额外参数
          imgRef.current.src = streamUrl
          setIsLoading(true)
          setConnectionStatus('重新连接中...')
        }
      }, 2000)
    } else {
      console.log('❌ 达到最大重试次数，切换到备用图片')
      setHasError(true)
      setConnectionStatus('使用备用图片')
      if (imgRef.current && fallbackSrc) {
        imgRef.current.src = fallbackSrc
      }
      if (onStreamError) onStreamError(e)
    }
  }

  useEffect(() => {
    if (imgRef.current) {
      console.log('🚀 初始化MJPEG流:', streamUrl)
      imgRef.current.src = streamUrl
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [streamUrl])

  return (
    <div style={{ position: 'relative', ...style }}>
      {/* 连接状态指示器 */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: isLoading
            ? 'rgba(255, 193, 7, 0.9)'
            : hasError
            ? 'rgba(220, 38, 38, 0.9)'
            : 'rgba(40, 167, 69, 0.9)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '500',
          zIndex: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}
      >
        {isLoading ? '🔄' : hasError ? '⚠️' : '🔴'} {connectionStatus}
      </div>

      {/* 加载提示 */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '20px 30px',
            borderRadius: '12px',
            fontSize: '16px',
            zIndex: 1,
            textAlign: 'center',
            fontWeight: '500'
          }}
        >
          <div style={{ marginBottom: '10px' }}>📡</div>
          {retryCount > 0
            ? `正在重连... (${retryCount}/${maxRetries})`
            : '正在连接实时流...'}
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            请稍候片刻
          </div>
        </div>
      )}

      {/* MJPEG流图片 */}
      <img
        ref={imgRef}
        alt='婴儿监控实时流'
        className={className}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          borderRadius: 'inherit'
        }}
      />

      {/* 调试信息 */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            zIndex: 2
          }}
        >
          重试: {retryCount}/{maxRetries}
        </div>
      )}
    </div>
  )
}

export default SimpleMjpegStream
