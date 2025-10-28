// response.js
const response = (req, res, next) => {

  // 200 OK
  res.ok = (data = {}, message = 'OK', meta = {}) => {
    res.status(200).json({ success: true, message, data, meta });
  };

  // 201 Created
  res.created = (data = {}, message = 'Created', meta = {}) => {
    res.status(201).json({ success: true, message, data, meta });
  };

  // 400 Bad Request
  res.badRequest = (message = 'Bad Request', errors = []) => {
    res.status(400).json({ success: false, message, errors });
  };

  // 401 Unauthorized
  res.unauthorized = (message = 'Unauthorized') => {
    res.status(401).json({ success: false, message });
  };

  // 403 Forbidden
  res.forbidden = (message = 'Forbidden') => {
    res.status(403).json({ success: false, message });
  };

  // 404 Not Found
  res.notFound = (message = 'Not Found') => {
    res.status(404).json({ success: false, message });
  };

  // 500 Internal Server Error
  res.serverError = (message = 'Internal Server Error', errors = []) => {
    res.status(500).json({ success: false, message, errors });
  };

  next();
};

export default response