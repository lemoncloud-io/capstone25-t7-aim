import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Dashboard from '../components//project/Dashboard';
import Settings from '../components/project/Settings';
import FileDetails from '../components/project/FileDetails';
import BuildLogs from '../components/project/BuildLogs';
import { ProjectResponse } from '@shared/types';
import { fetchProject, deleteProject } from '../apis/projectApi';

type PageType = 'dashboard' | 'apikeys' | 'file' | 'buildlogs';

interface NavItem {
    id: PageType;
    label: string;
    icon?: string;
}

const NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'apikeys', label: 'Settings' },
    { id: 'file', label: 'FileDetails' },
    { id: 'buildlogs', label: 'BuildLogs' },
];

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

const getStatusText = (status: 'analyzing' | 'deploying' | 'completed' | 'failed'): string => {
    switch (status) {
        case 'analyzing':
            return '분석 중';
        case 'deploying':
            return '배포 중';
        case 'completed':
            return '완료됨';
        case 'failed':
            return '실패';
        default:
            return status;
    }
};

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [page, setPage] = useState<PageType>('dashboard');
    const [project, setProject] = useState<ProjectResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProjectData = async () => {
            if (id) {
                try {
                    const transformedProject = await fetchProject(id);
                    setProject(transformedProject);
                } catch (error) {
                    console.error('프로젝트 데이터를 가져올 수 없습니다.');
                    alert('프로젝트 데이터를 가져올 수 없습니다.');
                    navigate('/project');
                } finally {
                    setLoading(false);
                }
            }
        };

        loadProjectData();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!project) return;

        if (window.confirm(`"${project.name}" 프로젝트를 정말 삭제하시겠습니까?`)) {
            try {
                await deleteProject(project.id);
                console.log('프로젝트 삭제 완료:', project.name);
                alert('프로젝트가 삭제되었습니다.');
                navigate('/project');
            } catch (error) {
                console.error('프로젝트 삭제 실패:', error);
                alert('프로젝트 삭제 중 오류가 발생했습니다.');
            }
        }
    };

    const PAGE_COMPONENTS: Record<PageType, React.ReactNode> = {
        dashboard: <Dashboard project={project} />,
        apikeys: <Settings project={project} />,
        file: <FileDetails project={project} />,
        buildlogs: <BuildLogs project={project} />,
    };

    if (loading) {
        return (
            <div className="pt-10 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">프로젝트 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="pt-10 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <svg
                        className="w-16 h-16 text-gray-300 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p className="text-gray-600 text-lg mb-4">프로젝트를 찾을 수 없습니다.</p>
                    <button
                        onClick={() => navigate('/project')}
                        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                    >
                        프로젝트 목록으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-6 max-w-6xl mx-auto">
            {/* 프로젝트 헤더 */}
            <div className="bg-white p-8 mb-6 rounded-lg shadow-md">
                <div className="flex mb-6 justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-bold">{project.name}</h1>
                        <span
                            className={`px-3 py-1 text-xs font-medium rounded ${
                                project.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : project.status === 'deploying'
                                      ? 'bg-blue-100 text-blue-700'
                                      : project.status === 'analyzing'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-red-100 text-red-700'
                            }`}
                        >
                            {getStatusText(project.status)}
                        </span>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 rounded text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                    >
                        삭제
                    </button>
                </div>
                <div className="border-b border-gray-300 mb-6"></div>

                {/* 프로젝트 정보 */}
                <div className="space-y-3 text-md">
                    {project.description && (
                        <div className="flex items-start gap-2 text-gray-600">
                            <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <div>
                                <span className="font-semibold">설명:</span>
                                <p className="mt-1 text-sm">{project.description}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                        </svg>
                        <span className="font-semibold">버전 </span>
                        <span>{project.version || '1.0.0'}</span>
                    </div>

                    {project.tags && project.tags.length > 0 && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                            </svg>
                            <span className="font-semibold">태그:</span>
                            <div className="flex gap-1 flex-wrap">
                                {project.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                            />
                        </svg>
                        <span className="font-semibold">배포된 URL</span>
                        {project.latestDeployment?.status === 'SUCCESS' && project.latestDeployment.frontendUrl ? (
                            <a
                                href={project.latestDeployment.frontendUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline ml-2"
                            >
                                {project.latestDeployment.frontendUrl}
                            </a>
                        ) : (
                            <span className="text-gray-500 ml-2">배포 완료 후 표시됩니다</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="font-semibold">최근 배포일 :</span>
                        <span>{formatDate(project.updatedAt)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <span className="font-semibold">생성일 :</span>
                        <span>{formatDate(project.createdAt)}</span>
                    </div>

                    {project.originalFileName && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <span className="font-semibold">파일명 :</span>
                            <span className="truncate">{project.originalFileName}</span>
                            {project.fileSize && (
                                <span className="text-sm text-gray-500">
                                    ({(project.fileSize / 1024 / 1024).toFixed(2)} MB)
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 네비게이션 탭 */}
            <div className="flex gap-2 border-b border-gray-200">
                {NAV_ITEMS.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setPage(item.id)}
                        className={`px-4 py-3 font-medium transition-colors rounded-t-lg ${
                            page === item.id
                                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* 페이지 콘텐츠 */}
            <div className="pb-32">{PAGE_COMPONENTS[page]}</div>
        </div>
    );
}
