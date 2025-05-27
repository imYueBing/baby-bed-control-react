import React, { useState } from 'react'
import HeartRateDisplay from './HeartRateDisplay'
import SimpleMjpegStream from './SimpleMjpegStream'
import StreamDiagnostics from './StreamDiagnostics'
import './VideoFeed.css'
import './MobileOptimizations.css'

const VideoFeed = ({ heartRate, heartRateColor, alertType }) => {
  const streamUrl = 'http://192.168.0.92:5000/api/video/stream'
  const [showDiagnostics, setShowDiagnostics] = useState(false)

  const handleStreamLoad = () => {
    console.log('✅ 视频流连接成功！')
    // 连接成功后隐藏诊断工具
    setShowDiagnostics(false)
  }

  const handleStreamError = error => {
    console.error('❌ 视频流连接失败:', error)
    console.log('💡 请检查：')
    console.log('   1. 摄像头服务器是否运行在 192.168.0.92:5000')
    console.log('   2. 网络连接是否正常')
    console.log('   3. 防火墙是否阻止了连接')

    // 连接失败时显示诊断工具
    setShowDiagnostics(true)
  }

  const handleLeftArrowClick = () => {
    console.log('⬅️ 左箭头点击')
    // 在这里发送请求
  }

  const handleRightArrowClick = () => {
    console.log('➡️ 右箭头点击')
    // 在这里发送请求
  }

  return (
    <>
      <div className='image-container'>
        <button
          className='arrow-button left-arrow'
          onClick={handleLeftArrowClick}
        >
          &lt;
        </button>
        <SimpleMjpegStream
          streamUrl={streamUrl}
          fallbackSrc='/assets/baby.png'
          className='baby-image'
          onStreamLoad={handleStreamLoad}
          onStreamError={handleStreamError}
        />
        <button
          className='arrow-button right-arrow'
          onClick={handleRightArrowClick}
        >
          &gt;
        </button>
        <HeartRateDisplay
          heartRate={heartRate}
          heartRateColor={heartRateColor}
          alertType={alertType}
        />
      </div>

      {/* 诊断工具 - 只在连接失败时显示 */}
      {showDiagnostics && <StreamDiagnostics streamUrl={streamUrl} />}
    </>
  )
}

export default VideoFeed
