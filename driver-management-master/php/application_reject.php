<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once __DIR__ . '/connection.php';

$id = $_GET['id'] ?? null;
$input = json_decode(file_get_contents('php://input'), true);
$remarks = $input['remarks'] ?? null;
$updatedBy = $input['updatedBy'] ?? 'admin';

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing id']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE applications SET status = ?, remarks = ?, updated_by = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute(['Rejected', $remarks, $updatedBy, $id]);
    echo json_encode(['ok' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    error_log('application_reject error: ' . $e->getMessage());
    echo json_encode(['error' => 'Failed to reject application']);
}