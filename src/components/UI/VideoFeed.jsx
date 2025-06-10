import React, { useState } from 'react'
// import HeartRateMonitor from './HeartRateMonitor'
import HeartRateDisplay from './HeartRateDisplay'
import SimpleMjpegStream from './SimpleMjpegStream'
import StreamDiagnostics from './StreamDiagnostics'
import { API_ENDPOINTS } from '../../config/api'
import './VideoFeed.css'
import './MobileOptimizations.css'

const VideoFeed = () => {
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

  const sendBedControlRequest = async controlType => {
    // 使用相对路径，让Vite代理处理CORS
    const endpoint = `/api/bed/${controlType}`
    console.log(`⬆️ 发送床铺控制请求: ${endpoint}`)
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        // 处理HTTP错误状态
        const errorData = await response.json().catch(() => ({}))
        console.error(
          `❌ 请求失败 ${response.status}: ${response.statusText}`,
          errorData
        )
        alert(
          `错误: 未能控制床铺 (${response.status} - ${
            errorData.message || response.statusText
          })`
        )
        return
      }

      // 请求成功
      const data = await response.json().catch(() => ({}))
      console.log('✅ 请求成功:', data)
    } catch (error) {
      console.error('❌ 网络或Fetch API错误:', error)
      alert('网络错误: 无法连接到服务器控制床铺。')
    }
  }

  // 定义四个控制函数
  const handleLeftUpClick = () => {
    console.log('⬆️ 左上按钮点击 (左侧床铺向上)')
    sendBedControlRequest('left_up')
  }

  const handleLeftDownClick = () => {
    console.log('⬇️ 左下按钮点击 (左侧床铺向下)')
    sendBedControlRequest('left_down')
  }

  const handleRightUpClick = () => {
    console.log('⬆️ 右上按钮点击 (右侧床铺向上)')
    sendBedControlRequest('right_up')
  }

  const handleRightDownClick = () => {
    console.log('⬇️ 右下按钮点击 (右侧床铺向下)')
    sendBedControlRequest('right_down')
  }

  return (
    <>
      <div className='image-container'>
        {/* 左侧控制按钮 */}
        <div className='bed-controls left-controls'>
          <button
            className='arrow-button up-arrow'
            onClick={handleLeftUpClick}
            title='左侧床铺向上'
          >
            ↑
          </button>
          <button
            className='arrow-button down-arrow'
            onClick={handleLeftDownClick}
            title='左侧床铺向下'
          >
            ↓
          </button>
        </div>

        {/* 视频流 */}
        <SimpleMjpegStream
          streamUrl={API_ENDPOINTS.VIDEO_STREAM}
          fallbackSrc='/assets/baby.png'
          className='baby-image'
          onStreamLoad={handleStreamLoad}
          onStreamError={handleStreamError}
        />

        {/* 右侧控制按钮 */}
        <div className='bed-controls right-controls'>
          <button
            className='arrow-button up-arrow'
            onClick={handleRightUpClick}
            title='右侧床铺向上'
          >
            ↑
          </button>
          <button
            className='arrow-button down-arrow'
            onClick={handleRightDownClick}
            title='右侧床铺向下'
          >
            ↓
          </button>
        </div>

        {/* 心率显示组件 */}
        <HeartRateDisplay />
      </div>

      {/* 诊断工具 - 只在连接失败时显示 */}
      {showDiagnostics && (
        <StreamDiagnostics streamUrl={API_ENDPOINTS.VIDEO_STREAM} />
      )}
    </>
  )
}

export default VideoFeed
