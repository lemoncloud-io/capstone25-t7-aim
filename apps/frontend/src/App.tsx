import { useState } from 'react';
import type { ApiResponse, HelloResponse } from '@shared/types';

function App() {
    const [response, setResponse] = useState<ApiResponse<HelloResponse> | null>(null);
    const [loading, setLoading] = useState(false);

    // 환경변수 사용 예제
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'AIM Capstone Project';
    const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
    const NODE_ENV = import.meta.env.MODE || 'development';

    const fetchHello = async () => {
        console.log(API_URL, APP_TITLE, APP_VERSION, NODE_ENV);
        setLoading(true);
        try {
            console.log(`🌐 [${NODE_ENV}] API 호출: ${API_URL}/api/hello`);
            const res = await fetch(`${API_URL}/api/hello`);
            const data: ApiResponse<HelloResponse> = await res.json();
            setResponse(data);
        } catch (error) {
            console.error('API 호출 실패:', error);
            setResponse({
                success: false,
                message: 'API 호출에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="card">
                <h1>🎯 {APP_TITLE}</h1>
                <p>
                    <strong>버전:</strong> {APP_VERSION} | <strong>환경:</strong> {NODE_ENV}
                </p>
                <p>모노레포 예제입니다. Frontend (React), Backend (Express), Shared함께 동작합니다.</p>
            </div>

            <div className="card">
                <h2>Hello World API 테스트</h2>
                <button className="button" onClick={fetchHello} disabled={loading}>
                    {loading ? '로딩 중...' : 'Hello World 가져오기'}
                </button>

                {response && (
                    <div className="response">
                        <h3>API 응답:</h3>
                        <p>
                            <strong>성공:</strong> {response.success ? '✅' : '❌'}
                        </p>
                        {response.data && (
                            <>
                                <p>
                                    <strong>메시지:</strong> {response.data.greeting}
                                </p>
                                <p>
                                    <strong>시간:</strong> {new Date(response.data.timestamp).toLocaleString('ko-KR')}
                                </p>
                            </>
                        )}
                        {response.message && (
                            <p>
                                <strong>response:</strong> {response.message}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
