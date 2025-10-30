import FileUpload from '../components/deployment/FileUpload';

function UploadPage() {
    return (
        <div className="flex flex-col w-full items-center justify-center px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold pt-8">Deploy Micro-Service AI Agent By Serverless</h1>
            </div>

            <div className="w-full min-w-7xl space-y-6">
                <FileUpload />
            </div>
        </div>
    );
}

export default UploadPage;
