const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;

    res.status(statusCode);

    const response = {
        success: false,
        message: err.message,
    };

    // Include stack trace only in development
    if (process.env.NODE_ENV !== 'production') {
        response.stack = err.stack;
    }

    res.json(response);
};

module.exports = {
    errorHandler,
};
