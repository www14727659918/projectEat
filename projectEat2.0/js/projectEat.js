/**
 * Created by Administrator on 2017/5/16.
 */
var app = angular.module("kfl", ['ionic']);
//定义方法为了防抖动
app.factory('$debounce', ['$rootScope', '$browser', '$q', '$exceptionHandler',
    function($rootScope, $browser, $q, $exceptionHandler) {
        var deferreds = {},
            methods = {},
            uuid = 0;

        function debounce(fn, delay, invokeApply) {
            var deferred = $q.defer(),
                promise = deferred.promise,
                skipApply = (angular.isDefined(invokeApply) && !invokeApply),
                timeoutId, cleanup,
                methodId, bouncing = false;

            // check we dont have this method already registered
            angular.forEach(methods, function(value, key) {
                if (angular.equals(methods[key].fn, fn)) {
                    bouncing = true;
                    methodId = key;
                }
            });

            // not bouncing, then register new instance
            if (!bouncing) {
                methodId = uuid++;
                methods[methodId] = { fn: fn };
            } else {
                // clear the old timeout
                deferreds[methods[methodId].timeoutId].reject('bounced');
                $browser.defer.cancel(methods[methodId].timeoutId);
            }

            var debounced = function() {
                // actually executing? clean method bank
                delete methods[methodId];

                try {
                    deferred.resolve(fn());
                } catch (e) {
                    deferred.reject(e);
                    $exceptionHandler(e);
                }

                if (!skipApply) $rootScope.$apply();
            };

            timeoutId = $browser.defer(debounced, delay);

            // track id with method
            methods[methodId].timeoutId = timeoutId;

            cleanup = function(reason) {
                delete deferreds[promise.$$timeoutId];
            };

            promise.$$timeoutId = timeoutId;
            deferreds[timeoutId] = deferred;
            promise.then(cleanup, cleanup);

            return promise;
        }


        // similar to angular's $timeout cancel
        debounce.cancel = function(promise) {
            if (promise && promise.$$timeoutId in deferreds) {
                deferreds[promise.$$timeoutId].reject('canceled');
                return $browser.defer.cancel(promise.$$timeoutId);
            }
            return false;
        };

        return debounce;
    }
]);
//在模块运行时的设置 可有可无
app.run(function ($http) {
    //发起post请求的头信息
    $http.defaults.headers.post={'Content-Type':'application/x-www-form-urlencoded'};
});
app.config(function ($stateProvider,$urlRouterProvider,$ionicConfigProvider) {
    //固定图标在底部
    $ionicConfigProvider.tabs.position('bottom');
    $stateProvider
        .state('detail', {
            url:'/detail/:did',
            templateUrl: 'tpl/detail.html',
            controller:'detailCtr'
        })
        .state('main', {
            url:'/main',
            templateUrl: 'tpl/main.html',
            controller:'mainCtrl'
        })
        .state('myorder',{
            url:'/myorder',
            templateUrl:'tpl/myorder.html',
            controller:'myOrderCtr'
        })
        .state('order',{
            url:'/order',
            templateUrl:'tpl/order.html',
            controller:'cartCtr'
        })
        .state('settings',{
            url:'/settings',
            templateUrl:'tpl/settings.html',
            controller:'settingsCtr'
        })
        .state('login',{
            url:'/login',
            templateUrl:'tpl/login.html',
            controller:'LoginCtrl'
        })
        .state('register',{
            url:'/register',
            templateUrl:'tpl/register.html',
            controller:'registerCtrl'
        })
        .state('start',{
            url:'/start',
            templateUrl:'tpl/start.html'
        })
        .state('cart',{
            url:'/cart',
            templateUrl:'tpl/cart.html',
            controller:'cartCtr'
        })

    $urlRouterProvider.otherwise('/start')
});
//跳转控制器
app.controller('toCtr',['$scope','$state', function ($scope,$state) {
    $scope.data = { totalNumInCart: 0 };
    //console.log( $scope.data.totalNumInCart)
    $scope.to= function (path,params) {
//            传啥跳转啥
        $state.go(path,params)
    }
}]);

