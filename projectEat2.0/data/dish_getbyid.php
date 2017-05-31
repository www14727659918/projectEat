<?php
header('Content-Type:application/json;charset=utf-8');
@$did = $_REQUEST["did"] or die('{"code":-2,"msg":"用户id不能为空"}');
require('init.php');
$sql = "select did, name, price, img_lg ,detail,material from kf_dish WHERE did=$did";
$result = mysqli_query($conn,$sql);
$row=mysqli_fetch_all($result,MYSQLI_ASSOC);
echo json_encode($row);

