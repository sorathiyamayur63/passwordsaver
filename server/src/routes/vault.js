import express from 'express';
import { requireAuth } from '../middleware/authenticate.js';
import { verifyOwnership } from '../middleware/verifyOwnership.js';
import { apiLimiter, vaultLimiter } from '../middleware/rateLimiter.js';
import { validateCreateVaultItem, validateUpdateVaultItem } from '../middleware/validateVaultItem.js';
import { VaultItem } from '../models/index.js';
import * as vaultController from '../controllers/vaultController.js';

const router = express.Router();

// Strict Authentication on everything in this router
router.use(requireAuth);

// Queries (API Limiter)
router.get('/', apiLimiter, vaultController.getVaultItems);
router.get('/recent', apiLimiter, vaultController.getRecentItems);
router.get('/trash', apiLimiter, vaultController.getTrashItems);
router.get('/:uuid', apiLimiter, verifyOwnership(VaultItem), vaultController.getVaultItem);

// Mutations (Stricter Vault Limiter to prevent brute force flooding)
router.post('/', vaultLimiter, validateCreateVaultItem, vaultController.createVaultItem);
router.post('/bulk-update', vaultLimiter, vaultController.bulkUpdateVaultItems);
router.post('/trash/empty', vaultLimiter, vaultController.emptyTrash);

router.put('/:uuid', vaultLimiter, verifyOwnership(VaultItem), validateUpdateVaultItem, vaultController.updateVaultItem);
router.delete('/:uuid', vaultLimiter, verifyOwnership(VaultItem), vaultController.deleteVaultItem);

// Trash operations explicitly pass allowDeleted: true to verifyOwnership
router.delete('/:uuid/permanent', vaultLimiter, verifyOwnership(VaultItem, 'uuid', { allowDeleted: true }), vaultController.permanentDeleteVaultItem);
router.post('/:uuid/restore', vaultLimiter, verifyOwnership(VaultItem, 'uuid', { allowDeleted: true }), vaultController.restoreVaultItem);

// Actions
router.post('/:uuid/favorite', vaultLimiter, verifyOwnership(VaultItem), vaultController.toggleFavorite);
router.post('/:uuid/duplicate', vaultLimiter, verifyOwnership(VaultItem), vaultController.duplicateVaultItem);

export default router;