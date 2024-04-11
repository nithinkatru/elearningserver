const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    res.status(500).send({
      success: false,
      message: err.message || 'An unexpected error occurred on the server.'
    });
  };
  
  module.exports = errorHandler;
  