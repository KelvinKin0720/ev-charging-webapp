<?php
// 允许来自所有域的跨域请求（*表示所有域）
header('Access-Control-Allow-Origin: *');

// 如果你需要允许特定的方法
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

// 如果你需要允许某些请求头
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// 允许浏览器在预检请求（OPTIONS）时不做身份验证
header('Access-Control-Allow-Credentials: true');

// 如果是 OPTIONS 请求，直接返回 200，不再继续执行后面的代码

// 引入数据库连接文件
include 'db.php';
if (!$pdo) {
    die("数据库连接失败！");
}

// 处理获取唯一值（Select Unique Values）操作
if ($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['action']) && $_GET['action'] == 'get-unique-values') {
    // 查询唯一值
    $sql = "SELECT DISTINCT NAME_OF_DISTRICT_COUNCIL_DISTRICT_EN, LOCATION_EN, LOCATION_TC FROM geo";

    try {
        $stmt = $pdo->query($sql);

        // 用来存储每个字段的唯一值
        $districts = [];
        $locations = [];
        $places = [];

        if ($stmt->rowCount() > 0) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                // 将唯一值存入对应的数组
                $districts[] = $row['NAME_OF_DISTRICT_COUNCIL_DISTRICT_EN'];
                $locations[] = $row['LOCATION_EN'];
                $places[] = $row['LOCATION_TC'];
            }

            // 去除重复项并返回结果
            echo json_encode([
                'districts' => array_values(array_unique($districts)),
                'locations' => array_values(array_unique($locations)),
                'places' => array_values(array_unique($places)),
            ]);
        } else {
            echo json_encode([
                'districts' => [],
                'locations' => [],
                'places' => []
            ]);
        }
    } catch (PDOException $e) {
        // 捕获数据库查询错误
        echo json_encode([
            'error' => '数据库查询失败: ' . $e->getMessage()
        ]);
    }
}
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] == 'search-data') {
    // 获取原始的 POST 数据
    $jsonData = file_get_contents("php://input");

    // 解析 JSON 数据
    $searchParams = json_decode($jsonData, true);  // true 将 JSON 转换为关联数组

    // 打印接收到的 POST 数据到错误日志
    error_log("Received POST data: " . print_r($searchParams, true));  // 将数据输出到错误日志

// 提取过滤条件
    $district = $searchParams['district'] ?? '';
    $location = $searchParams['location'] ?? '';
    $place = $searchParams['place'] ?? '';

// 初始化查询语句和参数数组
    $sql = "SELECT * FROM geo WHERE 1=1";
    $params = [];

// 动态添加条件
    if ($district) {
        $sql .= " AND NAME_OF_DISTRICT_COUNCIL_DISTRICT_EN = :district";
        $params[':district'] = $district;
    }
    if ($location) {
        $sql .= " AND LOCATION_EN = :location";
        $params[':location'] = $location;
    }
    if ($place) {
        $sql .= " AND LOCATION_TC = :place";
        $params[':place'] = $place;
    }

// 执行查询
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

// 获取查询结果
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 如果没有找到结果，则根据第一个条件（district）进行查询
    if (empty($results) && $district) {
        // 清除之前的条件，仅根据 district 查询
        $sql = "SELECT * FROM geo WHERE NAME_OF_DISTRICT_COUNCIL_DISTRICT_EN = :district";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':district' => $district]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

// 返回结果
    if ($results) {
        echo json_encode($results);
    } else {
        echo json_encode(["message" => "No results found"]);
    }
}
?>
