// +----------------------------------------------------------------------
// | Bieber [ 美道网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015 http://www.gzxinbibo.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: arterli <912697590@qq.com>
// +----------------------------------------------------------------------
'use strict';

/**
 * session configs
 */
export default {
  name: 'thinkjs',
  type: 'file',
  secret: '`5O%R#*P',
  timeout: 24 * 3600,
  cookie: { // cookie options
    length: 32,
    httponly: true
  },
  adapter: {
    file: {
      path: think.RUNTIME_PATH + '/session',
    }
  }
};