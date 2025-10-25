<?php
header('Content-Type: application/json');
require_once 'connection.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    $amount = floatval($input['amount'] ?? 0);
    $payment_method = $input['payment_method'] ?? '';
    $user_id = 1; // Replace with actual user authentication

    if ($amount <= 0) {
        throw new Exception('Invalid amount');
    }

    $pdo->beginTransaction();

    // Get wallet
    $stmt = $pdo->prepare("SELECT id, balance FROM wallets WHERE user_id = ? FOR UPDATE");
    $stmt->execute([$user_id]);
    $wallet = $stmt->fetch();

    if (!$wallet) {
        throw new Exception('Wallet not found');
    }

    switch ($action) {
        case 'topup':
            if ($amount < 100 || $amount > 2000) {
                throw new Exception('Amount must be between ₱100 and ₱2,000');
            }
            $new_balance = $wallet['balance'] + $amount;
            break;

        case 'cashout':
            if ($amount < 50) {
                throw new Exception('Minimum cash-out amount is ₱50');
            }
            if ($wallet['balance'] < $amount) {
                throw new Exception('Insufficient balance');
            }
            $new_balance = $wallet['balance'] - $amount;
            break;

        default:
            throw new Exception('Invalid action');
    }

    // Update wallet balance
    $stmt = $pdo->prepare("UPDATE wallets SET balance = ? WHERE id = ?");
    $stmt->execute([$new_balance, $wallet['id']]);

    // Record transaction
    $stmt = $pdo->prepare("
        INSERT INTO transactions (wallet_id, type, amount, payment_method, status)
        VALUES (?, ?, ?, ?, 'completed')
    ");
    $stmt->execute([$wallet['id'], $action, $amount, $payment_method]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'new_balance' => $new_balance
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}