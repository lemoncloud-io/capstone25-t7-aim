/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_APP_TITLE: string
    readonly VITE_APP_VERSION: string
    readonly VITE_ENABLE_DEBUG?: string
    // 추가 환경변수가 필요한 경우 여기에 추가
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
