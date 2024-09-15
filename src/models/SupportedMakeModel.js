const { v4: uuidv4 } = require('uuid');

class SupportedMake {
    constructor(id = uuidv4(), chargerId, make) {
        this.id = id;
        this.chargerId = chargerId; // UUID of the ChargerType
        this.make = make; // The make supported by this charger type
    }
}

module.exports = SupportedMake;
