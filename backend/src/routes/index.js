const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const publicoRoutes = require('./publico.routes');
const profesionalRoutes = require('./profesional.routes');
const adminRoutes = require('./admin.routes');

router.use('/auth', authRoutes);
router.use('/publico', publicoRoutes);
router.use('/profesional', profesionalRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
