import express from 'express';
import { submitContact } from '../controllers/contactController.js';

const router = express.Router();

// Handle contact form submission
router.post('/', submitContact);

export default router;
