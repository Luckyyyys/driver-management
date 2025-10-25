<?php
header('Content-Type: application/json');
require_once 'connection.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? 0;
    $user_id = 1; // Replace with actual user authentication

    $stmt = $pdo->prepare("
        DELETE FROM payment_methods 
        WHERE id = ? AND user_id = ?
    ");
    
    $stmt->execute([$id, $user_id]);

    if ($stmt->rowCount() === 0) {
        throw new Exception('Payment method not found');
    }

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}