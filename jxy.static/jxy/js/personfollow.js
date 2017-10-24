/**
 * @author andyzhao
 */
(function (personfollow) {
    //定义页面数据模型
    var url = window.houoy.public.static.contextPath+"/api" ;
    personfollow.model = (function () {
        if (!personfollow.model) {
            personfollow.model = {};
        }

        personfollow.model = window.houoy.public.createPageModel();
        personfollow.model.setCurrentData({
            pk_relfp: null,
            pk_person: $("#pk_person").val(),
            follow_pk_person: $("#follow_pk_person").val(),
        });

        personfollow.resetCurrentData = function (data) {
            personfollow.model.getCurrentData().pk_relfp = data.pk_relfp;
            personfollow.model.getCurrentData().pk_person = data.pk_person;
            personfollow.model.getCurrentData().follow_pk_person = data.follow_pk_person;
            $("#pk_person").val(personfollow.model.getCurrentData().pk_person);
            $("#follow_pk_person").val(personfollow.model.getCurrentData().follow_pk_person);
            $("#pk_relfp").val(personfollow.model.getCurrentData().pk_relfp);
        };

        return personfollow.model;
    })();

    personfollow.view = (function () {
        if (!personfollow.view) {
            personfollow.view = {};
        }

        personfollow.view.new = function () {
            //初始化模型
            personfollow.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);//默认是查询状态
            personfollow.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//默认是没有选中数据
            personfollow.model.setModal(window.houoy.public.PageManage.UIModal.LIST);//默认是列表模式

            //初始化表格
            personfollow.dataTable = window.houoy.public.createDataTable({
                dataTableID: "table",
                single:true,
                url: url + "/personFollow/retrieve",
                urlType: "get",
                param: {//查询参数
                    pk_person: function () {
                        return $("#pk_person").val();
                    },
                    follow_pk_person: function () {
                        return $("#follow_pk_person").val();
                    }
                },
                columns: [{"title": "pk", 'data': 'pk_relfp', "visible": false},
                    {"title": "用户主键", 'data': 'pk_person'},
                    {"title": "被关注用户主键", 'data': 'follow_pk_person'}],
                onSelectChange: function (selectedNum, selectedRows) {
                    if (selectedNum > 1) {
                        personfollow.model.setSelectState(window.houoy.public.PageManage.DataState.MUL_SELECT);
                    } else if (selectedNum == 1) {
                        personfollow.model.setSelectState(window.houoy.public.PageManage.DataState.ONE_SELECT);
                    } else {
                        personfollow.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//没有选中数据
                    }
                }
            });
        };

        return personfollow.view;
    }());

    personfollow.controller = (function () {
        if (!personfollow.controller) {
            personfollow.controller = {};
        }

        //刷新表格数据
        personfollow.controller.search = function () {
            personfollow.dataTable.refresh();
        };

        //搜索区reset
        personfollow.controller.searchReset = function () {
            $("#pk_person").val("");
            $("#follow_pk_person").val("");
            personfollow.controller.search();
        };

        return personfollow.controller;
    }());

    personfollow.registerEvent = function () {
        //注册事件监听
        $("#searchBtn").click(personfollow.controller.search);
        $("#searchResetBtn").click(personfollow.controller.searchReset);
    };

    personfollow.view.new();
    personfollow.registerEvent();

})(window.houoy.personfollow || {});


