import React, { useState, useEffect, useRef, useCallback } from 'react'

const RealTimeMjpegStream = ({
  streamUrl,
  fallbackSrc = '/assets/baby.png',
  className = '',
  style = {},
  onStreamLoad,
  onStreamError,
  refreshRate = 100 // 刷新率：毫秒
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('连接中...')
  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)

  const generateRealTimeUrl = useCallback(() => {
    // 生成真正的实时URL，每次都不同
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const separator = streamUrl.includes('?') ? '&' : '?'
    return `${streamUrl}${separator}ts=${timestamp}&rnd=${random}&nocache=1&realtime=1`
  }, [streamUrl])

  const loadFrame = useCallback(async () => {
    try {
      const url = generateRealTimeUrl()

      // 创建新的图片对象来加载最新帧
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        if (canvasRef.current && imgRef.current) {
          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d')

          // 设置canvas尺寸与容器匹配
          const container = imgRef.current.parentElement
          if (container) {
            canvas.width = container.clientWidth
            canvas.height = container.clientHeight

            // 绘制最新帧
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          }
        }

        if (isLoading) {
          setIsLoading(false)
          setConnectionStatus('实时连接正常')
          if (onStreamLoad) onStreamLoad()
        }
      }

      img.onerror = () => {
        throw new Error('帧加载失败')
      }

      img.src = url
    } catch (error) {
      console.error('实时帧加载错误:', error)
      setConnectionStatus('连接异常，重试中...')
    }
  }, [generateRealTimeUrl, isLoading, onStreamLoad])

  const startRealTimeStream = useCallback(() => {
    console.log('启动实时视频流...')
    setIsLoading(true)
    setHasError(false)
    setConnectionStatus('初始化实时流...')

    // 立即加载第一帧
    loadFrame()

    // 设置定时刷新实现真正实时播放
    intervalRef.current = setInterval(() => {
      loadFrame()
    }, refreshRate)
  }, [loadFrame, refreshRate])

  const stopRealTimeStream = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const handleFallback = useCallback(() => {
    setHasError(true)
    setConnectionStatus('使用备用图片')
    stopRealTimeStream()

    if (imgRef.current && fallbackSrc) {
      imgRef.current.src = fallbackSrc
      imgRef.current.style.display = 'block'
    }
    if (canvasRef.current) {
      canvasRef.current.style.display = 'none'
    }

    if (onStreamError) onStreamError(new Error('实时流不可用'))
  }, [fallbackSrc, onStreamError, stopRealTimeStream])

  useEffect(() => {
    // 延迟启动以避免初始加载问题
    const startTimer = setTimeout(() => {
      startRealTimeStream()
    }, 500)

    // 监听错误并在5秒后回退
    const errorTimer = setTimeout(() => {
      if (isLoading) {
        console.log('实时流启动超时，切换到备用方案')
        handleFallback()
      }
    }, 8000)

    return () => {
      clearTimeout(startTimer)
      clearTimeout(errorTimer)
      stopRealTimeStream()
    }
  }, [
    streamUrl,
    startRealTimeStream,
    stopRealTimeStream,
    handleFallback,
    isLoading
  ])

  return (
    <div style={{ position: 'relative', ...style }}>
      {/* 状态指示器 */}
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
          zIndex: 2
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
          <div style={{ marginBottom: '10px' }}>🎥</div>
          正在启动实时视频流...
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            刷新率: {1000 / refreshRate}fps
          </div>
        </div>
      )}

      {/* Canvas用于实时帧渲染 */}
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: hasError ? 'none' : 'block',
          borderRadius: 'inherit'
        }}
      />

      {/* 备用图片 */}
      <img
        ref={imgRef}
        alt='婴儿监控备用图片'
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: hasError ? 'block' : 'none',
          borderRadius: 'inherit'
        }}
      />
    </div>
  )
}

export default RealTimeMjpegStream
