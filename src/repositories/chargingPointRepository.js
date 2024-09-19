const pool = require('../config/database'); // Import your PostgreSQL configuration

class ChargingPointRepository {
     chargerDetailCTE = `
   WITH ChargerDetails AS (
    SELECT 
        ct.id AS charger_type_id,
        json_build_object(
            'id', ct.id,
            'label', ct.label,
            'description', ct.description,
            'supports_ac', ct.supports_ac,
            'supports_dc', ct.supports_dc,
            'power_min', ct.power_min::TEXT,  -- Cast to TEXT
            'power_max', ct.power_max::TEXT,  -- Cast to TEXT
            'availability', ct.availability
        ) AS charger_detail
    FROM ChargerTypes ct

    )
`;
// Register a new charging point
// Register a new charging point
async registerChargingPoint(chargingPoint) {
    let query;
    let values;

    if (chargingPoint.unitId === undefined || chargingPoint.unitId === null) {
        // unit_id is auto-incremented by the database
        query = `
            INSERT INTO ChargingPoints (vendor_id, charger_type_id, operation_status)
            VALUES ($1, $2, $3) RETURNING *
        `;
        values = [
            chargingPoint.vendorId,
            chargingPoint.chargerTypeId,
            chargingPoint.operationStatus
        ];
    } else {
        // unit_id is provided, use OVERRIDING SYSTEM VALUE
        query = `
            INSERT INTO ChargingPoints (vendor_id, charger_type_id, operation_status, unit_id)
            OVERRIDING SYSTEM VALUE
            VALUES ($1, $2, $3, $4)  RETURNING *
        `;
        values = [
            chargingPoint.vendorId,
            chargingPoint.chargerTypeId,
            chargingPoint.operationStatus,
            chargingPoint.unitId
        ];
    }

    const result = await pool.query(query, values);
    return result.rows[0];
}




