<?php
header('Content-Type:application/json;charset=utf-8');
//@$search = $_REQUEST["search"] or die('{"code":-1,"msg":"搜索框不能为空"}');
@$kw = $_REQUEST["kw"] or die('[]');
require('init.php');
$sql = "select * from kf_dish WHERE name LIKE '%$kw%' OR  material LIKE '%$kw%'";
$result = mysqli_query($conn,$sql);
$row=mysqli_fetch_all($result,MYSQLI_ASSOC);
echo json_encode($row);

