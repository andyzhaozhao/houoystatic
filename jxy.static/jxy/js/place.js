/**
 * 地点管理
 * @author andyzhao
 */
(function (place) {
    //定义页面数据模型
    //var url = "http://localhost:8888/api";
    var url = window.houoy.public.static.contextPath+"/api" ;

    place.model = (function () {
        if (!place.model) {
            place.model = {};
        }

        place.model = window.houoy.public.createPageModel();
        place.model.setCurrentData({
            select_node_id: 0//默认选中的树节点
        });

        return place.model;
    })();

    place.initTree = function (onSuccess) {
        var typeTree = null;
        var nameIpt = $("#nameIpt");
        var deleteSpan = $("#deleteSpan");

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
            window.houoy.public.get(url + '/place/retrieve', null, function (data) {
                if (data.success) {
                    debugger;
                    var treeData = data.resultData.nodes;
                    typeTree = $('#tree').treeview({
                        data: treeData,
                        onNodeSelected: function (event, data) {
                            place.model.getCurrentData().select_node_id = data.nodeId;
                        }
                    });
                    typeTree.treeview('selectNode', [place.model.getCurrentData().select_node_id, {silent: false}]);
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
            var so = typeTree.treeview('getSelected');
            if (so == null || so.length <= 0) {
                window.houoy.public.alert('#treeAlertArea', "请选择一个目录")
            } else {
                deleteSpan.text(so[0].place_name);
                deleteSpan.prop("pk_place", so[0].pk_place);
                $('#treeDeleteModal').modal();
            }
        });

        //添加节点
        function openAddModal(type) {
            var so = typeTree.treeview('getSelected');
            if (so == null || so.length <= 0) {
                window.houoy.public.alert('#treeAlertArea', "请选择一个目录")
            } else {
                var placeCode = null;
                var pkParent = null;

                switch (type) {
                    case "child":
                        pkParent = so[0].pk_place;
                        if (so[0].nodes) {//如果有子节点
                            placeCode = so[0].place_code + ((1000 + so[0].nodes.length + 1) + "").substr(1);//获得新节点的placeCode
                        } else {
                            placeCode = so[0].place_code + "001";//获得新节点的placeCode
                        }
                        break;
                    case "sibing":
                        if (so[0].parentId == null || so[0].parentId == undefined) {//如果是一级节点
                            var siblingLength = typeTree.treeview('getSiblings', so[0]).length;
                            placeCode = ((1000000 + siblingLength + 2) + "").substr(1);//获得新节点的placeCode
                            pkParent = "1";
                        } else {//如果存在，说明当前选中的不是一级节点
                            var parentNode = typeTree.treeview('getNode', so[0].parentId);
                            var n = ((1000 + parentNode.nodes.length + 1) + "").substr(1);//获得新节点的placeCode
                            placeCode = parentNode.place_code + n;
                            pkParent = parentNode.pk_place;
                        }
                        break;
                    default:
                        break;
                }

                nameIpt.prop("placeCode", placeCode);
                nameIpt.prop("pkParent", pkParent);
                nameIpt.prop("pk_place", null);
                $('#treeAddModal').modal();
            }
        }

        //编辑节点
        function openEditModal() {
            var so = typeTree.treeview('getSelected');
            if (so == null || so.length <= 0) {
                window.houoy.public.alert('#treeAlertArea', "请选择一个目录")
            } else {
                nameIpt.prop("placeCode", so[0].place_code);
                nameIpt.prop("pkParent", so[0].pk_parent);
                nameIpt.prop("pk_place", so[0].pk_place);
                nameIpt.val(so[0].place_name);
                $('#treeAddModal').modal();
            }
        }

        //保存节点
        $("#treeSaveBtn").click(function () {
            var paramData = {
                pk_place: nameIpt.prop("pk_place"),
                pk_parent: nameIpt.prop("pkParent"),
                place_code: nameIpt.prop("placeCode"),
                place_name: nameIpt.val()
            };

            window.houoy.public.post(url + '/place/save', JSON.stringify(paramData), function (data) {
                if (data.success) {
                    place.model.getCurrentData().select_node_id = typeTree.treeview('getSelected')[0].nodeId;
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
            var paramData = [deleteSpan.prop("pk_place")];

            var paramDD = "";
            window.houoy.public.post(url + '/place/delete', JSON.stringify(paramData), function (data) {
                if (data.success) {
                    place.model.getCurrentData().select_node_id = 0;
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
            typeTree.treeview('search', [$(this).val(), {
                ignoreCase: true,     // case insensitive
                exactMatch: false,    // like or equals
                revealResults: true // reveal matching nodes
            }]);
        });

        loadTree();
    };


    place.initTree();

})(window.houoy.place || {});


