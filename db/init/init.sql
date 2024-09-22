-- Ensure the uuid-ossp extension is enabled for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--Create the ChargerTypes table with UUID
CREATE TABLE ChargerTypes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- UUID for unique identification
    label VARCHAR(100) NOT NULL,
    description TEXT,
    supports_ac BOOLEAN NOT NULL,
    supports_dc BOOLEAN NOT NULL,
    power_min DECIMAL(10, 2),
    power_max DECIMAL(10, 2),
    svg_icon  VARCHAR(50),
    availability VARCHAR(255)
);

-- Create the SupportedMakes table with UUID
CREATE TABLE SupportedMakes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- UUID for unique identification
    charger_id UUID NOT NULL,
    make VARCHAR(100) NOT NULL,
    FOREIGN KEY (charger_id) REFERENCES ChargerTypes(id) ON DELETE CASCADE
);

-- Create the ChargingPoints table with UUID and auto-incrementing unit_id
CREATE TABLE ChargingPoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- UUID for unique identification
    vendor_id VARCHAR(50) NOT NULL, -- Vendor ID mapping
    charger_type_id UUID NOT NULL, -- Charger Type ID mapping (UUID)
    operation_status VARCHAR(50) NOT NULL, -- Operational status (e.g., operational, out of order)
    power DECIMAL(10, 2), -- Power in Kw
    is_free BOOLEAN NOT NULL DEFAULT false, -- Set default value of is_free to false
    -- make_id UUID, -- New column for makeId, referencing SupportedMakes
    unit_id SERIAL NOT NULL, -- Unit identifier, auto-incremented integer
    FOREIGN KEY (charger_type_id) REFERENCES ChargerTypes(id) ON DELETE CASCADE,
    FOREIGN KEY (make_id) REFERENCES SupportedMakes(id) ON DELETE SET NULL -- Links to SupportedMakes
);


-- Create ChargingPointCustomIds table for storing custom IDs
CREATE TABLE ChargingPointCustomIds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- UUID for unique identification
    charging_point_id UUID NOT NULL UNIQUE , -- Reference to ChargingPoints table
    custom_id VARCHAR(50) NOT NULL, -- Custom ID in the format cs00001u001p001
    vendor_id VARCHAR(50) NOT NULL, -- Vendor ID mapping
      unit_id INTEGER GENERATED ALWAYS AS IDENTITY, -- Auto-incrementing unit_id
  
    plug_id INTEGER NOT NULL, -- Plug identifier
    FOREIGN KEY (charging_point_id) REFERENCES ChargingPoints(id) ON DELETE CASCADE
);
CREATE OR REPLACE FUNCTION generate_custom_id() RETURNS TRIGGER AS $$
DECLARE
    plug_id INTEGER;  -- Local variable
    custom_id VARCHAR(50);
