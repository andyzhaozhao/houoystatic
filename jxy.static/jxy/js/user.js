/**
 * 用户管理
 * @author andyzhao
 */
(function (user) {
    //定义页面数据模型
    user.userModel = window.houoy.public.createPageModel();
    user.userModel.setCurrentData({
        pk_user: null,
        user_code: $("#user_code").val(),
        user_name: $("#user_name").val(),
        mobile: $("#mobile").val(),
        email: $("#email").val()
    });

    user.resetCurrentData = function (data) {
        user.userModel.getCurrentData().pk_user = data.pk_user;
        user.userModel.getCurrentData().user_code = data.user_code;
        user.userModel.getCurrentData().user_name = data.user_name;
        user.userModel.getCurrentData().mobile = data.mobile;
        user.userModel.getCurrentData().email = data.email;
        $("#user_code").val(user.userModel.getCurrentData().user_code);
        $("#user_name").val(user.userModel.getCurrentData().user_name);
        $("#mobile").val(user.userModel.getCurrentData().mobile);
        $("#email").val(user.userModel.getCurrentData().email);
    };

    //定义页面成员方法
    user.init = function () {
        //注册事件监听
        $("#addBtn").click(function () {
            user.userModel.setModal(window.houoy.public.PageManage.UIModal.CARD);
            user.userModel.setUIState(window.houoy.public.PageManage.UIState.CREATE);
            user.resetCurrentData({//新增时候当前缓存数据是空
                pk_user: null,
                user_code: null,
                user_name: null,
                mobile: null,
                email: null
            });
        });

        $("#editBtn").click(function () {
            user.userModel.setModal(window.houoy.public.PageManage.UIModal.CARD);
            user.userModel.setUIState(window.houoy.public.PageManage.UIState.CREATE);
            user.resetCurrentData(user.dataTable.getSelectedRows()[0]);//设置当前选中的行
        });

        $("#deleteBtn").click(function () {
            if (confirm('你确定要删除选择项目吗？')) {
                user.delete(function () {
                    user.userModel.setModal(window.houoy.public.PageManage.UIModal.LIST);
                    user.refresh();
                }, function () {
                });
            }
        });

        $("#saveBtn").click(function () {
            user.save(function () {
                user.userModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            }, function () {
            });
        });

        $("#cancelBtn").click(function () {
            user.userModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            user.resetCurrentData({//新增时候当前缓存数据是空
                pk_user: null,
                user_code: null,
                user_name: null,
                mobile: null,
                email: null
            });
        });

        $("#toCardBtn").click(function () {
            user.userModel.setModal(window.houoy.public.PageManage.UIModal.CARD);
            user.resetCurrentData(user.dataTable.getSelectedRows()[0]);//设置当前选中的行
        });

        $("#toListBtn").click(function () {
            user.userModel.setModal(window.houoy.public.PageManage.UIModal.LIST);
            user.userModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            user.userModel.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);
            user.refresh();
        });

        $("#searchBtn").click(function () {
            user.refresh();
        });

        $("#searchResetBtn").click(function () {
            $("input[name='user_code']").val("");
            $("input[name='user_name']").val("");
            $("input[name='mobile']").val("");
            $("input[name='email']").val("");
            user.refresh();
        });

        $("#allotRoleBtn").click(function(){
            $('#roleMenu').jstree("destroy");

            //设置checkbox单选
            $('#roleMenu').on('select_node.jstree', function(event, obj) {

                var ref = $('#roleMenu').jstree(true);
                var nodes = ref.get_checked();  //使用get_checked方法
                $.each(nodes, function(i, nd) {
                    if (nd != obj.node.id)
                        ref.uncheck_node(nd);
                });
            });

            $.ajax({
                type: 'post',
                url:  window.houoy.public.static.contextPath  + "/api/role/retrieve",
                contentType: "application/json;charset=UTF-8",
                dataType: "json",
                async:false,
                data: "",
                success: function (data) {
                    var treeData = [{
                        "id": "roleMenu",
                        "text": "角色",
                        "children": listToTree(data.data),
                        "icon":"",
                        "state": {
                            "opened": true
                        }
                    }];
                    showCheckboxTree(treeData,"roleMenu",user.dataTable.getSelectedRows()[0].pk_role);

                },
                error: function (data) {
                    alert("删除失败！");
                    onError();
                }
            });

        });

        //分配角色确定
        $("#okBtn").click(function () {
            var pk_user = user.dataTable.getSelectedRows()[0].pk_user;
            var pk_role_old = user.dataTable.getSelectedRows()[0].pk_role;
            var ids = getCheckboxTreeSelNode("roleMenu");
            var pk_role_new = ids[1];
            var roleLength = ids.length;
            if(roleLength > 2){
                alert("只能选择一种角色");
            }else if(roleLength == 0){
                alert("请选择角色");
            }else{
                //获取选中的角色
                if(pk_role_new != null && pk_role_new !="" &&pk_role_old != pk_role_new){
                    $.ajax({
                        type: 'get',
                        url: contextPath + "/root/base/user/updateUserRole",
                        contentType: "application/json;charset=UTF-8",
                        dataType: "json",
                        data: {
                            "pk_user":pk_user,
                            "pk_role":pk_role_new
                        },
                        success: function (data) {
                            if(data.success == true){
                                //这里需要重新加载表格数据
                                user.dataTable.refresh();
                                alert("设置成功");
                                $("#myModal").modal('hide')
                            }else{
                                alert("设置失败！");
                            }
                        },
                        error: function (data) {
                            alert("设置失败！");
                        }
                    });
                }else{
                    alert("设置成功");
                    $("#myModal").modal('hide')
                }
            }
        });

        /*
         **带checkbox的树形控件使用说明
         **@url：此url应该返回一个json串，用于生成树
         **@id: 将树渲染到页面的某个div上，此div的id
         **@checkId:需要默认勾选的数节点id；1.checkId="all"，表示勾选所有节点 2.checkId=[1,2]表示勾选id为1,2的节点
         **节点的id号由url传入json串中的id决定
         */
        function showCheckboxTree(data,id,checkId){
            document.getElementById(id).disabled = true;
            treeid = id;
            user.role = checkId;
            menuTree = $("#"+id).bind("loaded.jstree",function(e,data){
                $("#"+id).jstree("open_all");
                $("#"+id).find("li").each(function(){
                    if($(this).attr("id") == checkId){
                        $("#"+id).jstree("check_node",$(this));

                    }
                });
            }).jstree({
                "core" : {
                    "data":data,
                    "attr":{
                        "class":"jstree-checked"
                    }
                },
                "types" : {
                    "default" : {
                        "valid_children" : ["default","file"]
                    },
                    "file" : {
                        "icon" : "glyphicon glyphicon-file",
                        "valid_children" : []
                    }
                },
                "checkbox" : {
                    "keep_selected_style" : false,
                    "real_checkboxes" : true
                },
                "plugins" : [
                    "contextmenu", "dnd", "search",
                    "types", "wholerow","checkbox"
                ],
                "contextmenu":{
                    "items":{
                        "create":null,
                        "rename":null,
                        "remove":null,
                        "ccp":null
                    }
                }
            });
        }

        function getCheckboxTreeSelNode(treeid){
            var ids = Array();
            jQuery("#"+treeid).find("li").each(function(){
                var liid = jQuery(this).attr("id");
                if(jQuery("#"+liid+">a").hasClass("jstree-clicked") || jQuery("#"+liid+">a>i").hasClass("jstree-undetermined")){
                    ids.push(liid);
                }
            });
            return ids;
        }

        function listToTree(data, selectedID) {
            var result = [];
            $.each(data, function (n, e) {
                result.push(convertItem(e));
            });
            return result;
        }

        function convertItem(o) {
            var iconPath = "imgs/jxy/role.png";
            o.id = o.pk_role;
            o.text = o.role_name;
            o.icon = iconPath;
            return o;
        }

        //初始化
        user.userModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);//默认是查询状态
        user.userModel.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//默认是没有选中数据
        user.userModel.setModal(window.houoy.public.PageManage.UIModal.LIST);//默认是列表模式

        user.dataTable = window.houoy.public.createDataTable({
            dataTableID: "table",
            url:  window.houoy.public.static.contextPath  + "/root/base/user/retrieve",
            urlPort: "get",
            param: {//查询参数
                user_code: function(){return $("input[name='user_code']").val()},
                user_name: function(){return $("input[name='user_name']").val()},
                mobile: function(){return $("input[name='mobile']").val()},
                email: function(){return $("input[name='email']").val()}
            },
            columns: [
                {"title": "序列号", 'data': 'pk_user', "visible": false},
                {"title": "用户编码", 'data': 'user_code'},
                {"title": "用户名称", 'data': 'user_name'},
                {"title": "联系方式", 'data': 'mobile'},
                {"title": "电子邮箱", 'data': 'email'},
            ],
            onSelectChange: function (selectedNum, selectedRows) {
                if (selectedNum > 1) {
                    user.userModel.setSelectState(window.houoy.public.PageManage.DataState.MUL_SELECT);
                } else if (selectedNum == 1) {
                    user.userModel.setSelectState(window.houoy.public.PageManage.DataState.ONE_SELECT);
                } else {
                    user.userModel.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//没有选中数据
                }
            }
        });
    };

    user.save = function (onSuccess, onError) {
        if (!($("#user_code").val()) || !($("#user_name").val())) {
            alert("请填写完整信息");
        } else {
            user.userModel.getCurrentData().user_code = $("#user_code").val();
            user.userModel.getCurrentData().user_name = $("#user_name").val();
            user.userModel.getCurrentData().mobile = $("#mobile").val();
            user.userModel.getCurrentData().email = $("#email").val();

            $.ajax({
                type: 'post',
                url:  window.houoy.public.static.contextPath  + '/root/base/user/save',
                contentType: "application/json;charset=UTF-8",
                dataType: "json",
                data: JSON.stringify(user.userModel.getCurrentData()),
                success: function (data) {
                    if (data.success) {
                        alert("保存成功");
                        onSuccess();
                    } else {
                        alert("保存失败:" + data.msg);
                    }
                },
                error: function (data) {
                    alert("保存失败！");
                    onError();
                }
            });
        }
    };

    user.delete = function (onSuccess, onError) {
        var pk_users = [];
        switch (user.userModel.getModal()) {
            case window.houoy.public.PageManage.UIModal.CARD:
                pk_users[0] = user.userModel.getCurrentData().pk_user;
                break;
            case window.houoy.public.PageManage.UIModal.LIST:
                $.each(user.dataTable.getSelectedRows(), function (index, value) {
                    pk_users[index] = value.pk_user;
                });
                break;
            default:
                break;
        }

        $.ajax({
            type: 'post',
            url:  window.houoy.public.static.contextPath  + '/root/base/user/delete',
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            data: JSON.stringify(pk_users),
            success: function (data) {
                if (data.success) {
                    onSuccess();
                } else {
                    alert("删除失败:" + data.msg);
                }
            },
            error: function (data) {
                alert("删除失败！");
                onError();
            }
        });
    };

    user.refresh = function () {
        user.dataTable.refresh();
    }

    user.init();
})(window.houoy.role || {});
