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
  const [connectionStatus, setConnectionStatus] = useState('Connecting...')
  const [retryCount, setRetryCount] = useState(0)
  const imgRef = useRef(null)
  const retryTimeoutRef = useRef(null)
  const maxRetries = 3

  const handleLoad = () => {
    console.log('✅ MJPEG stream connected successfully')
    setIsLoading(false)
    setHasError(false)
    setRetryCount(0)
    setConnectionStatus('Live stream normal')
    if (onStreamLoad) onStreamLoad()
  }

  const handleError = e => {
    console.error('❌ MJPEG stream loading failed:', e)
    setIsLoading(false)

    if (retryCount < maxRetries) {
      const nextRetry = retryCount + 1
      setRetryCount(nextRetry)
      setConnectionStatus(`Reconnecting... (${nextRetry}/${maxRetries})`)

      // Wait 2 seconds before retrying
      retryTimeoutRef.current = setTimeout(() => {
        console.log(`🔄 Retry attempt ${nextRetry}...`)
        if (imgRef.current) {
          // Simply reset the src without adding extra parameters
          imgRef.current.src = streamUrl
          setIsLoading(true)
          setConnectionStatus('Reconnecting...')
        }
      }, 2000)
    } else {
      console.log(
        '❌ Maximum retry attempts reached, switching to fallback image'
      )
      setHasError(true)
      setConnectionStatus('Using fallback image')
      if (imgRef.current && fallbackSrc) {
        imgRef.current.src = fallbackSrc
      }
      if (onStreamError) onStreamError(e)
    }
  }

  useEffect(() => {
    if (imgRef.current) {
      console.log('🚀 Initializing MJPEG stream:', streamUrl)
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
      {/* Connection status indicator */}
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

      {/* Loading indicator */}
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
            ? `Reconnecting... (${retryCount}/${maxRetries})`
            : 'Connecting to live stream...'}
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            Please wait a moment
          </div>
        </div>
      )}

      {/* MJPEG stream image */}
      <img
        ref={imgRef}
        alt='Baby monitor live stream'
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

      {/* Debug info */}
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
          Retries: {retryCount}/{maxRetries}
        </div>
      )}
    </div>
  )
}

export default SimpleMjpegStream
