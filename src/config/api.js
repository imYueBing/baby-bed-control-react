// API配置文件
const API_BASE_URL = 'http://192.168.0.92:5000'

export const API_ENDPOINTS = {
  // 视频流
  VIDEO_STREAM: `${API_BASE_URL}/api/video/stream`,

  // 床控制
  BED_UP: `${API_BASE_URL}/api/bed/up`,
  BED_DOWN: `${API_BASE_URL}/api/bed/down`

  // 其他API端点可以在这里添加
}

export default API_BASE_URL
