// Route guard foundation for the RBAC work in the admin phase.
export function requireRole(...allowedRoles) {
  return (request, response, next) => {
    if (!request.user || !allowedRoles.includes(request.user.role)) {
      return response.status(403).json({ error: 'You do not have access to this resource.' });
    }
    return next();
  };
}
