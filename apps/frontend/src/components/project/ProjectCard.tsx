import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ProjectResponse } from '@shared/types';
import { fetchProjects, deleteProject } from '../../apis/projectApi';

export function ProjectCard() {
    const [projects, setProjects] = useState<ProjectResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // API에서 프로젝트 목록 불러오기
    useEffect(() => {
        const loadProjects = async () => {
            try {
                const transformedProjects = await fetchProjects();
                setProjects(transformedProjects);
            } catch (error) {
                console.error('프로젝트 데이터 로드 실패:', error);
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };

        loadProjects();
    }, []);

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>, projectId: string): Promise<void> => {
        e.preventDefault();
        e.stopPropagation();

        if (window.confirm('정말 이 프로젝트를 삭제하시겠습니까?')) {
            try {
                await deleteProject(projectId);
                setProjects(projects.filter(project => project.id !== projectId));
            } catch (error) {
                console.error('Failed to delete project');
            }
        }
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'completed':
                return 'bg-green-500';
            case 'failed':
                return 'bg-red-500';
            case 'deploying':
                return 'bg-blue-500';
            case 'analyzing':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusBadgeColor = (status: string): string => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-700';
            case 'failed':
                return 'bg-red-100 text-red-700';
            case 'deploying':
                return 'bg-blue-100 text-blue-700';
            case 'analyzing':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-gray-200 text-gray-700';
        }
    };

    const getStatusText = (status: string): string => {
        switch (status) {
            case 'completed':
                return '완료됨';
            case 'failed':
                return '실패';
            case 'deploying':
                return '배포 중';
            case 'analyzing':
                return '분석 중';
            default:
                return status;
        }
    };

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

    if (loading) {
        return (
            <div className="col-span-2 text-center py-12 text-gray-500 bg-white rounded-lg border shadow-sm">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                    <p>프로젝트를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl grid grid-cols-2 gap-6">
            {projects.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-gray-500 bg-white rounded-lg border shadow-sm">
                    <div className="flex flex-col items-center gap-4">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                        </svg>
                        <div>
                            <p className="text-lg font-semibold">배포된 프로젝트가 없습니다</p>
                            <p className="text-sm mt-2">새로운 프로젝트를 배포해보세요!</p>
                        </div>
                    </div>
                </div>
            ) : (
                projects.map(project => (
                    <Link
                        key={project.id}
                        to={`/project/${project.id}`}
                        state={{ project }}
                        className="p-6 shadow-md rounded-lg border hover:shadow-lg transition-all bg-white hover:border-cyan-200"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`} />
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-row gap-4 items-center">
                                        <h4 className="mb-1 font-semibold text-2xl">{project.name}</h4>
                                        <span
                                            className={`px-2 h-fit text-xs rounded font-medium ${getStatusBadgeColor(project.status)}`}
                                        >
                                            {getStatusText(project.status)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={e => handleDelete(e, project.id)}
                                    className="p-2 rounded hover:bg-red-50 hover:text-red-600 text-sm transition-colors font-medium"
                                >
                                    삭제
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <span>
                                    최근 배포일 :{' '}
                                    {project.latestDeployment?.status === 'SUCCESS' &&
                                    project.latestDeployment?.completedAt
                                        ? formatDate(project.latestDeployment.completedAt)
                                        : ' '}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                <span className="truncate">{project.originalFileName}</span>
                            </div>

                            {/* 배포 완료된 경우 URL 표시 */}
                            {project.latestDeployment?.status === 'SUCCESS' && project.latestDeployment.frontendUrl && (
                                <div className="flex items-center gap-2 text-sm">
                                    <svg
                                        className="w-4 h-4 text-blue-500"
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
                                    <div className="text-gray-600">배포된 URL:</div>
                                    <a
                                        href={project.latestDeployment.frontendUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 underline truncate ml-1"
                                    >
                                        {project.latestDeployment.frontendUrl}
                                    </a>
                                </div>
                            )}
                        </div>
                    </Link>
                ))
            )}
        </div>
    );
}
