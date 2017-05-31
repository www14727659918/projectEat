
<?php
header('Content-Type:application/json');
//解析传进来的start
$start = $_REQUEST['start'];

$count = 5;
require('init.php');

$sql = "select did,name,price,img_sm,material from kf_dish LIMIT $start,$count";
$result = mysqli_query($conn,$sql);
$output = [];
while(true){
    $row = mysqli_fetch_assoc($result);
    if(!$row)
    {
        break;
    }
    $output[] = $row;
}

echo json_encode($output);