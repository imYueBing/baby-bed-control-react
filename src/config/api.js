// API configuration file
const API_BASE_URL = 'http://192.168.0.92:5000'

export const API_ENDPOINTS = {
  // Video stream
  VIDEO_STREAM: `${API_BASE_URL}/api/video/stream`,

  // Bed control
  BED_UP: `${API_BASE_URL}/api/bed/up`,
  BED_DOWN: `${API_BASE_URL}/api/bed/down`

  // Other API endpoints can be added here
}

export default API_BASE_URL
