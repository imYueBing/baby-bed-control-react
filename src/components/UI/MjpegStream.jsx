import React, { useState, useEffect, useRef } from 'react'

const MjpegStream = ({
  streamUrl,
  fallbackSrc = '/assets/baby.png',
  className = '',
  style = {},
  onStreamLoad,
  onStreamError,
  retryInterval = 3000,
  maxRetries = 5
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const imgRef = useRef(null)
  const retryTimeoutRef = useRef(null)

  const generateStreamUrl = baseUrl => {
    // 添加时间戳和随机参数确保无缓存实时播放
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2)
    const separator = baseUrl.includes('?') ? '&' : '?'
    return `${baseUrl}${separator}t=${timestamp}&r=${random}&cache=false`
  }

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
    setRetryCount(0)
    if (onStreamLoad) onStreamLoad()
    console.log('实时视频流连接成功')
  }

  const handleError = e => {
    console.error('MJPEG流错误:', e)
    setIsLoading(false)

    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1)
      console.log(`正在重试连接... (${retryCount + 1}/${maxRetries})`)

      // 重试时使用新的无缓存URL
      retryTimeoutRef.current = setTimeout(() => {
        if (imgRef.current) {
          imgRef.current.src = generateStreamUrl(streamUrl)
          setIsLoading(true)
        }
      }, retryInterval)
    } else {
      setHasError(true)
      console.log('视频流连接失败，切换到备用图片')
      // 回退到静态图片
      if (imgRef.current && fallbackSrc) {
        imgRef.current.src = fallbackSrc
      }
      if (onStreamError) onStreamError(e)
    }
  }

  useEffect(() => {
    // 初始化实时流
    if (imgRef.current) {
      imgRef.current.src = generateStreamUrl(streamUrl)
    }

    // 清理定时器
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [streamUrl])

  return (
    <div style={{ position: 'relative', ...style }}>
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            zIndex: 1,
            textAlign: 'center',
            fontWeight: '500'
          }}
        >
          {retryCount > 0
            ? `正在重新连接... (${retryCount}/${maxRetries})`
            : '正在加载实时流...'}
        </div>
      )}

      {hasError && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(220, 38, 38, 0.9)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            zIndex: 1,
            textAlign: 'center',
            fontWeight: '500'
          }}
        >
          实时流不可用
          <br />
          <small>已切换到备用图片</small>
        </div>
      )}

      <img
        ref={imgRef}
        alt='婴儿监控实时视频流'
        className={className}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          // 禁用所有缓存以确保实时性
          imageRendering: 'auto',
          // 强制重新加载
          filter: 'none'
        }}
        // 添加属性确保无缓存
        crossOrigin='anonymous'
      />
    </div>
  )
}

export default MjpegStream
