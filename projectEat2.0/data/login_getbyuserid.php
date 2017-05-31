<?php
header('Content-Type:application/json');
$arr = [];
$output = [];
require('init.php');
session_start();
@$username = $_SESSION['loginUname'];
 //$row=json_encode($username);
if ($username == null){
    $output['code'] = "-1";
    echo json_encode($output);
}else {
    $sql = "select userid from kf_users where uname='$username'";
    $result = mysqli_query($conn,$sql);
    $row = mysqli_fetch_assoc($result);
    echo json_encode($row);
}


