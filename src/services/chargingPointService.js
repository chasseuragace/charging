const ChargingPointRepository = require('../repositories/chargingPointRepository');
const BookingService = require('./bookingService');


class ChargingPointService {
    constructor() {
        this.chargingPointRepository = new ChargingPointRepository();
        this.bookingService = new BookingService();

    }
  // Register a new charging point
async registerChargingPoint(data) {
    const chargingPoint = {
        vendorId: data.vendorId,
        chargerTypeId: data.chargerTypeId,
        operationStatus: data.operationStatus,
        unitId: data.unitId // Pass unitId to the repository
    };
    return await this.chargingPointRepository.registerChargingPoint(chargingPoint);
}


    // Update an existing charging point by ID
    async updateChargingPoint(id, data) {
    
        return await this.chargingPointRepository.updateChargingPoint(id, data);
    }

    // Get all charging points
    async getAllChargingPoints() {
        return await this.chargingPointRepository.getAllChargingPoints();
    }

    // Get a charging point by ID
    async getChargingPointById(id) {
        return await this.chargingPointRepository.getChargingPointById(id);
    }

    // Delete a charging point by ID
    async deleteChargingPoint(id) {
        return await this.chargingPointRepository.deleteChargingPoint(id);
    }
    
    async listFilteredChargingPoints(filters) {
        const chargingPoints = await this.chargingPointRepository.getFilteredChargingPoint(filters);
        console.log(chargingPoints);
        // Flatten and extract all charging_point_id
        const chargingPointIds = chargingPoints.flatMap((pointGroup) => {
            return pointGroup.id;
            
            
            // .charging_points.map((point) => {
            //     console.log(point);
            //     return point.charging_point_id; // Extract charging_point_id from each point
            // });
        });
        
        console.log("Extracted Charging Point IDs:", chargingPointIds);
        
        if (chargingPointIds.length === 0) return chargingPoints;

        const bookingStatuses = await this.bookingService.fetchBookingStatuses({
            entityIds: chargingPointIds.join(','),
            statuses: ['pending', 'in_progress', 'scheduled'].join(',')
        });

        const bookingStatusMap = this.bookingService.processBookingStatuses(bookingStatuses);

        return chargingPoints.map(point => ({
            ...point,
            bookingStatus: bookingStatusMap[point.id] || {
                status: 'available',
                details: null
            }
        }));
    }

    async listVendorsGroupChargingPoints(filters) {
        const chargingPoints = await this.chargingPointRepository.getGroupedFilteredChargingPoint(filters);
        return chargingPoints;
        // Flatten and extract all charging_point_id
        const chargingPointIds = chargingPoints.flatMap((pointGroup) => {
            return pointGroup.charging_points.map((point) => {
                console.log(point);
                return point.charging_point_id; // Extract charging_point_id from each point
            });
        });
        
        console.log("Extracted Charging Point IDs:", chargingPointIds);
        
        if (chargingPointIds.length === 0) return chargingPoints;

        const bookingStatuses = await this.bookingService.fetchBookingStatuses({
            entityIds: chargingPointIds.join(','),
            statuses: ['pending', 'in_progress', 'scheduled'].join(',')
        });

        const bookingStatusMap = this.bookingService.processBookingStatuses(bookingStatuses);

        return chargingPoints.map(point => ({
            ...point,
            bookingStatus: bookingStatusMap[point.id] || {
                status: 'available',
                details: null
            }
        }));
    }


}

module.exports = ChargingPointService;
