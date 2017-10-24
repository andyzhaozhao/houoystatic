/**
 * 社交用户管理
 * @author andyzhao
 */
(function (person) {
    //定义页面数据模型
    person.pageModel = window.houoy.public.createPageModel();
    person.pageModel.setCurrentData({
        pk_person: null,
        person_code: $("#person_code").val(),
        person_name: $("#person_name").val(),
        person_alias: $("#person_alias").val(),
        password: $("#password").val(),
        mobile: $("#mobile").val()
    });

    person.resetCurrentData = function (data) {
        person.pageModel.getCurrentData().pk_person = data.pk_person;
        person.pageModel.getCurrentData().person_code = data.person_code;
        person.pageModel.getCurrentData().person_name = data.person_name;
        person.pageModel.getCurrentData().person_alias = data.person_alias;
        person.pageModel.getCurrentData().password = data.password;
        person.pageModel.getCurrentData().mobile = data.mobile;

        $("#person_code").val(person.pageModel.getCurrentData().person_code);
        $("#person_name").val(person.pageModel.getCurrentData().person_name);
        $("#person_alias").val(person.pageModel.getCurrentData().person_alias);
        $("#password").val(person.pageModel.getCurrentData().password);
        $("#mobile").val(person.pageModel.getCurrentData().mobile);
    };

    //定义页面成员方法
    person.init = function () {
        //注册事件监听
        $("#addBtn").click(function () {
            person.pageModel.setModal(window.houoy.public.PageManage.UIModal.CARD);
            person.pageModel.setUIState(window.houoy.public.PageManage.UIState.CREATE);
            person.resetCurrentData({//新增时候当前缓存数据是空
                pk_person: null,
                person_code: null,
                person_name: null,
                person_alias: null,
                password: null,
                mobile: null
            });
        });

        $("#detailBtn").click(function () {
            person.pageModel.setModal(window.houoy.public.PageManage.UIModal.CARD);
            person.resetCurrentData(person.dataTable.getSelectedRows()[0]);//设置当前选中的行
            person.initPortrait();
        });

        $("#editBtn").click(function () {
            person.pageModel.setModal(window.houoy.public.PageManage.UIModal.CARD);
            person.pageModel.setUIState(window.houoy.public.PageManage.UIState.CREATE);
            person.resetCurrentData(person.dataTable.getSelectedRows()[0]);//设置当前选中的行
            person.initPortrait();
        });

        $("#deleteBtn").click(function () {
            if (confirm('你确定要删除选择项目吗？')) {
                person.delete(function () {
                    person.pageModel.setModal(window.houoy.public.PageManage.UIModal.LIST);
                    person.refresh();
                }, function () {
                });
            }
        });

        $("#saveBtn").click(function () {
            person.save(function () {
                person.pageModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            }, function () {
            });
        });

        $("#cancelBtn").click(function () {
            person.pageModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            person.resetCurrentData({//新增时候当前缓存数据是空
                pk_person: null,
                person_code: null,
                person_name: null,
                person_alias: null,
                password: null,
                mobile: null
            });
        });

        $("#toCardBtn").click(function () {
            person.pageModel.setModal(window.houoy.public.PageManage.UIModal.CARD);
            person.resetCurrentData(person.dataTable.getSelectedRows()[0]);//设置当前选中的行
        });

        $("#toListBtn").click(function () {
            person.pageModel.setModal(window.houoy.public.PageManage.UIModal.LIST);
            person.pageModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            person.pageModel.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);
            person.refresh();
        });

        $("#searchBtn").click(function () {
            person.refresh();
        });

        $("#searchResetBtn").click(function () {
            $("input[name='person_code']").val("");
            $("input[name='person_name']").val("");
            $("input[name='person_alias']").val("");
            $("input[name='password']").val("");
            $("input[name='mobile']").val("");
            person.refresh();
        });

        //初始化fileinput控件（第一次初始化）
        $('#imgAdd').fileinput({
            language: 'zh',
            showCaption: false, //是否显示标题,
            uploadUrl: window.houoy.public.static.contextPath + "/api/person/upload",//上传的地址
            uploadExtraData: function (previewId, index) {   //额外参数
                var obj = {pk_person: person.pageModel.getCurrentData().pk_person};
                return obj;
            },
            allowedFileExtensions: ['jpg', 'png']
        });

        //初始化
        person.pageModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);//默认是查询状态
        person.pageModel.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//默认是没有选中数据
        person.pageModel.setModal(window.houoy.public.PageManage.UIModal.LIST);//默认是列表模式

        person.dataTable = window.houoy.public.createDataTable({
            dataTableID: "table",
            url: window.houoy.public.static.contextPath + "/api/person/retrieve",
            urlType: "get",
            param: {//查询参数
                person_code: function () {
                    return $("input[name='person_code']").val()
                },
                person_name: function () {
                    return $("input[name='person_name']").val()
                },
                person_alias: function () {
                    return $("input[name='person_alias']").val()
                },
                mobile: function () {
                    return $("input[name='mobile']").val()
                },
            },
            columns: [{"title": "序列号", 'data': 'pk_person', "visible": false},
                {"title": "社交用户编码", 'data': 'person_code'},
                {"title": "社交用户名称", 'data': 'person_name'},
                {"title": "社交用户网名", 'data': 'person_alias'},
                {"title": "社交用户手机号", 'data': 'mobile'}],
            onSelectChange: function (selectedNum, selectedRows) {
                if (selectedNum > 1) {
                    person.pageModel.setSelectState(window.houoy.public.PageManage.DataState.MUL_SELECT);
                } else if (selectedNum == 1) {
                    person.pageModel.setSelectState(window.houoy.public.PageManage.DataState.ONE_SELECT);
                } else {
                    person.pageModel.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//没有选中数据
                }
            }
        });
    };

    person.save = function (onSuccess, onError) {
        if (!($("#person_code").val()) || !($("#person_name").val()) || !($("#person_alias").val())
            || !($("#password").val()) || !($("#mobile").val())) {
            alert("请填写完整信息");
        } else {
            person.pageModel.getCurrentData().person_code = $("#person_code").val();
            person.pageModel.getCurrentData().person_name = $("#person_name").val();
            person.pageModel.getCurrentData().person_alias = $("#person_alias").val();
            person.pageModel.getCurrentData().password = $("#password").val();
            person.pageModel.getCurrentData().mobile = $("#mobile").val();
            debugger;
            $.ajax({
                type: 'post',
                url: window.houoy.public.static.contextPath + '/api/person/save',
                contentType: "application/json;charset=UTF-8",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("x-auth-token", window.houoy.public.static.getSessionID());  //使用spring session的token方式
                },
                dataType: "json",
                data: JSON.stringify(person.pageModel.getCurrentData()),
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

    person.delete = function (onSuccess, onError) {
        var pk_persons = [];
        switch (person.pageModel.getModal()) {
            case window.houoy.public.PageManage.UIModal.CARD:
                pk_persons[0] = person.pageModel.getCurrentData().pk_person;
                break;
            case window.houoy.public.PageManage.UIModal.LIST:
                $.each(person.dataTable.getSelectedRows(), function (index, value) {
                    pk_persons[index] = value.pk_person;
                });
                break;
            default:
                break;
        }
        debugger;//浏览器调试时使用
        $.ajax({
            type: 'post',
            url: window.houoy.public.static.contextPath + '/api/person/delete',
            contentType: "application/json;charset=UTF-8",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("x-auth-token", window.houoy.public.static.getSessionID());  //使用spring session的token方式
            },
            dataType: "json",
            data: JSON.stringify(pk_persons),
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

    person.refresh = function () {
        person.dataTable.refresh();
    };

    person.initPortrait = function () {
        $("#portrait").attr("src",window.houoy.public.static.contextPath
            + '/api/person/portrait?pk='+person.pageModel.getCurrentData().pk_person);
    };

    person.init();
})(window.houoy.person || {});
