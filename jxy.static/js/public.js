/**
 *
 * @author andyzhao
 */
(function pub(houoy) {
    if (!window.houoy) {
        window.houoy = houoy;
    }
})(window.houoy || {});

//页面模型
(function pub(s) {
    if (!window.houoy.public) {
        window.houoy.public = s;
    }

    //定义全局变量
    if (typeof s.PageManage == "undefined") {
        s.PageManage = {
            UIState: {//页面状态:
                SEARCH: 0,//默认查询状态
                CREATE: 1,//新增
                UPDATE: 2//修改
            },
            DataState: {//页面状态:
                NONE_SELECT: 2,//没有选中数据
                ONE_SELECT: 3,//选中一条数据
                MUL_SELECT: 4//选中多条数据
            },
            UIModal: {//页面模式
                LIST: 1,//列表模式,对应的页面状态：查询
                CARD: 2//卡片模式,对应的页面状态：新增，修改，查询（详细信息)
            }
        }
    }

    //定义全局方法
    if (typeof s.createPageModel == "undefined") {
        s.createPageModel = function () {
            var uiState = "";//ui状态
            var selectState = "";//数据选中状态
            var modal = "";//页面模式
            var currentData = {};

            var pagemodel = {
                getUIState: function () {
                    return uiState;
                },
                setUIState: function (_uiState) {
                    uiState = _uiState;
                    switch (_uiState) {
                        case window.houoy.public.PageManage.UIState.SEARCH:
                            $(".pageStateCreate").attr("disabled", true);
                            $(".pageStateUpdate").attr("disabled", true);
                            $(".pageStateSearch").attr("disabled", false);
                            break;
                        case window.houoy.public.PageManage.UIState.CREATE:
                            $(".pageStateCreate").attr("disabled", false);
                            $(".pageStateUpdate").attr("disabled", false);
                            $(".pageStateSearch").attr("disabled", true);
                            break;
                        case window.houoy.public.PageManage.UIState.UPDATE:
                            $(".pageStateCreate").attr("disabled", false);
                            $(".pageStateUpdate").attr("disabled", false);
                            $(".pageStateSearch").attr("disabled", true);
                            break;
                        default:
                            break;
                    }
                },

                getSelectState: function () {
                    return selectState;
                },
                setSelectState: function (_selectState) {
                    selectState = _selectState;
                    switch (_selectState) {
                        case window.houoy.public.PageManage.DataState.NONE_SELECT:
                            $(".pageStateOneSelected").attr("disabled", true);
                            $(".pageStateMulSelected").attr("disabled", true);
                            break;
                        case window.houoy.public.PageManage.DataState.ONE_SELECT:
                            $(".pageStateOneSelected").attr("disabled", false);
                            $(".pageStateMulSelected").attr("disabled", false);
                            break;
                        case window.houoy.public.PageManage.DataState.MUL_SELECT://包括选中一个
                            $(".pageStateOneSelected").attr("disabled", true);
                            $(".pageStateMulSelected").attr("disabled", false);
                            break;
                        default:
                            break;
                    }
                },

                getModal: function () {
                    return modal;
                },

                setModal: function (_modal) {
                    modal = _modal;
                    switch (_modal) {
                        case window.houoy.public.PageManage.UIModal.CARD:
                            $(".modalList").hide();
                            $(".modalCard").show();
                            break;
                        case window.houoy.public.PageManage.UIModal.LIST:
                            $(".modalList").show();
                            $(".modalCard").hide();
                            break;
                        default:
                            break;
                    }
                },

                getCurrentData: function () {
                    return currentData;
                },
                setCurrentData: function (_currentData) {
                    currentData = _currentData;
                }
            };

            return pagemodel;
        }
    }

})(window.houoy.public || {});

