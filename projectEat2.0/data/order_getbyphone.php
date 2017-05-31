<?php
header('Content-Type:application/json;charset=utf-8');
@$phone = $_REQUEST["phone"] or die('{"code":-2,"msg":"用户手机号不能为空"}');
require('init.php');
$sql="select o.did,o.oid,o.user_name,o.order_time,d.img_sm from kf_order o,kf_dish d WHERE o.did=d.did and o.phone=$phone";
$result = mysqli_query($conn,$sql);
$row=mysqli_fetch_all($result,MYSQLI_ASSOC);
echo json_encode($row);


