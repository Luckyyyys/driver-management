<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/connection.php';

try {
    $stmt = $pdo->query("
        SELECT id, full_name, email, service_status, account_status, joined_at
        FROM drivers
        ORDER BY joined_at DESC
        LIMIT 1000
    ");
    $rows = $stmt->fetchAll();
    echo json_encode($rows);
} catch (PDOException $e) {
    http_response_code(500);
    error_log('get_drivers error: ' . $e->getMessage());
    echo json_encode(['error' => 'Failed to fetch drivers']);
}