app.controller('mainCtrl', ["$scope","$http","$debounce", function ($scope,$http,$debounce) {
    //初始化数据
    $scope.hasMore = true;
        $http.get('data/dish_getbypage.php?start=0').success(function (data) {
            //console.log(data[0].img_sm)
            $scope.dishList=data;
        });
    //  监听用户的输入
    $scope.inputTxt={kw:''};
    $scope.$watch('inputTxt.kw', function () {
        //放抖动处理
        //console.dir($scope.inputTxt.kw);
        $debounce(watchHandler,300);
    });
    watchHandler= function () {
        if ($scope.inputTxt.kw){
            $http.get('data/dish_getbykw.php?kw=' + $scope.inputTxt.kw).success(function (data) {
                if (data.length > 0) {
                    //更新页面
                    //将搜索到的结果显示在main页面的列表上
                    $scope.dishList = data
                }
            })
        }
    };
    $scope.getMore= function () {
            $http.get('data/dish_getbypage.php?start=' + $scope.dishList.length).success(function (data) {
                //console.log(data[0].img_sm)
                if (data.length < 5) {
                    //没有更多数据：将按钮隐藏掉，显示一个提示信息
                    $scope.hasMore = false;
                }
                //数组拼起来保存在data
                $scope.dishList = $scope.dishList.concat(data);
                $scope.$broadcast('scroll.infiniteScrollComplete');
            })
        }

}]);
app.controller('detailCtr',['$scope','$stateParams','$http','$ionicPopup','$ionicLoading','$state', function ($scope,$stateParams,$http,$ionicPopup,$ionicLoading,$state) {
    var did= $stateParams.did;
    //console.log(did);
    //原理：点击main里a 用href传给detail一个dish自带属性did，在detailCtr控制器中解析出did，利用dish_getbyid
    //.php获得对应的dish详细信息，由于一次只有一个did 对应的一次传来一个只有一个数据的json，所以给data[0]，把
    //data[0]的数据传给dish 在detail中展现出来

            $http.get('data/dish_getbyid.php?did=' + did).success(function (data) {
                $scope.dish = data[0];
            });
            //定义方法，用来添加购物车
            $scope.addToCart = function () {
                $http.get("data/login_getbyuserid.php").success(function (response) {
                    $scope.userlist = response;
                    //console.log($scope.userlist);
                    if ($scope.userlist.code == -1) {
                        $state.go("login");
                    } else {
                        $http.get('data/cart_update.php?uid='+$scope.userlist.userid+'&did=' + did + '&count=-1').success(function (data) {
                            //console.log(data)
                            if (data.msg == 'succ') {
                                //当添加到购物车成功时，总数肯定是自增
                                $scope.data.totalNumInCart++;
                                $ionicPopup.alert({template: '添加成功'})
                            } else {
                                //$ionicPopup.alert({template:'添加失败'})
                                $ionicLoading.show({
                                    template: '请登陆...',
                                    duration: 1000
                                });
                                //$scope.login = function () {
                                $state.go('login')
                                //};
                            }
                        })
                        }
                        })
            }

}]);

app.controller('myOrderCtr',['$scope','$http','$state' ,function ($scope,$http,$state){
    $http.get("data/login_getbyuserid.php").success(function (response) {
        $scope.userlist = response;
        //console.log($scope.userlist);
        if ($scope.userlist.code == -1) {
            $state.go("login");
        } else {
            //var phone=sessionStorage.getItem('phone');
            $http.get('data/order_getbyuserid.php?userid=' + $scope.userlist.userid).success(function (data) {
                //console.log(data);
                $scope.useridList = data.data;
            })
        }
    })
}]);

