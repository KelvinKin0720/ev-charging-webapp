<?php
header('Access-Control-Allow-Origin: *');

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

header('Access-Control-Allow-Credentials: true');
include 'db.php';

$id = $_GET['id'] ?? null;

if ($id) {
    $sql = "DELETE FROM geo WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':id', $id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Record deleted successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete record.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'No id provided.']);
}
?>
