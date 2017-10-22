(function pub(houoy) {
    if (!window.houoy) {
        window.houoy = houoy;
    }
})(window.houoy || {});

//分块上传文件
(function pub(s) {
    if (!window.houoy.upload) {
        window.houoy.upload = s;
    }

    if (typeof s.uploadByStep == "undefined") {
        s.uploadByStep = function () {
            var uploadId = '';
            var index = 0;
            var pause = false;

            function uploadPost(file, formData, totalSize, blockCount, blockSize, path, callback) {
                if (pause) {
                    return; //暂停
                }
                try {
                    var start = index * blockSize;
                    var end = Math.min(totalSize, start + blockSize);
                    var block = file.slice(start, end);
                    formData.set('uploadId', uploadId);
                    formData.set('index', index);
                    formData.set('file', block);

                    $.ajax({
                        url: window.houoy.public.static.cmsContextPath + "/api" + '/video/upload',
                        type: 'POST',
                        data: formData,
                        cache: false, //上传文件不需要缓存。
                        processData: false, // 告诉jQuery不要去处理发送的数据
                        contentType: false,// 告诉jQuery不要去设置Content-Type请求头
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("x-auth-token", window.houoy.public.static.getSessionID());  //使用spring session的token方式
                        },
                        success: function (res) {
                            block = null;
                            if (res.success) {
                                if (index === 0) {
                                    uploadId = res.uploadId;
                                }
                                //$('#progress').text((index / blockCount * 100).toFixed(2) + '%');
                                callback(((index+1) / blockCount * 100).toFixed(2));//报告进度
                                if (index < blockCount - 1) {
                                    index++;
                                    uploadPost(file, formData, totalSize, blockCount, blockSize, path, callback);
                                }
                            } else {
                                debugger
                                uploadId = '';
                                index = 0;
                                pause = false;
                                alert("保存失败:" + res.msg);
                            }
                        }, error: function (data) {
                            debugger;
                            uploadId = '';
                            index = 0;
                            pause = false;
                            alert("保存失败:" + data.msg);
                        }
                    });
                } catch (e) {
                    alert(e);
                }
            }

            var uploadPart = {
                upload: function (fileInputId, path, callback) {
                    var files = document.getElementById(fileInputId).files;
                    if (files.length < 1) {
                        alert('请选择文件~');
                        return;
                    }
                    var file = files[0];
                    var totalSize = file.size;//文件大小
                    var blockSize = 1024 * 1024 * 2;//块大小
                    var blockCount = Math.ceil(totalSize / blockSize);//总块数

                    //创建FormData对象
                    var formData = new FormData();
                    formData.append('fileName', file.name);//文件名
                    formData.append('total', blockCount);//总块数
                    formData.append('index', index);//当前上传的块下标
                    formData.append('uploadId', uploadId);//上传编号
                    formData.append('path', path);//ftp服务器的路径
                    formData.append('data', null);

                    uploadPost(file, formData, totalSize, blockCount, blockSize, path, callback);
                    return true;
                },
                ///暂停
                pause: function () {
                    pause = true;
                },
                //继续
                continue: function () {
                    pause = false;
                    this.upload();
                },
                //继续
                reset: function () {
                    uploadId = '';
                    index = 0;
                    pause = false;
                }
            };

            return uploadPart;
        }
    }
})(window.houoy.upload || {});
