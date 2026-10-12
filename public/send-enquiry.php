<?php
/**
 * send-enquiry.php — receives the website's contact / proposal form and emails it.
 *
 * Single self-contained file, PHP 7.4+, no Composer. Upload it to the web root next to index.html
 * (Next copies public/ into the build output, so `npm run build` produces out/send-enquiry.php).
 * Every response is JSON. PHP errors are never printed; they go to error_log.
 */

/* ------------------------------------------------------------------ settings ---- */

// Where enquiries are delivered. CHANGE HERE to change the recipient.
const RECIPIENT = 'kailas@proven-delivery.com';

// The "From" address. It MUST be an address on the site's own domain, otherwise SPF/DKIM
// alignment fails and mail is likely to land in spam. CHANGE HERE if the domain changes.
const SENDER_ADDRESS = 'no-reply@proven-delivery.com';
const SENDER_NAME = 'Proven Delivery Services Website';

// Hosts allowed in the Origin / Referer header (cheap cross-site posting guard).
// 'localhost' is for testing; remove it once the site is live if you like.
const ALLOWED_HOSTS = ['proven-delivery.com', 'www.proven-delivery.com', 'localhost'];

// 'mail' = PHP's mail(). If mail() proves unreliable on the host, switch to SMTP:
//   1. composer require phpmailer/phpmailer   (or upload PHPMailer's src/ folder)
//   2. set SEND_MODE to 'smtp' and fill in the block marked "SMTP via PHPMailer" in send_message().
const SEND_MODE = 'mail';

const MAX_BODY_BYTES = 20480;          // 20 KB
const MIN_ELAPSED_MS = 3000;           // faster than this = a bot
const RATE_LIMIT = 5;                  // accepted submissions per IP ...
const RATE_WINDOW = 3600;              // ... per this many seconds

const SERVICES = [
    'B2B Delivery Services',
    'E-Commerce Delivery',
    'Food and Restaurant Delivery',
    'Q-Commerce Delivery',
    'Pharmacy Delivery',
    'Retail Delivery',
    'Corporate Delivery',
    'Professional Rider Solutions',
    'Fleet Management',
];

/* ------------------------------------------------------------------- helpers ---- */

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);
mb_internal_encoding('UTF-8');

function respond($code, $data)
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data);
    exit;
}

/** Make a string valid UTF-8 and trim it. */
function utf8($v)
{
    if (!is_string($v)) {
        return '';
    }
    if (!mb_check_encoding($v, 'UTF-8')) {
        $v = mb_convert_encoding($v, 'UTF-8', 'UTF-8');
    }
    return trim($v);
}

/** Single-line value: CR, LF and every other control character removed (header-injection safe). */
function line($v)
{
    return trim(preg_replace('/[\x00-\x1F\x7F]+/', ' ', utf8($v)));
}

/** Multi-line value (the message body only, never used in a header). */
function block($v)
{
    $v = str_replace(["\r\n", "\r"], "\n", utf8($v));
    return preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $v);
}

function origin_ok()
{
    foreach (['HTTP_ORIGIN', 'HTTP_REFERER'] as $key) {
        if (!isset($_SERVER[$key]) || $_SERVER[$key] === '') {
            continue;
        }
        $host = parse_url($_SERVER[$key], PHP_URL_HOST);
        if (!is_string($host) || !in_array(strtolower($host), ALLOWED_HOSTS, true)) {
            return false;
        }
    }
    return true;
}

/* Rate limit: small files in the system temp dir, one per hashed IP, each line a timestamp. */
function rate_dir()
{
    $dir = rtrim(sys_get_temp_dir(), '/\\') . DIRECTORY_SEPARATOR . 'pds-enquiry-rl';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    return $dir;
}

function rate_file()
{
    // REMOTE_ADDR only: X-Forwarded-For is client-controlled. Behind a trusted proxy, adapt this.
    $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
    return rate_dir() . DIRECTORY_SEPARATOR . hash('sha256', $ip . '|pds-enquiry') . '.log';
}

