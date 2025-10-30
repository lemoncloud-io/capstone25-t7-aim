import DeploymentPipeline from '../components/deployment/DeploymentPipeline';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Project, Deployment } from '../types';
import { fetchDeployment } from '../services/deployment/deploymentApi';
import { fetchProject } from '../services/project/projectApi';

export default function DeployPage() {
    const navigate = useNavigate();
    const { deploymentId } = useParams<{ deploymentId: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [deployment, setDeployment] = useState<Deployment | null>(null);
    const [logs, setLogs] = useState<{ message: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjectData = async () => {
            if (deploymentId) {
                try {
                    const { deployment: deploymentData, logs: logsData } = await fetchDeployment(deploymentId);
                    console.log('Deployment:', deploymentData);
                    console.log('Project ID:', deploymentData.projectId);
                    console.log('Project ID type:', typeof deploymentData.projectId);
                    const projectData = await fetchProject(deploymentData.projectId);
                    setProject(projectData);
                    setDeployment(deploymentData);
                    setLogs(logsData);
                    // Update localStorage for consistency
                    localStorage.setItem('currentProjectId', deploymentData.projectId);
                } catch (error) {
                    console.error('Failed to fetch deployment or project:', error);
                }
            }
            setLoading(false);
        };

        fetchProjectData();
    }, [deploymentId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center w-full pt-10">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">프로젝트 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center w-full pt-10">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">프로젝트를 찾을 수 없습니다.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full pt-10">
            <div className="relative w-full max-w-7xl mx-auto px-10 mb-4">
                <div className="text-center font-semibold text-3xl">Deployment Pipeline Status</div>
            </div>

            <div className="w-full">
                <DeploymentPipeline projectId={project.id} initialDeployment={deployment} initialLogs={logs} />
            </div>
        </div>
    );
}
