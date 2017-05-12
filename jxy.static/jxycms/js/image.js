/**
 * 角色管理
 * @author andyzhao
 */
(function (cms) {
    //定义页面数据模型
    var url = "http://localhost:8888/api/folder";
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
        cms.initTree();
        //加载编辑器的容器
        if (!cms.um) {
            //debugger;
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
            url: url + "/essay",
            param: {//查询参数
                title: function () {
                    return $("input[name='title']").val()
                },
                content: function () {
                    return $("input[name='content']").val()
                }
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

    cms.initTree = function () {
        var folderTree = null;

        function loadTree() {
            window.houoy.public.post(url + '/retrieve', null, function (data) {
                if (data.success) {
                    var treeData = data.resultData.nodes;
                    folderTree = $('#tree').treeview({data: treeData});
                } else {
                    alert("获取tree失败:" + data.msg);
                }
            }, function (err) {
                alert("获取tree失败！" + err);
            });
        }

        //增加同级节点
        $("#treeAddNextBtn").click(function () {
            openAddModal("sibing") ;
        });

        //增加子节点
        $("#treeAddChildBtn").click(function () {
            openAddModal("child") ;
        });

        //编辑当前节点
        $("#treeEditBtn").click(function () {
            openEditModal();
        });

        //删除当前节点
        $("#treeDeleteBtn").click(function () {
            var so = folderTree.treeview('getSelected');
            if (so == null || so.length <= 0) {
                window.houoy.public.alert('#treeAlertArea', "请选择一个目录")
            } else {
                $("#deleteFolderSpan").text(so[0].folder_name);
                $("#deleteFolderSpan").prop("pk_folder",  so[0].pk_folder);
                $('#treeDeleteModal').modal();
            }
        });

        //添加节点
        function openAddModal(type) {
            var so = folderTree.treeview('getSelected');
            if (so == null || so.length <= 0) {
                window.houoy.public.alert('#treeAlertArea', "请选择一个目录")
            } else {
                var folderCode = null;
                var pkParent = null;

                switch (type) {
                    case "child":
                        pkParent = so[0].pk_folder;
                        if(so[0].nodes){//如果有子节点
                            folderCode = so[0].folder_code + ((1000 + so[0].nodes.length + 1) + "").substr(1);//获得新节点的folderCode
                        }else{
                            folderCode = so[0].folder_code + "001";//获得新节点的folderCode
                        }
                        break;
                    case "sibing":
                        if ( so[0].parentId == null ||  so[0].parentId == undefined) {//如果是一级节点
                            var siblingLength = folderTree.treeview('getSiblings', so[0]).length;
                            folderCode = ((1000000 + siblingLength + 2) + "").substr(1);//获得新节点的folderCode
                            pkParent = "1";
                        } else {//如果存在，说明当前选中的不是一级节点
                            var parentNode = folderTree.treeview('getNode',  so[0].parentId);
                            var n = ((1000 + parentNode.nodes.length + 1) + "").substr(1);//获得新节点的folderCode
                            folderCode = parentNode.folder_code + n;
                            pkParent = parentNode.pk_folder;
                        }
                        break;
                    default:
                        break;
                }

                $("#foldeNnameIpt").prop("folderCode", folderCode);
                $("#foldeNnameIpt").prop("pkParent", pkParent);
                $("#foldeNnameIpt").prop("pk_folder", null);
                $('#treeAddModal').modal();
            }
        }

        //编辑节点
        function openEditModal() {
            var so = folderTree.treeview('getSelected');
            if (so == null || so.length <= 0) {
                window.houoy.public.alert('#treeAlertArea', "请选择一个目录")
            } else {
                $("#foldeNnameIpt").prop("folderCode", so[0].folder_code);
                $("#foldeNnameIpt").prop("pkParent",  so[0].pk_parent);
                $("#foldeNnameIpt").prop("pk_folder",  so[0].pk_folder);
                $("#foldeNnameIpt").val(so[0].folder_name);
                $('#treeAddModal').modal();
            }
        }

        //保存节点
        $("#treeSaveBtn").click(function () {
            var paramData = {
                pk_folder: $("#foldeNnameIpt").prop("pk_folder"),
                pk_parent: $("#foldeNnameIpt").prop("pkParent"),
                folder_code: $("#foldeNnameIpt").prop("folderCode"),
                folder_name: $("#foldeNnameIpt").val()
            };

            window.houoy.public.post(url + '/save', JSON.stringify(paramData), function (data) {
                if (data.success) {
                    loadTree();
                } else {
                    alert("增加失败:" + data.msg);
                }
                $('#treeAddModal').modal("hide");
            }, function (err) {
                alert("增加失败！" + err.responseText);
                $('#treeAddModal').modal("hide");
            });
        });

        //删除
        $("#treeDeleteSureBtn").click(function(){
            var paramData = [$("#deleteFolderSpan").prop("pk_folder")];

            window.houoy.public.post(url + '/delete', JSON.stringify(paramData), function (data) {
                if (data.success) {
                    loadTree();
                } else {
                    alert("删除失败:" + data.msg);
                }
                $('#treeDeleteModal').modal("hide");
            }, function (err) {
                alert("删除失败" + err.responseText);
                $('#treeDeleteModal').modal("hide");
            });
        });

        //搜索
        $('#treeSearchInt').bind('input propertychange', function () {
            folderTree.treeview('search', [$(this).val(), {
                ignoreCase: true,     // case insensitive
                exactMatch: false,    // like or equals
                revealResults: true // reveal matching nodes
            }]);
        });

        loadTree();
    };

    cms.save = function (onSuccess, onError) {
        if (!($("#title").val()) || !($("#subTitle").val())) {
            alert("请填写完整信息");
        } else {
            cms.userModel.getCurrentData().title = $("#title").val();
            cms.userModel.getCurrentData().subTitle = $("#subTitle").val();
            cms.userModel.getCurrentData().content = cms.um.getContent();

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
                    alert("保存失败！" + data);
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
    };

    cms.init();
})(window.houoy.cms || {});


