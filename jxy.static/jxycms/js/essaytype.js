/**
 * 角色管理
 * @author andyzhao
 */
(function (essaytype) {
    //定义页面数据模型
    //var url = "http://localhost:8888/api";
    var url = window.houoy.public.static.cmsContextPath+"/api" ;

    essaytype.model = (function () {
        if (!essaytype.model) {
            essaytype.model = {};
        }

        essaytype.model = window.houoy.public.createPageModel();
        essaytype.model.setCurrentData({
            select_node_id: 0//默认选中的树节点
        });

        return essaytype.model;
    })();

    essaytype.initTree = function (onSuccess) {
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
            window.houoy.public.get(url + '/essaytype/retrieve', null, function (data) {
                if (data.success) {
                    var treeData = data.resultData.nodes;
                    typeTree = $('#tree').treeview({
                        data: treeData,
                        onNodeSelected: function (event, data) {
                            essaytype.model.getCurrentData().select_node_id = data.nodeId;
                        }
                    });
                    typeTree.treeview('selectNode', [essaytype.model.getCurrentData().select_node_id, {silent: false}]);
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
                deleteSpan.text(so[0].type_name);
                deleteSpan.prop("pk_type", so[0].pk_type);
                $('#treeDeleteModal').modal();
            }
        });

        //添加节点
        function openAddModal(type) {
            var so = typeTree.treeview('getSelected');
            if (so == null || so.length <= 0) {
                window.houoy.public.alert('#treeAlertArea', "请选择一个目录")
            } else {
                var typeCode = null;
                var pkParent = null;

                switch (type) {
                    case "child":
                        pkParent = so[0].pk_type;
                        if (so[0].nodes) {//如果有子节点
                            typeCode = so[0].type_code + ((1000 + so[0].nodes.length + 1) + "").substr(1);//获得新节点的typeCode
                        } else {
                            typeCode = so[0].type_code + "001";//获得新节点的typeCode
                        }
                        break;
                    case "sibing":
                        if (so[0].parentId == null || so[0].parentId == undefined) {//如果是一级节点
                            var siblingLength = typeTree.treeview('getSiblings', so[0]).length;
                            typeCode = ((1000000 + siblingLength + 2) + "").substr(1);//获得新节点的typeCode
                            pkParent = "1";
                        } else {//如果存在，说明当前选中的不是一级节点
                            var parentNode = typeTree.treeview('getNode', so[0].parentId);
                            var n = ((1000 + parentNode.nodes.length + 1) + "").substr(1);//获得新节点的typeCode
                            typeCode = parentNode.type_code + n;
                            pkParent = parentNode.pk_type;
                        }
                        break;
                    default:
                        break;
                }

                nameIpt.prop("typeCode", typeCode);
                nameIpt.prop("pkParent", pkParent);
                nameIpt.prop("pk_type", null);
                $('#treeAddModal').modal();
            }
        }

        //编辑节点
        function openEditModal() {
            var so = typeTree.treeview('getSelected');
            if (so == null || so.length <= 0) {
                window.houoy.public.alert('#treeAlertArea', "请选择一个目录")
            } else {
                nameIpt.prop("typeCode", so[0].type_code);
                nameIpt.prop("pkParent", so[0].pk_parent);
                nameIpt.prop("pk_type", so[0].pk_type);
                nameIpt.val(so[0].type_name);
                $('#treeAddModal').modal();
            }
        }

        //保存节点
        $("#treeSaveBtn").click(function () {
            var paramData = {
                pk_type: nameIpt.prop("pk_type"),
                pk_parent: nameIpt.prop("pkParent"),
                type_code: nameIpt.prop("typeCode"),
                type_name: nameIpt.val()
            };

            window.houoy.public.post(url + '/essaytype/save', JSON.stringify(paramData), function (data) {
                if (data.success) {
                    essaytype.model.getCurrentData().select_node_id = typeTree.treeview('getSelected')[0].nodeId;
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
            var paramData = [deleteSpan.prop("pk_type")];

            var paramDD = "";
            window.houoy.public.post(url + '/essaytype/delete', JSON.stringify(paramData), function (data) {
                if (data.success) {
                    essaytype.model.getCurrentData().select_node_id = 0;
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


    essaytype.initTree();

})(window.houoy.essaytype || {});


