const express = require('express');
const app = express();
const chargerTypeRoutes = require('./routes/chargerTypeRoutes');
const chargerPointRoutes = require('./routes/chargingPointRoutes');
require('dotenv').config();

// Middleware to parse JSON request bodies
app.use(express.json());

// Use charger type routes
app.use('/api/charger-types', chargerTypeRoutes);
app.use('/api/charging-point', chargerPointRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
