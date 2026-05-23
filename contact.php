<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// ===== CONFIGURATION =====
// SendGrid Email settings - use environment variable for API key (safer)
$sendgrid_api_key = getenv('SENDGRID_API_KEY');
if (!$sendgrid_api_key) {
    http_response_code(500);
    echo json_encode(['error' => 'SendGrid API key not configured']);
    exit;
}

$recipientEmail = 'tirexchangemobile@gmail.com';
$senderEmail = 'noreply@tirexchangemobile.ca';

// Twilio SMS settings (OPTIONAL - remove if not needed)
$twilio_enabled = false; // Set to true if you have Twilio account
$twilio_account_sid = 'YOUR_TWILIO_ACCOUNT_SID'; // Get from Twilio Console
$twilio_auth_token = 'YOUR_TWILIO_AUTH_TOKEN'; // Get from Twilio Console
$twilio_from_number = 'YOUR_TWILIO_PHONE_NUMBER'; // e.g., +15551234567
$sms_to_number = '+17802920818'; // Business owner's phone number

// ===== REQUEST VALIDATION =====
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

// ===== SEND EMAIL VIA SENDGRID =====
$emailSubject = "Tire Xchange request from $name";
$emailBody = "New request from $name\n";
$emailBody .= "Service: $service\n";
$emailBody .= "Contact: $contact\n";
$emailBody .= "Message: " . ($message ?: 'None') . "\n";
$emailBody .= "Sent at: " . date('Y-m-d H:i:s') . "\n";

// Prepare SendGrid API request
$sendgrid_url = 'https://api.sendgrid.com/v3/mail/send';

$email_payload = json_encode([
    'personalizations' => [
        [
            'to' => [['email' => $recipientEmail]],
            'subject' => $emailSubject
        ]
    ],
    'from' => ['email' => $senderEmail],
    'content' => [
        [
            'type' => 'text/plain',
            'value' => $emailBody
        ]
    ],
    'replyTo' => ['email' => $contact]
]);

$ch = curl_init($sendgrid_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_POSTFIELDS, $email_payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $sendgrid_api_key,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$email_sent = ($http_code === 202);

// ===== SEND SMS (Optional) =====
$sms_sent = true; // Default to true if SMS is disabled
if ($twilio_enabled && !empty($twilio_account_sid) && !empty($twilio_auth_token)) {
    $sms_message = "Tire Xchange Request - Customer: $name, Service: $service, Contact: $contact. Message: " . ($message ?: 'None');
    
    // Truncate SMS to 160 chars (SMS limit)
    $sms_message = substr($sms_message, 0, 160);
    
    // Send SMS via Twilio API
    $twilio_url = "https://api.twilio.com/2010-04-01/Accounts/$twilio_account_sid/Messages.json";
    
    $post_data = array(
        'From' => $twilio_from_number,
        'To' => $sms_to_number,
        'Body' => $sms_message
    );
    
    $ch = curl_init($twilio_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
    curl_setopt($ch, CURLOPT_USERPWD, "$twilio_account_sid:$twilio_auth_token");
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    // Check if SMS sent successfully
    $sms_sent = ($http_code === 201);
}

// ===== SEND RESPONSE =====
if ($email_sent) {
    http_response_code(200);
    $message = 'Contact request received and emailed successfully.';
    if ($twilio_enabled) {
        $message .= $sms_sent ? ' SMS sent to business owner.' : ' (SMS failed but email was sent)';
    }
    echo json_encode(['message' => $message]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send email']);
}