app.controller('settingsCtr',['$scope','$ionicModal','$http','$state', function ($scope,$ionicModal,$http,$state){
    $http.get("data/login_getbyuserid.php").success(function (response) {
        $scope.userlist = response;
        //console.log($scope.userlist);
        if ($scope.userlist.code == -1) {
            $state.go("login");
        } else {
            $http.get("data/userinfo_getbyuserid.php?userid=" + $scope.userlist.userid).success(function(data) {

                //console.log(data);
                $scope.list = data;
            });
            //先得到模态框所对应的实例
            $ionicModal.fromTemplateUrl('tpl/about.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (data) {
                $scope.modal = data;
            });
            //$ionicModal显示模态框
            $scope.show = function () {
                $scope.modal.show();
            };
            $scope.hide = function () {
                $scope.modal.hide();
            }
          //  增加userinfo页面
            $ionicModal.fromTemplateUrl('tpl/userinfo.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (data) {
                $scope.loginModal = data;
            });
            //$ionicModal显示模态框
            $scope.showLogin = function () {
                $scope.loginModal.show();
            };
            $scope.hideLogin = function () {
                $scope.loginModal.hide();
            }
            //增加一个登陆页面
            //$ionicModal.fromTemplateUrl('tpl/login.html', {
            //    scope: $scope,
            //    animation: 'slide-in-up'
            //}).then(function (data) {
            //    $scope.loginModal = data;
            //});
            ////$ionicModal显示模态框
            //$scope.nouserShow = function () {
            //    $scope.loginModal.show();
            //};
            //$scope.nouserHide = function () {
            //    $scope.loginModal.hide();
            //}
            $scope.closeout = function() {
                $http.get("data/login_out.php").success(function (data) {
                    $state.go("start");
                }).error(function () {
                    alert("错误");
                })

            }

        }
    })

}]);
//购物车cart模块
app.controller('cartCtr',['$scope','$http','$ionicLoading','$ionicModal','$httpParamSerializerJQLike','$state', function ($scope,$http,$ionicLoading,$ionicModal,$httpParamSerializerJQLike,$state){
    $http.get("data/login_getbyuserid.php").success(function (response) {
        $scope.userlist = response;
        //console.log($scope.userlist);
        if ($scope.userlist.code == -1) {
            $state.go("login");
        } else {
            $http.get('data/cart_select.php?uid='+$scope.userlist.userid).success(function (data) {
                //record 记录
                $scope.list = data.data;

                   var updateTotaNum = function() {
                        //在进入购物车页面时，将服务器返回的所有的数据的数量累加，
                        // 赋值给totalNumInCart
                        $scope.data.totalNumInCart = 0;
                        angular.forEach($scope.list,
                            function(value, key) {
                                $scope.data.totalNumInCart += parseInt(value.dishCount);
                            });
                    };
                //console.log( $scope.list);
                    updateTotaNum();

                $scope.sumAll = function () {
                    for (var i = 0, totalPrice = 0; i < $scope.list.length; i++) {
                        totalPrice += parseFloat($scope.list[i].price * $scope.list[i].dishCount);
                    }
                    return totalPrice;
                }
                //封装一个方法：更新服务器购物车中产品的数量
                var updateCart = function (did, count) {
                    $http
                        .get('data/cart_update.php?uid='+$scope.userlist.userid+'&did=' + did + "&count=" + count)
                        .success(function (result) {
                            //console.log(result.msg);
                        })
                }
                $scope.minus = function (index) {
                    if ($scope.list[index].dishCount <= 1) {
                        return
                    }
                    $scope.list[index].dishCount--;
                    updateCart($scope.list[index].did, $scope.list[index].dishCount);
                    updateTotaNum();

                }
                $scope.addBtn = function (index) {
                    $scope.list[index].dishCount++;
                    updateCart($scope.list[index].did, $scope.list[index].dishCount);
                    updateTotaNum();
                }
                $scope.deleteBtn = function (index, item) {
                    updateTotaNum();
                    //console.log(index,item);
                    $http.post('data/cart_delete.php?ctid=' + $scope.list[index].ctid).success(function (data) {
                        //console.log(data.msg)
                        $ionicLoading.show({
                            template: '删除成功...',
                            duration: 2000
                        });
                        //很关键的一行代码 更新视图
                        $scope.list.splice(index, 1);
                    })
                };
                $scope.isOpen = false;
                $scope.Msg = '编辑';
                $scope.isChange = function () {
                    $scope.isOpen = !$scope.isOpen;
                    if ($scope.isOpen) {
                        $scope.Msg = '完成';
                    } else {
                        $scope.Msg = '编辑';
                    }
                }
                // 获取最终价格合计
                for (var i = 0, totalPrice = 0; i < $scope.list.length; i++) {
                    totalPrice += parseFloat($scope.list[i].price * $scope.list[i].dishCount);
                }
                //没办法的办法 让totalPrice变为全局变量
                var result = angular.toJson($scope.list);//json化
                $scope.order = {
                    cartDetail: result,
                    totalprice: totalPrice,
                    userid: $scope.userlist.userid
                };
                $scope.submitOrder = function () {
                    var params = $httpParamSerializerJQLike($scope.order);
                    console.log($scope.order.phone)
                    var regtel = /(\+86|0086)?\s*1[34578]\d{9}/;
                    if(!regtel.test($scope.order.phone)){
                        $ionicLoading.show({
                            template: '手机号格式不正确',
                            duration: 1000
                        });
                    }else {

                        $http.get("data/order_add.php?" + params).success(function (data) {
                            $scope.data.totalNumInCart = 0;
                            if (data.msg == 'success') {
                                $scope.result = data.oid;
                            } else {
                                $scope.result = '下单失败'
                            }
                        })
                    }
                }
            }
        )}
    });
    //立即下单模块
        $ionicModal.fromTemplateUrl('tpl/order.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(data) {
            $scope.modal = data;
        });
        //$ionicModal显示模态框
        $scope.show= function () {
            $scope.modal.show();
        };
        $scope.hide= function () {
            $scope.modal.hide();
        }


}]);

