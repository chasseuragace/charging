class ChargerType {
    constructor(id, label, description, supportsAc, supportsDc, powerMin, powerMax, availability) {
        this.id = id;                // UUID
        this.label = label;          // Label of the charger type
        this.description = description; // Description of the charger type
        this.supportsAc = supportsAc;  // Boolean: true if AC charging is supported
        this.supportsDc = supportsDc;  // Boolean: true if DC charging is supported
        this.powerMin = powerMin;    // Minimum power in kW
        this.powerMax = powerMax;    // Maximum power in kW
        this.availability = availability; // Availability details
    }
}

module.exports = ChargerType;