function rate_clean()
{
    $cutoff = time() - 2 * RATE_WINDOW;
    foreach ((array) glob(rate_dir() . DIRECTORY_SEPARATOR . '*.log') as $f) {
        if (@filemtime($f) < $cutoff) {
            @unlink($f);
        }
    }
}

function rate_recent()
{
    $f = rate_file();
    if (!is_file($f)) {
        return 0;
    }
    $now = time();
    $n = 0;
    foreach ((array) @file($f, FILE_IGNORE_NEW_LINES) as $t) {
        if ((int) $t > $now - RATE_WINDOW) {
            $n++;
        }
    }
    return $n;
}

function rate_record()
{
    $f = rate_file();
    $now = time();
    $keep = [];
    foreach ((array) @file($f, FILE_IGNORE_NEW_LINES) as $t) {
        if ((int) $t > $now - RATE_WINDOW) {
            $keep[] = (int) $t;
        }
    }
    $keep[] = $now;
    @file_put_contents($f, implode("\n", $keep) . "\n", LOCK_EX);
}

/** Display name for a header: quoted ASCII, or an RFC 2047 encoded-word for anything else. */
function header_name($name)
{
    $name = line($name);
    if ($name === '') {
        return '';
    }
    if (preg_match('/[^\x20-\x7E]/', $name)) {
        return mb_encode_mimeheader($name, 'UTF-8', 'B');
    }
    return '"' . addcslashes($name, "\"\\") . '"';
}

function send_message($subject, $body, $replyName, $replyEmail)
{
    $from = header_name(SENDER_NAME) . ' <' . SENDER_ADDRESS . '>';
    $reply = ($replyName !== '' ? header_name($replyName) . ' ' : '') . '<' . $replyEmail . '>';

    if (SEND_MODE === 'smtp') {
        /* ---- SMTP via PHPMailer (not required now; uncomment and configure if mail() is unreliable) ----
        require __DIR__ . '/phpmailer/src/Exception.php';
        require __DIR__ . '/phpmailer/src/PHPMailer.php';
        require __DIR__ . '/phpmailer/src/SMTP.php';
        $m = new PHPMailer\PHPMailer\PHPMailer(true);
        $m->isSMTP();
        $m->Host       = 'smtp.example.com';
        $m->SMTPAuth   = true;
        $m->Username   = 'no-reply@proven-delivery.com';
        $m->Password   = 'SET-VIA-SERVER-CONFIG';   // do not commit real credentials
        $m->SMTPSecure = 'tls';
        $m->Port       = 587;
        $m->CharSet    = 'UTF-8';
        $m->setFrom(SENDER_ADDRESS, SENDER_NAME);
        $m->addAddress(RECIPIENT);
        $m->addReplyTo($replyEmail, $replyName);
        $m->Subject = $subject;
        $m->Body    = $body;
        $m->isHTML(false);
        $m->send();
        return true;
        ---- */
        error_log('send-enquiry: SEND_MODE is smtp but the PHPMailer block is not enabled');
        return false;
    }

    $headers = [
        'From: ' . $from,
        'Reply-To: ' . $reply,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];
    // -f makes the envelope sender match the site's domain (better SPF / deliverability).
    return mail(RECIPIENT, mb_encode_mimeheader($subject, 'UTF-8', 'B'), $body, implode("\r\n", $headers), '-f' . SENDER_ADDRESS);
}

/* ------------------------------------------------------------------ request ---- */

if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false]);
}

if (!origin_ok()) {
    respond(403, ['ok' => false]);
}

if (isset($_SERVER['CONTENT_LENGTH']) && (int) $_SERVER['CONTENT_LENGTH'] > MAX_BODY_BYTES) {
    respond(413, ['ok' => false]);
}
$raw = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
if ($raw === false || strlen($raw) > MAX_BODY_BYTES) {
    respond(413, ['ok' => false]);
}

$in = null;
if ($raw !== '') {
    $decoded = json_decode($raw, true);
    if (is_array($decoded)) {
        $in = $decoded;
    }
}
if ($in === null && !empty($_POST)) {
    $in = $_POST; // form-encoded fallback
}
if ($in === null) {
    respond(400, ['ok' => false]);
}

