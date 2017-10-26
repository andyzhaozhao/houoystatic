/**
 * @author andyzhao
 */
(function (recordEssay) {
    //定义页面数据模型
    var url = window.houoy.public.static.contextPath+"/api" ;
    recordEssay.model = (function () {
        if (!recordEssay.model) {
            recordEssay.model = {};
        }

        recordEssay.model = window.houoy.public.createPageModel();


        return recordEssay.model;
    })();

    recordEssay.view = (function () {
        if (!recordEssay.view) {
            recordEssay.view = {};
        }

        recordEssay.view.new = function () {
            //初始化模型
            recordEssay.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);//默认是查询状态
            recordEssay.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//默认是没有选中数据
            recordEssay.model.setModal(window.houoy.public.PageManage.UIModal.LIST);//默认是列表模式

            //初始化表格
            recordEssay.dataTable = window.houoy.public.createDataTable({
                dataTableID: "table",
                single:true,
                url: url + "/recordEssay/retrieve",
                urlType: "get",
                param: {//查询参数
                    person_name: function () {
                        return $("#person_name").val();
                    },
                    essay_name: function () {
                        return $("#essay_name").val();
                    }
                },
                columns: [{"title": "pk", 'data': 'pk_record_essay', "visible": false},
                    {"title": "阅读记录代码", 'data': 'record_essay_code'},
                    {"title": "阅读记录名称", 'data': 'record_essay_name'},
                    {"title": "用户主键", 'data': 'pk_person', "visible": false},
                    {"title": "用户名称", 'data': 'person_name'},
                    {"title": "文章pk", 'data': 'pk_essay'},
                    {"title": "文章名称", 'data': 'essay_name', "visible": false},
                    {"title": "阅读时长", 'data': 'time_length'}
                ],
                onSelectChange: function (selectedNum, selectedRows) {
                    if (selectedNum > 1) {
                        recordEssay.model.setSelectState(window.houoy.public.PageManage.DataState.MUL_SELECT);
                    } else if (selectedNum == 1) {
                        recordEssay.model.setSelectState(window.houoy.public.PageManage.DataState.ONE_SELECT);
                    } else {
                        recordEssay.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//没有选中数据
                    }
                }
            });
        };

        return recordEssay.view;
    }());

    recordEssay.controller = (function () {
        if (!recordEssay.controller) {
            recordEssay.controller = {};
        }

        //刷新表格数据
        recordEssay.controller.search = function () {
            recordEssay.dataTable.refresh();
        };

        //搜索区reset
        recordEssay.controller.searchReset = function () {
            $("#person_name").val("");
            $("#essay_name").val("");
            recordEssay.controller.search();
        };

        return recordEssay.controller;
    }());

    recordEssay.registerEvent = function () {
        //注册事件监听
        $("#searchBtn").click(recordEssay.controller.search);
        $("#searchResetBtn").click(recordEssay.controller.searchReset);
    };

    recordEssay.view.new();
    recordEssay.registerEvent();

})(window.houoy.recordEssay || {});


