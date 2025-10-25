<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/connection.php';

try {

    $stmt = $pdo->query("SELECT COALESCE(SUM(amount), 0) as total FROM bookings WHERE status = 'completed'");
    $totalEarnings = $stmt->fetchColumn();

    $stmt = $pdo->query("SELECT COALESCE(SUM(amount), 0) as today FROM bookings WHERE status = 'completed' AND DATE(completed_at) = CURDATE()");
    $todayEarnings = $stmt->fetchColumn();

    $stmt = $pdo->query("SELECT COUNT(*) as total FROM bookings WHERE status = 'completed'");
    $totalTrips = $stmt->fetchColumn();


    $stmt = $pdo->query("
        SELECT b.*, c.name as customer_name 
        FROM bookings b
        LEFT JOIN customers c ON b.customer_id = c.id
        ORDER BY b.created_at DESC
        LIMIT 5
    ");
    $recentBookings = $stmt->fetchAll();

    $stmt = $pdo->query("
        SELECT DATE_FORMAT(completed_at, '%Y-%m') as month,
               COALESCE(SUM(amount), 0) as total
        FROM bookings 
        WHERE status = 'completed'
        AND completed_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(completed_at, '%Y-%m')
        ORDER BY month DESC
    ");
    $monthlyEarnings = $stmt->fetchAll();

    echo json_encode([
        'total_earnings' => $totalEarnings,
        'today_earnings' => $todayEarnings,
        'total_trips' => $totalTrips,
        'recent_bookings' => $recentBookings,
        'monthly_earnings' => $monthlyEarnings
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log('Dashboard stats error: ' . $e->getMessage());
    echo json_encode(['error' => 'Failed to fetch dashboard stats']);
}