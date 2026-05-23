<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
$name = trim($input['name'] ?? '');
$contact = trim($input['contact'] ?? '');
$service = trim($input['service'] ?? '');
$message = trim($input['message'] ?? '');

if (empty($name) || empty($contact) || empty($service)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// Sanitize input
$name = substr(htmlspecialchars($name, ENT_QUOTES, 'UTF-8'), 0, 80);
$contact = substr(htmlspecialchars($contact, ENT_QUOTES, 'UTF-8'), 0, 120);
$service = substr(htmlspecialchars($service, ENT_QUOTES, 'UTF-8'), 0, 80);
$message = substr(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'), 0, 1000);

// Email configuration
$recipientEmail = 'tirexchangemobile@gmail.com';
$emailSubject = "Tire Xchange request from $name";
$emailBody = "New request from $name\n";
$emailBody .= "Service: $service\n";
$emailBody .= "Contact: $contact\n";
$emailBody .= "Message: " . ($message ?: 'None') . "\n";
$emailBody .= "Sent at: " . date('Y-m-d H:i:s') . "\n";

// Email headers
$headers = "From: noreply@tirexchangemobile.ca\r\n";
$headers .= "Reply-To: $contact\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Send email
if (mail($recipientEmail, $emailSubject, $emailBody, $headers)) {
    http_response_code(200);
    echo json_encode(['message' => 'Contact request received and emailed successfully.']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send email']);
}
