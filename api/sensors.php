<?php
// ============================================================
//  api/sensors.php — XAMPP / MySQL API Endpoint
//  Returns sensor data as JSON for the frontend dashboard.
//
//  ▸ Place this file in: C:\xampp\htdocs\iot-dashboard\api\
//  ▸ Access via:         http://localhost/iot-dashboard/api/sensors.php
// ============================================================

// ---- Allow cross-origin requests from your frontend ----
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// ---- Database connection settings ----
$host     = "127.0.0.1:3307";
$dbname   = "iot_dashboard";   // your database name
$username = "root";            // default XAMPP MySQL user
$password = "";                // default XAMPP password is empty

// ---- Connect to MySQL ----
$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  http_response_code(500);
  echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
  exit;
}

// ---- Fetch latest sensor reading ----
$sql    = "SELECT * FROM sensor_readings ORDER BY id DESC LIMIT 1";
$result = $conn->query($sql);

if (!$result || $result->num_rows === 0) {
  http_response_code(404);
  echo json_encode(["error" => "No sensor data found in database."]);
  exit;
}

$latest = $result->fetch_assoc();

// ---- Fetch last 6 readings for the history charts ----
$sqlHistory = "SELECT temperature, humidity, gas_level, recorded_at
               FROM sensor_readings
               ORDER BY id DESC LIMIT 6";
$histResult = $conn->query($sqlHistory);

$history = [
  "labels"      => [],
  "temperature" => [],
  "humidity"    => [],
  "gas"         => []
];

// We'll push rows then reverse so oldest is first (left on chart)
$rows = [];
while ($row = $histResult->fetch_assoc()) {
  $rows[] = $row;
}
$rows = array_reverse($rows);

foreach ($rows as $row) {
  // Format time label from the recorded_at timestamp
  $history["labels"][]      = date("H:i", strtotime($row["recorded_at"]));
  $history["temperature"][] = (float) $row["temperature"];
  $history["humidity"][]    = (float) $row["humidity"];
  $history["gas"][]         = (float) $row["gas_level"];
}

// ---- Fetch motion log (last 5 entries) ----
$sqlMotion = "SELECT detected_at, status FROM motion_log ORDER BY id DESC LIMIT 5";
$motResult = $conn->query($sqlMotion);

$motionLog = [];
while ($row = $motResult->fetch_assoc()) {
  $motionLog[] = [
    "time"   => date("H:i", strtotime($row["detected_at"])),
    "status" => $row["status"]
  ];
}

// ---- Build the full response object ----
$response = [
  "temperature" => (float) $latest["temperature"],
  "humidity"    => (float) $latest["humidity"],
  "gas_level"   => (float) $latest["gas_level"],
  "motion"      => $latest["motion"],
  "light"       => (float) $latest["light"],
  "pressure"    => (float) $latest["pressure"],
  "motion_log"  => $motionLog,
  "history"     => $history,
  "fetched_at"  => date("Y-m-d H:i:s")
];

// ---- Send JSON response ----
echo json_encode($response, JSON_PRETTY_PRINT);

$conn->close();
?>
