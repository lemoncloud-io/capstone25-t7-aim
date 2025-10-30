import { Project } from '../../types';

interface BuildLogsProps {
    project: Project | null;
}

export default function BuildLogs({ project }: BuildLogsProps) {
    if (!project) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                    <svg
                        className="w-16 h-16 mx-auto mb-4 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <p className="text-lg font-semibold">프로젝트를 선택해주세요</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 빌드 로그 헤더 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Build Logs</h2>
                <div className="flex flex-row justify-between">
                    <p className="text-gray-600 ">
                        프로젝트 "{project.name}"의 빌드 및 배포 로그를 확인할 수 있습니다.
                    </p>
                    {/* 배포 상태 표시 */}
                    <div className="flex items-center space-x-2 ">
                        <div
                            className={`w-3 h-3 rounded-full ${
                                project.status === 'completed'
                                    ? 'bg-green-500'
                                    : project.status === 'failed'
                                      ? 'bg-red-500'
                                      : project.status === 'deploying'
                                        ? 'bg-blue-500'
                                        : 'bg-yellow-500'
                            }`}
                        />
                        <span className="text-gray-900 font-medium">
                            {project.status === 'completed'
                                ? '배포 완료'
                                : project.status === 'failed'
                                  ? '배포 실패'
                                  : project.status === 'deploying'
                                    ? '배포 중'
                                    : '분석 중'}
                        </span>
                    </div>
                </div>
            </div>

            {/* 로그 표시 영역 - 퍼블리싱 상태 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Realtime Logs</h3>
                </div>

                {/* 로그 콘솔 스타일 영역 */}
                <div className="bg-black rounded-lg p-4 font-mono text-sm text-green-400 h-96 overflow-y-auto">
                    <div className="space-y-1">
                        <div>$ npm install</div>
                        <div className="text-gray-400">✓ 패키지 설치 완료 (2.3s)</div>
                        <div>$ npm run build</div>
                        <div className="text-gray-400">✓ 빌드 완료 (5.7s)</div>
                        <div>$ 배포 시작...</div>
                        <div className="text-gray-400">✓ 파일 처리 완료</div>
                        <div className="text-gray-400">✓ Lambda 함수 생성</div>
                        <div className="text-gray-400">✓ API Gateway 설정</div>
                        <div className="text-blue-400">✓ 배포 성공! (총 12.4s)</div>
                        <div className="text-yellow-400">ℹ 프론트엔드 URL: https://example.app</div>
                        <div className="text-yellow-400">ℹ 백엔드 URL: https://api.example.app</div>
                    </div>
                </div>

                <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                    <span>마지막 업데이트: {new Date().toLocaleString('ko-KR')}</span>
                    <button className="text-blue-600 hover:text-blue-800 underline">로그 새로고침</button>
                </div>
            </div>

            {/* 추가 기능 미리보기 */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">추가 기능 (개발 예정)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded border border-dashed border-gray-300">
                        <h4 className="font-medium text-gray-700 mb-2">📋 상세 로그 필터링</h4>
                        <p className="text-sm text-gray-500">오류, 경고, 정보 로그별 필터링</p>
                    </div>
                    <div className="bg-white p-4 rounded border border-dashed border-gray-300">
                        <h4 className="font-medium text-gray-700 mb-2">📊 로그 통계</h4>
                        <p className="text-sm text-gray-500">로그량, 오류율, 성능 지표 분석</p>
                    </div>
                    <div className="bg-white p-4 rounded border border-dashed border-gray-300">
                        <h4 className="font-medium text-gray-700 mb-2">🔍 로그 검색</h4>
                        <p className="text-sm text-gray-500">키워드 기반 로그 검색 기능</p>
                    </div>
                    <div className="bg-white p-4 rounded border border-dashed border-gray-300">
                        <h4 className="font-medium text-gray-700 mb-2">📤 로그 내보내기</h4>
                        <p className="text-sm text-gray-500">로그 파일 다운로드 및 공유</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