app.controller("LoginCtrl",["$scope","$state","$ionicLoading","$httpParamSerializerJQLike","$http","$timeout",function ($scope,$state,$ionicLoading,$httpParamSerializerJQLike,$http,$timeout) {
    $scope.register = function () {
        $state.go("register");
    };
    $scope.submitInfo= function () {
        //需要优化
        //console.log($scope.$$childHead.$$childHead.myForm.userName.$modelValue)
        $http.get('data/login.php?uname='+$scope.$$childHead.$$childHead.myForm.userName.$modelValue+'&upwd='+$scope.$$childHead.$$childHead.myForm.userPwd.$modelValue).success(function (data) {
                if(data.msg=="login succ"){
                    //console.log(sessionStorage.getItem('loginUname'))
                    $ionicLoading.show({
                        template: '登陆成功即将跳转...',
                        duration: 1000
                    });
                    $timeout(function() {
                        $state.go("main");
                    }, 1000);
                }else{
                    $ionicLoading.show({
                        template: '无该账号或密码错误',
                        duration: 1000
                    });
                }
        })
    }
}]);

app.controller("registerCtrl", ["$scope", "$http", "$httpParamSerializerJQLike", "$ionicLoading", "$timeout", "$state", function($scope, $http, $httpParamSerializerJQLike, $ionicLoading, $timeout, $state) {
    $scope.data = {};
    $scope.register_btn = function() {
        var result = $httpParamSerializerJQLike($scope.data);
        console.log(result);
        var reg = /^[a-z0-9_-]{6,18}$/;
        var regtel = /(\+86|0086)?\s*1[34578]\d{9}/;
        if(!reg.test($scope.data.pwd)){
            $ionicLoading.show({
                template: '密码至少6位数...',
                duration: 1000
            });
        }else if(!regtel.test($scope.data.phone)){
            $ionicLoading.show({
                template: '手机号格式不正确...',
                duration: 1000
            });
        }else {
            $http.post("data/register.php?"+result).success(function(reponse) {
                //console.log(reponse);
                if(reponse.code==200){
                    $ionicLoading.show({
                        template: '注册成功并登陆...',
                        duration: 1000
                    });
                    $timeout(function() {
                        $state.go("myorder");
                    }, 1000);
                }else{
                    $ionicLoading.show({
                        template: '注册失败,请核实查证...',
                        duration: 1000
                    });
                }

            })
        }
    }
}]);
