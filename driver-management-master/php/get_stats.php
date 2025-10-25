<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/connection.php';

try {
    // total drivers
    $stmt = $pdo->query("SELECT COUNT(*) AS total FROM drivers");
    $total = (int) $stmt->fetchColumn();

    // disabled accounts (case-insensitive)
    $stmt = $pdo->query("SELECT COUNT(*) AS disabled FROM drivers WHERE LOWER(account_status) = 'disabled'");
    $disabled = (int) $stmt->fetchColumn();

    // serviceable drivers: try to cover common values (case-insensitive) and fuzzy 'service'
    $stmt = $pdo->query("
        SELECT COUNT(*) AS serviceable
        FROM drivers
        WHERE LOWER(service_status) IN ('serviceable','active')
           OR LOWER(service_status) LIKE '%service%'
    ");
    $serviceable = (int) $stmt->fetchColumn();

    echo json_encode([
        'total' => $total,
        'disabled' => $disabled,
        'serviceable' => $serviceable
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    error_log('get_stats error: ' . $e->getMessage());
    echo json_encode(['error' => 'Failed to fetch stats']);
}