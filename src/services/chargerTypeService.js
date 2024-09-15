
const ChargerTypeRepository = require('../repositories/chargerTypeRepo');
const { v4: uuidv4 } = require('uuid'); // Import UUID for unique identifiers if needed

class ChargerTypeService {
    constructor() {
        this.chargerTypeRepository = new ChargerTypeRepository();
    }

    // Create a new charger type
    async createChargerType(data) {
        const chargerType = {
            id: uuidv4(), // Generate a unique ID for the new charger type
            label: data.label,
            description: data.description,
            supports_ac: data.supports_ac,
            supports_dc: data.supports_dc,
            power_min: data.power_min,
            power_max: data.power_max,
            availability: data.availability
        };
        return await this.chargerTypeRepository.createChargerType(chargerType);
    }

    // Update an existing charger type by ID
    async updateChargerType(id, data) {
        const updatedChargerType = {
            label: data.label,
            description: data.description,
            supports_ac: data.supports_ac,
            supports_dc: data.supports_dc,
            power_min: data.power_min,
            power_max: data.power_max,
            availability: data.availability
        };
        return await this.chargerTypeRepository.updateChargerType(id, updatedChargerType);
    }

    // Get all charger types
    async getAllChargerTypes() {
        return await this.chargerTypeRepository.getAllChargerTypes();
    }

    // Get a charger type by ID
    async getChargerTypeById(id) {
        return await this.chargerTypeRepository.getChargerTypeById(id);
    }

    // Delete a charger type by ID
    async deleteChargerType(id) {
        return await this.chargerTypeRepository.deleteChargerType(id);
    }

    // Get filtered charger types based on criteria
    async listFilteredChargerTypes(filters) {
        return await this.chargerTypeRepository.getFilteredChargerTypes(filters);
    }
}

module.exports = ChargerTypeService;
