import { Router } from 'express';
import { deploymentRepository } from '../repositories/deployment.repository';

const router = Router();

router.get('/deployments/:deploymentId', async (req, res) => {
    const { deploymentId } = req.params;
    const result = await deploymentRepository.getDeploymentById(deploymentId);
    res.json(result);
});

router.get('/deployments/:deploymentId/status', async (req, res) => {
    const { deploymentId } = req.params;
    const result = await deploymentRepository.getDeploymentStatusById(deploymentId);
    res.json(result);
});

export default router;
