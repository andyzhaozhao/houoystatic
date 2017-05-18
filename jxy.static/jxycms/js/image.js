/**
 * 角色管理
 * @author andyzhao
 */
(function (image) {
    //定义页面数据模型
    var url = "http://localhost:8888/api";
    image.imageModel = window.houoy.public.createPageModel();
    image.imageModel.setCurrentData({
        pk_image: null,
        image_code: $("#image_code").val(),
        image_name: $("#image_name").val()
    });

    image.resetCurrentData = function (data) {
        image.imageModel.getCurrentData().image_code = data.image_code;
        image.imageModel.getCurrentData().image_name = data.image_name;
        $("#image_code").val(image.imageModel.getCurrentData().image_code);
        $("#image_name").val(image.imageModel.getCurrentData().image_name);
    };

    //定义页面成员方法
    image.init = function () {
        image.initTree();

        //注册事件监听
        $("#addBtn").click(function () {
            image.imageModel.setModal(window.houoy.public.PageManage.UIModal.CARD);
            image.imageModel.setUIState(window.houoy.public.PageManage.UIState.CREATE);
            image.resetCurrentData({//新增时候当前缓存数据是空
                image_code: null,
                image_name: null
            });
        });

        $("#editBtn").click(function () {
            image.imageModel.setModal(window.houoy.public.PageManage.UIModal.CARD);
            image.imageModel.setUIState(window.houoy.public.PageManage.UIState.CREATE);
            image.resetCurrentData(image.dataTable.getSelectedRows()[0]);//设置当前选中的行
        });

        $("#deleteBtn").click(function () {
            if (confirm('你确定要删除选择项目吗？')) {
                image.delete(function () {
                    image.imageModel.setModal(window.houoy.public.PageManage.UIModal.LIST);
                    image.refresh();
                }, function () {
                });
            }
        });

        $("#saveBtn").click(function () {
            image.save(function () {
                image.imageModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            }, function () {
            });
        });

        $("#cancelBtn").click(function () {
            image.imageModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            image.resetCurrentData({//新增时候当前缓存数据是空
                image_code: null,
                image_name: null
            });
        });

        $("#toCardBtn").click(function () {
            image.imageModel.setModal(window.houoy.public.PageManage.UIModal.CARD);
            image.resetCurrentData(image.dataTable.getSelectedRows()[0]);//设置当前选中的行
        });

        $("#toListBtn").click(function () {
            image.imageModel.setModal(window.houoy.public.PageManage.UIModal.LIST);
            image.imageModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            image.imageModel.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);
            image.refresh();
        });

        $("#searchBtn").click(function () {
            image.refresh();
        });

        $("#searchResetBtn").click(function () {
            $("input[name='image_code']").val("");
            $("input[name='image_name']").val("");
            image.refresh();
        });

        //初始化
        image.imageModel.setUIState(window.houoy.public.PageManage.UIState.SEARCH);//默认是查询状态
        image.imageModel.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//默认是没有选中数据
        image.imageModel.setModal(window.houoy.public.PageManage.UIModal.LIST);//默认是列表模式

        image.dataTable = window.houoy.public.createDataTable({
            dataTableID: "table",
            url: url + "/image/retrieve",
            param: {//查询参数
                image_code: function () {
                    return $("input[name='image_code']").val();
                },
                image_name: function () {
                    return $("input[name='image_name']").val();
                }
            },
            columns: [{"title": "pk", 'data': 'pk_image', "visible": false},
                {"title": "图片编码", 'data': 'image_code'},
                {"title": "图片名称", 'data': 'image_name'}],
            onSelectChange: function (selectedNum, selectedRows) {
                if (selectedNum > 1) {
                    image.imageModel.setSelectState(window.houoy.public.PageManage.DataState.MUL_SELECT);
                } else if (selectedNum == 1) {
                    image.imageModel.setSelectState(window.houoy.public.PageManage.DataState.ONE_SELECT);
                } else {
                    image.imageModel.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//没有选中数据
                }
            }
        });
    };

    image.initTree = function () {
        var folderTree = null;
        var foldeNnameIpt = $("#foldeNnameIpt");
        function loadTree() {
            window.houoy.public.post(url + '/folder/retrieve', null, function (data) {
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

                foldeNnameIpt.prop("folderCode", folderCode);
                foldeNnameIpt.prop("pkParent", pkParent);
                foldeNnameIpt.prop("pk_folder", null);
                $('#treeAddModal').modal();
            }
        }

        //编辑节点
        function openEditModal() {
            var so = folderTree.treeview('getSelected');
            if (so == null || so.length <= 0) {
                window.houoy.public.alert('#treeAlertArea', "请选择一个目录")
            } else {
                foldeNnameIpt.prop("folderCode", so[0].folder_code);
                foldeNnameIpt.prop("pkParent",  so[0].pk_parent);
                foldeNnameIpt.prop("pk_folder",  so[0].pk_folder);
                foldeNnameIpt.val(so[0].folder_name);
                $('#treeAddModal').modal();
            }
        }

        //保存节点
        $("#treeSaveBtn").click(function () {
            var paramData = {
                pk_folder: foldeNnameIpt.prop("pk_folder"),
                pk_parent: foldeNnameIpt.prop("pkParent"),
                folder_code: foldeNnameIpt.prop("folderCode"),
                folder_name: foldeNnameIpt.val()
            };

            window.houoy.public.post(url + '/folder/save', JSON.stringify(paramData), function (data) {
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

            window.houoy.public.post(url + '/folder/delete', JSON.stringify(paramData), function (data) {
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

    image.save = function (onSuccess, onError) {
        if (!($("#image_name").val()) || !($("#image_code").val())) {
            alert("请填写完整信息");
        } else {
            image.imageModel.getCurrentData().image_name = $("#image_name").val();
            image.imageModel.getCurrentData().image_code = $("#image_code").val();

            $.ajax({
                type: 'post',
                url: url + '/image/save',
                contentType: "application/json;charset=UTF-8",
                dataType: "json",
                data: JSON.stringify(image.imageModel.getCurrentData()),
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

    image.delete = function (onSuccess, onError) {
        var _ids = [];
        switch (image.imageModel.getModal()) {
            case window.houoy.public.PageManage.UIModal.CARD:
                _ids[0] = image.imageModel.getCurrentData().id;
                break;
            case window.houoy.public.PageManage.UIModal.LIST:
                $.each(image.dataTable.getSelectedRows(), function (index, value) {
                    _ids[index] = value.id;
                });
                break;
            default:
                break;
        }

        $.ajax({
            type: 'delete',
            url: url + '/image/delete',
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

    image.refresh = function () {
        image.dataTable.refresh();
    };

    image.init();
})(window.houoy.image || {});


