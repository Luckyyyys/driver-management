<?php
require_once __DIR__ . '/connection.php';

try {
    // First insert some sample customers
    $customerNames = ['John Doe', 'Maria Garcia', 'James Smith', 'Sarah Johnson', 'Mike Wilson'];
    $customerIds = [];
    
    $stmt = $pdo->prepare("INSERT INTO customers (name) VALUES (?, ?)");
    foreach ($customerNames as $name) {
        $phone = '09' . rand(100000000, 999999999); // Random PH mobile number
        $stmt->execute([$name, $phone]);
        $customerIds[] = $pdo->lastInsertId();
    }

    // Now insert sample bookings
    $locations = [
        'SM Mall of Asia', 'Bonifacio Global City', 'Makati CBD', 
        'NAIA Terminal 3', 'Quezon City Circle', 'Ortigas Center',
        'Greenhills Shopping Center', 'UP Diliman', 'Eastwood City'
    ];

    $stmt = $pdo->prepare("
        INSERT INTO bookings 
        (customer_id, amount, status, created_at, completed_at, pickup_location, dropoff_location) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    // Insert 20 sample bookings across different dates
    for ($i = 0; $i < 20; $i++) {
        $customerId = $customerIds[array_rand($customerIds)];
        $amount = rand(150, 1000);
        $status = rand(0, 10) > 2 ? 'completed' : 'pending'; // 70% completed
        
        // Random date within last 6 months
        $date = date('Y-m-d H:i:s', strtotime("-" . rand(0, 180) . " days"));
        $completedAt = $status === 'completed' ? date('Y-m-d H:i:s', strtotime($date . " +" . rand(15, 90) . " minutes")) : null;
        
        // Random pickup/dropoff
        $pickup = $locations[array_rand($locations)];
        $dropoff = $locations[array_rand($locations)];
        
        $stmt->execute([
            $customerId,
            $amount,
            $status,
            $date,
            $completedAt,
            $pickup,
            $dropoff
        ]);
    }

    echo "Successfully inserted sample data!\n";
    echo "Added " . count($customerNames) . " customers and 20 bookings";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}