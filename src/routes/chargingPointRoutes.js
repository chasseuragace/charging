const express = require('express');
const ChargingPointController = require('../controllers/chargingPointController');

const router = express.Router();
const chargingPointController = new ChargingPointController();
router.get('/filtered', chargingPointController.getFilteredChargingPoints.bind(chargingPointController));
router.get('/groupedFilter', chargingPointController.listVendorsGroupChargingPoints.bind(chargingPointController));
router.get('/filters', chargingPointController.getFilters.bind(chargingPointController));
// New routes for booking history
router.get('/user/:userId/booking-history', chargingPointController.getUserBookingHistory.bind(chargingPointController));
router.get('/entity/:entityId/booking-history', chargingPointController.getEntityBookingHistory.bind(chargingPointController));
router.get('/vendor/:vendorId/booking-history', chargingPointController.getVendorsBookingHistory.bind(chargingPointController));
router.get('/unit/:id/status', chargingPointController.getBookingStatusOfUnit.bind(chargingPointController));
// New routes for creating and updating bookings
router.post('/booking', chargingPointController.createBooking.bind(chargingPointController));
router.patch('/booking/:id/status', chargingPointController.updateBookingStatus.bind(chargingPointController));

// Route for registering a new charging point
router.post('/multiple', chargingPointController.registerMultiChargingPoint.bind(chargingPointController));
router.post('/', chargingPointController.registerChargingPoint.bind(chargingPointController));
// Route for updating an existing charging point
router.put('/:id', chargingPointController.updateChargingPoint.bind(chargingPointController));
// Route for listing all charging points
router.get('/', chargingPointController.listChargingPoints.bind(chargingPointController));
// Route for getting a charging point by ID
router.get('/list/:id', chargingPointController.getChargingPoint.bind(chargingPointController));
// Route for deleting a charging point
router.delete('/:id', chargingPointController.deleteChargingPoint.bind(chargingPointController));




module.exports = router;
