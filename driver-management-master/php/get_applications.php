<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

require_once __DIR__ . '/connection.php';

try {
    $stmt = $pdo->query("
        SELECT id, full_name, submitted_at, status, remarks, updated_by
        FROM applications
        ORDER BY submitted_at DESC
        LIMIT 1000
    ");
    $rows = $stmt->fetchAll();
    echo json_encode($rows);
} catch (PDOException $e) {
    http_response_code(500);
    error_log('get_applications error: ' . $e->getMessage());
    echo json_encode(['error' => 'Failed to fetch applications']);
}