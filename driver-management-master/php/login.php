<?php
require_once __DIR__ . '/connection.php';

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? $_POST['email'] ?? null;
$password = $input['password'] ?? $_POST['password'] ?? null;

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password required']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT user_id, email, password_hash, first_name, last_name, role FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        exit;
    }

    $stored = $user['password_hash'];

    $ok = false;
    // Accept SHA256 stored hashes or plain password (fallback)
    if ($stored) {
        if (hash('sha256', $password) === $stored) $ok = true;
        if (!$ok && password_verify($password, $stored)) $ok = true;
    } else {
        // if no hash stored, try direct compare with password column (rare)
        $ok = ($password === $user['password_hash']);
    }

    if (!$ok) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        exit;
    }

    // Successful login: return minimal user info and redirect path based on role
    $role = $user['role'] ?? 'user';
    $redirect = $role === 'admin' ? 'admin_account.html' : ($role === 'driver' ? 'dashboard.html' : 'dashboard.html');

    echo json_encode([
        'success' => true,
        'user' => [
            'user_id' => $user['user_id'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'role' => $role
        ],
        'redirect' => $redirect
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}