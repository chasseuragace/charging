const ChargerTypeService = require('../services/chargerTypeService');

class ChargerTypeController {
    constructor() {
        this.chargerTypeService = new ChargerTypeService();
    }

    // Create a new charger type
    async createChargerType(req, res) {
        const { id, label, description, supportsAc, supportsDc, powerMin, powerMax, availability } = req.body;
        try {
            const chargerType = await this.chargerTypeService.createChargerType({
                id, label, description, supportsAc, supportsDc, powerMin, powerMax, availability
            });
            res.status(201).json(chargerType);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Update an existing charger type
    async updateChargerType(req, res) {
        const { id } = req.params;
        const { label, description, supportsAc, supportsDc, powerMin, powerMax, availability } = req.body;
        try {
            const updatedChargerType = await this.chargerTypeService.updateChargerType(id, {
                label, description, supportsAc, supportsDc, powerMin, powerMax, availability
            });
            if (updatedChargerType) {
                res.json(updatedChargerType);
            } else {
                res.status(404).json({ message: 'Charger Type not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get all charger types
    async listChargerTypes(req, res) {
        try {
            const chargerTypes = await this.chargerTypeService.getAllChargerTypes();
            res.json(chargerTypes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get filtered charger types based on criteria
    async listFilteredChargerTypes(req, res) {
        const { supportsAc, supportsDc, powerMin, powerMax } = req.query;
        try {
            const filters = { supportsAc, supportsDc, powerMin, powerMax };
            const chargerTypes = await this.chargerTypeService.listFilteredChargerTypes(filters);
            res.json(chargerTypes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Delete a charger type by ID
      async deleteChargerType(req, res) {
        const { id } = req.params;
        try {
            const deletedChargerType = await this.chargerTypeService.deleteChargerType(id);
            if (deletedChargerType) {
                res.json({ message: 'Charger Type deleted successfully', deletedChargerType });
            } else {
                res.status(404).json({ message: 'Charger Type not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Get supported makes for a charger type
    // async getSupportedMakes(req, res) {
    //     const { chargerId } = req.params;
    //     try {
    //         const supportedMakes = await this.chargerTypeService.getSupportedMakes(chargerId);
    //         if (supportedMakes) {
    //             res.json(supportedMakes);
    //         } else {
    //             res.status(404).json({ message: 'Charger Type not found' });
    //         }
    //     } catch (error) {
    //         res.status(500).json({ error: error.message });
    //     }
   
    // }
}

module.exports = ChargerTypeController;
