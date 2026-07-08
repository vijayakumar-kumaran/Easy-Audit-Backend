const requireLogin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  next();
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }
    const { usertype } = req.session.user;
    if (!allowedRoles.includes(usertype)) {
      return res.status(403).json({ error: 'Unauthorized access for your role.' });
    }
    next();
  };
};

module.exports = { requireLogin, requireRole };
