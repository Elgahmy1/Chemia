<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Get the input data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['type']) || !isset($input['data'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid input data']);
    exit;
}

$type = $input['type'];
$data = $input['data'];

// Validate the data type
$allowedTypes = ['programs', 'achievements', 'administrators'];
if (!in_array($type, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid data type']);
    exit;
}

// Simple authentication check (optional - you can remove this if not needed)
$isAuthenticated = isset($input['authenticated']) && $input['authenticated'] === true;
if (!$isAuthenticated) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Authentication required']);
    exit;
}

// Prepare the file path
$filename = "data/{$type}.json";

// Create the data structure
$jsonData = [
    $type => $data
];

// Convert to JSON with pretty formatting
$jsonString = json_encode($jsonData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

// Attempt to write the file
if (file_put_contents($filename, $jsonString)) {
    echo json_encode(['success' => true, 'message' => 'Data saved successfully']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to write file']);
}
?>
