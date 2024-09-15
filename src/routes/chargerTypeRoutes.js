const express = require('express');
const ChargerTypeController = require('../controllers/chargerTypeController');

const router = express.Router();
const chargerTypeController = new ChargerTypeController();
// Route for listing filtered charger types
router.get('/filtered', chargerTypeController.listFilteredChargerTypes.bind(chargerTypeController));

// Route for creating a new charger type
router.post('/', chargerTypeController.createChargerType.bind(chargerTypeController));

// Route for updating an existing charger type
router.put('/:id', chargerTypeController.updateChargerType.bind(chargerTypeController));

// Route for listing all charger types
router.get('/', chargerTypeController.listChargerTypes.bind(chargerTypeController));


// Route for deleting a charger type
router.delete('/:id', chargerTypeController.deleteChargerType.bind(chargerTypeController));

// Route for getting supported makes of a specific charger type
// router.get('/charger-types/:chargerId/supported-makes', chargerTypeController.getSupportedMakes.bind(chargerTypeController));

module.exports = router;
