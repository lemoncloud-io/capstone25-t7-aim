import { useNavigate } from 'react-router-dom';
import { ProjectResponse } from '@shared/types';

interface StatCard {
    icon: string;
    title: string;
    value: string | number;
    change: string;
    changeColor: 'green' | 'red';
}

interface SystemStat {
    label: string;
    value: string;
}

interface DashboardProps {
    project: ProjectResponse | null;
}

const Dashboard = ({ project }: DashboardProps): JSX.Element => {
    const navigate = useNavigate();

    // 시스템 전체 통계 데이터 (프로젝트와 무관)
    const getStatCards = () => {
        return [
            {
                icon: '📊',
                title: 'API 호출 수',
                value: '1,234',
                change: '+12%',
                changeColor: 'green' as 'green' | 'red',
            },
            {
                icon: '⚡',
                title: '평균 응답 시간',
                value: '245ms',
                change: '-5%',
                changeColor: 'green' as 'green' | 'red',
            },
            {
                icon: '🚨',
                title: '에러율',
                value: '0.1%',
                change: '-0.05%',
                changeColor: 'green' as 'green' | 'red',
            },
            {
                icon: '👥',
                title: '활성 사용자',
                value: '89',
                change: '+8',
                changeColor: 'green' as 'green' | 'red',
            },
        ];
    };

    const getSystemStats = () => {
        if (!project) return [];

        const deployment = project.latestDeployment;

        return [
            { label: '프로젝트명', value: project.name },
            { label: '프로젝트 생성', value: new Date(project.createdAt).toLocaleDateString('ko-KR') },
            { label: '파일 업로드', value: new Date(project.uploadedAt).toLocaleDateString('ko-KR') },
            { label: '마지막 업데이트', value: new Date(project.updatedAt).toLocaleDateString('ko-KR') },
            { label: '배포 시작', value: deployment ? new Date(deployment.startedAt).toLocaleString('ko-KR') : '없음' },
            {
                label: '배포 완료',
                value: deployment?.completedAt ? new Date(deployment.completedAt).toLocaleString('ko-KR') : '진행중',
            },
            { label: '프론트엔드 URL', value: deployment?.frontendUrl || '없음' },
            { label: '백엔드 URL', value: deployment?.backendUrl || '없음' },
        ];
    };

    const statCards = getStatCards();
    const systemStats = getSystemStats();

    const handleViewDeploymentStatus = () => {
        if (project?.latestDeployment) {
            navigate(`/deploy/${project.latestDeployment.id}`);
        }
    };

    return (
        <div className="rounded-md shadow-md bg-white p-8">
            <div className="w-full mx-auto">
                {/* 헤더 */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Realtime-Monitoring</h1>
                        <p className="text-gray-600">배포된 AI Agent의 성능 및 상태 지표</p>
                    </div>

                    {/* Deployment Pipeline Status 버튼 */}
                    {project?.latestDeployment && project.latestDeployment.status !== 'PENDING' && (
                        <button
                            onClick={handleViewDeploymentStatus}
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:shadow-xl transition-all duration-200 hover:scale-105"
                        >
                            Deployment Pipeline Status
                        </button>
                    )}
                </div>

                {/* 통계 카드 그리드 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statCards.map((card: StatCard, index: number) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            {/* 아이콘 */}
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4 text-2xl">
                                {card.icon}
                            </div>

                            {/* 제목 */}
                            <h3 className="text-sm font-medium text-gray-600 mb-2">{card.title}</h3>

                            {/* 값과 변화 */}
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-bold text-gray-900">{card.value}</span>
                                <span
                                    className={`text-sm font-semibold ${
                                        card.changeColor === 'green' ? 'text-green-500' : 'text-red-400'
                                    }`}
                                >
                                    {card.change}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 시스템 상태 섹션 */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">시스템 상태</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {systemStats.map((stat: SystemStat, index: number) => (
                            <div
                                key={`stat-${index}`}
                                className={stat.label === '프론트엔드 URL' ? 'col-span-full' : ''}
                            >
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                                </div>

                                {stat.label === '프론트엔드 URL' && <div className="h-4" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
