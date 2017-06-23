// +----------------------------------------------------------------------
// | Bieber [ 美道网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015 http://www.gzxinbibo.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: arterli <912697590@qq.com>
// +----------------------------------------------------------------------
'use strict';

/**
 * hook config
 * https://thinkjs.org/doc/middleware.html#toc-df6
 */
export default {
    //view_filter : ['append', 'debug_toolbar'],
    payload_parse: ['prepend', 'parse_wechat'],
    // logic_before: ["prepend", "csrf"]
}