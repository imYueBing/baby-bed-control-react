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

  const sendBedControlRequest = async direction => {
    const endpoint = `/api/arduino/bed/${direction}`
    console.log(`⬆️ 发送请求到: ${endpoint}`)
    try {
      const response = await fetch(endpoint, {
        method: 'POST', // 或者 'GET'，根据您的API设计
        headers: {
          'Content-Type': 'application/json'
          // 如果需要，可以添加其他头部信息，例如认证token
        }
        // 如果是POST请求并且需要发送数据，可以添加body:
        // body: JSON.stringify({ /* 您的数据 */ })
      })

      if (!response.ok) {
        // 处理HTTP错误状态 (例如 4xx, 5xx)
        const errorData = await response.json().catch(() => ({})) // 尝试解析错误JSON，失败则返回空对象
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
      const data = await response.json().catch(() => ({})) // 尝试解析成功JSON，失败则返回空对象
      console.log('✅ 请求成功:', data)
      // 根据API的响应执行操作，例如显示成功消息
      // alert(`成功: 床铺已向 ${direction === 'up' ? '上' : '下'} 移动。`);
    } catch (error) {
      // 处理网络错误或其他fetch API本身的错误
      console.error('❌ 网络或Fetch API错误:', error)
      alert('网络错误: 无法连接到服务器控制床铺。')
    }
  }

  const handleLeftArrowClick = () => {
    console.log('⬅️ 左箭头点击 (床铺向上)')
    sendBedControlRequest('up')
  }

  const handleRightArrowClick = () => {
    console.log('➡️ 右箭头点击 (床铺向下)')
    sendBedControlRequest('down')
  }

  return (
    <>
      <div className='image-container'>
        <button
          className='arrow-button left-arrow'
          onClick={handleLeftArrowClick}
          title='床铺向上'
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
          title='床铺向下'
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
