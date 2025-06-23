// backend/src/config/constants.js
module.exports = {
  ROLES: {
    ADMIN: "admin",
    USER: "user"
  },
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: true,
    sameSite: "Strict"
  },
  TENANT_HEADER: "x-tenant-id", // para identificar el tenant desde frontend
  DEFAULT_TENANT: "public"
};
