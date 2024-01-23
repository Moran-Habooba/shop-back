function checkAdminPermission(req, res, next) {
  if (!req.user.isAdmin) {
    return res
      .status(403)
      .send("Permission denied. Only admins can perform this action.");
  }
  next();
}

module.exports = checkAdminPermission;
