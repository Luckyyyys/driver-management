<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/connection.php';

try {
    // Total applications submitted today
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM applications WHERE DATE(submitted_at) = CURDATE()");
    $stmt->execute();
    $totalToday = (int) $stmt->fetchColumn();

    // Pending applications submitted today (case-insensitive, fuzzy match)
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM applications WHERE DATE(submitted_at) = CURDATE() AND LOWER(status) LIKE '%pend%'");
    $stmt->execute();
    $pendingToday = (int) $stmt->fetchColumn();

    // Approved applications submitted today (case-insensitive, fuzzy match)
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM applications WHERE DATE(submitted_at) = CURDATE() AND LOWER(status) LIKE '%approv%'");
    $stmt->execute();
    $approvedToday = (int) $stmt->fetchColumn();

    echo json_encode([
        'submitted_today' => $totalToday,
        'pending_today' => $pendingToday,
        'approved_today' => $approvedToday
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    error_log('get_application_stats error: ' . $e->getMessage());
    echo json_encode(['error' => 'Failed to fetch application stats']);
}