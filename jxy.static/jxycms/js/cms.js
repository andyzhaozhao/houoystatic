/**
 * 角色管理
 * @author andyzhao
 */
(function (cms) {
    //定义页面数据模型
    var url = "http://localhost:8888";
    cms.userModel = window.houoy.public.createPageModel();
    cms.userModel.setCurrentData({
        id: null,
        title: $("#title").val(),
        subTitle: $("#subTitle").val(),
        content: $("#content").val()
    });

    cms.resetCurrentData = function (data) {
        cms.userModel.getCurrentData().id = data.id;
        cms.userModel.getCurrentData().title = data.title;
        cms.userModel.getCurrentData().subTitle = data.subTitle;
        cms.userModel.getCurrentData().content = data.content;
        $("#title").val(cms.userModel.getCurrentData().title);
        $("#subTitle").val(cms.userModel.getCurrentData().subTitle);
        cms.um.setContent(cms.userModel.getCurrentData().content);
    };

    //定义页面成员方法
    cms.init = function () {
        //加载编辑器的容器
        if(!cms.um){
            debugger;
            cms.um = new wangEditor('container');
            cms.um.create();
        }

        //注册事件监听
        $("#addBtn").click(function () {
            cms.userModel.setModal(window.houoy.public.PageManage.UIModal.CARD);
            cms.userModel.setUIState(window.houoy.public.PageManage.UIState.CREATE);
            cms.resetCurrentData({//新增时候当前缓存数据是空
                id: null,
                title: null,
                subTitle: null,
                content: null
            });
        });

        $("#editBtn").click(function () {
            cms.userModel.setModal(window.houoy.public.PageManage.UIModal.CARD);
            cms.userModel.setUIState(window.houoy.public.PageManage.UIState.CREATE);
            cms.resetCurrentData(cms.dataTable.getSelectedRows()[0]);//设置当前选中的行
        });

        $("#deleteBtn").click(function () {
            if (confirm('你确定要删除选择项目吗？')) {
                cms.delete(function () {
                    cms.userModel.setModal(window.houoy.public.PageManage.UIModal.LIST);
                    cms.refresh();
                }, function () {
                });
            }
        });

        $("#saveBtn").click(function () {
            cms.save(function () {
                cms.userModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            }, function () {
            });
        });

        $("#cancelBtn").click(function () {
            cms.userModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            cms.resetCurrentData({//新增时候当前缓存数据是空
                id: null,
                title: null,
                subTitle: null,
                content: null
            });
        });

        $("#toCardBtn").click(function () {
            cms.userModel.setModal(window.houoy.public.PageManage.UIModal.CARD);
            cms.resetCurrentData(cms.dataTable.getSelectedRows()[0]);//设置当前选中的行
        });

        $("#toListBtn").click(function () {
            cms.userModel.setModal(window.houoy.public.PageManage.UIModal.LIST);
            cms.userModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            cms.userModel.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);
            cms.refresh();
        });

        $("#searchBtn").click(function () {
            cms.refresh();
        });

        $("#searchResetBtn").click(function () {
            $("input[name='title']").val("");
            $("input[name='content']").val("");
            cms.refresh();
        });

        //初始化
        cms.userModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);//默认是查询状态
        cms.userModel.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//默认是没有选中数据
        cms.userModel.setModal(window.houoy.public.PageManage.UIModal.LIST);//默认是列表模式

        cms.dataTable = window.houoy.public.createDataTable({
            dataTableID: "table",
            url: url+"/essay",
            param: {//查询参数
                title: function(){return $("input[name='title']").val()},
                content: function(){return $("input[name='content']").val()}
            },
            columns: [{"title": "序列号", 'data': 'id', "visible": false},
                {"title": "标题", 'data': 'title'},
                {"title": "副标题", 'data': 'subTitle'}],
            onSelectChange: function (selectedNum, selectedRows) {
                if (selectedNum > 1) {
                    cms.userModel.setSelectState(window.houoy.public.PageManage.DataState.MUL_SELECT);
                } else if (selectedNum == 1) {
                    cms.userModel.setSelectState(window.houoy.public.PageManage.DataState.ONE_SELECT);
                } else {
                    cms.userModel.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//没有选中数据
                }
            }
        });
    };

    cms.save = function (onSuccess, onError) {
        if (!($("#title").val()) || !($("#subTitle").val())) {
            alert("请填写完整信息");
        } else {
            cms.userModel.getCurrentData().title = $("#title").val();
            cms.userModel.getCurrentData().subTitle = $("#subTitle").val();
            cms.userModel.getCurrentData().content =   cms.um.getContent();

            $.ajax({
                type: 'post',
                url: url + '/essay',
                contentType: "application/json;charset=UTF-8",
                dataType: "json",
                data: JSON.stringify(cms.userModel.getCurrentData()),
                success: function (data) {
                    if (data.success) {
                        alert("保存成功");
                        onSuccess();
                    } else {
                        alert("保存失败:" + data.msg);
                    }
                },
                error: function (data) {
                    alert("保存失败！"+data);
                    onError();
                }
            });
        }
    };

    cms.delete = function (onSuccess, onError) {
        var _ids = [];
        switch (cms.userModel.getModal()) {
            case window.houoy.public.PageManage.UIModal.CARD:
                _ids[0] = cms.userModel.getCurrentData().id;
                break;
            case window.houoy.public.PageManage.UIModal.LIST:
                $.each(cms.dataTable.getSelectedRows(), function (index, value) {
                    _ids[index] = value.id;
                });
                break;
            default:
                break;
        }

        $.ajax({
            type: 'delete',
            url: url + '/delete',
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            data: JSON.stringify(_ids),
            success: function (data) {
                if (data.success) {
                    onSuccess();
                } else {
                    alert("删除失败:" + data);
                }
            },
            error: function (data) {
                alert("删除失败！");
                onError();
            }
        });
    };

    cms.refresh = function () {
        cms.dataTable.refresh();
    }

    cms.init();
})(window.houoy.cms || {});


