<?php
$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'charge';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
//    echo "Connection successful";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>