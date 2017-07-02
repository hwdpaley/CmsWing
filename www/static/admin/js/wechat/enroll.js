$(document).ready(function() {
    // body...
    // var path = window.location.pathname;
    // console.log(path);
    // var id =333;// path.match("[0-9]+")[0];

    var img_list = $(".introduction_content img");
    for (var i = 0; i < img_list.length; i++) { //循环为每个img设置
        img_list[i].removeAttribute("width");
        //img_list[i].attr("width", "100%");
        img_list[i].removeAttribute("height");
        img_list[i].removeAttribute("style");
    }

    var pay_type1 = $("#pay_type");
    if (pay_type1.val() == "1") {
        $("#enroll_button").val("已报名");
    }
    // else if(pay_type1.val() == "2"){
    // 	$("#enroll_button").val("已付费参加");
    // }

    // 未支付按钮的点击相应事件
    $("#enroll_button").click(function() {
        // 支付弹窗
        // $("#qr_code").removeClass("hidden");
        var pay_type = $("#pay_type");
        // 未报名
        if (pay_type.val() == "0") {
            $("#enroll_modal").modal('show');
        } else //已报名
        {
            if ($('#price').val() == '0') {
                $("#free_show").removeClass("hidden");
            } else {
                $("#qr_code").removeClass("hidden");
            }
            $("#modal_body").addClass("hidden");
            $("#enroll_modal").modal('show');
        }
    });


});

function enroll_modal_button(did) {
    console.log("did=" + did);
    var user_name = $("#user_name");
    var user_phone = $("#user_phone");

    if (user_name.val().length == 0 || user_phone.val().length == 0) {
        alert("用户名和手机号不能为空");
        return;
    }
    if (user_phone.val().length != 11) {
        alert("请输入正确的手机号");
        return;
    }
    //报名参加
    $.ajax({
        url: "/uc/weixin/enroll",
        method: "post",
        data: {
            "docid": did,
            "name": user_name.val(),
            "phone": user_phone.val(),
            // csrfmiddlewaretoken: $.cookie("csrftoken")
        },
        success: function(data) {
            console.log(JSON.stringify(data));
            if (data.data.name) {
                alert(data.data.name);
            }


            if (data.data.status == 0) {
                $("#modal_body").addClass("hidden");
                if ($('#price').val() == '0') {
                    $("#free_show").removeClass("hidden");
                } else {
                    $("#qr_code").removeClass("hidden");
                }

                $("#pay_type").val('1');
                $("#enroll_button").val("已报名");
            } else if (data.data.status == -1) {
                $("#enroll_modal").modal('hide');
                // $("#modal_body").addClass("hidden");
                // $("#modal-header").addClass("hidden");
            }

        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.status);
            alert(XMLHttpRequest.readyState);
            alert(textStatus);
        }
    });

};

