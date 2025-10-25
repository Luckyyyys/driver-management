<?php
header('Content-Type: application/json');
require_once 'connection.php';

try {
    $user_id = 1; // Replace with actual user authentication

    // Get wallet balance
    $stmt = $pdo->prepare("
        SELECT w.*, u.first_name, u.last_name, u.email, u.phone
        FROM wallets w
        JOIN users u ON w.user_id = u.user_id
        WHERE w.user_id = ?
    ");
    $stmt->execute([$user_id]);
    $wallet = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get payment methods
    $stmt = $pdo->prepare("
        SELECT * FROM payment_methods 
        WHERE user_id = ?
    ");
    $stmt->execute([$user_id]);
    $payment_methods = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get recent transactions
    $stmt = $pdo->prepare("
        SELECT t.* 
        FROM transactions t
        JOIN wallets w ON t.wallet_id = w.id
        WHERE w.user_id = ?
        ORDER BY t.created_at DESC
        LIMIT 10
    ");
    $stmt->execute([$user_id]);
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'wallet' => $wallet,
        'payment_methods' => $payment_methods,
        'transactions' => $transactions
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}