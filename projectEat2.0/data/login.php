<?php
header('Content-Type: application/json');

@$uname = $_REQUEST['uname'] or die('{"code":-2,"msg":"用户uname不能为空"}');
@$upwd = $_REQUEST['upwd'] or die('{"code":-2,"msg":"用户upwd不能为空"}');

require('init.php');
$sql = "SELECT userid FROM kf_users WHERE uname='$uname' AND pwd='$upwd'";
$result = mysqli_query($conn,$sql);
$row = mysqli_fetch_assoc($result);

if(!$row){
    echo '{"code":401, "msg":"uname or upwd err"}';
}else {
    echo '{"code":200, "msg":"login succ"}';
   //在服务器端为当前客户端开辟session空间，存储该客户端专有数据
    session_start( );
    $_SESSION['loginUid'] = $row['userid'];
    $_SESSION['loginUname'] = $uname;
}


