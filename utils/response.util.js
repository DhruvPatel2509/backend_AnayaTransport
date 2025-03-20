// utils/responseUtil.js

/**
 * Sends a standardized JSON response.
 * @param {object} res - The Express response object.
 * @param {number} statusCode - The HTTP status code.
 * @param {object} data - The data to send in the response.
 * @param {string} message - The message to include in the response.
 */
const sendResponse = (res, statusCode, data = null, message = "") => {
  const response = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
  };

  res.status(statusCode).json(response);
};

export default sendResponse;
