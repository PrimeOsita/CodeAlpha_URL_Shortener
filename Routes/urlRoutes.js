const express = require('express');
const {
  shortenUrl,
  listUrls,
  getUrlStats,
  deleteUrl
} = require('../controllers/urlController.js');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: URLs
 *   description: Create and manage shortened URLs
 */

/**
 * @swagger
 * /api/shorten:
 *   post:
 *     summary: Create a short URL
 *     description: Works with or without auth. If a valid JWT is sent, the URL is linked to your account.
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url:
 *                 type: string
 *                 example: https://example.com/some/very/long/path
 *               customCode:
 *                 type: string
 *                 example: my-link
 *     responses:
 *       201:
 *         description: Short URL created
 *       400:
 *         description: Invalid URL or custom code
 *       409:
 *         description: Custom code already taken
 */
router.post('/shorten', optionalAuth, shortenUrl);

/**
 * @swagger
 * /api/urls:
 *   get:
 *     summary: List your short URLs (admins see all)
 *     tags: [URLs]
 *     responses:
 *       200:
 *         description: List of short URLs
 *       401:
 *         description: Not authenticated
 */
router.get('/urls', requireAuth, listUrls);

/**
 * @swagger
 * /api/urls/{code}:
 *   get:
 *     summary: Get stats for a short URL
 *     tags: [URLs]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: URL details
 *       404:
 *         description: Not found
 *   delete:
 *     summary: Delete a short URL (owner or admin only)
 *     tags: [URLs]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted
 *       403:
 *         description: Not allowed
 *       404:
 *         description: Not found
 */
router.get('/urls/:code', getUrlStats);
router.delete('/urls/:code', requireAuth, deleteUrl);

module.exports = router;