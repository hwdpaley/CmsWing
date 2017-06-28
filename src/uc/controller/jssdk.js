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
    getSigPackage:function(url){
        const instance=this;
        instance.getJsApiTicket(function(err,JsApiTicket){
            if(err){
                debug('getJsApiTicket.err',err);
                return {};
            }
            const timestamp=Math.round(Date.now()/1000);
            const noncestr=instance.createNonceStr();
            const rawString='jsapi_ticket='+JsApiTicket+'&noncestr='+noncestr+'&timestamp='+timestamp+'&url='+url;
            const hash=crypto.createHash('sha1');
            const signature=hash.update(rawString).digest('hex');
            sign={
                timestamp,
                url,
                signature,
                rawString,
                appId:instance.appId,
                nonceStr:noncestr

            };
            console.log(JSON.stringify(sign));
            return (sign);
        });
        
    },
    getJsApiTicket: function (done) {
        const cacheFile = '.jsapiticket.json';
        const intance = this;
        const data = intance.readCacheFile(cacheFile);
        const time = Math.round(Date.now() / 1000);

        if (typeof data.expireTime === 'undefined' || data.expireTime < time) {
            debug('getJsApiTicket: from server');
            intance.getAccessToken(function (error, accessToken) {
                if (error) {
                    debug('getJsApiTicket.token.error:', error);
                    return done(error, null);
                }

                const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=${accessToken}`;
                request.get(url, function (err, res, body) {
                    if (err) {
                        debug('getJsApiTicket.request.error:', err, url);
                        return done(err, null);
                    }

                    debug('getJsApiTicket.request.body:', body);

                    try {
                        const data = JSON.parse(body);

                        intance.writeCacheFile(cacheFile, {
                            expireTime: Math.round(Date.now() / 1000) + 7200,
                            jsApiTicket: data.ticket,
                        });

                        done(null, data.ticket);
                    } catch (e) {
                        debug('getJsApiTicket.parse.error:', e, url);
                        done(e, null);
                    }
                });
            });
        } else {
            debug('getJsApiTicket: from cache');
            done(null, data.jsApiTicket);
        }
    },

    getAccessToken: function (done) {
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
                    return done(err, null);
                }

                debug('getAccessToken.request.body:', body);

                try {
                    const data = JSON.parse(body);

                    intance.writeCacheFile(cacheFile, {
                        expireTime: Math.round(Date.now() / 1000) + 7200,
                        accessToken: data.access_token,
                    });

                    done(null, data.access_token);
                } catch (e) {
                    debug('getAccessToken.parse.error:', e, url);
                    done(e, null);
                }
            });
        } else {
            debug('getAccessToken: from cache');
            done(null, data.accessToken);
        }
    },

    createNonceStr: function () {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const length = chars.length;
        let str = '';
        for (let i = 0; i < length; i++) {
            str += chars.substr(Math.round(Math.random() * length), 1);
        }
        return str;
    },

    // 从文件里面读取缓存
    readCacheFile: function (filename) {
        try {
            return JSON.parse(fs.readFileSync(filename));
        } catch (e) {
            debug('read file %s failed: %s', filename, e);
        }

        return {};
    },

    // 往文件里面写缓存
    writeCacheFile: function (filename, data) {
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