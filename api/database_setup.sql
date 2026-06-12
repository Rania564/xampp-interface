-- ============================================================
--  database_setup.sql — IoT Dashboard MySQL Schema & Sample Data
--
--  HOW TO USE:
--  1. Open phpMyAdmin → http://localhost/phpmyadmin
--  2. Click "SQL" tab at the top
--  3. Paste this entire script and click "Go"
--  ── OR ──
--  Run from terminal:  mysql -u root < database_setup.sql
-- ============================================================


-- ---- Create & select the database ----
CREATE DATABASE IF NOT EXISTS iot_dashboard;
USE iot_dashboard;


-- ============================================================
--  TABLE: sensor_readings
--  Stores periodic sensor snapshots (temperature, humidity, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS sensor_readings (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  temperature DECIMAL(5,2)  NOT NULL COMMENT 'Celsius',
  humidity    DECIMAL(5,2)  NOT NULL COMMENT 'Percentage 0-100',
  gas_level   DECIMAL(7,2)  NOT NULL COMMENT 'PPM (parts per million)',
  motion      VARCHAR(20)   NOT NULL COMMENT 'Detected / Clear',
  light       DECIMAL(7,2)  NOT NULL COMMENT 'Lux',
  pressure    DECIMAL(7,2)  NOT NULL COMMENT 'hPa',
  recorded_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
--  TABLE: motion_log
--  Logs every motion detection event separately
-- ============================================================
CREATE TABLE IF NOT EXISTS motion_log (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  status      VARCHAR(20)   NOT NULL COMMENT 'Detected / Clear',
  detected_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
--  STATIC SAMPLE DATA — sensor_readings
--  6 rows = 6 data points on the history charts
-- ============================================================
INSERT INTO sensor_readings (temperature, humidity, gas_level, motion, light, pressure, recorded_at) VALUES
  (25.10, 65.0, 280.0, 'Clear',    350.0, 1012.5, NOW() - INTERVAL 5 HOUR),
  (26.30, 63.0, 300.0, 'Clear',    400.0, 1013.0, NOW() - INTERVAL 4 HOUR),
  (27.40, 62.0, 320.0, 'Detected', 480.0, 1013.2, NOW() - INTERVAL 3 HOUR),
  (28.00, 60.0, 310.0, 'Clear',    500.0, 1013.0, NOW() - INTERVAL 2 HOUR),
  (27.80, 61.0, 295.0, 'Clear',    460.0, 1012.8, NOW() - INTERVAL 1 HOUR),
  (27.40, 62.0, 320.0, 'Detected', 480.0, 1013.2, NOW());

-- ============================================================
--  STATIC SAMPLE DATA — motion_log
-- ============================================================
INSERT INTO motion_log (status, detected_at) VALUES
  ('Detected', NOW() - INTERVAL 5 HOUR),
  ('Clear',    NOW() - INTERVAL 4 HOUR),
  ('Detected', NOW() - INTERVAL 3 HOUR),
  ('Clear',    NOW() - INTERVAL 2 HOUR),
  ('Detected', NOW());

-- ---- Verify data was inserted ----
SELECT 'sensor_readings' AS table_name, COUNT(*) AS rows FROM sensor_readings
UNION ALL
SELECT 'motion_log',                    COUNT(*)          FROM motion_log;
