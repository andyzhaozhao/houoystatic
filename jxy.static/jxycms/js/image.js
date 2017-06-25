/**
 * 角色管理
 * @author andyzhao
 */
(function (image) {
    //定义页面数据模型
    //var url = "http://localhost:8888/api";
    var url = window.houoy.public.static.cmsContextPath+"/api" ;
    image.model = (function () {
        if (!image.model) {
            image.model = {};
        }

        image.model = window.houoy.public.createPageModel();
        image.model.setCurrentData({
            pk_image: null,
            image_code: $("#image_code").val(),
            image_name: $("#image_name").val(),
            select_node_id: 0,//默认选中的树节点
            pk_folder: ""
        });

        image.resetCurrentData = function (data) {
            image.model.getCurrentData().pk_image = data.pk_image;
            image.model.getCurrentData().image_code = data.image_code;
            image.model.getCurrentData().image_name = data.image_name;
            $("#image_code").val(image.model.getCurrentData().image_code);
            $("#image_name").val(image.model.getCurrentData().image_name);
            $("#pk_image").val(image.model.getCurrentData().pk_image);
        };

        return image.model;
    })();

    image.view = (function () {
        if (!image.view) {
            image.view = {};
        }

        image.view.new = function () {
            //初始化模型
            image.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);//默认是查询状态
            image.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//默认是没有选中数据
            image.model.setModal(window.houoy.public.PageManage.UIModal.LIST);//默认是列表模式

            //初始化表格
            image.dataTable = window.houoy.public.createDataTable({
                dataTableID: "table",
                url: url + "/image/retrieve",
                param: {//查询参数
                    image_code: function () {
                        return $("input[name='image_code']").val();
                    },
                    image_name: function () {
                        return $("input[name='image_name']").val();
                    },
                    pk_folder: function () {
                        return image.model.getCurrentData().pk_folder;
                    }
                },
                columns: [{"title": "pk", 'data': 'pk_image', "visible": false},
                    {"title": "图片编码", 'data': 'image_code'},
                    {"title": "图片名称", 'data': 'image_name'}],
                onSelectChange: function (selectedNum, selectedRows) {
                    if (selectedNum > 1) {
                        image.model.setSelectState(window.houoy.public.PageManage.DataState.MUL_SELECT);
                    } else if (selectedNum == 1) {
                        image.model.setSelectState(window.houoy.public.PageManage.DataState.ONE_SELECT);
                    } else {
                        image.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//没有选中数据
                    }
                }
            });
        };

        return image.view;
    }());

    image.controller = (function () {
        if (!image.controller) {
            image.controller = {};
        }

        image.controller.toAdd = function () {
            image.model.setModal(window.houoy.public.PageManage.UIModal.CARD);
            image.model.setUIState(window.houoy.public.PageManage.UIState.CREATE);
            image.resetCurrentData({//新增时候当前缓存数据是空
                image_code: null,
                image_name: null
            });
            $("#imageshow").hide();
        };

        image.controller.toEdit = function () {
            image.model.setModal(window.houoy.public.PageManage.UIModal.CARD);
            image.model.setUIState(window.houoy.public.PageManage.UIState.CREATE);
            image.resetCurrentData(image.dataTable.getSelectedRows()[0]);//设置当前选中的行
            var srcstr = "http://47.94.6.120/image/"+image.model.getCurrentData().path+
                "/"+image.dataTable.getSelectedRows()[0].image_name;
            debugger;
            $("#imageshow").attr("src",srcstr);
            $("#imageshowpath").text(srcstr);
            $("#imageshow").show();
        };

        image.controller.toList = function () {
            image.model.setModal(window.houoy.public.PageManage.UIModal.LIST);
            image.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            image.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);
            image.controller.search();
        };

        image.controller.toCard = function () {
            image.model.setModal(window.houoy.public.PageManage.UIModal.CARD);
            image.resetCurrentData(image.dataTable.getSelectedRows()[0]);//设置当前选中的行
            var srcstr = "http://47.94.6.120/image/"+image.model.getCurrentData().path+
                "/"+image.dataTable.getSelectedRows()[0].image_name;
            debugger;
            $("#imageshow").attr("src",srcstr);
            $("#imageshowpath").text(srcstr);
            $("#imageshow").show();
        };

        image.controller.saveRow = function () {
            if (!($("#image_name").val()) || !($("#image_code").val())) {
                alert("请填写完整信息");
            } else {

                image.model.getCurrentData().image_name = $("#image_name").val();
                image.model.getCurrentData().image_code = $("#image_code").val();

                var formData = new FormData();
                formData.append("file", $("#imageFile")[0].files[0]);
                if(image.model.getCurrentData().pk_image){
                    formData.append("pk_image", image.model.getCurrentData().pk_image);
                }
                formData.append("image_name", image.model.getCurrentData().image_name);
                formData.append("image_code", image.model.getCurrentData().image_code);
                formData.append("pk_folder", image.model.getCurrentData().pk_folder);
                formData.append("path", image.model.getCurrentData().path);

                $.ajax({
                    url: url + '/image/save',
                    type: 'POST',
                    data: formData,
                    cache: false, //上传文件不需要缓存。
                    processData: false, // 告诉jQuery不要去处理发送的数据
                    contentType: false,// 告诉jQuery不要去设置Content-Type请求头
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("x-auth-token", window.houoy.public.static.getSessionID());  //使用spring session的token方式
                    },
                    success: function (data) {
                        if (data.success) {
                            alert("保存成功");
                            image.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
                        } else {
                            alert("保存失败:" + data.msg);
                        }
                    },
                    error: function (data) {
                        alert("保存失败:" + data.msg);
                    }
                });


                //
                //window.houoy.public.post(url + '/image/save', JSON.stringify(image.model.getCurrentData()), function (data) {
                //    if (data.success) {
                //        alert("保存成功");
                //        image.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
                //    } else {
                //        alert("保存失败:" + data.msg);
                //    }
                //}, function (err) {
                //    alert("请求保存失败！" + err);
                //});
            }
        };

        image.controller.deleteRow = function () {
            if (confirm('你确定要删除选择项目吗？')) {
                var _ids = [];
                switch (image.model.getModal()) {
                    case window.houoy.public.PageManage.UIModal.CARD:
                        _ids[0] = image.model.getCurrentData().id;
                        break;
                    case window.houoy.public.PageManage.UIModal.LIST:
                        $.each(image.dataTable.getSelectedRows(), function (index, value) {
                            _ids[index] = value.id;
                        });
                        break;
                    default:
                        break;
                }

                window.houoy.public.post(url + '/image/delete', JSON.stringify(_ids), function (data) {
                    if (data.success) {
                        image.model.setModal(window.houoy.public.PageManage.UIModal.LIST);
                        image.controller.search();
                    } else {
                        alert("删除失败:" + data);
                    }
                }, function (err) {
                    alert("请求删除失败！");
                });

                //$.ajax({
                //    type: 'delete',
                //    url: url + '/image/delete',
                //    contentType: "application/json;charset=UTF-8",
                //    dataType: "json",
                //    data: JSON.stringify(_ids),
                //    success: function (data) {
                //        if (data.success) {
                //            image.model.setModal(window.houoy.public.PageManage.UIModal.LIST);
                //            image.refresh();
                //        } else {
                //            alert("删除失败:" + data);
                //        }
                //    },
                //    error: function (data) {
                //        alert("删除失败！");
                //    }
                //});
            }
        };

        //取消所有行操作
        image.controller.cancelRow = function () {
            image.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            image.resetCurrentData({//新增时候当前缓存数据是空
                image_code: null,
                image_name: null
            });
        };

        //刷新表格数据
        image.controller.search = function () {
            image.dataTable.refresh();
        };

        //搜索区reset
        image.controller.searchReset = function () {
            $("input[name='image_code']").val("");
            $("input[name='image_name']").val("");
            image.controller.search();
        };

        return image.controller;
    }());

    image.initTree = function (onSuccess) {
        var folderTree = null;
        var foldeNameIpt = $("#foldeNameIpt");
        var deleteFolderSpan = $("#deleteFolderSpan");

        //获得节点的当前路径
        function getPath(cn) {
            function stepAdd(currentNode) {
                var parentNode = $('#tree').treeview('getParent', currentNode.nodeId);
                if (parentNode.hasOwnProperty("nodeId")) {
                    nodePath = parentNode.text + "/" + nodePath;
                    if (parentNode.hasOwnProperty("parentId")) {
                        stepAdd(parentNode);
                    }
                }
            }

            var nodePath = cn.text;
            stepAdd(cn);
            return nodePath;
        }

        function loadTree() {
            window.houoy.public.post(url + '/folder/retrieve', null, function (data) {
                if (data.success) {
                    var treeData = data.resultData.nodes;
                    folderTree = $('#tree').treeview({
                        data: treeData,
                        onNodeSelected: function (event, data) {
                            image.model.getCurrentData().select_node_id = data.nodeId;
                            image.model.getCurrentData().pk_folder = data.pk_folder;
                            image.model.getCurrentData().path = getPath(data);
                            //刷新列表区
                            image.controller.search();
                        }
                    });

                    folderTree.treeview('selectNode', [image.model.getCurrentData().select_node_id, {silent: false}]);
                } else {
                    alert("获取tree失败:" + data.msg);
                }
            }, function (err) {
                alert("获取tree失败！" + err);
            });
        }

        //增加同级节点
        $("#treeAddNextBtn").click(function () {
            openAddModal("sibing");
        });

        //增加子节点
        $("#treeAddChildBtn").click(function () {
            openAddModal("child");
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
                deleteFolderSpan.text(so[0].folder_name);
                deleteFolderSpan.prop("pk_folder", so[0].pk_folder);
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
                        if (so[0].nodes) {//如果有子节点
                            folderCode = so[0].folder_code + ((1000 + so[0].nodes.length + 1) + "").substr(1);//获得新节点的folderCode
                        } else {
                            folderCode = so[0].folder_code + "001";//获得新节点的folderCode
                        }
                        break;
                    case "sibing":
                        if (so[0].parentId == null || so[0].parentId == undefined) {//如果是一级节点
                            var siblingLength = folderTree.treeview('getSiblings', so[0]).length;
                            folderCode = ((1000000 + siblingLength + 2) + "").substr(1);//获得新节点的folderCode
                            pkParent = "1";
                        } else {//如果存在，说明当前选中的不是一级节点
                            var parentNode = folderTree.treeview('getNode', so[0].parentId);
                            var n = ((1000 + parentNode.nodes.length + 1) + "").substr(1);//获得新节点的folderCode
                            folderCode = parentNode.folder_code + n;
                            pkParent = parentNode.pk_folder;
                        }
                        break;
                    default:
                        break;
                }

                foldeNameIpt.prop("folderCode", folderCode);
                foldeNameIpt.prop("pkParent", pkParent);
                foldeNameIpt.prop("pk_folder", null);
                $('#treeAddModal').modal();
            }
        }

        //编辑节点
        function openEditModal() {
            var so = folderTree.treeview('getSelected');
            if (so == null || so.length <= 0) {
                window.houoy.public.alert('#treeAlertArea', "请选择一个目录")
            } else {
                foldeNameIpt.prop("folderCode", so[0].folder_code);
                foldeNameIpt.prop("pkParent", so[0].pk_parent);
                foldeNameIpt.prop("pk_folder", so[0].pk_folder);
                foldeNameIpt.val(so[0].folder_name);
                $('#treeAddModal').modal();
            }
        }

        //保存节点
        $("#treeSaveBtn").click(function () {
            var paramData = {
                pk_folder: foldeNameIpt.prop("pk_folder"),
                pk_parent: foldeNameIpt.prop("pkParent"),
                folder_code: foldeNameIpt.prop("folderCode"),
                folder_name: foldeNameIpt.val()
            };

            window.houoy.public.post(url + '/folder/save', JSON.stringify(paramData), function (data) {
                if (data.success) {
                    image.model.getCurrentData().select_node_id = folderTree.treeview('getSelected')[0].nodeId;
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
        $("#treeDeleteSureBtn").click(function () {
            var paramData = [deleteFolderSpan.prop("pk_folder")];

            var paramDD = "";
            window.houoy.public.post(url + '/folder/delete', JSON.stringify(paramData), function (data) {
                if (data.success) {
                    image.model.getCurrentData().select_node_id = 0;
                    loadTree();
                } else {
                    alert("删除失败:" + data.msg);
                }
                $('#treeDeleteModal').modal("hide");
            }, function (err) {
                alert("删除失败" + err.responseText);
                $('#treeDeleteModal').modal("hide");
            });

            //window.houoy.public.post(url + '/folder/delete', JSON.stringify(paramData), function (data) {
            //    if (data.success) {
            //        image.model.getCurrentData().select_node_id = 0 ;
            //        loadTree();
            //    } else {
            //        alert("删除失败:" + data.msg);
            //    }
            //    $('#treeDeleteModal').modal("hide");
            //}, function (err) {
            //    alert("删除失败" + err.responseText);
            //    $('#treeDeleteModal').modal("hide");
            //});
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

    image.registerEvent = function () {
        //注册事件监听
        $("#toAddBtn").click(image.controller.toAdd);
        $("#toEditBtn").click(image.controller.toEdit);
        $("#toCardBtn").click(image.controller.toCard);
        $("#toListBtn").click(image.controller.toList);
        $("#deleteBtn").click(image.controller.deleteRow);
        $("#saveBtn").click(image.controller.saveRow);
        $("#cancelBtn").click(image.controller.cancelRow);
        $("#searchBtn").click(image.controller.search);
        $("#searchResetBtn").click(image.controller.searchReset);
        $('#imageFile').change(function(){
            var str = $(this).val();
            var arr=str.split('\\');//注split可以用字符或字符串分割
            var my=arr[arr.length-1];//这就是要取得的图片名称
            $('#image_name').val(my);
            debugger;
        })
    };

    image.view.new();
    image.initTree();
    image.registerEvent();

})(window.houoy.image || {});


