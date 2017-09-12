/**
 * @author andyzhao
 */
(function (hobby) {
    //定义页面数据模型
    hobby.pageModel = window.houoy.public.createPageModel();
    hobby.pageModel.setCurrentData({
        pk_hobby: null,
        hobby_code: $("#hobby_code").val(),
        hobby_name: $("#hobby_name").val(),
        pk_person: $("#pk_person").val(),
        hobby_desc: $("#hobby_desc").val()
    });

    hobby.resetCurrentData = function (data) {
        hobby.pageModel.getCurrentData().pk_hobby = data.pk_hobby;
        hobby.pageModel.getCurrentData().hobby_code = data.hobby_code;
        hobby.pageModel.getCurrentData().hobby_name = data.hobby_name;
        hobby.pageModel.getCurrentData().pk_person = data.pk_person;
        hobby.pageModel.getCurrentData().hobby_desc = data.hobby_desc;

        $("#hobby_code").val(hobby.pageModel.getCurrentData().hobby_code);
        $("#hobby_name").val(hobby.pageModel.getCurrentData().hobby_name);
        $("#pk_person").val(hobby.pageModel.getCurrentData().pk_person);
        $("#hobby_desc").val(hobby.pageModel.getCurrentData().hobby_desc);
    };

    //定义页面成员方法
    hobby.init = function () {
        //注册事件监听
        $("#addBtn").click(function () {
            hobby.pageModel.setModal(window.houoy.public.PageManage.UIModal.CARD);
            hobby.pageModel.setUIState(window.houoy.public.PageManage.UIState.CREATE);
            hobby.resetCurrentData({//新增时候当前缓存数据是空
                pk_hobby: null,
                hobby_code: null,
                hobby_name: null,
                pk_person: null,
                hobby_desc: null
            });
        });

        $("#editBtn").click(function () {
            hobby.pageModel.setModal(window.houoy.public.PageManage.UIModal.CARD);
            hobby.pageModel.setUIState(window.houoy.public.PageManage.UIState.CREATE);
            hobby.resetCurrentData(hobby.dataTable.getSelectedRows()[0]);//设置当前选中的行
        });

        $("#deleteBtn").click(function () {
            if (confirm('你确定要删除选择项目吗？')) {
                hobby.delete(function () {
                    hobby.pageModel.setModal(window.houoy.public.PageManage.UIModal.LIST);
                    hobby.refresh();
                }, function () {
                });
            }
        });

        $("#saveBtn").click(function () {
            hobby.save(function () {
                hobby.pageModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            }, function () {
            });
        });

        $("#cancelBtn").click(function () {
            hobby.pageModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            hobby.resetCurrentData({//新增时候当前缓存数据是空
                pk_hobby: null,
                hobby_code: null,
                hobby_name: null,
                pk_person: null,
                hobby_desc: null
            });
        });

        $("#toCardBtn").click(function () {
            hobby.pageModel.setModal(window.houoy.public.PageManage.UIModal.CARD);
            hobby.resetCurrentData(hobby.dataTable.getSelectedRows()[0]);//设置当前选中的行
        });

        $("#toListBtn").click(function () {
            hobby.pageModel.setModal(window.houoy.public.PageManage.UIModal.LIST);
            hobby.pageModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            hobby.pageModel.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);
            hobby.refresh();
        });

        $("#searchBtn").click(function () {
            hobby.refresh();
        });

        $("#searchResetBtn").click(function () {
            $("input[name='hobby_code']").val("");
            $("input[name='hobby_name']").val("");
            $("input[name='pk_person']").val("");
            $("input[name='hobby_desc']").val("");
            hobby.refresh();
        });

        //初始化
        hobby.pageModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);//默认是查询状态
        hobby.pageModel.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//默认是没有选中数据
        hobby.pageModel.setModal(window.houoy.public.PageManage.UIModal.LIST);//默认是列表模式

        hobby.dataTable = window.houoy.public.createDataTable({
            dataTableID: "table",
            url: window.houoy.public.static.contextPath + "/api/hobby/retrieve",
            param: {//查询参数
                hobby_code: function () {
                    return $("input[name='hobby_code']").val()
                },
                hobby_name: function () {
                    return $("input[name='hobby_name']").val()
                },
                pk_person: function () {
                    return $("input[name='pk_person']").val()
                },
                hobby_desc: function () {
                    return $("input[name='hobby_desc']").val()
                }
            },
            columns: [
                {"title": "兴趣编码", 'data': 'hobby_code'},
                {"title": "兴趣名称", 'data': 'hobby_name'},
                {"title": "兴趣描述", 'data': 'hobby_desc'}],
            onSelectChange: function (selectedNum, selectedRows) {
                if (selectedNum > 1) {
                    hobby.pageModel.setSelectState(window.houoy.public.PageManage.DataState.MUL_SELECT);
                } else if (selectedNum == 1) {
                    hobby.pageModel.setSelectState(window.houoy.public.PageManage.DataState.ONE_SELECT);
                } else {
                    hobby.pageModel.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//没有选中数据
                }
            }
        });
    };

    hobby.save = function (onSuccess, onError) {
        if (!($("#hobby_code").val()) || !($("#hobby_name").val()) || !($("#hobby_desc").val())) {
            alert("请填写完整信息");
        } else {
            hobby.pageModel.getCurrentData().hobby_code = $("#hobby_code").val();
            hobby.pageModel.getCurrentData().hobby_name = $("#hobby_name").val();
            hobby.pageModel.getCurrentData().hobby_desc = $("#hobby_desc").val();
            debugger;
            $.ajax({
                type: 'post',
                url: window.houoy.public.static.contextPath + '/api/hobby/save',
                contentType: "application/json;charset=UTF-8",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("x-auth-token", window.houoy.public.static.getSessionID());  //使用spring session的token方式
                },
                dataType: "json",
                data: JSON.stringify(hobby.pageModel.getCurrentData()),
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

    hobby.delete = function (onSuccess, onError) {
        var pk_hobbys = [];
        switch (hobby.pageModel.getModal()) {
            case window.houoy.public.PageManage.UIModal.CARD:
                pk_hobbys[0] = hobby.pageModel.getCurrentData().pk_hobby;
                break;
            case window.houoy.public.PageManage.UIModal.LIST:
                $.each(hobby.dataTable.getSelectedRows(), function (index, value) {
                    pk_hobbys[index] = value.pk_hobby;
                });
                break;
            default:
                break;
        }
        debugger;//浏览器调试时使用
        $.ajax({
            type: 'post',
            url: window.houoy.public.static.contextPath + '/api/hobby/delete',
            contentType: "application/json;charset=UTF-8",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("x-auth-token", window.houoy.public.static.getSessionID());  //使用spring session的token方式
            },
            dataType: "json",
            data: JSON.stringify(pk_hobbys),
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

    hobby.refresh = function () {
        hobby.dataTable.refresh();
    };

    hobby.init();
})(window.houoy.hobby || {});
