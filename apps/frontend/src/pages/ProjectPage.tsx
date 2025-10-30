import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from '../components/project/ProjectCard';

// 1. 라우트 경로를 상수로 관리하여 오타를 방지하고 유지보수성을 높입니다.
const ROUTES = {
    HOME: '/',
    // NEW_PROJECT: "/projects/new" // 예시: 새 프로젝트 경로 추가
};

export default function ProjectPage() {
    const navigate = useNavigate();

    // 2. useCallback을 사용하여 함수를 메모이제이션합니다.
    // 이 컴포넌트가 리렌더링 되어도 navigate가 바뀌지 않는 한 함수가 재생성되지 않아 성능에 이점이 있습니다.
    const handleNewProjectClick = useCallback(() => {
        navigate(ROUTES.HOME);
    }, [navigate]);

    return (
        // 3. 시맨틱 태그(<header>, <main>)를 사용하여 코드의 구조를 명확하게 합니다.
        <div className="container mx-auto max-w-6xl pt-10 text-center mb-32">
            <header className="mb-4 flex flex-row items-center justify-between">
                {/* 4. 시맨틱 HTML을 위해 div 대신 h1 태그를 사용합니다. (SEO 및 웹 접근성 개선) */}
                <h1 className="text-4xl font-bold">Projects</h1>
                <button
                    onClick={handleNewProjectClick}
                    // 5. 가독성을 위해 Tailwind CSS 클래스 순서를 조정하고, hover 효과를 추가하여 UX를 개선합니다.
                    className="rounded-md shadow-md border bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-cyan-500/80"
                >
                    New Project
                </button>
            </header>

            <main>
                {/* 추후 여러 프로젝트 목록을 표시할 것을 대비해 <ProjectList /> 같은 컴포넌트로 감싸면 좋습니다. */}
                <ProjectCard />
            </main>
        </div>
    );
}
