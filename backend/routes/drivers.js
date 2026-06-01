const express = require('express');
const router = express.Router();
const DriverController = require('../controllers/driverController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');
const Joi = require('joi');
const multer = require('multer');

// Setup multer for proof photos
const upload = multer({ dest: 'uploads/' });

const statusSchema = Joi.object({
  isOnline: Joi.boolean().optional(),
  isAvailable: Joi.boolean().optional(),
}).or('isOnline', 'isAvailable');

const locationSchema = Joi.object({
  lat: Joi.number().required(),
  lng: Joi.number().required(),
});

const idParamSchema = Joi.object({ id: Joi.string().uuid().required() });

// All driver routes require auth and driver role
router.use(authenticate, authorize('driver'));

router.get('/me/orders', DriverController.getMyOrders);
router.put('/me/status', validate(statusSchema), DriverController.updateStatus);
router.put('/me/location', validate(locationSchema), DriverController.updateLocation);

router.put('/orders/:id/accept', validate(idParamSchema, 'params'), DriverController.acceptOrder);
router.put('/orders/:id/pickup', validate(idParamSchema, 'params'), DriverController.pickupOrder);
router.put('/orders/:id/deliver', validate(idParamSchema, 'params'), upload.single('proofPhoto'), DriverController.deliverOrder);
router.put('/orders/:id/reject', validate(idParamSchema, 'params'), DriverController.rejectOrder);

module.exports = router;