    // Update an existing charging point by ID
    async updateChargingPoint(id, updatedData) {
        // Start building the query
        let query = 'UPDATE ChargingPoints SET';
        const values = [];
        let fieldIndex = 1;
    
        // Add the vendor_id if it is provided
        if (updatedData.vendorId !== null && updatedData.vendorId !== undefined) {
            query += ` vendor_id = $${fieldIndex++},`;
            values.push(updatedData.vendorId);
        }
    
        // Add the charger_type_id if it is provided
        if (updatedData.chargerTypeId !== null && updatedData.chargerTypeId !== undefined) {
            query += ` charger_type_id = $${fieldIndex++},`;
            values.push(updatedData.chargerTypeId);
        }
    
        // Add the operation_status if it is provided
        if (updatedData.operationStatus !== null && updatedData.operationStatus !== undefined) {
            query += ` operation_status = $${fieldIndex++},`;
            values.push(updatedData.operationStatus);
        }
        // Add the isFree if it is provided
        if (updatedData.isFree !== null && updatedData.isFree !== undefined) {
            query += ` is_free = $${fieldIndex++},`;
            values.push(updatedData.isFree);
        }
    
        // Remove the trailing comma and add the WHERE clause
        query = query.slice(0, -1); // Remove the last comma
        query += ` WHERE id = $${fieldIndex} RETURNING *`;
        values.push(id);
    
        // Execute the query
        const result = await pool.query(query, values);
        return result.rows[0];
    }
     // Delete a charging point by ID
     async deleteChargingPoint(id) {
        const query = 'DELETE FROM ChargingPoints WHERE id = $1 RETURNING *';
        const values = [id];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async getAllChargingPoints() {
        const query = `
        ${this.chargerDetailCTE}
        SELECT 
            cp.*, 
            cd.charger_detail
        FROM ChargingPoints cp
        INNER JOIN ChargerDetails cd ON cp.charger_type_id = cd.charger_type_id
    `;
        const result = await pool.query(query);
        return result.rows;
    }

    // Get a charging point by ID
    async getChargingPointById(id) {
        const query = `
        ${this.chargerDetailCTE}
        SELECT 
            cp.*, 
            cd.charger_detail
        FROM ChargingPoints cp
        INNER JOIN ChargerDetails cd ON cp.charger_type_id = cd.charger_type_id
        WHERE cp.id = $1
    `;
        const values = [id];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
    

   
       // Get filtered charging points based on the provided criteria
       async getFilteredChargingPoint({ vendorIds, chargerTypeIds, operationStatus, isFree }) {
        const query = `
        ${this.chargerDetailCTE}
        SELECT 
            cp.*, 
            cd.charger_detail
        FROM ChargingPoints cp
        INNER JOIN ChargerDetails cd ON cp.charger_type_id = cd.charger_type_id
        WHERE 
            (ARRAY_LENGTH($1::VARCHAR[], 1) IS NULL OR cp.vendor_id = ANY($1::VARCHAR[])) AND
            (ARRAY_LENGTH($2::UUID[], 1) IS NULL OR cp.charger_type_id = ANY($2::UUID[])) AND
            ($3::VARCHAR IS NULL OR cp.operation_status = $3) AND
            ($4::BOOLEAN IS NULL OR cp.is_free = $4)
    `;
    
        const values = [
            vendorIds && vendorIds.length > 0 ? vendorIds : null,       // Vendor IDs filter
            chargerTypeIds && chargerTypeIds.length > 0 ? chargerTypeIds : null, // Charger Type IDs filter
            operationStatus || null,                                   // Operation Status filter
            typeof isFree === 'boolean' ? isFree : null                // Is Free filter
        ];
    
        const result = await pool.query(query, values);
        return result.rows;
    }

    async getGroupedFilteredChargingPoint({ vendorIds, chargerTypeIds, operationStatus, isFree }) {
        const query = `
            ${this.chargerDetailCTE}
            SELECT 
                cp.*, 
                cd.charger_detail,
                cpc.custom_id,
                cpc.plug_id
            FROM ChargingPoints cp
            INNER JOIN ChargerDetails cd ON cp.charger_type_id = cd.charger_type_id
            LEFT JOIN ChargingPointCustomIds cpc ON cp.id = cpc.charging_point_id
            WHERE 
                (ARRAY_LENGTH($1::VARCHAR[], 1) IS NULL OR cp.vendor_id = ANY($1::VARCHAR[])) AND
                (ARRAY_LENGTH($2::UUID[], 1) IS NULL OR cp.charger_type_id = ANY($2::UUID[])) AND
                ($3::VARCHAR IS NULL OR cp.operation_status = $3) AND
                ($4::BOOLEAN IS NULL OR cp.is_free = $4)
            ORDER BY cp.vendor_id, cp.unit_id;
        `;
        
        const values = [
            vendorIds && vendorIds.length > 0 ? vendorIds : null,       // Vendor IDs filter
            chargerTypeIds && chargerTypeIds.length > 0 ? chargerTypeIds : null, // Charger Type IDs filter
            operationStatus || null,                                   // Operation Status filter
            typeof isFree === 'boolean' ? isFree : null                // Is Free filter
        ];
    
        const result = await pool.query(query, values);
    
        // Process the result to match the desired structure
        const groupedData = result.rows.reduce((acc, row) => {
            const { vendor_id, unit_id, ...chargingPoint } = row;  // Keep all other fields as chargingPoint
    
            // Find or create the vendor entry
            let vendor = acc.find(v => v.vendorId === vendor_id);
            if (!vendor) {
                vendor = { vendorId: vendor_id, chargingUnits: [] };
                acc.push(vendor);
            }
    
            // Find or create the charging unit entry
            let chargingUnit = vendor.chargingUnits.find(cu => cu.unitId === unit_id);
            if (!chargingUnit) {
                chargingUnit = { unitId: unit_id, chargingPoints: [] };
                vendor.chargingUnits.push(chargingUnit);
            }
    
            // Add the charging point to the charging unit
            chargingUnit.chargingPoints.push(chargingPoint);
    
            return acc;
        }, []);
    
        return groupedData;
    }
    
    
    

    
    
}

module.exports = ChargingPointRepository;
    