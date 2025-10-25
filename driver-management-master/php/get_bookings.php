<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/connection.php';

try {
    $status = $_GET['status'] ?? 'available'; // available, ongoing, or history

    $query = match($status) {
        'ongoing' => "
            SELECT b.*, c.name as customer_name, c.phone 
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            WHERE b.status IN ('accepted', 'pickup', 'inprogress')
            ORDER BY b.created_at DESC
        ",
        'history' => "
            SELECT b.*, c.name as customer_name, c.phone 
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            WHERE b.status IN ('completed', 'cancelled')
            ORDER BY b.created_at DESC
        ",
        default => "
            SELECT b.*, c.name as customer_name, c.phone 
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            WHERE b.status = 'pending'
            ORDER BY b.created_at DESC
        "
    };

    $stmt = $pdo->query($query);
    $bookings = $stmt->fetchAll();

    // Format response
    $formatted = array_map(function($booking) {
        return [
            'id' => $booking['id'],
            'customer_name' => $booking['customer_name'],
            'phone' => $booking['phone'],
            'pickup_location' => $booking['pickup_location'],
            'dropoff_location' => $booking['dropoff_location'],
            'amount' => $booking['amount'],
            'status' => $booking['status'],
            'note' => $booking['note'] ?? '',
            'created_at' => $booking['created_at'],
            'distance' => $booking['distance'] ?? '0',
        ];
    }, $bookings);

    echo json_encode($formatted);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch bookings']);
}