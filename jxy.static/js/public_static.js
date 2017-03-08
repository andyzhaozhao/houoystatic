/**
 * 家校易全局变量
 * @author andyzhao
 */
(function pub(iandtop) {
    if (!window.iandtop) {
        window.iandtop = iandtop;
    }
})(window.iandtop || {});

//页面模型
(function pub(s) {
    if (!window.iandtop.public) {
        window.iandtop.public = s;
    }

    //定义全局变量
    if (typeof s.static == "undefined") {
        s.static = {
            contextPath: "http://localhost:8889",//后端服务器地址
            xauthtoken: "com.jiaxiaoyi.xauthtoken",//sessionid的token
            getURLParameter: function (name) {//获得页面url参数
                return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
            },
            getSessionID:function(){
                return sessionStorage.getItem( window.iandtop.public.static.xauthtoken);
            },
            setSessionID:function(value){
                sessionStorage.setItem(window.iandtop.public.static.xauthtoken,value);
            }
        }
    }

})(window.iandtop.public || {});