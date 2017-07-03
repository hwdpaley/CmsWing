var wechatMiddleware = require('think-wechat');

// think.middleware('parse_wechat', wechatMiddleware({
//         wechat:{
//             token: 'bieber',
//             appid: 'wx31783e0b591a7f4b',
//             encodingAESKey: 'dPcV8ASnbOiBNSi0hdZyEvf27459CY84AdTZcbqoR58'
//         },
//  }));
think.middleware('parse_wechat', wechatMiddleware({
        pathname: 'uc/wechat/index',    //默认，可配置为其他路径，与公众号对应的服务器URL设置一致
        route: {
          text: 'uc/wechat/index/text', //文字转发
          image: 'uc/wechat/index/image', //图片转发
          voice: 'uc/wechat/index/voice', //语音转发
          video: 'uc/wechat/index/video', //视频转发
          shortvideo: 'uc/wechat/index/shortvideo', //小视频转发
          location: 'uc/wechat/index/location', //地理位置转发
          link: 'uc/wechat/index/link', //链接转发
          event: 'uc/wechat/index/event', //推送事件转发
        },
        wechat:{
            token: 'bieber',
            appid: 'wx31783e0b591a7f4b',
            encodingAESKey: 'dPcV8ASnbOiBNSi0hdZyEvf27459CY84AdTZcbqoR58'
        },
    }));