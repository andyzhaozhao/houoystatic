/**
 *
 * @author andyzhao
 */
(function (cms) {
    //定义页面数据模型
    var url = window.houoy.public.static.cmsContextPath + "/api/essay";
    var urlTree = window.houoy.public.static.cmsContextPath+"/api" ;

    cms.model = window.houoy.public.createPageModel();
    cms.model.setCurrentData({
        pk_essay: null,
        essay_name: $("#essay_name").val(),
        essay_subname: $("#essay_subname").val(),
        essay_content: $("#essay_content").val(),
        ts_start: $("#ts_start").val(),
        ts_end: $("#ts_end").val(),
        is_publish: 0,
        pk_person:$("#pk_person").val(),
        person_name: $("#person_name").val(),
        tree_data:[],
        select_node:{}
    });

    cms.resetCurrentData = function (data) {
        cms.model.getCurrentData().pk_essay = data.pk_essay;
        cms.model.getCurrentData().essay_name = data.essay_name;
        cms.model.getCurrentData().essay_subname = data.essay_subname;
        cms.model.getCurrentData().essay_content = data.essay_content;
        cms.model.getCurrentData().ts_start = data.ts_start;
        cms.model.getCurrentData().ts_end = data.ts_end;
        cms.model.getCurrentData().pk_type = data.pk_type;
        cms.model.getCurrentData().is_publish = data.is_publish;
        cms.model.getCurrentData().person_name = data.person_name;
        cms.model.getCurrentData().pk_person = data.pk_person;
        cms.model.getCurrentData().select_node = cms.initTree.getSelectedByField("pk_type",data.pk_type);

        $("#essay_name").val(cms.model.getCurrentData().essay_name);
        $("#essay_subname").val(cms.model.getCurrentData().essay_subname);
        $("#ts_start").val(cms.model.getCurrentData().ts_start);
        $("#ts_end").val(cms.model.getCurrentData().ts_end);
        $("#pk_type").val(cms.model.getCurrentData().select_node.text);
        $("#pk_person").val(cms.model.getCurrentData().pk_person);
        $("#person_name").val(cms.model.getCurrentData().person_name);

        cms.contentSet('<p>用 JS 设置的内容</p>');
        cms.contentSet(cms.model.getCurrentData().essay_content);
    };

    cms.initWangEditor = function () {
        //加载编辑器的容器
        debugger;
        if (!cms.um) {
            cms.um = new window.wangEditor('container');
            cms.um.create();
        }
    };

    cms.contentSet = function (c) {
       cms.um.$txt.html(c);
    };

    cms.contentGet = function () {
        return cms.um.$txt.html();
    };

    //定义页面成员方法
    cms.init = function () {
        //注册事件监听
        $("#addBtn").click(function () {
            cms.model.setModal(window.houoy.public.PageManage.UIModal.CARD);
            cms.model.setUIState(window.houoy.public.PageManage.UIState.CREATE);
            cms.initWangEditor();
            cms.resetCurrentData({//新增时候当前缓存数据是空
                pk_essay: null,
                essay_name: "",
                essay_subname: "",
                essay_content: "",
                ts_start:null,
                ts_end:null,
                pk_type:0,
                is_publish:0,
                pk_person:"",
                person_name:"",
                tree_data:[],
                select_node:{}
            });
        });

        $("#editBtn").click(function () {
            cms.model.setModal(window.houoy.public.PageManage.UIModal.CARD);
            cms.model.setUIState(window.houoy.public.PageManage.UIState.CREATE);
            cms.initWangEditor();
            cms.resetCurrentData(cms.dataTable.getSelectedRows()[0]);//设置当前选中的行

        });

        $("#deleteBtn").click(function () {
            if (confirm('你确定要删除选择项目吗？')) {
                cms.delete(function () {
                    cms.model.setModal(window.houoy.public.PageManage.UIModal.LIST);
                    cms.refresh();
                }, function () {
                });
            }
        });

        $("#saveBtn").click(function () {
            cms.save(function () {
                cms.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            }, function () {
            });
        });

        $("#publishBtn").click(function () {
            if (confirm('你确定要发布吗？')) {
                cms.resetCurrentData(cms.dataTable.getSelectedRows()[0]);//设置当前选中的行
                cms.model.getCurrentData().is_publish = 1;
                cms.save(function () {
                    cms.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
                    cms.refresh();
                }, function () {
                });
            }
        });

        $("#cancelBtn").click(function () {
            cms.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            //cms.resetCurrentData({//新增时候当前缓存数据是空
            //    pk_essay: null,
            //    essay_name: null,
            //    essay_subname: null,
            //    essay_content: null,
            //    ts_start:null,
            //    ts_end:null,
            //    select_node:{}
            //});
        });

        $("#toCardBtn").click(function () {
            cms.model.setModal(window.houoy.public.PageManage.UIModal.CARD);
            cms.initWangEditor();
            cms.resetCurrentData(cms.dataTable.getSelectedRows()[0]);//设置当前选中的行
        });

        $("#toListBtn").click(function () {
            cms.model.setModal(window.houoy.public.PageManage.UIModal.LIST);
            cms.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            cms.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);
            cms.refresh();
        });

        $("#searchBtn").click(function () {
            cms.refresh();
        });

        $("#searchResetBtn").click(function () {
            $("input[name='essay_name']").val("");
            $("input[name='essay_subname']").val("");
            $("input[name='person_name']").val("");
            cms.refresh();
        });

        $(".form_datetime").datetimepicker({format: 'yyyy-mm-dd hh:ii:ss'});

        //初始化
        cms.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);//默认是查询状态
        cms.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//默认是没有选中数据
        cms.model.setModal(window.houoy.public.PageManage.UIModal.LIST);//默认是列表模式

        cms.dataTable = window.houoy.public.createDataTable({
            dataTableID: "table",
            url: url + "/retrieve",
            urlType: "get",
            param: {//查询参数
                essay_name: function () {
                    return $("input[name='essay_name']").val();
                },
                essay_subname: function () {
                    return $("input[name='essay_subname']").val();
                },
                person_name: function () {
                    return $("input[name='person_name']").val();
                }
            },
            columns: [{"title": "序列号", 'data': 'pk_essay', "visible": false},
                {"title": "文章编码", 'data': 'essay_code', "visible": false},
                {"title": "标题", 'data': 'essay_name'},
                {"title": "副标题", 'data': 'essay_subname'},
                {"title": "开始时间", 'data': 'ts_start'},
                {"title": "结束时间", 'data': 'ts_end'},
                {"title": "类型", 'data': 'pk_type'},
                {"title": "作者", 'data': 'person_name'},
                {"title": "发布", 'data': 'is_publish', "visible": false}
            ],
            onSelectChange: function (selectedNum, selectedRows) {
                if (selectedNum > 1) {
                    cms.model.setSelectState(window.houoy.public.PageManage.DataState.MUL_SELECT);
                } else if (selectedNum == 1) {
                    cms.model.setSelectState(window.houoy.public.PageManage.DataState.ONE_SELECT);
                } else {
                    cms.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//没有选中数据
                }
            }
        });
    };

    cms.save = function (onSuccess, onError) {
        if (!($("#essay_name").val()) || !($("#essay_subname").val())) {
            alert("请填写完整信息");
        } else {
            cms.model.getCurrentData().essay_name = $("#essay_name").val();
            cms.model.getCurrentData().essay_subname = $("#essay_subname").val();
            cms.model.getCurrentData().essay_content = cms.contentGet();
            cms.model.getCurrentData().ts_start = $("#ts_start").val();
            cms.model.getCurrentData().ts_end = $("#ts_end").val();
            cms.model.getCurrentData().pk_type = cms.model.getCurrentData().select_node.pk_type;
            cms.model.getCurrentData().pk_person = $("#pk_person").val();
            cms.model.getCurrentData().person_name = $("#person_name").val();

            window.houoy.public.post(url + '/save', JSON.stringify(cms.model.getCurrentData()), function (data) {
                if (data.success) {
                    alert("保存成功");
                    cms.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
                } else {
                    alert("保存失败:" + data.msg);
                }
            }, function (err) {
                alert("请求保存失败！");
            });
        }
    };

    cms.delete = function (onSuccess, onError) {
        var _ids = [];
        switch (cms.model.getModal()) {
            case window.houoy.public.PageManage.UIModal.CARD:
                _ids[0] = cms.model.getCurrentData().pk_essay;
                break;
            case window.houoy.public.PageManage.UIModal.LIST:
                $.each(cms.dataTable.getSelectedRows(), function (index, value) {
                    _ids[index] = value.pk_essay;
                });
                break;
            default:
                break;
        }

        window.houoy.public.post(url + '/delete', JSON.stringify(_ids), function (data) {
            if (data.success) {
                cms.model.setModal(window.houoy.public.PageManage.UIModal.LIST);
                cms.refresh();
            } else {
                alert("删除失败:" + data);
            }
        }, function (err) {
            alert("请求删除失败！");
        });
    };

    cms.refresh = function () {
        cms.dataTable.refresh();
    };

    cms.initTree = function (onSuccess) {
        var typeTree = null;

        function loadTree() {
            window.houoy.public.get(urlTree + '/essaytype/retrieve', null, function (data) {
                if (data.success) {
                    cms.model.getCurrentData().tree_data = data.resultData;
                    typeTree = $('#tree').treeview({
                        data: cms.model.getCurrentData().tree_data.nodes
                    });
                    onSuccess();
                } else {
                    alert("获取tree失败:" + data.msg);
                }
            }, function (err) {
                alert("获取tree失败！" + err);
            });
        }

        //改变选中项
        $("#changeType").click(function () {
            var so = typeTree.treeview('getSelected');
            if (so == null || so.length <= 0) {
                window.houoy.public.alert('#treeAlertArea', "请选择一个类型")
            } else {
                cms.model.getCurrentData().select_node = so[0];
                $("#pk_type").val(so[0].text);
                $('#typeModal').modal("hide");
            }
        });

        //搜索
        $('#treeSearchInt').bind('input propertychange', function () {
            typeTree.treeview('search', [$(this).val(), {
                ignoreCase: true,     // case insensitive
                exactMatch: false,    // like or equals
                revealResults: true // reveal matching nodes
            }]);
        });


        loadTree();
    };

    //根据属性获得对应的节点
    cms.initTree.getSelectedByField=function(field , value){
        var rs = [];
        function inget(currentNode){
            if(currentNode[field] == value){
                rs.push(currentNode);
            }

            var cs = currentNode.nodes;
            if(cs){
                for(var i=0;i<cs.length;i++){
                    inget(cs[i]);
                }
            }
        }

        inget(cms.model.getCurrentData().tree_data);
        return rs;
    };

    cms.initTree(function(){
        cms.init();
    });

})(window.houoy.cms || {});


