<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get the JSON input
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate input
if (!$data || !isset($data['name']) || !isset($data['email']) || !isset($data['subject']) || !isset($data['message'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields', 'message' => 'Please fill in all fields']);
    exit;
}

$name = trim($data['name']);
$email = trim($data['email']);
$subject = trim($data['subject']);
$message = trim($data['message']);

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email', 'message' => 'Please enter a valid email address']);
    exit;
}

// Sanitize inputs
$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$email = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$subject = htmlspecialchars($subject, ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

// Email configuration
$to = 'contact@romaintomlinson.com';
$headers = array(
    'From' => 'noreply@' . $_SERVER['HTTP_HOST'],
    'Reply-To' => $email,
    'X-Mailer' => 'PHP/' . phpversion(),
    'Content-Type' => 'text/html; charset=UTF-8',
    'MIME-Version' => '1.0'
);

// Create email body
$emailSubject = "DayFuse Contact Form: " . $subject;
$emailBody = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>DayFuse Contact Form</title>
</head>
<body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;'>
        <h1 style='margin: 0; font-size: 24px;'>DayFuse</h1>
        <p style='margin: 10px 0 0 0; opacity: 0.9;'>Contact Form Submission</p>
    </div>
    
    <div style='background: #f8fafc; padding: 20px; border: 1px solid #e5e7eb; border-top: none;'>
        <p><strong>Name:</strong> {$name}</p>
        <p><strong>Email:</strong> <a href='mailto:{$email}'>{$email}</a></p>
        <p><strong>Subject:</strong> {$subject}</p>
    </div>
    
    <div style='background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-top: none;'>
        <h3 style='margin-top: 0; color: #1f2937;'>Message:</h3>
        <div style='line-height: 1.6; color: #374151; white-space: pre-wrap;'>{$message}</div>
    </div>
    
    <div style='background: #eff6ff; padding: 15px; border: 1px solid #dbeafe; border-top: none; border-radius: 0 0 8px 8px; font-size: 14px; color: #374151;'>
        <p style='margin: 5px 0;'><strong>Sent from:</strong> DayFuse Contact Form</p>
        <p style='margin: 5px 0;'><strong>Time:</strong> " . date('Y-m-d H:i:s T') . "</p>
        <p style='margin: 5px 0;'><strong>IP Address:</strong> " . $_SERVER['REMOTE_ADDR'] . "</p>
        <p style='margin: 5px 0;'><strong>User Agent:</strong> " . (isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'Unknown') . "</p>
    </div>
</body>
</html>
";

// Convert headers array to string
$headerString = '';
foreach ($headers as $key => $value) {
    $headerString .= $key . ': ' . $value . "\r\n";
}

// Send email
$success = mail($to, $emailSubject, $emailBody, $headerString);

if ($success) {
    // Send auto-reply to user
    $autoReplySubject = "Thank you for contacting DayFuse - We received your message!";
    $autoReplyBody = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <title>Thank you - DayFuse</title>
    </head>
    <body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
        <div style='text-align: center; padding: 20px; background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; border-radius: 8px 8px 0 0;'>
            <h1 style='margin: 0; font-size: 24px;'>DayFuse</h1>
            <p style='margin: 10px 0 0 0; opacity: 0.9;'>Productivity Simplified</p>
        </div>
        
        <div style='padding: 30px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;'>
            <h2 style='color: #1f2937; margin-top: 0;'>Hi {$name}!</h2>
            
            <p style='line-height: 1.6; color: #374151;'>
                Thank you for reaching out to us through the DayFuse contact form!
            </p>
            
            <p style='line-height: 1.6; color: #374151;'>
                We've received your message and will get back to you <strong>within 24 hours</strong>. Our team reviews all inquiries personally to provide you with the best possible assistance.
            </p>
            
            <div style='background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;'>
                <p style='margin: 0; color: #1e40af;'>
                    <strong>💡 Pro Tip:</strong> While you wait, explore all of DayFuse's productivity features including task scheduling, push notifications, and calendar integration!
                </p>
            </div>
            
            <p style='line-height: 1.6; color: #374151;'>
                If you have any urgent questions, you can also reach us directly at 
                <a href='mailto:contact@romaintomlinson.com' style='color: #2563eb; text-decoration: none;'>contact@romaintomlinson.com</a>.
            </p>
            
            <p style='line-height: 1.6; color: #374151;'>
                Best regards,<br>
                <strong>The DayFuse Team</strong>
            </p>
        </div>
        
        <div style='text-align: center; padding: 15px; color: #6b7280; font-size: 12px;'>
            This is an automated confirmation email.
        </div>
    </body>
    </html>
    ";
    
    $autoReplyHeaders = array(
        'From' => 'noreply@' . $_SERVER['HTTP_HOST'],
        'X-Mailer' => 'PHP/' . phpversion(),
        'Content-Type' => 'text/html; charset=UTF-8',
        'MIME-Version' => '1.0'
    );
    
    $autoReplyHeaderString = '';
    foreach ($autoReplyHeaders as $key => $value) {
        $autoReplyHeaderString .= $key . ': ' . $value . "\r\n";
    }
    
    // Send auto-reply (don't fail if this fails)
    mail($email, $autoReplySubject, $autoReplyBody, $autoReplyHeaderString);
    
    echo json_encode([
        'success' => true,
        'message' => 'Your message has been sent successfully! We\'ll get back to you within 24 hours.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to send email',
        'message' => 'We couldn\'t send your message at this time. Please try again later or email us directly at contact@romaintomlinson.com'
    ]);
}
?>