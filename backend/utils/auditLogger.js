const AuditLog = require('../models/AuditLog');

const logAction = async ({ req, user, action, targetModel, targetId, details }) => {
  try {
    const actor = user || (req && req.user);
    const ipAddress = req ? req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress : '';

    await AuditLog.create({
      user: actor ? actor._id : null,
      userName: actor ? actor.name : 'System',
      userRole: actor ? actor.role : 'system',
      action,
      targetModel: targetModel || '',
      targetId: targetId ? String(targetId) : '',
      details,
      ipAddress,
    });
  } catch (error) {
    console.error('[AuditLog Error]:', error.message);
  }
};

module.exports = { logAction };
