<?php
header('Content-Type: application/json');
require_once 'connection.php';

try {
    $stmt = $pdo->query("
        SELECT DISTINCT 
            u.user_id,
            u.first_name,
            u.last_name,
            u.avatar_initials,
            m.message as last_message,
            m.created_at as last_message_time,
            CASE WHEN m.read_at IS NULL 
                 AND m.receiver_id = 1 THEN 1 
                 ELSE 0 
            END as unread
        FROM users u
        JOIN messages m ON (u.user_id = m.sender_id OR u.user_id = m.receiver_id)
        WHERE (m.sender_id = 1 OR m.receiver_id = 1)
        AND u.user_id != 1
        ORDER BY m.created_at DESC
    ");
    
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}