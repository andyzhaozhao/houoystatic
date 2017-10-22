/**
 * 角色管理
 * @author andyzhao
 */
(function (video) {
    //定义页面数据模型
    //var url = "http://localhost:8888/api";
    var url = window.houoy.public.static.cmsContextPath + "/api";
    video.upload = window.houoy.upload.uploadByStep();

    video.model = (function () {
        if (!video.model) {
            video.model = {};
        }

        video.model = window.houoy.public.createPageModel();
        video.model.setCurrentData({
            pk_video: null,
            video_code: $("#video_code").val(),
            video_name: $("#video_name").val(),
            video_desc: $("#video_desc").val(),
            select_node_id: 0,//默认选中的树节点
            pk_folder: ""
        });

        video.resetCurrentData = function (data) {
            video.model.getCurrentData().pk_video = data.pk_video;
            video.model.getCurrentData().video_code = data.video_code;
            video.model.getCurrentData().video_name = data.video_name;
            video.model.getCurrentData().video_desc = data.video_desc;
            $("#video_code").val(video.model.getCurrentData().video_code);
            $("#video_name").val(video.model.getCurrentData().video_name);
            $("#video_desc").val(video.model.getCurrentData().video_desc);
            $("#pk_video").val(video.model.getCurrentData().pk_video);
            video.upload.reset();
            $("#videoFile").val();
        };

        return video.model;
    })();

    video.view = (function () {
        if (!video.view) {
            video.view = {};
        }

        video.view.new = function () {
            //初始化模型
            video.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);//默认是查询状态
            video.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//默认是没有选中数据
            video.model.setModal(window.houoy.public.PageManage.UIModal.LIST);//默认是列表模式

            //初始化表格
            video.dataTable = window.houoy.public.createDataTable({
                dataTableID: "table",
                url: url + "/video/retrieve",
                param: {//查询参数
                    video_code: function () {
                        return $("input[name='video_code']").val();
                    },
                    video_name: function () {
                        return $("input[name='video_name']").val();
                    },
                    video_desc: function () {
                        return $("input[name='video_desc']").val();
                    },
                    pk_folder: function () {
                        return video.model.getCurrentData().pk_folder;
                    }
                },
                columns: [{"title": "pk", 'data': 'pk_video', "visible": false},
                    {"title": "视频编码", 'data': 'video_code'},
                    {"title": "视频名称", 'data': 'video_name'},
                    {"title": "视频详细描述", 'data': 'video_desc'}],
                onSelectChange: function (selectedNum, selectedRows) {
                    if (selectedNum > 1) {
                        video.model.setSelectState(window.houoy.public.PageManage.DataState.MUL_SELECT);
                    } else if (selectedNum == 1) {
                        video.model.setSelectState(window.houoy.public.PageManage.DataState.ONE_SELECT);
                    } else {
                        video.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);//没有选中数据
                    }
                }
            });
        };

        return video.view;
    }());

    video.controller = (function () {
        if (!video.controller) {
            video.controller = {};
        }

        video.controller.toAdd = function () {
            video.model.setModal(window.houoy.public.PageManage.UIModal.CARD);
            video.model.setUIState(window.houoy.public.PageManage.UIState.CREATE);
            video.resetCurrentData({//新增时候当前缓存数据是空
                video_code: null,
                video_name: null,
                video_desc: null
            });
        };

        video.controller.toEdit = function () {
            video.model.setModal(window.houoy.public.PageManage.UIModal.CARD);
            video.model.setUIState(window.houoy.public.PageManage.UIState.CREATE);
            video.resetCurrentData(video.dataTable.getSelectedRows()[0]);//设置当前选中的行
            var srcstr = "http://47.94.6.120/video/" + video.model.getCurrentData().path +
                "/" + video.dataTable.getSelectedRows()[0].video_name;
            debugger;
            $("#videoshowpath").text(srcstr);
        };

        video.controller.toList = function () {
            video.model.setModal(window.houoy.public.PageManage.UIModal.LIST);
            video.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            video.model.setSelectState(window.houoy.public.PageManage.DataState.NONE_SELECT);
            video.controller.search();
        };

        video.controller.toCard = function () {
            video.model.setModal(window.houoy.public.PageManage.UIModal.CARD);
            video.resetCurrentData(video.dataTable.getSelectedRows()[0]);//设置当前选中的行
            var srcstr = "http://47.94.6.120/video/" + video.model.getCurrentData().path +
                "/" + video.dataTable.getSelectedRows()[0].video_name;
            $("#videoshowpath").text(srcstr);
        };

        video.controller.saveRow = function () {
            if (!($("#video_name").val()) || !($("#video_code").val()) || !($("#video_desc").val())) {
                alert("请填写完整信息");
            } else {
                video.upload.upload("videoFile", video.model.getCurrentData().path, function (progress) {
                    $("#progress").show();
                    $("#progress span").text(progress + "%");
                    if (progress >= 100) {//传递完成
                        video.model.getCurrentData().video_name = $("#video_name").val();
                        video.model.getCurrentData().video_code = $("#video_code").val();
                        video.model.getCurrentData().video_desc = $("#video_desc").val();

                        window.houoy.public.post(url + '/video/save', JSON.stringify(video.model.getCurrentData()), function (data) {
                            if (data.success) {
                                alert("保存成功");
                                video.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
                            } else {
                                alert("保存失败:" + data.msg);
                            }
                        }, function (err) {
                            alert("请求保存失败！" + err);
                        });
                    }
                });
                //video.model.getCurrentData().video_name = $("#video_name").val();
                //video.model.getCurrentData().video_code = $("#video_code").val();
                //video.model.getCurrentData().video_desc = $("#video_desc").val();

                /*var formData = new FormData();
                 formData.append("file", $("#videoFile")[0].files[0]);
                 if (video.model.getCurrentData().pk_video) {
                 formData.append("pk_video", video.model.getCurrentData().pk_video);
                 }
                 formData.append("video_name", video.model.getCurrentData().video_name);
                 formData.append("video_code", video.model.getCurrentData().video_code);
                 formData.append("video_desc", video.model.getCurrentData().video_desc);
                 formData.append("pk_folder", video.model.getCurrentData().pk_folder);
                 formData.append("path", video.model.getCurrentData().path);

                 $.ajax({
                 url: url + '/video/save',
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
                 video.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
                 } else {
                 alert("保存失败:" + data.msg);
                 }
                 },
                 error: function (data) {
                 alert("保存失败:" + data.msg);
                 }
                 });*/
            }
        };

        video.controller.deleteRow = function () {
            if (confirm('你确定要删除选择项目吗？')) {
                var _ids = [];
                switch (video.model.getModal()) {
                    case window.houoy.public.PageManage.UIModal.CARD:
                        _ids[0] = video.model.getCurrentData().id;
                        break;
                    case window.houoy.public.PageManage.UIModal.LIST:
                        $.each(video.dataTable.getSelectedRows(), function (index, value) {
                            _ids[index] = value.id;
                        });
                        break;
                    default:
                        break;
                }

                window.houoy.public.post(url + '/video/delete', JSON.stringify(_ids), function (data) {
                    if (data.success) {
                        video.model.setModal(window.houoy.public.PageManage.UIModal.LIST);
                        video.controller.search();
                    } else {
                        alert("删除失败:" + data);
                    }
                }, function (err) {
                    alert("请求删除失败！");
                });

                //$.ajax({
                //    type: 'delete',
                //    url: url + '/video/delete',
                //    contentType: "application/json;charset=UTF-8",
                //    dataType: "json",
                //    data: JSON.stringify(_ids),
                //    success: function (data) {
                //        if (data.success) {
                //            video.model.setModal(window.houoy.public.PageManage.UIModal.LIST);
                //            video.refresh();
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
        video.controller.cancelRow = function () {
            video.model.setUIState(window.houoy.public.PageManage.UIState.SEARCH);
            video.resetCurrentData({//新增时候当前缓存数据是空
                video_code: null,
                video_name: null,
                video_desc: null
            });
        };

        //刷新表格数据
        video.controller.search = function () {
            video.dataTable.refresh();
        };

        //搜索区reset
        video.controller.searchReset = function () {
            $("input[name='video_code']").val("");
            $("input[name='video_name']").val("");
            $("input[name='video_desc']").val("");
            video.controller.search();
        };

        return video.controller;
    }());

    video.initTree = function (onSuccess) {
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
            window.houoy.public.post(url + '/folderVideo/retrieve', null, function (data) {
                if (data.success) {
                    var treeData = data.resultData.nodes;
                    folderTree = $('#tree').treeview({
                        data: treeData,
                        onNodeSelected: function (event, data) {
                            video.model.getCurrentData().select_node_id = data.nodeId;
                            video.model.getCurrentData().pk_folder = data.pk_folder;
                            video.model.getCurrentData().path = getPath(data);
                            //刷新列表区
                            video.controller.search();
                        }
                    });

                    folderTree.treeview('selectNode', [video.model.getCurrentData().select_node_id, {silent: false}]);
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

            window.houoy.public.post(url + '/folderVideo/save', JSON.stringify(paramData), function (data) {
                if (data.success) {
                    video.model.getCurrentData().select_node_id = folderTree.treeview('getSelected')[0].nodeId;
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
            window.houoy.public.post(url + '/folderVideo/delete', JSON.stringify(paramData), function (data) {
                if (data.success) {
                    video.model.getCurrentData().select_node_id = 0;
                    loadTree();
                } else {
                    alert("删除失败:" + data.msg);
                }
                $('#treeDeleteModal').modal("hide");
            }, function (err) {
                alert("删除失败" + err.responseText);
                $('#treeDeleteModal').modal("hide");
            });

            //window.houoy.public.post(url + '/folderVideo/delete', JSON.stringify(paramData), function (data) {
            //    if (data.success) {
            //        video.model.getCurrentData().select_node_id = 0 ;
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

    video.registerEvent = function () {
        //注册事件监听
        $("#toAddBtn").click(video.controller.toAdd);
        $("#toEditBtn").click(video.controller.toEdit);
        $("#toCardBtn").click(video.controller.toCard);
        $("#toListBtn").click(video.controller.toList);
        $("#deleteBtn").click(video.controller.deleteRow);
        $("#saveBtn").click(video.controller.saveRow);
        $("#cancelBtn").click(video.controller.cancelRow);
        $("#searchBtn").click(video.controller.search);
        $("#searchResetBtn").click(video.controller.searchReset);
        $('#videoFile').change(function () {
            var str = $(this).val();
            var arr = str.split('\\');//注split可以用字符或字符串分割
            var my = arr[arr.length - 1];//这就是要取得的视频名称
            $('#video_name').val(my);
        })
    };

    video.view.new();
    video.initTree();
    video.registerEvent();

})(window.houoy.video || {});


