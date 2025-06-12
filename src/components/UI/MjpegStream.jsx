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
    // Add timestamp and random parameters to ensure no-cache real-time playback
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
    console.log('Live video stream connected successfully')
  }

  const handleError = e => {
    console.error('MJPEG stream error:', e)
    setIsLoading(false)

    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1)
      console.log(`Retrying connection... (${retryCount + 1}/${maxRetries})`)

      // Use new no-cache URL when retrying
      retryTimeoutRef.current = setTimeout(() => {
        if (imgRef.current) {
          imgRef.current.src = generateStreamUrl(streamUrl)
          setIsLoading(true)
        }
      }, retryInterval)
    } else {
      setHasError(true)
      console.log('Video stream connection failed, switching to fallback image')
      // Fall back to static image
      if (imgRef.current && fallbackSrc) {
        imgRef.current.src = fallbackSrc
      }
      if (onStreamError) onStreamError(e)
    }
  }

  useEffect(() => {
    // Initialize live stream
    if (imgRef.current) {
      imgRef.current.src = generateStreamUrl(streamUrl)
    }

    // Clean up timers
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
            ? `Reconnecting... (${retryCount}/${maxRetries})`
            : 'Loading live stream...'}
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
          Live stream unavailable
          <br />
          <small>Switched to fallback image</small>
        </div>
      )}

      <img
        ref={imgRef}
        alt='Baby monitor live video stream'
        className={className}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          // Disable all caching to ensure real-time streaming
          imageRendering: 'auto',
          // Force reload
          filter: 'none'
        }}
        // Add attributes to ensure no-cache
        crossOrigin='anonymous'
      />
    </div>
  )
}

export default MjpegStream
