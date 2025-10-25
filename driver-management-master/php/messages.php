<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $action = $_GET['action'] ?? '';

    switch($action) {
        case 'get_conversations':
            $user_id = $_GET['user_id'] ?? 1; // Replace with actual auth
            $stmt = $pdo->prepare("
                SELECT DISTINCT 
                    u.id, 
                    u.name,
                    m.message as last_message,
                    m.created_at as message_time,
                    u.avatar_initials,
                    CASE WHEN m.read_at IS NULL AND m.receiver_id = ? THEN 1 ELSE 0 END as unread
                FROM users u
                JOIN messages m ON (u.id = m.sender_id OR u.id = m.receiver_id)
                WHERE (m.sender_id = ? OR m.receiver_id = ?)
                AND u.id != ?
                ORDER BY m.created_at DESC
            ");
            $stmt->execute([$user_id, $user_id, $user_id, $user_id]);
            echo json_encode($stmt->fetchAll());
            break;

        case 'get_messages':
            $user_id = $_GET['user_id'] ?? 1;
            $other_id = $_GET['other_id'] ?? null;
            
            if (!$other_id) {
                throw new Exception('Missing other_id parameter');
            }

            $stmt = $pdo->prepare("
                SELECT 
                    m.*,
                    u.name as sender_name,
                    u.avatar_initials
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE (m.sender_id = ? AND m.receiver_id = ?)
                   OR (m.sender_id = ? AND m.receiver_id = ?)
                ORDER BY m.created_at ASC
            ");
            $stmt->execute([$user_id, $other_id, $other_id, $user_id]);
            
            // Mark messages as read
            $pdo->prepare("
                UPDATE messages 
                SET read_at = NOW() 
                WHERE sender_id = ? AND receiver_id = ? AND read_at IS NULL
            ")->execute([$other_id, $user_id]);
            
            echo json_encode($stmt->fetchAll());
            break;

        case 'send_message':
            $input = json_decode(file_get_contents('php://input'), true);
            $sender_id = $input['sender_id'] ?? 1; // Replace with actual auth
            $receiver_id = $input['receiver_id'] ?? null;
            $message = $input['message'] ?? null;

            if (!$receiver_id || !$message) {
                throw new Exception('Missing required fields');
            }

            $stmt = $pdo->prepare("
                INSERT INTO messages (sender_id, receiver_id, message)
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$sender_id, $receiver_id, $message]);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            break;

        default:
            throw new Exception('Invalid action');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
