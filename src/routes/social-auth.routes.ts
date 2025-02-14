import express, { Router } from 'express';
import {
  getGoogleAuthURL,
  googleCallback,
  getFacebookAuthURL,
  facebookCallback,
  getMicrosoftAuthURL,
  microsoftCallback,
} from '../controllers/social-auth';

const router: Router = express.Router();

/**
 * @swagger
 * /api/social-auth/google/url:
 *   get:
 *     summary: Get Google OAuth URL
 *     tags: [Social Auth]
 *     responses:
 *       200:
 *         description: Google OAuth URL
 */
router.get('/google/url', getGoogleAuthURL);

/**
 * @swagger
 * /api/social-auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Social Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to frontend with tokens
 */
router.get('/google/callback', googleCallback);

// Facebook routes
/**
 * @swagger
 * /api/social-auth/facebook/url:
 *   get:
 *     summary: Get Facebook OAuth URL
 *     tags: [Social Auth]
 *     responses:
 *       200:
 *         description: Facebook OAuth URL
 */
router.get('/facebook/url', getFacebookAuthURL);

/**
 * @swagger
 * /api/social-auth/facebook/callback:
 *   get:
 *     summary: Facebook OAuth callback
 *     tags: [Social Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to frontend with tokens
 */
router.get('/facebook/callback', facebookCallback);

// Microsoft routes
/**
 * @swagger
 * /api/social-auth/microsoft/url:
 *   get:
 *     summary: Get Microsoft OAuth URL
 *     tags: [Social Auth]
 *     responses:
 *       200:
 *         description: Microsoft OAuth URL
 */
router.get('/microsoft/url', getMicrosoftAuthURL);

/**
 * @swagger
 * /api/social-auth/microsoft/callback:
 *   get:
 *     summary: Microsoft OAuth callback
 *     tags: [Social Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to frontend with tokens
 */
router.get('/microsoft/callback', microsoftCallback);

export default router;
