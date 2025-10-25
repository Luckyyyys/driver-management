<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/connection.php';

$id = $_GET['id'] ?? null;
if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing id']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM drivers WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    echo json_encode($row ?: null);
} catch (PDOException $e) {
    http_response_code(500);
    error_log('get_driver error: ' . $e->getMessage());
    echo json_encode(['error' => 'Failed to fetch driver']);
}                                                                           