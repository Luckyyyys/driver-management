<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/connection.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;
    $status = $input['status'] ?? null;
    $driver_id = $input['driver_id'] ?? 1; // Replace with actual driver authentication

    if (!$id || !$status) {
        throw new Exception('Missing required fields');
    }

    $stmt = $pdo->prepare("
        UPDATE bookings 
        SET status = ?, 
            driver_id = ?,
            updated_at = NOW()
        WHERE id = ?
    ");

    $stmt->execute([$status, $driver_id, $id]);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}