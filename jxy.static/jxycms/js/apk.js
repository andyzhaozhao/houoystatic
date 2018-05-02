/**
 * 角色管理
 * @author andyzhao
 */
(function (apk) {
    //定义页面数据模型
    //var url = "http://localhost:8888/api";
    var url = window.houoy.public.static.cmsContextPath + "/api";
    apk.upload = window.houoy.upload.uploadByStep();

    apk.model = (function () {
        if (!apk.model) {
            apk.model = {};
        }

        apk.model = window.houoy.public.createPageModel();
        apk.model.setCurrentData({
            pk_apk: null,
            newestVersionCode: $("#newestVersionCode").val(),
            newestVersionName: $("#newestVersionName").val(),
            comment: $("#comment").val(),
            url: "",
            size: "",
            select_node_id: 0,//默认选中的树节点
            pk_folder: ""
        });

        apk.resetCurrentData = function (data) {
            apk.model.getCurrentData().pk_apk = data.pk_apk;
            apk.model.getCurrentData().newestVersionCode = data.newestVersionCode;
            apk.model.getCurrentData().newestVersionName = data.newestVersionName;
            apk.model.getCurrentData().comment = data.comment;
            $("#newestVersionCode").val(apk.model.getCurrentData().newestVersionCode);
            $("#newestVersionName").val(apk.model.getCurrentData().newestVersionName);
            $("#comment").val(apk.model.getCurrentData().comment);
            $("#pk_apk").val(apk.model.getCurrentData().pk_apk);
            apk.upload.reset();
            $("#apkFile").val();
        };

        return apk.model;
    })();

    apk.view = (function () {
        if (!apk.view) {
            apk.view = {};
        }

        apk.view.new = function () {
            //初始化模型
            apk.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);//默认是查询状态
            apk.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//默认是没有选中数据
            apk.model.setModal(window.houoy.public.PageManage.UIModal.LIST);//默认是列表模式

            //初始化表格
            apk.dataTable = window.houoy.public.createDataTable({
                dataTableID: "table",
                url: url + "/apk/retrieve",
                urlType: "get",
                param: {//查询参数
                    newestVersionCode: function () {
                        return $("input[name='newestVersionCode']").val();
                    },
                    newestVersionName: function () {
                        return $("input[name='newestVersionName']").val();
                    },
                    comment: function () {
                        return $("input[name='comment']").val();
                    },
                    pk_folder: function () {
                        return apk.model.getCurrentData().pk_folder;
                    }
                },
                columns: [{"title": "pk", 'data': 'pk_apk', "visible": false},
                    {"title": "最新安装包版本号", 'data': 'newestVersionCode'},
                    {"title": "最新安装包版名称", 'data': 'newestVersionName'},
                    {"title": "apk大小", 'data': 'size'},
                    {"title": "apk的url", 'data': 'url'},
                    {"title": "版本描述", 'data': 'comment'}],
                onSelectChange: function (selectedNum, selectedRows) {
                    if (selectedNum > 1) {
                        apk.model.setSelectState(window.houoy.public.PageManage.DataState.MUL_SELECT);
                    } else if (selectedNum == 1) {
                        apk.model.setSelectState(window.houoy.public.PageManage.DataState.ONE_SELECT);
                    } else {
                        apk.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//没有选中数据
                    }
                }
            });
        };

        return apk.view;
    }());

    apk.controller = (function () {
        if (!apk.controller) {
            apk.controller = {};
        }

        apk.controller.toAdd = function () {
            apk.model.setModal(window.houoy.public.PageManage.UIModal.CARD);
            apk.model.setUIState(window.houoy.public.PageManage.UIState.CREATE);
            apk.resetCurrentData({//新增时候当前缓存数据是空
                newestVersionCode: null,
                newestVersionName: null,
                comment: null,
                size: null,
                actor_times: null,
                actor_calorie: null,
                path_thumbnail: null,
                pk_apk: null,
                url: null,
                select_node_id: 0,
                pk_folder: ""
            });
        };

        apk.controller.toEdit = function () {
            apk.model.setModal(window.houoy.public.PageManage.UIModal.CARD);
            apk.model.setUIState(window.houoy.public.PageManage.UIState.CREATE);
            apk.resetCurrentData(apk.dataTable.getSelectedRows()[0]);//设置当前选中的行
            //var srcstr = "http://47.94.6.120/apk/" + apk.model.getCurrentData().url +
            //    "/" + apk.dataTable.getSelectedRows()[0].newestVersionName;
            //debugger;
            $("#apkshowpath").text(apk.model.getCurrentData().url);
        };

        apk.controller.toList = function () {
            apk.model.setModal(window.houoy.public.PageManage.UIModal.LIST);
            apk.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            apk.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);
            apk.controller.search();
        };

        apk.controller.toCard = function () {
            apk.model.setModal(window.houoy.public.PageManage.UIModal.CARD);
            apk.resetCurrentData(apk.dataTable.getSelectedRows()[0]);//设置当前选中的行
            $("#apkshowpath").text(apk.model.getCurrentData().url);
        };

        apk.controller.saveRow = function () {
            if (!($("#newestVersionName").val()) || !($("#newestVersionCode").val()) || !($("#comment").val())) {
                alert("请填写完整信息");
            } else {
                apk.model.getCurrentData().newestVersionName = $("#newestVersionName").val();
                apk.model.getCurrentData().newestVersionCode = $("#newestVersionCode").val();
                apk.model.getCurrentData().comment = $("#comment").val();

                var formData = new FormData();
                formData.append("file", $("#apkFile")[0].files[0]);
                if (apk.model.getCurrentData().pk_apk) {
                    formData.append("pk_apk", apk.model.getCurrentData().pk_apk);
                }
                formData.append("newestVersionName", apk.model.getCurrentData().newestVersionName);
                formData.append("newestVersionCode", apk.model.getCurrentData().newestVersionCode);
                formData.append("pk_folder", apk.model.getCurrentData().pk_folder);
                formData.append("comment", apk.model.getCurrentData().comment);
                formData.append("size", apk.model.getCurrentData().size);
                formData.append("url", apk.model.getCurrentData().url);

                debugger;
                $.ajax({
                    url: url + '/apk/save',
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
                            apk.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
                        } else {
                            alert("保存失败:" + data.msg);
                        }
                    },
                    error: function (data) {
                        alert("保存失败:" + data.msg);
                    }
                });
            }
        };

        apk.controller.deleteRow = function () {
            if (confirm('你确定要删除选择项目吗？')) {
                var _ids = [];
                switch (apk.model.getModal()) {
                    case window.houoy.public.PageManage.UIModal.CARD:
                        _ids[0] = apk.model.getCurrentData().pk_apk;
                        break;
                    case window.houoy.public.PageManage.UIModal.LIST:
                        $.each(apk.dataTable.getSelectedRows(), function (index, value) {
                            _ids[index] = value.pk_apk;
                        });
                        break;
                    default:
                        break;
                }

                window.houoy.public.post(url + '/apk/delete', JSON.stringify(_ids), function (data) {
                    if (data.success) {
                        apk.model.setModal(window.houoy.public.PageManage.UIModal.LIST);
                        apk.controller.search();
                    } else {
                        alert("删除失败:" + data);
                    }
                }, function (err) {
                    alert("请求删除失败！");
                });
            }
        };

        //取消所有行操作
        apk.controller.cancelRow = function () {
            apk.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            apk.resetCurrentData({//新增时候当前缓存数据是空
                newestVersionCode: null,
                newestVersionName: null,
                comment: null
            });
        };

        //刷新表格数据
        apk.controller.search = function () {
            apk.dataTable.refresh();
        };

        //搜索区reset
        apk.controller.searchReset = function () {
            $("input[name='newestVersionCode']").val("");
            $("input[name='newestVersionName']").val("");
            $("input[name='comment']").val("");
            apk.controller.search();
        };

        return apk.controller;
    }());

    apk.initTree = function (onSuccess) {
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
            window.houoy.public.get(url + '/folderApk/retrieve', null, function (data) {
                if (data.success) {
                    var treeData = data.resultData.nodes;
                    folderTree = $('#tree').treeview({
                        data: treeData,
                        onNodeSelected: function (event, data) {
                            apk.model.getCurrentData().select_node_id = data.nodeId;
                            apk.model.getCurrentData().pk_folder = data.pk_folder;
                            apk.model.getCurrentData().url = getPath(data);
                            //刷新列表区
                            apk.controller.search();
                        }
                    });

                    folderTree.treeview('selectNode', [apk.model.getCurrentData().select_node_id, {silent: false}]);
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

            window.houoy.public.post(url + '/folderApk/save', JSON.stringify(paramData), function (data) {
                if (data.success) {
                    apk.model.getCurrentData().select_node_id = folderTree.treeview('getSelected')[0].nodeId;
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
            window.houoy.public.post(url + '/folderApk/delete', JSON.stringify(paramData), function (data) {
                if (data.success) {
                    apk.model.getCurrentData().select_node_id = 0;
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

    apk.registerEvent = function () {
        //注册事件监听
        $("#toAddBtn").click(apk.controller.toAdd);
        $("#toEditBtn").click(apk.controller.toEdit);
        $("#toCardBtn").click(apk.controller.toCard);
        $("#toListBtn").click(apk.controller.toList);
        $("#deleteBtn").click(apk.controller.deleteRow);
        $("#saveBtn").click(apk.controller.saveRow);
        $("#cancelBtn").click(apk.controller.cancelRow);
        $("#searchBtn").click(apk.controller.search);
        $("#searchResetBtn").click(apk.controller.searchReset);
        $('#apkFile').change(function () {
            var str = $(this).val();
            var arr = str.split('\\');//注split可以用字符或字符串分割
            var my = arr[arr.length - 1];//这就是要取得的视频名称
            //$('#newestVersionName').val(my);
            debugger;
            apk.model.getCurrentData().size = ($(this)[0].files[0].size / 1048576).toFixed(2) + "M";
        })
    };

    apk.view.new();
    apk.initTree();
    apk.registerEvent();

})(window.houoy.apk || {});


