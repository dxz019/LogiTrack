const express = require('express');
const router = express.Router();
const TrackingController = require('../controllers/trackingController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const Joi = require('joi');

const idParamSchema = Joi.object({ orderId: Joi.string().uuid().required() });

router.get('/:orderId/history', authenticate, validate(idParamSchema, 'params'), TrackingController.getTrackingHistory);

module.exports = router;
