/**
 *
 * @author andyzhao
 */
(function (cmslist) {
    //定义页面数据模型
    var url = window.houoy.public.static.cmsContextPath + "/api/essay";
    var urlTree = window.houoy.public.static.cmsContextPath+"/api" ;

    cmslist.model = window.houoy.public.createPageModel();
    cmslist.model.setCurrentData({
        pk_essay: null,
        essay_name: $("#essay_name").val(),
        essay_subname: $("#essay_subname").val(),
        essay_content: $("#essay_content").val(),
        ts_start: $("#ts_start").val(),
        ts_end: $("#ts_end").val(),
        is_publish: 0,
        tree_data:[],
        select_node:{}
    });

    cmslist.resetCurrentData = function (data) {
        cmslist.model.getCurrentData().pk_essay = data.pk_essay;
        cmslist.model.getCurrentData().essay_name = data.essay_name;
        cmslist.model.getCurrentData().essay_subname = data.essay_subname;
        cmslist.model.getCurrentData().essay_content = data.essay_content;
        cmslist.model.getCurrentData().ts_start = data.ts_start;
        cmslist.model.getCurrentData().ts_end = data.ts_end;
        cmslist.model.getCurrentData().pk_type = data.pk_type;
        cmslist.model.getCurrentData().is_publish = data.is_publish;
        cmslist.model.getCurrentData().select_node = cmslist.initTree.getSelectedByField("pk_type",data.pk_type);

        $("#essay_name").val(cmslist.model.getCurrentData().essay_name);
        $("#essay_subname").val(cmslist.model.getCurrentData().essay_subname);
        $("#ts_start").val(cmslist.model.getCurrentData().ts_start);
        $("#ts_end").val(cmslist.model.getCurrentData().ts_end);
        $("#pk_type").val(cmslist.model.getCurrentData().select_node.text);

        cmslist.contentSet('<p>用 JS 设置的内容</p>');
        cmslist.contentSet(cmslist.model.getCurrentData().essay_content);
    };

    cmslist.initWangEditor = function () {
        //加载编辑器的容器
        debugger;
        if (!cmslist.um) {
            cmslist.um = new window.wangEditor('container');
            cmslist.um.create();
        }
    };

    cmslist.contentSet = function (c) {
       cmslist.um.$txt.html(c);
    };

    cmslist.contentGet = function () {
        return cmslist.um.$txt.html();
    };

    //定义页面成员方法
    cmslist.init = function () {
        $("#unPublishBtn").click(function () {
            if (confirm('你确定要取消发布吗？')) {
                cmslist.resetCurrentData(cmslist.dataTable.getSelectedRows()[0]);//设置当前选中的行
                cmslist.model.getCurrentData().is_publish = 1;
                cmslist.save(function () {
                    cmslist.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
                    cmslist.refresh();
                }, function () {
                });
            }
        });

        $("#toCardBtn").click(function () {
            cmslist.model.setModal(window.houoy.public.PageManage.UIModal.CARD);
            cmslist.initWangEditor();
            cmslist.resetCurrentData(cmslist.dataTable.getSelectedRows()[0]);//设置当前选中的行
        });

        $("#toListBtn").click(function () {
            cmslist.model.setModal(window.houoy.public.PageManage.UIModal.LIST);
            cmslist.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            cmslist.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);
            cmslist.refresh();
        });

        $("#searchBtn").click(function () {
            cmslist.refresh();
        });

        $("#searchResetBtn").click(function () {
            $("input[name='essay_name']").val("");
            $("input[name='essay_subname']").val("");
            cmslist.refresh();
        });

        //初始化
        cmslist.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);//默认是查询状态
        cmslist.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//默认是没有选中数据
        cmslist.model.setModal(window.houoy.public.PageManage.UIModal.LIST);//默认是列表模式

        cmslist.dataTable = window.houoy.public.createDataTable({
            dataTableID: "table",
            url: url + "/retrieve",
            urlType: "get",
            param: {//查询参数
                essay_name: function () {
                    return $("input[name='essay_name']").val();
                },
                essay_subname: function () {
                    return $("input[name='essay_subname']").val();
                }
            },
            columns: [{"title": "序列号", 'data': 'pk_essay', "visible": false},
                {"title": "文章编码", 'data': 'essay_code', "visible": false},
                {"title": "标题", 'data': 'essay_name'},
                {"title": "副标题", 'data': 'essay_subname'},
                {"title": "开始时间", 'data': 'ts_start'},
                {"title": "结束时间", 'data': 'ts_end'},
                {"title": "类型", 'data': 'pk_type'},
                {"title": "发布", 'data': 'is_publish', "visible": false}
            ],
            onSelectChange: function (selectedNum, selectedRows) {
                if (selectedNum > 1) {
                    cmslist.model.setSelectState(window.houoy.public.PageManage.DataState.MUL_SELECT);
                } else if (selectedNum == 1) {
                    cmslist.model.setSelectState(window.houoy.public.PageManage.DataState.ONE_SELECT);
                } else {
                    cmslist.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//没有选中数据
                }
            }
        });
    };

    cmslist.refresh = function () {
        cmslist.dataTable.refresh();
    };

    cmslist.init();
})(window.houoy.cmslist || {});


