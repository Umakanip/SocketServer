import { Router } from 'express';
import getUserList from '../controllers/userController';

const router = Router();

router.get('/users', getUserList);

export default router;