//公共组件
(function pub(s) {
    if (!window.houoy.public) {
        window.houoy.public = s;
    }

    //定义全局变量
    if (typeof s.createDataTable == "undefined") {
        function onSelectChange(_param) {
            //设置操作按钮状态
            var selectedNum = $("#" + _param.dataTableID).DataTable().rows('.selected').data().length;
            var selectedRows = $("#" + _param.dataTableID).DataTable().rows('.selected').data();
            if (_param.onSelectChange) {
                _param.onSelectChange(selectedNum, selectedRows);
            }
        }

        s.createDataTable = function (_param) {
            var param = {
                dataTableID: _param.dataTableID,
                url: _param.url,
                urlType: _param.urlType,
                param: _param.param,
                columns: _param.columns,
                onSelectChange: _param.onSelectChange,
                single: _param.single//是否单选模式
            };

            var columns = param.columns;
            //var columns = [{"title": "序列号", 'data': 'pk_role', "visible": false},
            //    {"title": "角色编码", 'data': 'role_code'},
            //    {"title": "角色名称", 'data': 'role_name'}];

            var columnObject = [];
            if (!param.single) {
                columnObject = [{
                    "title": "<label><input type='checkbox' name='allChecked' />All</label>",
                    'data': 'id',
                    'render': function (data, type, row, meta) {
                        return '<label><input type="checkbox" value="' + data + '" name="id"/>' + meta.row + '</label>';
                    },
                    "orderable": false,
                    "width": "50px",
                    "sortable": false
                }];

                columnObject = columnObject.concat(columns);
            } else {
                columnObject = columns;
            }

            var thisTable = $("#" + param.dataTableID).dataTable({
                //"dom": "<'row' <'col-md-12'B>><'row'<'col-md-6 col-sm-12'l><'col-md-6 col-sm-12'f>r>" +
                //"<'table-scrollable't><'row'<'col-md-5 col-sm-12'i><'col-md-7 col-sm-12'p>>", // horizobtal scrollable datatable
                "dom": "<'row'<'col-md-6 col-sm-12'l><'col-md-6 col-sm-12'>B>" +
                    //"<'row'<'col-md-6 col-sm-12'l>>" +
                "t" +
                "<'row'<'col-md-5 col-sm-12'i><'col-md-7 col-sm-12'p>>",
                "autoWidth": false,//自动控制列宽
                "processing": true,
                "ajax": {
                    "url": param.url,
                    type: param.urlType ? param.urlType : 'post',//post跨域请求
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("x-auth-token", window.houoy.public.static.getSessionID());  //使用spring session的token方式
                    },
                    "dataSrc": function (d) {//后台返回的数据
                        return d.data;
                    }, "data": function (d) {//向后台传递的参数
                        $.each(param.param, function (key, val) {
                            d[key] = val();
                        });
                        //var name = searchDiv.find("input[name='name']").val();
                        //var state = searchDiv.find("input[name='state']").val();
                        //var linkTimeFrom = searchDiv.find("input[name='linkTimeFrom']").val();
                        //var linkTimeTo = searchDiv.find("input[name='linkTimeTo']").val();
                        //
                        //d.name = name;
                        //d.state = state;
                        //d.linkTimeFrom = linkTimeFrom;
                        //d.linkTimeTo = linkTimeTo;
                        //
                        //d.currentUserName = currentUserName;//当前用户名
                    }
                },
                //"ordering" : false,// 全局禁用排序
                // "bPaginate":false,//翻页功能,
                "order": [[2, "desc"]],
                "aLengthMenu": [10, 20, 40, 60, 100, 200, 500, 1000],
                "LengthChange": true,//改变每页显示的数据量
                //  "bFilter":false,//过滤功能
                //  "bSort":false,//排序功能
                //  "bInfo":false,//页脚信息
                //  "bAutoWidth":false,//自动宽度
                //"pageLength": 5,
                "deferRender": true,// 延迟渲染
                "bStateSave": false, // 在第三页刷新页面，会自动到第一页
                "iDisplayLength": 10,
                "iDisplayStart": 0,
                "serverSide": true,
                "buttons": [
                    {extend: 'print', className: 'btn green btn-outline', text: '打印'},
                    {extend: 'copy', className: 'btn green btn-outline', text: '复制'},
                    {extend: 'pdf', className: 'btn green btn-outline', text: 'PDF'},
                    {extend: 'excel', className: 'btn green btn-outline ', text: 'Excel'},
                    {extend: 'csv', className: 'btn green btn-outline ', text: 'CSV'},
                    // { extend: 'colvis', className: 'btn green btn-outline', text: 'Columns'},
                    // { extend: 'export', className: 'btn green btn-outline', text: '导出全部'}
                ],
                "columns": columnObject,
                "language": {
                    "lengthMenu": "每页 _MENU_ 条记录",
                    "zeroRecords": "没有找到记录",
                    "info": "第 _PAGE_ 页 ( 总共 _PAGES_ 页 )",
                    "infoEmpty": "无记录",
                    "infoFiltered": "(从 _MAX_ 条记录过滤)",
                    "search": "搜索:"
                },
                initComplete: function () {
                    if (!param.single) {
                        //全选
                        $('#' + param.dataTableID + ' input[name=allChecked]').click(function () {
                            if (this.checked) {
                                $('#' + param.dataTableID + ' tbody tr').each(function () {
                                    var thisinput = $(this).find("input").get(0);
                                    thisinput.checked = true;
                                    //$.uniform.update(thisinput);
                                    $(this).addClass('selected');
                                });
                            } else {
                                $('#' + param.dataTableID + ' tbody tr').each(function () {
                                    var thisinput = $(this).find("input").get(0);
                                    thisinput.checked = false;
                                    //$.uniform.update(thisinput);
                                    $(this).removeClass('selected');
                                });
                            }

                            onSelectChange(param);
                        });

                        //选择某一行
                        $('#' + param.dataTableID + ' tbody').unbind('click').on('click', 'tr', function (event) {
                            //更新当前选中行
                            var thisinput = $(this).find("input").get(0);
                            if ($(event.target).is(":checkbox") || $(event.target).is("label")) {
                                //防止点解checkbox本省进行两次check和uncheck操作
                                //alert($(event.target).is("label"));
                            } else {
                                if (thisinput.checked == true) {
                                    thisinput.checked = false;
                                } else {
                                    thisinput.checked = true;
                                }
                                //$.uniform.update(thisinput);
                            }
                            //更新全选按钮
                            var hasUncheck = false;
                            $('#' + param.dataTableID + ' tbody tr').each(function () {
                                var thisinput = $(this).find("input").get(0);
                                if (thisinput.checked == false) {
                                    hasUncheck = true;
                                }
                            });
                            var allChecked = $('#' + param.dataTableID + ' input[name=allChecked]').get(0);
                            if (hasUncheck) {//存在没有选中的项目
                                allChecked.checked = false;
                                //$.uniform.update(allChecked);
                            } else {
                                allChecked.checked = true;
                                //$.uniform.update(allChecked);
                            }

                            if (thisinput.checked == true) {
                                $(this).addClass("selected"); // 追加样式
                            } else {
                                $(this).removeClass("selected");
                            }
                            //  $(this).toggleClass("selected");

                            onSelectChange(param);
                        });
                    } else {
                        //选择某一行
                        $('#' + param.dataTableID + ' tbody').unbind('click').on('click', 'tr', function (event) {
                            $('#' + param.dataTableID + ' tbody tr').each(function () {
                                $(this).removeClass("selected");
                            });
                            $(this).addClass("selected"); // 追加样式

                            onSelectChange(param);
                        });
                    }
                },
                // set first column as a default sort by asc
                "fnDrawCallback": function () {
                    // App.initUniform();//使css生效
                    onSelectChange(param);
                },
                "createdRow": function (row, data, dataIndex) {
                    $(row).children('td').eq(0).attr('style', 'text-align: center;');//设置居中方式
                }
            });

            return {
                getDataTable: function () {
                    return thisTable;
                },
                getSelectedRows: function () {
                    return $("#" + param.dataTableID).DataTable().rows('.selected').data();
                },
                refresh: function () {
                    $("#" + param.dataTableID).DataTable().draw();
                }
            };

        };
    }


})(window.houoy.public || {});


