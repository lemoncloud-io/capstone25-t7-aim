import { useState, useEffect } from 'react';
import { Project } from '../../types';
import { BuildSettings } from '@shared/types';
import { fetchProject } from '../../services/project/projectApi';

interface SettingsProps {
    project: Project | null;
}

export default function Settings({ project }: SettingsProps): JSX.Element {
    const [buildSettings, setBuildSettings] = useState<BuildSettings>({
        buildCommand: 'npm run build',
        outputDirectory: 'dist',
        installCommand: 'npm install',
        runtime: 'nodejs20.x',
        memory: '1024',
        timeout: '30',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // 프로젝트 설정 로드
    useEffect(() => {
        if (!project?.id) {
            setIsLoading(false);
            return;
        }

        const loadProjectSettings = async () => {
            setIsLoading(true);

            try {
                // 백엔드에서 프로젝트 정보 가져오기
                const projectData = await fetchProject(project.id);

                // 백엔드에서 가져온 buildSettings로 초기화
                if (projectData.buildSettings) {
                    setBuildSettings({
                        buildCommand: projectData.buildSettings.buildCommand || 'npm run build',
                        outputDirectory: projectData.buildSettings.outputDirectory || 'dist',
                        installCommand: projectData.buildSettings.installCommand || 'npm install',
                        runtime: projectData.buildSettings.runtime || 'nodejs20.x',
                        memory: projectData.buildSettings.memory || '1024',
                        timeout: projectData.buildSettings.timeout || '30',
                    });
                }

                // localStorage에서 사용자 커스터마이징 설정 불러오기 (백엔드 데이터를 덮어씀)
                const savedSettings = localStorage.getItem(`project-settings-${project.id}`);
                if (savedSettings) {
                    try {
                        const parsed = JSON.parse(savedSettings);
                        console.log('저장된 설정 불러오기:', parsed);

                        if (parsed.buildSettings) {
                            setBuildSettings(parsed.buildSettings);
                        }
                    } catch (error) {
                        console.error('설정 로드 실패:', error);
                    }
                }
            } catch (error) {
                console.error('프로젝트 정보 로드 실패:', error);

                // 백엔드 로드 실패 시 localStorage에서만 불러오기
                const savedSettings = localStorage.getItem(`project-settings-${project.id}`);
                if (savedSettings) {
                    try {
                        const parsed = JSON.parse(savedSettings);
                        if (parsed.buildSettings) {
                            setBuildSettings(parsed.buildSettings);
                        }
                    } catch (error) {
                        console.error('설정 로드 실패:', error);
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadProjectSettings();
    }, [project?.id]);

    const handleBuildSettingChange = (field: keyof BuildSettings, value: string): void => {
        setBuildSettings((prev: BuildSettings) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSaveSettings = async (): Promise<void> => {
        if (!project?.id) {
            alert('프로젝트 정보가 없습니다.');
            return;
        }

        setIsSaving(true);
        setSaveMessage('');

        try {
            // localStorage에 설정 저장
            const settings = {
                buildSettings,
                updatedAt: new Date().toISOString(),
            };

            localStorage.setItem(`project-settings-${project.id}`, JSON.stringify(settings));

            console.log('설정 저장 완료:', settings);

            // 성공 메시지
            setSaveMessage('설정이 저장되었습니다. ✅');

            // 메시지 자동 삭제
            setTimeout(() => {
                setSaveMessage('');
            }, 3000);
        } catch (error) {
            console.error('설정 저장 실패:', error);
            setSaveMessage('설정 저장에 실패했습니다. ❌');

            setTimeout(() => {
                setSaveMessage('');
            }, 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const runtimeOptions = [
        { value: 'nodejs20.x', label: 'Node.js 20.x' },
        { value: 'nodejs18.x', label: 'Node.js 18.x' },
        { value: 'nodejs16.x', label: 'Node.js 16.x' },
        { value: 'python3.12', label: 'Python 3.12' },
        { value: 'python3.11', label: 'Python 3.11' },
    ];

    const memoryOptions = ['128', '256', '512', '1024', '2048', '3008'];
    const timeoutOptions = ['10', '30', '60', '120', '300', '900'];

    if (!project) {
        return (
            <div className="bg-white p-8 rounded-lg">
                <div className="text-center py-12 text-gray-500">
                    <p>프로젝트 정보를 불러올 수 없습니다.</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="bg-white p-8 rounded-lg">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                    <span className="ml-3 text-gray-600">설정을 불러오는 중...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="w-full">
                <div className="mb-8">
                    <p className="text-gray-600">빌드 옵션과 Lambda 런타임을 설정하세요.</p>
                </div>

                {/* 빌드 & 런타임 섹션 */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-8">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold mb-1">빌드 설정</h2>
                        <p className="text-sm text-gray-600">프로젝트 빌드 명령어와 출력 디렉토리를 설정하세요</p>
                    </div>

                    <div className="space-y-4">
                        {/* 빌드 명령어 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">빌드 명령어</label>
                            <input
                                type="text"
                                value={buildSettings.buildCommand}
                                onChange={e => handleBuildSettingChange('buildCommand', e.target.value)}
                                placeholder="npm run build"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:outline-none focus:border-cyan-400 bg-white"
                            />
                            <p className="text-xs text-gray-500 mt-1">예: npm run build, yarn build</p>
                        </div>

                        {/* 출력 디렉토리 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">출력 디렉토리</label>
                            <input
                                type="text"
                                value={buildSettings.outputDirectory}
                                onChange={e => handleBuildSettingChange('outputDirectory', e.target.value)}
                                placeholder="dist"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:outline-none focus:border-cyan-400 bg-white"
                            />
                            <p className="text-xs text-gray-500 mt-1">예: dist, build, out</p>
                        </div>

                        {/* 설치 명령어 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">설치 명령어</label>
                            <input
                                type="text"
                                value={buildSettings.installCommand}
                                onChange={e => handleBuildSettingChange('installCommand', e.target.value)}
                                placeholder="npm install"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:outline-none focus:border-cyan-400 bg-white"
                            />
                            <p className="text-xs text-gray-500 mt-1">예: npm install, yarn, pnpm install</p>
                        </div>
                    </div>
                </div>

                {/* Lambda 런타임 섹션 */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-8">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold mb-1">Lambda 런타임 설정</h2>
                        <p className="text-sm text-gray-600">AWS Lambda 함수의 런타임 환경을 설정하세요</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 런타임 버전 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">런타임</label>
                            <select
                                value={buildSettings.runtime}
                                onChange={e => handleBuildSettingChange('runtime', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:outline-none focus:border-cyan-400 bg-white"
                            >
                                {runtimeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 메모리 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">메모리 (MB)</label>
                            <select
                                value={buildSettings.memory}
                                onChange={e => handleBuildSettingChange('memory', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:outline-none focus:border-cyan-400 bg-white"
                            >
                                {memoryOptions.map(option => (
                                    <option key={option} value={option}>
                                        {option} MB
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 타임아웃 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">타임아웃 (초)</label>
                            <select
                                value={buildSettings.timeout}
                                onChange={e => handleBuildSettingChange('timeout', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:outline-none focus:border-cyan-400 bg-white"
                            >
                                {timeoutOptions.map(option => (
                                    <option key={option} value={option}>
                                        {option}초
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* 저장 버튼 */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        className={`px-8 py-3 rounded-lg font-semibold text-white transition-all ${
                            isSaving
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 shadow-lg hover:shadow-xl'
                        }`}
                    >
                        {isSaving ? (
                            <span className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                저장 중...
                            </span>
                        ) : (
                            '설정 저장'
                        )}
                    </button>

                    {saveMessage && (
                        <div
                            className={`px-4 py-2 rounded-lg font-medium ${
                                saveMessage.includes('✅')
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-red-100 text-red-700 border border-red-200'
                            }`}
                        >
                            {saveMessage}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
