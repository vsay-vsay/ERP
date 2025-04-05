// middleware/roleMiddleware.js
module.exports = function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
      const userRole = req.user?.role; // Assuming authMiddleware sets req.user
  
      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: "Access denied. Unauthorized role." });
      }
  
      next();
    };
  };
  