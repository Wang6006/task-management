const express = require("express");
const router = express.Router();

const userController = require('../controllers/users.controller');
const { methodNotAllowed } = require('../controllers/errors.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { searchLimiter } = require('../middlewares/rate-limit.middleware');

router
  .route('/')
  .get(authenticateToken, userController.getAllUsers)
  .all(methodNotAllowed);

router
  .route('/search')
  .get(searchLimiter, userController.searchUsersOrTasks)
  .all(methodNotAllowed);

router
  .route('/:id')
  .get(authenticateToken, userController.getUserById)
  .put(authenticateToken, userController.updateUser)
  .all(methodNotAllowed);

module.exports = router;
