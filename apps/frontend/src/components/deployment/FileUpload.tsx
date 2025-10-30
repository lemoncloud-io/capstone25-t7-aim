import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { createProject, fetchProject } from '../../services/project/projectApi';

interface FileUploadProps {}

function FileUpload({}: FileUploadProps) {
    const [selected, setSelected] = useState<'git' | 'zip'>('zip');
    const [file, setFile] = useState<File | null>(null);
    const [fileList, setFileList] = useState<string[]>([]);
    const [projectName, setProjectName] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [validationError, setValidationError] = useState<string>('');
    const navigate = useNavigate();

    // ZIP 파일이 유효한 프로젝트인지 검증
    const validateProjectStructure = (fileNames: string[]): { valid: boolean; error: string } => {
        // node_modules 제외한 실제 파일들만
        const actualFiles = fileNames.filter(name => !name.includes('node_modules/') && !name.includes('__MACOSX'));

        // 필수 파일 체크
        const hasPackageJson = actualFiles.some(name => name.endsWith('package.json'));
        const hasIndexHtml = actualFiles.some(
            name => name.endsWith('index.html') || name.includes('public/index.html'),
        );
        const hasSrcFolder = actualFiles.some(name => name.includes('src/'));
        const hasJsFiles = actualFiles.some(name => /\.(js|jsx|ts|tsx)$/.test(name));

        // React/Vue/Angular 등 프론트엔드 프로젝트 판별
        if (!hasPackageJson && !hasIndexHtml) {
            return {
                valid: false,
                error: '유효한 프로젝트가 아닙니다. package.json 또는 index.html 파일이 필요합니다.',
            };
        }

        if (!hasSrcFolder && !hasJsFiles) {
            return {
                valid: false,
                error: '소스 코드가 없습니다. src 폴더 또는 JavaScript/TypeScript 파일이 필요합니다.',
            };
        }

        // 최소 파일 개수 체크 (빈 프로젝트 방지)
        if (actualFiles.length < 3) {
            return {
                valid: false,
                error: '프로젝트 파일이 너무 적습니다. 유효한 프로젝트인지 확인해주세요.',
            };
        }

        return { valid: true, error: '' };
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // 파일 크기 체크 (800MB)
            const maxSize = 800 * 1024 * 1024;
            if (selectedFile.size > maxSize) {
                alert('파일 크기는 800MB를 초과할 수 없습니다.');
                return;
            }

            setFile(selectedFile);
            setValidationError('');

            try {
                // ZIP 내부 파일 목록 읽기
                const zip = new JSZip();
                const data = await zip.loadAsync(selectedFile);
                const names = Object.keys(data.files);
                setFileList(names);

                // 프로젝트 구조 검증
                const validation = validateProjectStructure(names);
                if (!validation.valid) {
                    setValidationError(validation.error);
                    setFile(null);
                    setFileList([]);
                    alert(validation.error);
                }
            } catch (error) {
                console.error('ZIP 파일 읽기 오류:', error);
                alert('ZIP 파일을 읽을 수 없습니다. 올바른 ZIP 파일인지 확인해주세요.');
                setFile(null);
                setFileList([]);
            }
        }
    };

    // 파일 삭제 기능
    const handleFileRemove = () => {
        setFile(null);
        setFileList([]);
        setValidationError('');
        // input 초기화
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleUpload = async () => {
        // 검증: 프로젝트 이름과 파일 모두 필수
        if (!projectName.trim()) {
            alert('프로젝트 이름을 입력해주세요.');
            return;
        }

        if (selected === 'zip' && !file) {
            alert('ZIP 파일을 선택해주세요.');
            return;
        }

        if (validationError) {
            alert('유효한 프로젝트 파일을 업로드해주세요.');
            return;
        }

        setLoading(true);
        setUploadProgress(0);

        try {
            if (!file) {
                return;
            }

            // 1. Convert file to Base64
            setUploadProgress(10);
            const base64Data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    // Remove data URL prefix (data:application/zip;base64,)
                    const base64 = result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsDataURL(file);
            });

            setUploadProgress(30);

            // 2. Upload file data to backend as JSON
            const { projectId } = await createProject(file.name, projectName.trim(), base64Data);

            console.log('✅ Upload successful');

            setUploadProgress(80);
            setUploadProgress(100);

            // Fetch latest deployment ID from project data
            const projectData = await fetchProject(projectId);
            const latestDeploymentId = projectData?.latestDeployment?.id;

            if (!latestDeploymentId) {
                throw new Error('Failed to fetch latest deployment ID.');
            }

            // Navigate to DeployPage with latest deployment ID
            navigate(`/deploy/${latestDeploymentId}`, {
                state: { projectId, latestDeploymentId },
            });
        } catch (error) {
            console.error('❌ Deployment error:', error);
            alert(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    // 배포 버튼 활성화 여부
    const isUploadDisabled = !projectName.trim() || (selected === 'zip' && !file) || loading || !!validationError;

    return (
        <div className="space-y-8 max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            {/* ZIP / Git 카드 선택 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ZIP 카드 */}
                <div
                    className={`rounded-lg border p-6 shadow-sm cursor-pointer transition-all duration-200 ${
                        selected === 'zip'
                            ? 'ring-2 ring-[#2BCBE8CC] shadow-lg bg-[#d7f6fcd0]'
                            : 'hover:shadow-lg hover:border-[#2BCBE8CC]'
                    }`}
                    onClick={() => setSelected('zip')}
                >
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                            />
                        </svg>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">ZIP File</h3>
                    <p className="text-sm text-gray-600">Upload your project</p>
                </div>

                {/* Git 카드 (비활성용) */}
                <div className={`rounded-lg border p-6 shadow-sm cursor-not-allowed opacity-50`}>
                    <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                        </svg>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Git Repository</h3>
                    <p className="text-sm text-gray-600">Coming Soon...</p>
                </div>
            </div>

            {/* 프로젝트 이름 입력 */}
            <div>
                <div className="py-2">
                    Project Name <span className="text-red-500">*</span> ( Project name will be URL Address )
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <input
                        type="text"
                        className="border w-full py-3 px-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2BCBE8CC]"
                        placeholder="Enter your project name"
                        value={projectName}
                        onChange={e => setProjectName(e.target.value)}
                        disabled={loading}
                    />
                    <div className="border px-2 py-3 rounded-md">.app</div>
                </div>
            </div>

            {/* ZIP 업로드 영역 */}
            <div
                className={`border-2 border-dashed rounded-lg p-6 py-12 text-center transition-all cursor-pointer ${
                    validationError
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 hover:border-[#2BCBE8CC] hover:bg-gray-50'
                }`}
                onClick={() => !loading && document.getElementById('fileInput')?.click()}
            >
                <div className="flex flex-col items-center justify-center space-y-3">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-12 w-12 ${validationError ? 'text-red-400' : 'text-gray-400'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>

                    {file ? (
                        <div className="w-full">
                            <div className="flex flex-col items-center justify-center gap-3">
                                <p className="text-sm text-gray-700 font-medium">
                                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleFileRemove();
                                    }}
                                    className="text-red-500 text-sm flex flex-row gap-2 items-center border-2 border-red-300 font-semibold px-2 hover:text-red-700 hover:bg-red-100 rounded-md py-1 transition-colors"
                                    disabled={loading}
                                >
                                    <div>Delete</div>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                            {validationError && (
                                <p className="mt-2 text-sm text-red-600 font-medium">⚠️ {validationError}</p>
                            )}
                        </div>
                    ) : (
                        <>
                            <p className="text-base font-medium text-gray-900">Drop your ZIP file here</p>
                            <p className="text-sm text-gray-500">or click to browse files (max 800MB)</p>
                            <p className="text-xs text-gray-400 mt-2">
                                ✓ package.json 또는 index.html 필수
                                <br />✓ 소스 코드 폴더 필수 (src/)
                            </p>
                        </>
                    )}
                </div>

                <input
                    id="fileInput"
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={loading}
                />
            </div>

            {/* 파일 구조 표시 */}
            {fileList.length > 0 && !validationError && (
                <div className="border rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto text-left">
                    <p className="font-semibold mb-2">📁 ZIP 내부 파일 구조 ({fileList.length}개 파일):</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                        {fileList.slice(0, 20).map(name => (
                            <li key={name} className="truncate">
                                - {name}
                            </li>
                        ))}
                        {fileList.length > 20 && (
                            <li className="text-gray-500 italic">... 외 {fileList.length - 20}개 파일</li>
                        )}
                    </ul>
                </div>
            )}

            {/* 배포 버튼 */}
            <button
                onClick={handleUpload}
                disabled={isUploadDisabled}
                className={`mt-4 w-full py-3 font-semibold rounded-lg transition-colors ${
                    isUploadDisabled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#2BCBE8CC] text-white hover:bg-[#1ba8c4]'
                }`}
            >
                {loading ? `배포 중... ${uploadProgress}%` : 'Start Deployment'}
            </button>
        </div>
    );
}

export default FileUpload;
