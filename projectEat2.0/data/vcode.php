<?php
header('Content-Type: image/png;charset=utf-8');

$w = 120;
$h = 30;
//在服务器端内存中生成一幅随机图片
$img = imagecreatetruecolor($w, $h);

//绘制随机的背景颜色
$c = imagecolorallocate($img, rand(180,240), rand(180, 240), rand(180,240));
//填充一个矩形作为背景
imagefilledrectangle($img, 0, 0, $w, $h, $c);

//绘制4个随机的字符
$pool = 'ABCDEFGHIJKLMNPQRSTUVWXY3456789';
$vc = '';
for($i=0; $i<4; $i++){
    $char = $pool[ rand(0, strlen($pool)-1 )];
    $vc .= $char;
    $c = imagecolorallocate($img, rand(80,180), rand(80,180), rand(80,180));
    $x = $i * 30+5;
    $y = rand(15, 30);
    $fontSize = rand(10, 30);
    $font = "../fonts/simhei.ttf";
    $deg = rand(-45, 45);
    imagettftext($img, $fontSize, $deg, $x, $y, $c, $font, $char);
}
//把服务器端生成的随机验证码保存在服务器端session中
session_start();
$_SESSION['vcodeInServer'] = $vc;



//绘制6条随机干扰线
for($i=0; $i<6; $i++){
    $c = imagecolorallocate($img, rand(0,255), rand(0,255), rand(0,255));
    imageline($img, rand(0, $w), rand(0, $h), rand(0, $w), rand(0,$h), $c);
}
//绘制50条随机干扰点——半径为1的圆
for($i=0; $i<50; $i++){
    $c = imagecolorallocate($img, rand(0,255), rand(0,255), rand(0,255));
    imagearc($img, rand(0, $w), rand(0, $h), 1,1,0, 360, $c);
}

//把图片输出给客户端
imagepng($img);
//从服务器内存中删除该图片
imagedestroy($img);