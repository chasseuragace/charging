const ChargerTypeRepository = require('../repositories/chargerTypeRepo');
class ChargerFilterService {
    constructor() {
        this.chargingTypeRepository = new ChargerTypeRepository();
    }

    async getFilters() {
        // Fetch all charger types from the repository
        const chargerTypes = await this.chargingTypeRepository.getAllChargerTypes();

        // Map AC and DC socket types based on charger data
        const acSocketTypes = chargerTypes
            .filter((charger) => charger.supports_ac) // Only chargers that support AC
            .map((charger) => ({
                value: charger.label.toLowerCase().replace(/\s+/g, ''),
                label: charger.label,
                description: `Supports AC charging with power range ${charger.power_min} kW to ${charger.power_max} kW`,
            }));

        const dcSocketTypes = chargerTypes
            .filter((charger) => charger.supports_dc) // Only chargers that support DC
            .map((charger) => ({
                value: charger.label.toLowerCase().replace(/\s+/g, ''),
                label: charger.label,
                description: `Supports DC charging with power range ${charger.power_min} kW to ${charger.power_max} kW`,
            }));

        // Return the full filter setup
        return {
            filters: [
                {
                    id: "chargerType",
                    label: "Charger Type",
                    type: "buttonGroup",
                    options: [
                        { value: "all", label: "All" },
                        { value: "ac", label: "AC" },
                        { value: "dc", label: "DC" }
                    ],
                    defaultValue: "all"
                },
                {
                    id: "kilowattRange",
                    label: "Kilowatt Range",
                    type: "rangeSlider",
                    min: 0,
                    max: 350,
                    defaultMin: 0,
                    defaultMax: 350,
                    unit: "KW"
                },
                {
                    id: "socketTypes",
                    label: "Socket Types",
                    type: "linkedMultiSelect",
                    options: {
                        ac: acSocketTypes,
                        dc: dcSocketTypes
                    }
                },
                {
                    id: "availableChargers",
                    label: "Only available chargers",
                    type: "toggle",
                    defaultValue: false
                },
                {
                    id: "freeChargers",
                    label: "Only free chargers",
                    type: "toggle",
                    defaultValue: false
                },
                {
                    id: "amenities",
                    label: "Amenities",
                    type: "multiSelect",
                    options: [
                        { value: "dining", label: "Dining" },
                        { value: "restroom", label: "Restroom" },
                        { value: "park", label: "Park" },
                        { value: "wifi", label: "Wifi" },
                        { value: "hiking", label: "Hiking" }
                    ]
                }
            ]
        };
    }
}

module.exports = ChargerFilterService;