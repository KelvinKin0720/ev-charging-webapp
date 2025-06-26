<?php
// Include database connection
require_once 'db.php';

// Set response headers
header("Content-Type: application/json; charset=UTF-8");

// Initialize response array
$response = ["type" => "FeatureCollection", "name" => "geotagging", "features" => []];

try {
    // Check the request method
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Initialize the query and parameters
    $query = "SELECT * FROM geo WHERE 1=1";
    $params = [];

    // Check for specific ID
    if (isset($_GET['id'])) {
        $query = "SELECT * FROM geo WHERE id = :id";
        $params[':id'] = $_GET['id'];
    }

    // Add filters for district and location if provided
    if (isset($_GET['district'])) {
        $query .= " AND NAME_OF_DISTRICT_COUNCIL_DISTRICT_EN LIKE :district";
        $params[':district'] = '%' . $_GET['district'] . '%';
    }

    if (isset($_GET['location'])) {
        $query .= " AND LOCATION_EN LIKE :location";
        $params[':location'] = '%' . $_GET['location'] . '%';
    }

    // Prepare and execute the query
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Check if any records are found
    if ($rows) {
        foreach ($rows as $row) {
            $feature = [
                "type" => "Feature",
                "properties" => array_diff_key($row, array_flip(['GeometryLongitude', 'GeometryLatitude']))
            ];

            // Add geometry only if coordinates are available
            if (isset($row['GeometryLongitude']) && isset($row['GeometryLatitude'])) {
                $feature["geometry"] = [
                    "type" => "Point",
                    "coordinates" => [
                        (float)$row['GeometryLongitude'],
                        (float)$row['GeometryLatitude']
                    ]
                ];
            }

            $response["features"][] = $feature;
        }
    } else {
        // If no records are found, return an error response
        http_response_code(404);
        $response = [
            "header" => [
                "success" => false,
                "err_code" => "1006",
                "err_msg" => "No records found matching the criteria"
            ]
        ];
    }
}



     elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Handle POST request (Add a new record)
        $input = json_decode(file_get_contents("php://input"), true);
        $fields = [
            "NAME_OF_DISTRICT_COUNCIL_DISTRICT_EN", "LOCATION_EN", "ADDRESS_EN", "NAME_OF_DISTRICT_COUNCIL_DISTRICT_TC",
            "LOCATION_TC", "ADDRESS_TC", "NAME_OF_DISTRICT_COUNCIL_DISTRICT_SC", "LOCATION_SC", "ADDRESS_SC",
            "STANDARD_BS1363_no", "MEDIUM_IEC62196_no", "MEDIUM_SAEJ1772_no", "MEDIUM_OTHERS_no",
            "QUICK_CHAdeMO_no", "QUICK_CCS_DC_COMBO_no", "QUICK_IEC62196_no", "QUICK_GB_T20234_3_DC__no",
            "QUICK_OTHERS_no", "REMARK_FOR__OTHERS_", "DATA_PATH", "GeometryLongitude", "GeometryLatitude"
        ];

        $placeholders = ":" . implode(", :", $fields);
        $stmt = $pdo->prepare("INSERT INTO geo (" . implode(", ", $fields) . ") VALUES ($placeholders)");

        foreach ($fields as $field) {
            $stmt->bindValue(":$field", $input[$field] ?? null);
        }

        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $response["message"] = "Record added successfully";
        } else {
            throw new Exception("Failed to add record", 1002);
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Handle PUT request (Update a record)
        if (!isset($_GET['id'])) {
            throw new Exception("Missing required parameter: id", 1003);
        }

        $id = $_GET['id'];
        $input = json_decode(file_get_contents("php://input"), true);
        $fields = [
            "NAME_OF_DISTRICT_COUNCIL_DISTRICT_EN", "LOCATION_EN", "ADDRESS_EN", "NAME_OF_DISTRICT_COUNCIL_DISTRICT_TC",
            "LOCATION_TC", "ADDRESS_TC", "NAME_OF_DISTRICT_COUNCIL_DISTRICT_SC", "LOCATION_SC", "ADDRESS_SC",
            "STANDARD_BS1363_no", "MEDIUM_IEC62196_no", "MEDIUM_SAEJ1772_no", "MEDIUM_OTHERS_no",
            "QUICK_CHAdeMO_no", "QUICK_CCS_DC_COMBO_no", "QUICK_IEC62196_no", "QUICK_GB_T20234_3_DC__no",
            "QUICK_OTHERS_no", "REMARK_FOR__OTHERS_", "DATA_PATH", "GeometryLongitude", "GeometryLatitude"
        ];

        $setClause = implode(", ", array_map(fn($f) => "$f = :$f", $fields));
        $stmt = $pdo->prepare("UPDATE geo SET $setClause WHERE id = :id");

        foreach ($fields as $field) {
            $stmt->bindValue(":$field", $input[$field] ?? null);
        }
        $stmt->bindValue(":id", $id);

        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $response["message"] = "Record updated successfully";
        } else {
            throw new Exception("Failed to update record or no changes made", 1004);
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        // Handle DELETE request (Delete a record)
        if (!isset($_GET['id'])) {
            throw new Exception("Missing required parameter: id", 1003);
        }

        $id = $_GET['id'];
        $stmt = $pdo->prepare("DELETE FROM geo WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() > 0) {
            $response["header"] = [
                "success" => true,
                "message" => "EV Charger record deleted successfully",
                "err_code" => "0000",
                "err_msg" => "No error found"
            ];
        } else {
            throw new Exception("Failed to delete EV Charger record or record not found", 1005);
        }
    } else {
        http_response_code(405);
        throw new Exception("Invalid request method", 405);
    }
} catch (Exception $e) {
    $response = [
        "header" => [
            "success" => false,
            "err_code" => $e->getCode(),
            "err_msg" => $e->getMessage()
        ]
    ];
} finally {
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
?>



