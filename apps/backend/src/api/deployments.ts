import { Router } from 'express';
import { Deployment } from '../models/deployment.model';
import { Service } from '../models/service.model';
import { Log } from '../models/log.model';

const router = Router();

router.get('/deployments/:deploymentId', async (req, res) => {
    const { deploymentId } = req.params;

    try {
        const deployment = await Deployment.findById(deploymentId);
        if (!deployment) {
            return res.status(404).json({ message: 'Deployment not found' });
        }

        console.log('API - Raw deployment from DB:', deployment);
        console.log('API - Deployment currentStep:', deployment.currentStep);
        console.log('API - Deployment toObject():', deployment.toObject());

        const services = await Service.find({ deploymentId });
        const logs = await Log.find({ deploymentId }).sort({ timestamp: 1 });

        res.json({
            deployment: {
                ...deployment.toObject(),
                projectId: deployment.projectId,
            },
            services,
            logs,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error getting deployment status' });
    }
});

export default router;