BEGIN
    -- Determine the next plug_id for the given vendor and unit
    SELECT COALESCE(MAX(cpci.plug_id) + 1, 1) INTO plug_id  -- Qualify plug_id with table alias cpci
    FROM ChargingPointCustomIds cpci
    WHERE cpci.vendor_id = NEW.vendor_id AND cpci.unit_id = NEW.unit_id;
    
    -- Generate the custom ID in the format cs00001u001p001
    custom_id := 'cs' || LPAD(NEW.vendor_id, 8, '0') || 'u' || LPAD(NEW.unit_id::TEXT, 3, '0') || 'p' || LPAD(plug_id::TEXT, 3, '0');
    
    -- Insert the custom ID into the ChargingPointCustomIds table
    INSERT INTO ChargingPointCustomIds (charging_point_id, custom_id, vendor_id, unit_id, plug_id)
    OVERRIDING SYSTEM VALUE
    VALUES (NEW.id, custom_id, NEW.vendor_id, NEW.unit_id, plug_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically generate custom IDs when new ChargingPoints are inserted
CREATE TRIGGER insert_charging_point_trigger
AFTER INSERT ON ChargingPoints
FOR EACH ROW
EXECUTE FUNCTION generate_custom_id();

-- Insert sample data into the ChargerTypes table
INSERT INTO ChargerTypes (id, label, description, supports_ac, supports_dc, power_min, power_max, availability) VALUES
(uuid_generate_v4(), 'Type 1', 'Connector commonly used in North America and Japan, supporting single-phase power.', TRUE, FALSE, 3.7, 7.4, 'Widely available in North America and Japan'),
(uuid_generate_v4(), 'Type 2', 'Versatile connector used in Europe and other regions, supports both single-phase and three-phase power.', TRUE, FALSE, 3.7, 22.0, 'Widely available in Europe and other regions'),
(uuid_generate_v4(), 'GB/T', 'Connector used primarily in China, supports single-phase and DC power for different applications.', TRUE, TRUE, 1.0, 350.0, 'Widely available in China'),
(uuid_generate_v4(), 'CHAdeMO', 'Early standard for DC fast charging, widely used in Japan and Asia.', FALSE, TRUE, 50.0, 350.0, 'Common in Japan, South Korea, and other Asian countries'),
(uuid_generate_v4(), 'CCS1', 'Versatile connector used in North America, supports both AC and DC charging through a single connector.', TRUE, TRUE, 3.7, 350.0, 'Widely available in North America'),
(uuid_generate_v4(), 'CCS2', 'Versatile connector used in Europe and other regions, supports both AC and DC charging through a single connector.', TRUE, TRUE, 3.7, 350.0, 'Widely available in Europe and other regions'),
(uuid_generate_v4(), 'Tesla Supercharger', 'Proprietary charging network for Tesla vehicles, offering high-speed DC charging.', FALSE, TRUE, 120.0, 350.0, 'Exclusive to Tesla vehicles, primarily located along major highways and in urban areas'),
(uuid_generate_v4(), 'IEC 60309', 'Connector commonly used for charging small EVs in Europe, suitable for lower power levels.', TRUE, FALSE, 1.0, 2.0, 'Widely available in Europe and other regions for small EVs'),
(uuid_generate_v4(), 'Schuko', 'Standard European household plug used for charging small EVs.', TRUE, FALSE, 1.0, 3.0, 'Commonly available in Europe and some Asian markets'),
(uuid_generate_v4(), 'BS 546 (Type D/M Plug)', 'Connector used in India for slow charging of small EVs.', TRUE, FALSE, 1.0, 2.0, 'Widely available in India and nearby regions'),
(uuid_generate_v4(), 'C13 Connector', 'Connector used for charging e-bikes and scooters, commonly seen in Southeast Asia.', TRUE, FALSE, 0.5, 1.5, 'Widely available globally, including Asia'),
(uuid_generate_v4(), 'CCS Mini', 'Compact version of CCS for fast charging of high-performance motorcycles.', FALSE, TRUE, 7.0, 20.0, 'Less common but available in urban areas'),
(uuid_generate_v4(), 'GB/T Mini', 'Compact version of GB/T for fast charging of smaller EVs in China.', FALSE, TRUE, 7.0, 20.0, 'Widely available in China and some other parts of Asia'),
(uuid_generate_v4(), 'Battery Swapping', 'Instant battery swapping for vehicles with removable batteries.', FALSE, FALSE, 0.0, 0.0,  'Increasingly available in urban areas, especially in China, Taiwan, and India'),
(uuid_generate_v4(), 'Type 3', 'Previously used in Europe, features shutters for enhanced safety, now largely replaced by Type 2.', TRUE, FALSE, 3.7, 22.0, 'Less common in Europe'),
(uuid_generate_v4(), 'J1772', 'Widely used AC charging connector in North America, compatible with most electric vehicles.', TRUE, FALSE, 1.0, 19.2, 'Widely available in North America'),
(uuid_generate_v4(), 'CEE 7/7', 'Universal European plug, used for household and light-duty AC charging applications.', TRUE, FALSE, 1.0, 3.0, 'Widely available in Europe'),
(uuid_generate_v4(), 'Type G', 'Used mainly in the UK and Ireland, compatible with Level 1 AC charging.', TRUE, FALSE, 1.0, 3.0, 'Common in the UK and Ireland'),
(uuid_generate_v4(), 'NEMA 5-15', 'Standard AC plug in North America, used for Level 1 charging at 120V.', TRUE, FALSE, 1.0, 1.9, 'Widely available in North America'),
(uuid_generate_v4(), 'CHAdeMO 2', 'Updated version of the CHAdeMO standard offering higher charging power for fast DC charging.', FALSE, TRUE, 100.0, 400.0, 'Common in Japan and other Asian countries');

-- Insert sample data into the SupportedMakes table
INSERT INTO SupportedMakes (charger_id, make) VALUES
((SELECT id FROM ChargerTypes WHERE label = 'Type 1'), 'Nissan'),
((SELECT id FROM ChargerTypes WHERE label = 'Type 1'), 'Mitsubishi'),
((SELECT id FROM ChargerTypes WHERE label = 'Type 1'), 'Chevrolet'),
((SELECT id FROM ChargerTypes WHERE label = 'Type 1'), 'Ford'),
((SELECT id FROM ChargerTypes WHERE label = 'Type 1'), 'Kia'),
((SELECT id FROM ChargerTypes WHERE label = 'Type 1'), 'Hyundai'),
((SELECT id FROM ChargerTypes WHERE label = 'Type 1'), 'Toyota'),
-- Example for GB/T
((SELECT id FROM ChargerTypes WHERE label = 'GB/T'), 'BYD'),
((SELECT id FROM ChargerTypes WHERE label = 'GB/T'), 'NIO'),
((SELECT id FROM ChargerTypes WHERE label = 'GB/T'), 'Xpeng'),
((SELECT id FROM ChargerTypes WHERE label = 'GB/T'), 'Geely'),
((SELECT id FROM ChargerTypes WHERE label = 'GB/T'), 'SAIC'),
((SELECT id FROM ChargerTypes WHERE label = 'GB/T'), 'Changan'),
((SELECT id FROM ChargerTypes WHERE label = 'GB/T'), 'Niu'),
((SELECT id FROM ChargerTypes WHERE label = 'GB/T'), 'Xiaomi (scooters)'),
-- Example for Battery Swapping
((SELECT id FROM ChargerTypes WHERE label = 'Battery Swapping'), 'Gogoro'),
((SELECT id FROM ChargerTypes WHERE label = 'Battery Swapping'), 'Niu'),
((SELECT id FROM ChargerTypes WHERE label = 'Battery Swapping'), 'Yadea'),
((SELECT id FROM ChargerTypes WHERE label = 'Battery Swapping'), 'Okinawa Autotech'),
((SELECT id FROM ChargerTypes WHERE label = 'Battery Swapping'), 'Hero Electric');



-- Inserting data for Vendor 1, Unit 1 (3 plugs)
INSERT INTO ChargingPoints (vendor_id, charger_type_id, operation_status, is_free, unit_id,power) VALUES
('B-AEF1EE', (SELECT id FROM ChargerTypes WHERE label = 'Type 1'), 'operational', false, 1,14),
('B-AEF1EE', (SELECT id FROM ChargerTypes WHERE label = 'Type 1'), 'operational', false, 1,14),
('B-AEF1EE', (SELECT id FROM ChargerTypes WHERE label = 'Type 1'), 'operational', false, 1,14);

-- Inserting data for Vendor 1, Unit 2 (3 plugs)
INSERT INTO ChargingPoints (vendor_id, charger_type_id, operation_status, is_free, unit_id,power) VALUES
('B-AEF1EE', (SELECT id FROM ChargerTypes WHERE label = 'Type 2'), 'operational', false, 2,14),
('B-AEF1EE', (SELECT id FROM ChargerTypes WHERE label = 'Type 2'), 'operational', false, 2,14),
('B-AEF1EE', (SELECT id FROM ChargerTypes WHERE label = 'Type 2'), 'operational', false, 2,14);

-- -- Inserting data for Vendor 2, Unit 1 (3 plugs)
-- INSERT INTO ChargingPoints (vendor_id, charger_type_id, operation_status, is_free, unit_id) VALUES
-- ('00002', (SELECT id FROM ChargerTypes WHERE label = 'Type 1'), 'operational', false, 1),
-- ('00002', (SELECT id FROM ChargerTypes WHERE label = 'Type 1'), 'operational', false, 1),
-- ('00002', (SELECT id FROM ChargerTypes WHERE label = 'Type 1'), 'operational', false, 1);

-- -- Inserting data for Vendor 2, Unit 2 (3 plugs)
-- INSERT INTO ChargingPoints (vendor_id, charger_type_id, operation_status, is_free, unit_id) VALUES
-- ('00002', (SELECT id FROM ChargerTypes WHERE label = 'Type 2'), 'operational', false, 2),
-- ('00002', (SELECT id FROM ChargerTypes WHERE label = 'Type 2'), 'operational', false, 2),
-- ('00002', (SELECT id FROM ChargerTypes WHERE label = 'Type 2'), 'operational', false, 2);

