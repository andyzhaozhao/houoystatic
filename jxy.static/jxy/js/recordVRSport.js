/**
 * @author andyzhao
 */
(function (recordVRSport) {
    //定义页面数据模型
    var url = window.houoy.public.static.contextPath+"/api" ;
    recordVRSport.model = (function () {
        if (!recordVRSport.model) {
            recordVRSport.model = {};
        }

        recordVRSport.model = window.houoy.public.createPageModel();


        return recordVRSport.model;
    })();

    recordVRSport.view = (function () {
        if (!recordVRSport.view) {
            recordVRSport.view = {};
        }

        recordVRSport.view.new = function () {
            //初始化模型
            recordVRSport.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);//默认是查询状态
            recordVRSport.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//默认是没有选中数据
            recordVRSport.model.setModal(window.houoy.public.PageManage.UIModal.LIST);//默认是列表模式

            //初始化表格
            recordVRSport.dataTable = window.houoy.public.createDataTable({
                dataTableID: "table",
                single:true,
                url: url + "/recordVRSport/retrieve",
                urlType: "get",
                param: {//查询参数
                    person_name: function () {
                        return $("#person_name").val();
                    },
                    place_name: function () {
                        return $("#place_name").val();
                    },
                    video_name: function () {
                        return $("#video_name").val();
                    }
                },
                columns: [{"title": "pk", 'data': 'pk_record_sport', "visible": false},
                    {"title": "运动记录代码", 'data': 'record_sport_code'},
                    {"title": "运动记录名称", 'data': 'record_sport_name'},
                    {"title": "用户主键", 'data': 'pk_person', "visible": false},
                    {"title": "用户名称", 'data': 'person_name'},
                    {"title": "地点名称", 'data': 'place_name'},
                    {"title": "教程名称", 'data': 'video_name'},
                    {"title": "开始时间", 'data': 'time_start'},
                    {"title": "结束名称", 'data': 'time_end'},
                    {"title": "运动时长", 'data': 'time_length'},
                    {"title": "平均心率", 'data': 'heart_rate'},
                    {"title": "最大心率", 'data': 'heart_rate_max'},
                    {"title": "消耗的卡路里", 'data': 'calorie'}
                ],
                onSelectChange: function (selectedNum, selectedRows) {
                    if (selectedNum > 1) {
                        recordVRSport.model.setSelectState(window.houoy.public.PageManage.DataState.MUL_SELECT);
                    } else if (selectedNum == 1) {
                        recordVRSport.model.setSelectState(window.houoy.public.PageManage.DataState.ONE_SELECT);
                    } else {
                        recordVRSport.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//没有选中数据
                    }
                }
            });
        };

        return recordVRSport.view;
    }());

    recordVRSport.controller = (function () {
        if (!recordVRSport.controller) {
            recordVRSport.controller = {};
        }

        //刷新表格数据
        recordVRSport.controller.search = function () {
            recordVRSport.dataTable.refresh();
        };

        //搜索区reset
        recordVRSport.controller.searchReset = function () {
            $("#person_name").val("");
            $("#place_name").val("");
            $("#video_name").val("");
            recordVRSport.controller.search();
        };

        return recordVRSport.controller;
    }());

    recordVRSport.registerEvent = function () {
        //注册事件监听
        $("#searchBtn").click(recordVRSport.controller.search);
        $("#searchResetBtn").click(recordVRSport.controller.searchReset);
    };

    recordVRSport.view.new();
    recordVRSport.registerEvent();

})(window.houoy.recordVRSport || {});


