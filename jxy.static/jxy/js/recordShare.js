/**
 * @author andyzhao
 */
(function (recordShare) {
    //定义页面数据模型
    var url = window.houoy.public.static.contextPath+"/api" ;
    recordShare.model = (function () {
        if (!recordShare.model) {
            recordShare.model = {};
        }

        recordShare.model = window.houoy.public.createPageModel();


        return recordShare.model;
    })();

    recordShare.view = (function () {
        if (!recordShare.view) {
            recordShare.view = {};
        }

        recordShare.view.new = function () {
            //初始化模型
            recordShare.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);//默认是查询状态
            recordShare.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//默认是没有选中数据
            recordShare.model.setModal(window.houoy.public.PageManage.UIModal.LIST);//默认是列表模式

            //初始化表格
            recordShare.dataTable = window.houoy.public.createDataTable({
                dataTableID: "table",
                single:true,
                url: url + "/recordShare/retrieve",
                urlType: "get",
                param: {//查询参数
                    person_name: function () {
                        return $("#person_name").val();
                    },
                    record_share_desc: function () {
                        return $("#record_share_desc").val();
                    }
                },
                columns: [{"title": "pk", 'data': 'pk_record_share', "visible": false},
                    {"title": "分享记录代码", 'data': 'record_share_code'},
                    {"title": "分享记录名称", 'data': 'record_share_name'},
                    {"title": "用户主键", 'data': 'pk_person', "visible": false},
                    {"title": "用户名称", 'data': 'person_name'},
                    {"title": "分享内容", 'data': 'record_share_desc'}
                ],
                onSelectChange: function (selectedNum, selectedRows) {
                    if (selectedNum > 1) {
                        recordShare.model.setSelectState(window.houoy.public.PageManage.DataState.MUL_SELECT);
                    } else if (selectedNum == 1) {
                        recordShare.model.setSelectState(window.houoy.public.PageManage.DataState.ONE_SELECT);
                    } else {
                        recordShare.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//没有选中数据
                    }
                }
            });
        };

        return recordShare.view;
    }());

    recordShare.controller = (function () {
        if (!recordShare.controller) {
            recordShare.controller = {};
        }

        //刷新表格数据
        recordShare.controller.search = function () {
            recordShare.dataTable.refresh();
        };

        //搜索区reset
        recordShare.controller.searchReset = function () {
            $("#person_name").val("");
            $("#record_share_desc").val("");
            recordShare.controller.search();
        };

        return recordShare.controller;
    }());

    recordShare.registerEvent = function () {
        //注册事件监听
        $("#searchBtn").click(recordShare.controller.search);
        $("#searchResetBtn").click(recordShare.controller.searchReset);
    };

    recordShare.view.new();
    recordShare.registerEvent();

})(window.houoy.recordShare || {});


