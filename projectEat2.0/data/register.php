<?php
header('Access-Control-Allow-Origin: http://127.0.0.1');
header('Content-Type:application/json');
@$username = $_REQUEST['username'] or die ("[]");
@$pwd = $_REQUEST['pwd'] or die ("[]");
@$phone = $_REQUEST['phone'] or die ("[]");
@$vc = $_REQUEST['vc'] or die ("[]");
session_start();


//    $arr = [];

    if($vc===$_SESSION['vcodeInServer']){
     require('init.php');
        $sql = "insert into kf_users value(null,'$username','$pwd','$phone')";
        $result = mysqli_query($conn,$sql);
//            $arr = mysqli_insert_id($conn);
    $output['code'] = "200";
     $output['msg'] = "注册成功";
    echo json_encode($output);

//            session_start();
//            $_SESSION['loginUname'] = $username;
    }else{
          $output['code'] = "404";
               $output['msg'] = "注册失败";
              echo json_encode($output);
}