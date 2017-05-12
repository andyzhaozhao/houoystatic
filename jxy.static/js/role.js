/**
 * 角色管理
 * @author andyzhao
 */
(function (role) {
    //定义页面数据模型
    role.userModel = window.houoy.public.createPageModel();
    role.userModel.setCurrentData({
        pk_role: null,
        role_code: $("#role_code").val(),
        role_name: $("#role_name").val()
    });

    role.resetCurrentData = function (data) {
        role.userModel.getCurrentData().pk_role = data.pk_role;
        role.userModel.getCurrentData().role_code = data.role_code;
        role.userModel.getCurrentData().role_name = data.role_name;
        $("#role_code").val(role.userModel.getCurrentData().role_code);
        $("#role_name").val(role.userModel.getCurrentData().role_name);
    };

    //定义页面成员方法
    role.init = function () {
        //注册事件监听
        $("#addBtn").click(function () {
            role.userModel.setModal(window.houoy.public.PageManage.UIModal.CARD);
            role.userModel.setUIState(window.houoy.public.PageManage.UIState.CREATE);
            role.resetCurrentData({//新增时候当前缓存数据是空
                pk_role: null,
                role_code: null,
                role_name: null
            });
        });

        $("#editBtn").click(function () {
            role.userModel.setModal(window.houoy.public.PageManage.UIModal.CARD);
            role.userModel.setUIState(window.houoy.public.PageManage.UIState.CREATE);
            role.resetCurrentData(role.dataTable.getSelectedRows()[0]);//设置当前选中的行
        });

        $("#deleteBtn").click(function () {
            if (confirm('你确定要删除选择项目吗？')) {
                role.delete(function () {
                    role.userModel.setModal(window.houoy.public.PageManage.UIModal.LIST);
                    role.refresh();
                }, function () {
                });
            }
        });

        $("#saveBtn").click(function () {
            role.save(function () {
                role.userModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            }, function () {
            });
        });

        $("#cancelBtn").click(function () {
            role.userModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            role.resetCurrentData({//新增时候当前缓存数据是空
                pk_role: null,
                role_code: null,
                role_name: null
            });
        });

        $("#toCardBtn").click(function () {
            role.userModel.setModal(window.houoy.public.PageManage.UIModal.CARD);
            role.resetCurrentData(role.dataTable.getSelectedRows()[0]);//设置当前选中的行
        });

        $("#toListBtn").click(function () {
            role.userModel.setModal(window.houoy.public.PageManage.UIModal.LIST);
            role.userModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            role.userModel.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);
            role.refresh();
        });

        $("#searchBtn").click(function () {
            role.refresh();
        });

        $("#searchResetBtn").click(function () {
            $("input[name='role_code']").val("");
            $("input[name='role_name']").val("");
            role.refresh();
        });

        $("#grantBtn").click(function () {
            //角色授权
            alert("授权成功");
        });

        //初始化
        role.userModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);//默认是查询状态
        role.userModel.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//默认是没有选中数据
        role.userModel.setModal(window.houoy.public.PageManage.UIModal.LIST);//默认是列表模式

        role.dataTable = window.houoy.public.createDataTable({
            dataTableID: "table",
            url: window.houoy.public.static.contextPath + "/api/role/retrieve",
            param: {//查询参数
                role_code: function(){return $("input[name='role_code']").val()},
                role_name: function(){return $("input[name='role_name']").val()}
            },
            columns: [{"title": "序列号", 'data': 'pk_role', "visible": false},
                {"title": "角色编码", 'data': 'role_code'},
                {"title": "角色名称", 'data': 'role_name'}],
            onSelectChange: function (selectedNum, selectedRows) {
                if (selectedNum > 1) {
                    role.userModel.setSelectState(window.houoy.public.PageManage.DataState.MUL_SELECT);
                } else if (selectedNum == 1) {
                    role.userModel.setSelectState(window.houoy.public.PageManage.DataState.ONE_SELECT);
                } else {
                    role.userModel.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//没有选中数据
                }
            }
        });
    };

    role.save = function (onSuccess, onError) {
        if (!($("#role_code").val()) || !($("#role_name").val())) {
            alert("请填写完整信息");
        } else {
            role.userModel.getCurrentData().role_code = $("#role_code").val();
            role.userModel.getCurrentData().role_name = $("#role_name").val();
            debugger;
            $.ajax({
                type: 'post',
                url: window.houoy.public.static.contextPath + '/api/role/save',
                contentType: "application/json;charset=UTF-8",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("x-auth-token", window.houoy.public.static.getSessionID());  //使用spring session的token方式
                },
                dataType: "json",
                data: JSON.stringify(role.userModel.getCurrentData()),
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

    role.delete = function (onSuccess, onError) {
        var pk_roles = [];
        switch (role.userModel.getModal()) {
            case window.houoy.public.PageManage.UIModal.CARD:
                pk_roles[0] = role.userModel.getCurrentData().pk_role;
                break;
            case window.houoy.public.PageManage.UIModal.LIST:
                $.each(role.dataTable.getSelectedRows(), function (index, value) {
                    pk_roles[index] = value.pk_role;
                });
                break;
            default:
                break;
        }
        debugger;//浏览器调试时使用
        $.ajax({
            type: 'post',
            url: window.houoy.public.static.contextPath + '/api/role/delete',
            contentType: "application/json;charset=UTF-8",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("x-auth-token",window.houoy.public.static.getSessionID());  //使用spring session的token方式
            },
            dataType: "json",
            data: JSON.stringify(pk_roles),
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

    role.refresh = function () {
        role.dataTable.refresh();
    }

    role.init();
})(window.houoy.role || {});
