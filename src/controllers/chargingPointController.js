const ChargingPointService = require('../services/chargingPointService');
const BookingService = require('../services/bookingService');
const ChargerFilterService = require('../services/filterService');
class ChargingPointController {
    constructor() {
        this.chargingPointService = new ChargingPointService();
        this.bookingService = new BookingService();
        this.filterServoce = new ChargerFilterService();
        console.log('ChargingPointController instantiated');
    }

    // Register a new charging point
    async registerChargingPoint(req, res) {
        const { vendorId, chargerTypeId, operationStatus } = req.body;
        console.log('Received request to register charging point:', { vendorId, chargerTypeId, operationStatus });
        try {
            const chargingPoint = await this.chargingPointService.registerChargingPoint({
                vendorId,
                chargerTypeId,
                operationStatus
            });
            console.log('Successfully registered charging point:', chargingPoint);
            res.status(201).json(chargingPoint);
        } catch (error) {
            console.error('Error registering charging point:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Register multiple charging points
  // Register multiple charging points
  async registerMultiChargingPoint(req, res) {
    const chargingPoints = req.body.chargingPoints; // Array of charging point objects
    console.log('Received request to register multiple charging points:', chargingPoints);

    if (!Array.isArray(chargingPoints) || chargingPoints.length === 0) {
        console.warn('Invalid input: chargingPoints should be a non-empty array.');
        return res.status(400).json({ error: "Invalid input: chargingPoints should be a non-empty array." });
    }

    try {
        const results = [];
        let previousUnitId = null; // Track the unit_id from the first point if not provided

        for (const point of chargingPoints) {
            const { vendorId, chargerTypeId, operationStatus, unitId } = point;

            if (!vendorId || !chargerTypeId || typeof operationStatus === 'undefined') {
                console.warn('Missing required fields in point:', point);
                results.push({
                    point,
                    status: "failed",
                    error: "Missing required fields: vendorId, chargerTypeId, or operationStatus."
                });
                continue;
            }

            try {
                // If unitId is not provided, use the previousUnitId (from first registered point)
                const chargingPoint = await this.chargingPointService.registerChargingPoint({
                    vendorId,
                    chargerTypeId,
                    operationStatus,
                    unitId: unitId || previousUnitId // Use unitId if provided, or fallback to previousUnitId
                });

                // If unitId was auto-generated, store it for future use
                if (!unitId && !previousUnitId) {
                    previousUnitId = chargingPoint.unit_id;
                    console.log('Auto-generated unitId is now being used for subsequent points:', previousUnitId);
                }

                console.log('Successfully registered charging point:', chargingPoint);
                results.push({
                    point,
                    status: "success",
                    chargingPoint
                });
            } catch (error) {
                console.error('Error registering charging point:', error);
                results.push({
                    point,
                    status: "failed",
                    error: error.message
                });
            }
        }

        console.log('Registration results:', results);
        res.status(201).json(results);
    } catch (error) {
        console.error('Error in registerMultiChargingPoint:', error);
        res.status(500).json({ error: error.message });
    }
}



    // Update an existing charging point
    async updateChargingPoint(req, res) {
        const { id } = req.params;
        const { vendorId, chargerTypeId, operationStatus, isFree } = req.body;
        console.log('Received request to update charging point:', { id, vendorId, chargerTypeId, operationStatus, isFree });
        try {
            const updatedChargingPoint = await this.chargingPointService.updateChargingPoint(id, {
                vendorId,
                chargerTypeId,
                operationStatus,
                isFree
            });
            if (updatedChargingPoint) {
                console.log('Successfully updated charging point:', updatedChargingPoint);
                res.json(updatedChargingPoint);
            } else {
                console.warn('Charging Point not found for update:', id);
                res.status(404).json({ message: 'Charging Point not found' });
            }
        } catch (error) {
            console.error('Error updating charging point:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Get all charging points
    async listChargingPoints(req, res) {
        console.log('Received request to list all charging points');
        try {
            const chargingPoints = await this.chargingPointService.getAllChargingPoints();
            console.log(`Successfully fetched ${chargingPoints.length} charging points`);
            res.json(chargingPoints);
        } catch (error) {
            console.error('Error fetching all charging points:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Get a charging point by ID
    async getChargingPoint(req, res) {
        const { id } = req.params;
        console.log('Received request to get charging point by ID:', id);
        try {
            const chargingPoint = await this.chargingPointService.getChargingPointById(id);
            if (chargingPoint) {
                console.log('Successfully fetched charging point:', chargingPoint);
                res.json(chargingPoint);
            } else {
                console.warn('Charging Point not found by ID:', id);
                res.status(404).json({ message: 'Charging Point not found' });
            }
        } catch (error) {
            console.error('Error fetching charging point by ID:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Delete a charging point
    async deleteChargingPoint(req, res) {
        const { id } = req.params;
        console.log('Received request to delete charging point by ID:', id);
        try {
            const deletedChargingPoint = await this.chargingPointService.deleteChargingPoint(id);
            if (deletedChargingPoint) {
                console.log('Successfully deleted charging point:', deletedChargingPoint);
                res.json({ message: 'Charging Point deleted successfully', deletedChargingPoint });
            } else {
                console.warn('Charging Point not found for deletion:', id);
                res.status(404).json({ message: 'Charging Point not found' });
            }
        } catch (error) {
            console.error('Error deleting charging point:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Get filtered charging points
    async getFilteredChargingPoints(req, res) {
        console.log('Received request to filter charging points with query:', req.query);
        try {
            const { vendorIds, chargerTypeIds, operationStatus, isFree } = req.query;

            // Convert comma-separated strings into arrays (if they exist)
            const vendorIdsArray = vendorIds ? vendorIds.split(',') : null;
            const chargerTypeIdsArray = chargerTypeIds ? chargerTypeIds.split(',') : null;
            const isFreeBoolean = isFree === 'true' ? true : isFree === 'false' ? false : null;

            const filters = {
                vendorIds: vendorIdsArray,
                chargerTypeIds: chargerTypeIdsArray,
                operationStatus: operationStatus || null,
                isFree: isFreeBoolean,
            };

            console.log('Applying filters:', filters);

            const chargingPoints = await this.chargingPointService.listFilteredChargingPoints(filters);

            console.log(`Successfully fetched ${chargingPoints.length} filtered charging points`);
            res.status(200).json(chargingPoints);
        } catch (error) {
            console.error('Error fetching filtered charging points:', error);
            res.status(500).json({
                message: 'An error occurred while fetching charging points',
            });
        }
    }
    async listVendorsGroupChargingPoints(req, res) {
        console.log('Received request to filter charging points with query:', req.query);
        try {
            const { vendorIds, chargerTypeIds, operationStatus, isFree } = req.query;

            // Convert comma-separated strings into arrays (if they exist)
            const vendorIdsArray = vendorIds ? vendorIds.split(',') : null;
            const chargerTypeIdsArray = chargerTypeIds ? chargerTypeIds.split(',') : null;
            const isFreeBoolean = isFree === 'true' ? true : isFree === 'false' ? false : null;

            const filters = {
                vendorIds: vendorIdsArray,
                chargerTypeIds: chargerTypeIdsArray,
                operationStatus: operationStatus || null,
                isFree: isFreeBoolean,
            };

            console.log('Applying filters:', filters);

            const chargingPoints = await this.chargingPointService.listVendorsGroupChargingPoints(filters);

            console.log(`Successfully fetched ${chargingPoints.length} filtered charging points`);
            res.status(200).json(chargingPoints);
        } catch (error) {
            console.error('Error fetching filtered charging points:', error);
            res.status(500).json({
                message: 'An error occurred while fetching charging points',
            });
        }
    }

    // Get user's booking history
    async getUserBookingHistory(req, res) {
        const { userId } = req.params;
        console.log(`Received request for booking history of user: ${userId}`);

        try {
            const bookingHistory = await this.bookingService.getUserBookingHistory(userId);
            console.log(`Successfully fetched booking history for user ${userId}`);
            res.status(200).json(bookingHistory);
        } catch (error) {
            console.error(`Error fetching booking history for user ${userId}:`, error);
            res.status(500).json({
                message: 'An error occurred while fetching user booking history',
                error: error.message
            });
        }
    }

    // Get entity's booking history
    async getEntityBookingHistory(req, res) {
        const { entityId } = req.params;
        console.log(`Received request for booking history of entity: ${entityId}`);

        try {
            const bookingHistory = await this.bookingService.getEntityBookingHistory(entityId);
            console.log(`Successfully fetched booking history for entity ${entityId}`);
            res.status(200).json(bookingHistory);
        } catch (error) {
            console.error(`Error fetching booking history for entity ${entityId}:`, error);
            res.status(500).json({
                message: 'An error occurred while fetching entity booking history',
                error: error.message
            });
        }
    }

    // Create a new booking
   // Create a new booking
async createBooking(req, res) {
    console.log('Received request to create a new booking:', req.body);
    try {
        const bookingData = req.body;

        // Fetch the charger details
        const charger = await this.chargingPointService.getChargingPointById(bookingData.entityId);
        bookingData.additionalInfo = bookingData.additionalInfo || {};  // Ensure additionalInfo exists
        bookingData.additionalInfo.charger = charger;

        console.log('Append charger details', bookingData.additionalInfo);

        // Attempt to create the booking
        const result = await this.bookingService.createBooking(bookingData);
        console.log('Successfully created new booking:', result);

        // If booking is successful, return the result with a 201 Created status
        res.status(201).json(result);

    } catch (error) {
        console.error('Error creating new booking:', error);

        // Check if the error was thrown by the booking microservice and if the status was 409
        if (error.response && error.response.status === 409) {
            res.status(409).json({
                error: 'Booking conflict: the entity is already booked during this time range.'
            });
        } else {
            // Handle other unexpected errors
            res.status(500).json({
                message: error.message
            });
        }
    }
}


    // Update booking status
    async updateBookingStatus(req, res) {
        const bookingId = req.params.id;
        console.log('Received request to update booking status for ID:', bookingId);
        try {
            const { status } = req.body;
            const result = await this.bookingService.updateBookingStatus(bookingId, status);
            console.log('Successfully updated booking status:', result);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error updating booking status:', error);
            res.status(500).json({ message: error.message });
        }
    }
    // Get ChargingUnits booking status 
    async getBookingStatusOfUnit(req, res) {
        const unitId = req.params.id;
        console.log('Received request to fetch booking status for unit ID:', unitId);
      try {
          const bookingStatuses = await this.bookingService.fetchBookingStatuses({
              entityIds: unitId,
              statuses: ['pending', 'in_progress', 'scheduled'].join(',')
          });
          console.log('Successfully  fetch booking status for unit :', bookingStatuses);
          
          res.status(200).json(bookingStatuses);
      } catch (error) {
        console.error('Error updating fetching booking  status:', error);
        res.status(500).json({ message: error.message });
      }
      
    }
    async getFilters(req, res) {
        const unitId = req.params.id;
        console.log('Received request to fetch filters', unitId);
      try {
          const bookingStatuses = await this.filterServoce.getFilters();
          console.log('Successfully  fetch filters :', bookingStatuses);
          
          res.status(200).json(bookingStatuses);
      } catch (error) {
        console.error('Error fetching filters  :', error);
        res.status(500).json({ message: error.message });
      }
      
    }
}

module.exports = ChargingPointController;
