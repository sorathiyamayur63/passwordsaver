import express from 'express';
import { requireAuth } from '../middleware/authenticate.js';
import { verifyOwnership } from '../middleware/verifyOwnership.js';
import { apiLimiter, vaultLimiter } from '../middleware/rateLimiter.js';
import { Group } from '../models/index.js';
import * as groupController from '../controllers/groupController.js';
import * as personController from '../controllers/personController.js';

const router = express.Router();
router.use(requireAuth);

// Group CRUD
router.get('/', apiLimiter, groupController.getGroups);
router.post('/', vaultLimiter, groupController.createGroup);
router.put('/reorder', vaultLimiter, groupController.reorderGroups);
router.put('/:uuid', vaultLimiter, verifyOwnership(Group), groupController.updateGroup);
router.delete('/:uuid', vaultLimiter, verifyOwnership(Group), groupController.deleteGroup);

// People CRUD (nested under group)
router.get('/:groupUuid/people', apiLimiter, personController.getPersons);
router.post('/:groupUuid/people', vaultLimiter, personController.createPerson);
router.put('/:groupUuid/people/reorder', vaultLimiter, personController.reorderPersons);
router.get('/:groupUuid/people/:uuid', apiLimiter, personController.getPerson);
router.put('/:groupUuid/people/:uuid', vaultLimiter, personController.updatePerson);
router.delete('/:groupUuid/people/:uuid', vaultLimiter, personController.deletePerson);
router.post('/:groupUuid/people/:uuid/favorite', vaultLimiter, personController.toggleFavoritePerson);

export default router;
