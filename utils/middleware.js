// middleware.js
const { decryptData } = require("./crypto");

function decryptMiddleware(req, res, next) {
  try {
    if (req.body.payload) {
      req.body = decryptData(req.body.payload);
    }
    next();
  } catch (err) {
    console.error("Decryption failed:", err.message);
    return res.status(400).json({ message: "Invalid encrypted payload" });
  }
}
const { encryptData } = require("./crypto");

function responseEncryptionMiddleware(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = function (data) {
    const encrypted = encryptData(data);
    return originalJson({ payload: encrypted });
  };

  next();
}

module.exports = {responseEncryptionMiddleware, decryptMiddleware};
