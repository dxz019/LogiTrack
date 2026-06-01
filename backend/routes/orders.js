const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');
const Joi = require('joi');

// Validation schemas
const orderCreateSchema = Joi.object({
  pickupAddress: Joi.string().required(),
  deliveryAddress: Joi.string().required(),
  packageDescription: Joi.string().optional(),
  priority: Joi.string().valid('normal', 'express', 'urgent').default('normal'),
  notes: Joi.string().optional(),
});

// @route   POST /api/orders
// @desc    Create an order
// @access  Private (customer)
router.post('/', auth, role('customer'), validate(orderCreateSchema), orderController.createOrder);

// @route   GET /api/orders
// @desc    Get all orders for the current user (customer) or all orders (admin)
// @access  Private
router.get('/', auth, orderController.getOrders);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, orderController.getOrderById);

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private (customer or admin)
router.put('/:id/cancel', auth, orderController.cancelOrder);

module.exports = router;