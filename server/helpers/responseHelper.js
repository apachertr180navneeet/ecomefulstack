/**
 * Send a standardized API response
 * @param {object} res - Express response object
 * @param {boolean} success - true for success, false for failure
 * @param {string} message - Message to send
 * @param {object} [data] - Optional data object
 * @param {number} [statusCode] - HTTP status code (default: 200 for success, 400 for failure)
 */
const sendResponse = (res, success, message, data = null, statusCode = null) => {
  const code = statusCode || (success ? 200 : 400);
  const response = { success, message };
  if (data !== null) response.data = data;
  return res.status(code).json(response);
};

module.exports = { sendResponse }; 