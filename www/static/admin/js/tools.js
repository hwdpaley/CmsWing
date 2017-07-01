/**
 * Created by whos on 2015/11/30.
 */

function getCookie(name) {
     var cookieValue = null ;
     if (document.cookie && document.cookie != '') {
         var cookies = document.cookie.split (';');
         for (var i = 0; i < cookies.length; i++) {
             var cookie = jQuery.trim (cookies[i]);
             // Does this cookie string begin with the name we want?
             if (cookie.substring(0, name.length + 1) == (name + '=')) {
                 cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                 if(cookieValue.charAt(0) == '"' && cookieValue.charAt(cookieValue.length-1))
                 {
                     cookieValue = cookieValue.substring(1, cookieValue.length-1);
                 }
                 break ;
             }
         }
     }
     return cookieValue ;
 }

function checkStringNull(str)
{
    if(str == null || str == "" || str == undefined || str == "null")
    {
        return true
    }
    return false;
}

//视频时长转换
function secondsTominutes(str){
    var hour=0;
    var min = parseInt(str/60);
    if (min>60) {
        hour = parseInt(min/60);
        min=min%60;
    }
    if(hour!=0)
        return hour+"小时"+min+"分";
    else
        return min+"分钟";
}

//分钟转换为小时或天
function minutesToHoursOrDays(minutes)
{
    if(minutes < 60)
    {
        return minutes+"分钟"
    }
    var hours = minutes/60;
    if (hours > 24 && hours % 24 == 0)
    {
        return hours/24+"天";
    }
    return hours+"小时";
}

//function UTCtoLocal(utc)
//{
//    var date = new Date(utc);
//    return date.getUTCFullYear()+"-"+
//        (date.getUTCMonth()+1)+"-"+
//        date.getUTCDate()+" "+
//        date.getUTCHours()+":"+
//        date.getUTCMinutes();
//}

function UTCtoLocal(utc){
    //var divUtc = $('#divUTC');
    //var divLocal = $('#divLocal');
    ////put UTC time into divUTC
    //divUtc.text(moment.utc().format('YYYY-MM-DD HH:mm:ss'));

    //get text from divUTC and conver to local timezone
    var localTime  = moment.utc(utc).toDate();
    return moment(localTime).format('YYYY-MM-DD HH:mm');
    //divLocal.text(localTime);
}

function UTCtoLocalss(utc){
    var localTime  = moment.utc(utc).toDate();
    return moment(localTime).format('YYYY-MM-DD HH:mm:ss');
}

//判断浏览器
function checkPlatform(){
	if(/android/i.test(navigator.userAgent)){
		return 'android';//这是Android平台下浏览器
	}
	else if(/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)){
		return 'ios';//这是iOS平台下浏览器
	}
	//else if(/Linux/i.test(navigator.userAgent) || /Linux/i.test(navigator.platform)){
	//	return 'linux';//这是Linux平台下浏览器
	//}
	else if(/MicroMessenger/i.test(navigator.userAgent)){
		return 'wechat';//这是微信平台下浏览器
	}
    else
    {
        return 'pc';
    }
}

/**
 *
 * @param value
 * @returns {*}
 */
function doBase64Code(value) {
    var encoded = Base64[
    'encode' + ($('encodeURI').checked ? 'URI' : '')
        ](value);
    encoded = encoded.replace(new RegExp(/(\+)/g), '-').replace(new RegExp(/(\/)/g), '_');
    return encoded;
}

//获取get参数
function $_GET(param) {
	var vars = {};
	window.location.href.replace( location.hash, '' ).replace(
		/[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
		function( m, key, value ) { // callback
			vars[key] = value !== undefined ? value : '';
		}
	);

	if ( param ) {
		return vars[param] ? vars[param] : null;
	}
	return vars;
}

var $_GET = $_GET();

//检查登录
function checklogin(){
    return !checkStringNull(getCookie("key"));
}
