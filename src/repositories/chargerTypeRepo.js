// ChargerTypeRepository.js
const pool = require('../config/database'); // Import your PostgreSQL configuration

class ChargerTypeRepository {
    // Create a new charger type
    async createChargerType(chargerType) {
        const query = `
            INSERT INTO ChargerTypes (id, label, description, supports_ac, supports_dc, power_min, power_max, availability)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
        `;
        const values = [
            chargerType.id,
            chargerType.label,
            chargerType.description,
            chargerType.supports_ac,
            chargerType.supports_dc,
            chargerType.power_min,
            chargerType.power_max,
            chargerType.availability
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Update an existing charger type
    async updateChargerType(id, updatedData) {
        const query = `
            UPDATE ChargerTypes
            SET label = $1, description = $2, supports_ac = $3, supports_dc = $4, power_min = $5, power_max = $6, availability = $7
            WHERE id = $8 RETURNING *
        `;
        const values = [
            updatedData.label,
            updatedData.description,
            updatedData.supports_ac,
            updatedData.supports_dc,
            updatedData.power_min,
            updatedData.power_max,
            updatedData.availability,
            id
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Get all charger types
    async getAllChargerTypes() {
        const query = 'SELECT * FROM ChargerTypes';
        const result = await pool.query(query);
        return result.rows;
    }

    // Get a charger type by ID
    async getChargerTypeById(id) {
        const query = 'SELECT * FROM ChargerTypes WHERE id = $1';
        const values = [id];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Delete a charger type by ID
    async deleteChargerType(id) {
        const query = 'DELETE FROM ChargerTypes WHERE id = $1 RETURNING *';
        const values = [id];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Get filtered charger types based on criteria
    async getFilteredChargerTypes(filters) {
        let query = `
            SELECT DISTINCT c.* FROM ChargerTypes c
            LEFT JOIN SupportedMakes sm ON c.id = sm.charger_id
            WHERE 
                ($1::BOOLEAN IS NULL OR c.supports_ac = $1) AND
                ($2::BOOLEAN IS NULL OR c.supports_dc = $2) AND
                ($3::DECIMAL IS NULL OR c.power_min >= $3) AND
                ($4::DECIMAL IS NULL OR c.power_max <= $4)
        `;
        const values = [
            filters.supportsAc ? filters.supportsAc === 'true' : null,
            filters.supportsDc ? filters.supportsDc === 'true' : null,
            filters.powerMin ? parseFloat(filters.powerMin) : null,
            filters.powerMax ? parseFloat(filters.powerMax) : null,
            filters.make || null
        ];
        const result = await pool.query(query, values);
        return result.rows;
    }
}

module.exports = ChargerTypeRepository;