//自动消失的bootstrape警告框
(function pub(s) {
    if (!window.houoy.public) {
        window.houoy.public = s;
    }

    //定义全局变量
    if (typeof s.alert == "undefined") {
        s.alert = function (id, msg, type) {
            var typeclass = "";
            switch (type) {
                case "success":
                    typeclass = "'alert alert-success'";
                    break;
                case "info":
                    typeclass = "alert alert-info";
                    break;
                case "danger":
                    typeclass = "alert alert-danger";
                    break;
                default:
                    typeclass = "alert alert-warning";
                    break;
            }
            $('<div>').appendTo(id).addClass(typeclass).html(msg).show().delay(1500).fadeOut();
        }


    }


})(window.houoy.public || {});

//网络请求相关
(function pub(s) {
    if (!window.houoy.public) {
        window.houoy.public = s;
    }

    //post请求
    if (typeof s.post == "undefined") {
        s.post = function (url, data, onSuccess, onError) {
            $.ajax({
                type: 'post',
                url: url,
                contentType: "application/json;charset=UTF-8",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("x-auth-token", window.houoy.public.static.getSessionID());  //使用spring session的token方式
                },
                dataType: "json",
                data: data,
                success: function (data) {
                    if (onSuccess) {
                        onSuccess(data);
                    }
                },
                error: function (err) {
                    if (onError) {
                        onError(err);
                    }
                }
            });
        };

        s.get = function (url, data, onSuccess, onError) {
            $.ajax({
                type: 'get',
                url: url,
                contentType: "application/json;charset=UTF-8",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("x-auth-token", window.houoy.public.static.getSessionID());  //使用spring session的token方式
                },
                dataType: "json",
                data: data,
                success: function (data) {
                    if (onSuccess) {
                        onSuccess(data);
                    }
                },
                error: function (err) {
                    if (onError) {
                        onError(err);
                    }
                }
            });
        }


    }


})(window.houoy.public || {});