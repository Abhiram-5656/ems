// cat > backend/src/middleware/auditLogMiddleware.js << 'EOF'
import AuditLog from '../models/AuditLog.js';

export const auditLog = async (req, res, next) => {
  // Capture original json method
  const originalJson = res.json;

  res.json = function (body) {
    if (req.user && req.method !== 'GET') {
      const logEntry = {
        user: req.user._id,
        action: `${req.method} ${req.path}`,
        module: req.path.split('/')[2] || 'general',
        details: {
          method: req.method,
          path: req.path,
          body: req.body,
          statusCode: res.statusCode,
        },
        ipAddress: req.ip,
      };

      AuditLog.create(logEntry).catch((err) => {
        console.error('Error creating audit log:', err);
      });
    }

    return originalJson.call(this, body);
  };

  next();
};
// EOF