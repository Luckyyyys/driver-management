<?php
header('Content-Type: application/json');
require_once 'connection.php';

try {
    // Get all messages with user information
    $stmt = $pdo->query("
        SELECT 
            m.id,
            m.message,
            m.created_at,
            m.read_at,
            s.first_name as sender_name,
            r.first_name as receiver_name,
            s.user_id as sender_id,
            r.user_id as receiver_id
        FROM messages m
        JOIN users s ON m.sender_id = s.user_id
        JOIN users r ON m.receiver_id = r.user_id
        ORDER BY m.created_at DESC
    ");

    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'messages' => $messages]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to read messages: ' . $e->getMessage()]);
}