const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');
const Joi = require('joi');

router.use(authenticate, authorize('admin'));

const paginationSchema = Joi.object({
  status: Joi.string().optional(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
});

router.get('/orders', validate(paginationSchema, 'query'), AdminController.getOrders);
router.get('/drivers', AdminController.getDrivers);

const assignSchema = Joi.object({
  driverId: Joi.string().uuid().required(),
});
const idParamSchema = Joi.object({ id: Joi.string().uuid().required() });

router.put('/orders/:id/assign', validate(idParamSchema, 'params'), validate(assignSchema), AdminController.assignDriver);
router.get('/stats', AdminController.getStats);
router.get('/forecast', AdminController.getForecast);
router.get('/drivers/:id/profile', AdminController.getDriverProfile);
router.put('/drivers/:id/profile', AdminController.updateDriverProfile);

module.exports = router;
