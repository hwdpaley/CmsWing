/**
 * Created by whos on 2016/3/31.
 */


function GoProductShelve(button, shelve, pid) {
    $.ajax({
        url: '/product/shelve/' + pid,
        method: 'post',
        data: {
            shelve: shelve,
            csrfmiddlewaretoken: $.cookie("csrftoken")
        },
        success: function (data) {
            //console.log(data);
            $.toast("操作成功");
            if (shelve) {
                $(button).text('点击下架');
                $(button).removeClass('btn-success');
                $(button).addClass('btn-danger');
                $(button).unbind('click');
                $(button).click(function () {
                    GoProductShelve(button, false, pid);
                })
            }
            else {
                $(button).text('点击上架');
                $(button).removeClass('btn-danger');
                $(button).addClass('btn-success');
                $(button).unbind('click');
                $(button).click(function () {
                    GoProductShelve(button, true, pid);
                })

            }
        },
        error: function (data) {
            //console.log(data);
        }
    });
}

function type_delete(tid) {
    $("#target_id").val(tid);
    $("#modal_delete_button").unbind('click');
    $("#modal_delete_button").click(function () {
        DeleteProductType($("#target_id").val());
    });
    $("#delete_modal").modal('show');
}

function DeleteProductType(tid) {
    $.ajax({
        url: '/product/type/' + tid,
        method: 'delete',
        beforeSend: function (req) {
            req.setRequestHeader("X-CSRFToken", $.cookie("csrftoken"));
        },
        success: function (data) {
            //console.log(data);
            $.toast("删除成功");
            window.location.href=window.location.pathname;
        },
        error: function (data) {
            //console.log(data);
        }
    });
}

function ProductDeleteChoice(tid) {
    $("#target_id").val(tid);
    $("#modal_delete_button").unbind('click');
    $("#modal_delete_button").click(function () {
        DeleteProduct($("#target_id").val());
    });
    $("#delete_modal").modal('show');
}

function DeleteProduct(pid) {
    $.ajax({
        url: '/product/self/' + pid,
        method: 'delete',
        beforeSend: function (req) {
            req.setRequestHeader("X-CSRFToken", $.cookie("csrftoken"));
        },
        success: function (data) {
            //console.log(data);
            $.toast("删除成功");
            window.location.reload();
        },
        error: function (data) {
            //console.log(data);
        }
    });
}

function ProductCopy(id) {
    $('#product_copy_modal').modal('show');
    $("#modal_copy_button").unbind('click');
    $("#modal_copy_button").bind('click', function () {
        var type = $("#type_select").val();
        $.ajax({
            url: "/product/api/copy/"+id,
            method: "post",
            data: {
                type: type
            },
            beforeSend: function (req) {
                req.setRequestHeader("X-CSRFToken", $.cookie("csrftoken"));
            },
            success: function (data) {
                console.log(data);
                $('#product_copy_modal').modal('hide');
                if (data['status'] == 0) {

                    $.toast("保存成功，请到“项目列表”中查看已保存链接。");
                }
                else {
                    $.toast(data['detail'], 'cancel');
                }
            },
            error: function (data) {
                //console.log(data);
            }
        });

    });
}
