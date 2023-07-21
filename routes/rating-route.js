const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/rating-controller');

router.get('/', ratingController.getAll);
router.post('/', ratingController.addOrUpdate);

module.exports = router;