/* Honeypot / too-fast submissions: pretend it worked, send nothing. */
$bot = isset($in['botcheck']) ? $in['botcheck'] : '';
$elapsed = isset($in['elapsed_ms']) && is_numeric($in['elapsed_ms']) ? (float) $in['elapsed_ms'] : 0;
if ((is_string($bot) ? trim($bot) !== '' : !empty($bot)) || $elapsed < MIN_ELAPSED_MS) {
    respond(200, ['ok' => true]);
}

rate_clean();
if (rate_recent() >= RATE_LIMIT) {
    header('Retry-After: ' . RATE_WINDOW);
    respond(429, ['ok' => false]);
}

/* Validate. */
$name = line(isset($in['name']) ? $in['name'] : '');
$company = line(isset($in['company']) ? $in['company'] : '');
$email = line(isset($in['email']) ? $in['email'] : '');
$phone = line(isset($in['phone']) ? $in['phone'] : '');
$service = line(isset($in['service']) ? $in['service'] : '');
$type = line(isset($in['enquiry_type']) ? $in['enquiry_type'] : '');
$message = trim(block(isset($in['message']) ? $in['message'] : ''));
$page = mb_substr(line(isset($in['page']) ? $in['page'] : ''), 0, 200);

$errors = [];
if ($name === '' || mb_strlen($name) > 100) {
    $errors['name'] = 'Please enter your name (up to 100 characters).';
}
if ($email === '' || strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please enter a valid email address.';
}
if ($phone !== '' && (mb_strlen($phone) > 30 || !preg_match('/^[0-9 +\-()]+$/', $phone))) {
    $errors['phone'] = 'Use digits, spaces and + - ( ) only.';
}
if (mb_strlen($company) > 120) {
    $errors['company'] = 'Please use 120 characters or fewer.';
}
if ($service !== '' && !in_array($service, SERVICES, true)) {
    $errors['service'] = 'Please choose one of the listed services.';
}
if ($type !== 'contact' && $type !== 'proposal') {
    $errors['enquiry_type'] = 'Unknown enquiry type.';
}
$mlen = mb_strlen($message);
if ($mlen < 10 || $mlen > 3000) {
    $errors['message'] = 'Please write between 10 and 3000 characters.';
}
if ($errors) {
    respond(422, ['ok' => false, 'errors' => $errors]);
}

/* Compose. */
$subject = 'New enquiry from proven-delivery.com';
if ($type === 'proposal') {
    $subject .= ' - Business proposal request';
}
if ($service !== '') {
    $subject .= ' - ' . $service;
}

$when = new DateTime('now', new DateTimeZone('Asia/Dubai'));
$ip = isset($_SERVER['REMOTE_ADDR']) ? line($_SERVER['REMOTE_ADDR']) : 'unknown';
$ua = mb_substr(line(isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : ''), 0, 200);

$body = implode("\n", [
    'Enquiry type: ' . ($type === 'proposal' ? 'Business proposal request' : 'Contact request'),
    'Name: ' . $name,
    'Company: ' . ($company !== '' ? $company : '-'),
    'Email: ' . $email,
    'Phone: ' . ($phone !== '' ? $phone : '-'),
    'Service: ' . ($service !== '' ? $service : '-'),
    '',
    'Message:',
    $message,
    '',
    '----------------------------------------',
    'Submitted: ' . $when->format('Y-m-d H:i:s') . ' (Asia/Dubai)',
    'Page: ' . ($page !== '' ? $page : '-'),
    'IP: ' . $ip,
    'User agent: ' . ($ua !== '' ? $ua : '-'),
    '',
]);

/* Count it, then send. */
rate_record();

/* No auto-reply to the visitor. If one is ever wanted, send a short plain-text thank-you here
   to $email (never copy the visitor's message into a header):
   // mail($email, 'We received your enquiry', "Thank you...", 'From: ' . SENDER_NAME . ' <' . SENDER_ADDRESS . '>', '-f' . SENDER_ADDRESS);
*/

if (!send_message($subject, $body, $name, $email)) {
    error_log('send-enquiry: mail() returned false for an enquiry from ' . $ip);
    respond(500, ['ok' => false]);
}
respond(200, ['ok' => true]);
