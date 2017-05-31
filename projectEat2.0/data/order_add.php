<?php
header('Content-Type:application/json;charset=utf-8');
@$phone = $_REQUEST["phone"] or die('{"code":-2,"msg":"用户phone不能为空"}');
@$userid = $_REQUEST['userid']or die('{"code":-2,"msg":"用户userid不能为空"}');
@$user_name = $_REQUEST["user_name"] or die('{"code":-2,"msg":"用户user_name不能为空"}');
//@$sex = $_REQUEST["sex"] or die('{"code":-2,"msg":"用户sex不能为空"}');
//@$order_time = $_REQUEST["sex"] or die('{"code":-2,"msg":"用户$order_time不能为空"}');
@$addr = $_REQUEST["addr"] or die('{"code":-2,"msg":"用户addr不能为空"}');
@$totalprice = $_REQUEST['totalprice']or die('{"code":-2,"msg":"用户totalprice不能为空"}');
@$cartDetail = $_REQUEST['cartDetail']or die('{"code":-2,"msg":"用户cartDetail不能为空"}');
require('init.php');
$sql = "insert into kf_order values(null,'$userid','$phone','$user_name',now(),'$addr','$totalprice')";
$result = mysqli_query($conn,$sql);
//$count=mysqli_insert_id($conn);
$array=[];
if($result){
    $oid = mysqli_insert_id($conn); //获取最近执行的一条INSERT语句生成的自增主键


     $cart = json_decode($cartDetail);
     foreach ($cart as &$one ) {
             //将数据插入到购物车详情
             $sql = "insert into kf_orderdetails values('$oid','$one->did','$one->dishCount','$one->price')";
             $result = mysqli_query($conn, $sql);
             //从购物车中删除
             $sql = "DELETE FROM kf_cart WHERE ctid=$one->ctid";
             $result = mysqli_query($conn,$sql);
     }
     $array['msg']='success';
     $array['reason'] = "订单生成成功";
     $array['oid']=$oid;
     echo json_encode($array);
}else{
     $array['msg']='failure';
     $array['oid']=$oid;
     $array['reason'] = "订单生成失败";
     echo json_encode($array);
}

