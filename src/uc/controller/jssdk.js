const crypto = require('crypto');
const request = require('request');
const fs = require('fs');
const debug = require('debug')('jswechat:jssdk');

function JSSDK(appId, appSecret) {
    this.appId = appId;
    this.appSecret = appSecret;
}

JSSDK.prototype = {
    getSignPackage_: function (url, done) {
        const instance = this;

        this.getJsApiTicket(function (err, jsApiTicket) {
            if (err) {
                return done(err);
            }

            const nonceStr = instance.createNonceStr();
            const timestamp = Math.round(Date.now() / 1000);

            // 生成签名
            const rawString = `jsapi_ticket=${jsApiTicket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
            const hash = crypto.createHash('sha1');
            const signature = hash.update(rawString).digest('hex');

            done(null, {
                timestamp,
                url,
                signature,
                // rawString,
                nonceStr,
                appId: instance.appId,
            });
        });
    },
    async getSignPackage(url){
        const instance=this;
        const JsApiTicket=this.getJsApiTicket();
        // instance.getJsApiTicket(function(err,JsApiTicket){
        //     if(err){
        //         debug('getJsApiTicket.err',err);
        //         return {};
        //     }
            
        // });
        const timestamp=Math.round(Date.now()/1000);
            const noncestr=instance.createNonceStr();
            const rawString='jsapi_ticket='+JsApiTicket+'&noncestr='+noncestr+'&timestamp='+timestamp+'&url='+url;
            const hash=crypto.createHash('sha1');
            const signature=hash.update(rawString).digest('hex');
            const sign={
                timestamp,
                url,
                signature,
                rawString,
                appId:instance.appId,
                nonceStr:noncestr

            };
            // console.log(JSON.stringify(sign));
            return (sign);
        
    },
    async getJsApiTicket() {
        const cacheFile = '.jsapiticket.json';
        const intance = this;
        const data = intance.readCacheFile(cacheFile);
        const time = Math.round(Date.now() / 1000);

        if (typeof data.expireTime === 'undefined' || data.expireTime < time) {
            debug('getJsApiTicket: from server');
            const accessToken=this.getAccessToken();
            const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=${accessToken}`;
                request.get(url, function (err, res, body) {
                    if (err) {
                        debug('getJsApiTicket.request.error:', err, url);
                        return (err);
                    }

                    debug('getJsApiTicket.request.body:', body);

                    try {
                        const data = JSON.parse(body);

                        intance.writeCacheFile(cacheFile, {
                            expireTime: Math.round(Date.now() / 1000) + 7200,
                            jsApiTicket: data.ticket,
                        });

                        return(data.ticket);
                    } catch (e) {
                        debug('getJsApiTicket.parse.error:', e, url);
                        return(e);
                    }
                });
        } else {
            debug('getJsApiTicket: from cache');
            return(data.jsApiTicket);
        }
    },

    async getAccessToken() {
        const cacheFile = '.accesstoken.json';
        const intance = this;
        const data = intance.readCacheFile(cacheFile);
        const time = Math.round(Date.now() / 1000);

        if (typeof data.expireTime === 'undefined' || data.expireTime < time) {
            debug('getAccessToken: from server');
            const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`;
            request.get(url, function (err, res, body) {
                if (err) {
                    debug('getAccessToken.request.error:', err, url);
                    return (err);
                }

                debug('getAccessToken.request.body:', body);

                try {
                    const data = JSON.parse(body);

                    intance.writeCacheFile(cacheFile, {
                        expireTime: Math.round(Date.now() / 1000) + 7200,
                        accessToken: data.access_token,
                    });

                    return(data.access_token);
                } catch (e) {
                    debug('getAccessToken.parse.error:', e, url);
                    return(e);
                }
            });
        } else {
            debug('getAccessToken: from cache');
            return(data.accessToken);
        }
    },

    async createNonceStr() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const length = chars.length;
        let str = '';
        for (let i = 0; i < length; i++) {
            str += chars.substr(Math.round(Math.random() * length), 1);
        }
        return str;
    },

    // 从文件里面读取缓存
    async readCacheFile(filename) {
        try {
            return JSON.parse(fs.readFileSync(filename));
        } catch (e) {
            debug('read file %s failed: %s', filename, e);
        }

        return {};
    },

    // 往文件里面写缓存
    async writeCacheFile(filename, data) {
        return fs.writeFileSync(filename, JSON.stringify(data));
    },
};

const jssdk = new JSSDK('wx31783e0b591a7f4b', 'c4cca2d1622fd3e6f70aa78d2621db3b');
module.exports = jssdk;

// debug(jssdk.createNonceStr());
// debug(jssdk.createNonceStr());
//
// jssdk.getAccessToken(function (err, accessToken) {
//     console.log(arguments);
// });
//
// jssdk.getJsApiTicket(function (err, accessToken) {
//     console.log(arguments);
// });
//
// jssdk.getSignPackage_('http://www.gzxinbibo.com/uc/wechat/index', function (err, accessToken) {
//     console.log(arguments);
// });
//
// debug(jssdk.getSigPackage('http://www.gzxinbibo.com/uc/wechat/index'));