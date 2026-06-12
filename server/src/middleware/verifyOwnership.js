export const verifyOwnership = (Model, uuidParam = 'uuid', options = { allowDeleted: false }) => {
  return async (req, res, next) => {
    try {
      const uuid = req.params[uuidParam];
      
      // Strict UUID v4 format validation to prevent injection or malformed queries
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(uuid)) {
        return res.status(400).json({ success: false, message: 'Invalid resource ID format' });
      }

      // MUST ALWAYS filter by userId to ensure ownership
      const resource = await Model.findOne({ uuid, userId: req.userId });

      // Return generic 404 whether it genuinely doesn't exist or belongs to someone else
      if (!resource) {
        return res.status(404).json({ success: false, message: 'Resource not found' });
      }

      // Check soft-delete status unless specifically bypassed (e.g., for trash operations)
      if (resource.isDeleted && !options.allowDeleted) {
        return res.status(410).json({ success: false, message: 'Resource has been deleted' });
      }

      // Attach securely verified resource to request
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};
