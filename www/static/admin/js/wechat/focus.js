/**
 * Created by whos on 2016/3/31.
 */

$(document).ready(function () {
    
});

function GoFocus(focus, sid) {
    // $("#focus_cancel").removeClass("hidden");
    $.toast('取消关注成功');
    $("#focus_cancel").addClass("hidden");
    $("#focus_ok").removeClass("hidden");
                // $("#focus_ok").addClass("hidden");
                // $("#ln_qr_modal").modal('show');
    // $.ajax({
    //     url: '/shop/focus/' + sid,
    //     method: 'post',
    //     data: {
    //         focus: focus,
    //         // __CSRF__: $.cookie("__CSRF__")
    //     },
    //     success: function (data) {
    //         //console.log(data);
    //         $.toast(data['detail']);
    //         if (focus) {
    //             $("#focus_cancel").removeClass("hidden");
    //             $("#focus_ok").addClass("hidden");
    //             $("#ln_qr_modal").modal('show');
    //         }
    //         else {
    //             $("#focus_cancel").addClass("hidden");
    //             $("#focus_ok").removeClass("hidden");
    //         }
    //     },
    //     error: function (data) {
    //         //console.log(data);
    //     }
    // });
}
