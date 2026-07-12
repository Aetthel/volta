/**
 * A wrapper function that catches any rejected promises from asynchronous Express route handlers
 * and forwards them to the next middleware (the global error handler) automatically.
 *
 * @param {Function} fn - The asynchronous Express handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
