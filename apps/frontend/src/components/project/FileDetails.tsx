import { Project } from '../../types';

interface FileDetailsProps {
    project: Project | null;
}

export default function FileDetails({ project }: FileDetailsProps) {
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

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '알 수 없음';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            {/* 파일 정보 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">파일 정보</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">파일명</label>
                        <div className="flex items-center space-x-2">
                            <svg
                                className="w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <span className="text-gray-900 font-medium">
                                {project.originalFileName || '알 수 없음'}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">파일 크기</label>
                        <div className="flex items-center space-x-2">
                            <svg
                                className="w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2m4 0H8l.5 16h7L16 4z"
                                />
                            </svg>
                            <span className="text-gray-900 font-medium">{formatFileSize(project.fileSize)}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">업로드 일시</label>
                        <div className="flex items-center space-x-2">
                            <svg
                                className="w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <span className="text-gray-900 font-medium">
                                {formatDateTime(project.uploadedAt.toISOString())}
                            </span>
                        </div>
                    </div>{' '}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">프로젝트 상태</label>
                        <div className="flex items-center space-x-2">
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
                            <span className="text-gray-900 font-medium">{project.status}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 배포 정보 */}
            {project.latestDeployment && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">배포 정보</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">배포 상태</label>
                            <div className="flex items-center space-x-2">
                                <div
                                    className={`w-3 h-3 rounded-full ${
                                        project.latestDeployment.status === 'SUCCESS'
                                            ? 'bg-green-500'
                                            : project.latestDeployment.status === 'FAILED'
                                              ? 'bg-red-500'
                                              : project.latestDeployment.status === 'IN_PROGRESS'
                                                ? 'bg-blue-500'
                                                : 'bg-yellow-500'
                                    }`}
                                />
                                <span className="text-gray-900 font-medium">
                                    {project.latestDeployment.status === 'SUCCESS'
                                        ? '성공'
                                        : project.latestDeployment.status === 'FAILED'
                                          ? '실패'
                                          : project.latestDeployment.status === 'IN_PROGRESS'
                                            ? '진행중'
                                            : '대기중'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">배포 시작</label>
                            <div className="flex items-center space-x-2">
                                <svg
                                    className="w-5 h-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span className="text-gray-900 font-medium">
                                    {formatDateTime(project.latestDeployment.startedAt.toISOString())}
                                </span>
                            </div>
                        </div>

                        {project.latestDeployment.completedAt && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">배포 완료</label>
                                <div className="flex items-center space-x-2">
                                    <svg
                                        className="w-5 h-5 text-green-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span className="text-gray-900 font-medium">
                                        {formatDateTime(project.latestDeployment.completedAt!.toISOString())}
                                    </span>
                                </div>
                            </div>
                        )}

                        {project.latestDeployment.frontendUrl && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">프론트엔드 URL</label>
                                <div className="flex items-center space-x-2">
                                    <svg
                                        className="w-5 h-5 text-blue-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                        />
                                    </svg>
                                    <a
                                        href={project.latestDeployment.frontendUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 underline truncate"
                                    >
                                        {project.latestDeployment.frontendUrl}
                                    </a>
                                </div>
                            </div>
                        )}

                        {project.latestDeployment.backendUrl && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">백엔드 URL</label>
                                <div className="flex items-center space-x-2">
                                    <svg
                                        className="w-5 h-5 text-purple-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                                        />
                                    </svg>
                                    <a
                                        href={project.latestDeployment.backendUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-600 hover:text-purple-800 underline truncate"
                                    >
                                        {project.latestDeployment.backendUrl}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 퍼블리싱 상태 */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">추가 기능 (개발 예정)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded border border-dashed border-gray-300">
                        <h3 className="font-medium text-gray-700 mb-2">📊 성능 모니터링</h3>
                        <p className="text-sm text-gray-500">실시간 성능 지표 및 모니터링 대시보드</p>
                    </div>
                    <div className="bg-white p-4 rounded border border-dashed border-gray-300">
                        <h3 className="font-medium text-gray-700 mb-2">🔍 로그 분석</h3>
                        <p className="text-sm text-gray-500">상세한 애플리케이션 로그 및 오류 분석</p>
                    </div>
                    <div className="bg-white p-4 rounded border border-dashed border-gray-300">
                        <h3 className="font-medium text-gray-700 mb-2">📈 사용량 통계</h3>
                        <p className="text-sm text-gray-500">API 호출량, 트래픽, 리소스 사용량 분석</p>
                    </div>
                    <div className="bg-white p-4 rounded border border-dashed border-gray-300">
                        <h3 className="font-medium text-gray-700 mb-2">🔧 설정 관리</h3>
                        <p className="text-sm text-gray-500">고급 설정 및 환경 구성 관리</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
