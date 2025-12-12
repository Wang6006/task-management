const ApiError = require('../api-error');
const JSend = require('../jsend');

// 405 - Method not allowed
function methodNotAllowed(req, res, next) {
    if (req.route) {
        const methods = Object.keys(req.route.methods)
            .filter((method) => method !== '_all')
            .map((method) => method.toUpperCase());

        return next(
            new ApiError(405, 'Method Not Allowed', {
                Allow: methods.join(', ')
            })
        );
    }
    return next();
}

// 404 - Resource not found
function resourceNotFound(req, res, next) {
    return next(new ApiError(404, 'Resource not found'));
}

// Tổng quát - lỗi cuối cùng
function handleError(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    return res
        .status(statusCode)
        .set(error.headers || {})
        .json(
            statusCode === 500
                ? JSend.error(message)
                : JSend.fail(message)
        );
}

module.exports = {
    methodNotAllowed,
    resourceNotFound,
    handleError
};
