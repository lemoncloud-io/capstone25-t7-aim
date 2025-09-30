export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

export interface HelloResponse {
  greeting: string
  timestamp: string
}
