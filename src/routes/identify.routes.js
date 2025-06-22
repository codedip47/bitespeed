import express from 'express'
import { identifyController } from '../controllers/identify.controllers.js';

const router = express.Router();

router.route('/').post(identifyController);

export default router;