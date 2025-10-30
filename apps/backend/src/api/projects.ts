import { Router } from 'express';
import { uploadToS3 } from '../services/uploadService';
import { Project } from '../models/project.model';
import { Deployment } from '../models/deployment.model';
import { addDeploymentJob } from '../services/queueService';

const router = Router();

router.get('/projects', async (req, res) => {
    try {
        const projects = await Project.find().sort({ uploadedAt: -1 });

        // 각 프로젝트의 최신 배포 상태를 가져옴
        const projectsWithDeployment = await Promise.all(
            projects.map(async project => {
                const latestDeployment = await Deployment.findOne({ projectId: project._id })
                    .sort({ startedAt: -1 })
                    .select('_id status frontendUrl backendUrl startedAt completedAt');

                return {
                    ...project.toObject(),
                    latestDeployment: latestDeployment?.toObject() || null,
                };
            }),
        );

        res.json(projectsWithDeployment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching projects' });
    }
});

router.get('/projects/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // 최신 배포 상태를 가져옴
        const latestDeployment = await Deployment.findOne({ projectId: project._id })
            .sort({ startedAt: -1 })
            .select('_id status frontendUrl backendUrl startedAt completedAt');

        const projectWithDeployment = {
            ...project.toObject(),
            latestDeployment: latestDeployment || null,
        };

        res.json(projectWithDeployment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching project' });
    }
});

router.delete('/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Project.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting project' });
    }
});

router.post('/projects', async (req, res) => {
    const { fileName, projectName, fileData } = req.body;

    if (!fileName || !projectName || !fileData) {
        return res.status(400).json({
            message: 'fileName, projectName, and fileData are required',
        });
    }

    try {
        // 1. Upload file to S3 directly
        const { key } = await uploadToS3(fileData, fileName);

        // 2. Save project to database
        const project = new Project({
            name: projectName,
            description: '',
            version: '1.0.0',
            tags: [],
            zipFileUrl: key,
            originalFileName: fileName,
            fileSize: Buffer.from(fileData, 'base64').length,
        });
        await project.save();

        // 3. Add deployment job to queue
        const deploymentId = await addDeploymentJob({
            projectId: project._id as string,
            s3Key: key,
        });

        res.status(201).json({
            projectId: project._id,
            deploymentId,
            message: 'Project created and deployment started successfully',
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Error creating project' });
    }
});

export default router;
