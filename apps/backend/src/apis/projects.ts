import { Router } from 'express';
import { uploadToS3 } from '../services/uploadService';
import { addDeploymentJob } from '../services/queueService';
import { projectRepository } from '../repositories/project.repository';
import { AimException, ErrorCode } from '@shared/errors';

const router = Router();

router.get('/projects', async (req, res) => {
    const projects = await projectRepository.getAllProjects();
    res.json(projects);
});

router.get('/projects/:id', async (req, res) => {
    const project = await projectRepository.getProjectById(req.params.id);
    res.json(project);
});

router.delete('/projects/:id', async (req, res) => {
    await projectRepository.deleteProjectById(req.params.id);
    res.status(204).send();
});

router.post('/projects', async (req, res) => {
    const { fileName, projectName, fileData } = req.body;

    if (!fileName || !projectName || !fileData) {
        throw new AimException(ErrorCode.INVALID_INPUT);
    }

    // 1. Upload file to S3 directly
    const { key } = await uploadToS3(fileData, fileName);

    // 2. Save project to database using repository
    const projectId = await projectRepository.createProject({
        name: projectName,
        description: '',
        version: '1.0.0',
        tags: [],
        zipFileUrl: key,
        originalFileName: fileName,
        fileSize: Buffer.from(fileData, 'base64').length,
    });

    // 3. Add deployment job to queue
    const deploymentId = await addDeploymentJob({
        projectId,
        s3Key: key,
    });

    res.status(201).json({
        projectId,
        deploymentId,
        message: 'Project created and deployment started successfully',
    });
});

export default router;
