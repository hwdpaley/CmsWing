// +----------------------------------------------------------------------
// | Bieber [ 美媒网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2017 http://www.gzxinbibo.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: Tony <912697590@qq.com>
// +----------------------------------------------------------------------
export default [
    [/^index\/(.*)$/, "topic/index/index?order=:1"],
    [/^index$/, "topic/index/index"],
    [/^p\/(.*)$/, "topic/detail/index?id=:1"],
    [/^w\/(.*)$/, "topic/detail/index?id=:1"],
    [/^dlink\/(.*)$/, "topic/detail/downloadgetid?id=:1"],
    [/^keywords\/(.*)$/,"topic/list/keywords?key=:1"],
    [/^topic\/(.*)$/,"topic/keyword/index?key=:1"],
    [/^topic$/,"topic/keyword/index"],
    // [/^music$/,"topic/music/index"],
    [/^music\/(.*)$/,"topic/music/audio?id:1"],
    [/^.well-known$/,"topic/weike/pkivalidation?key=:1"],
    [/^search$/,"topic/search/index"],
    [/^t\/(.*)$/,"topic/keyword/list?key=:1"],
    [/(.*)$/, "topic/index/route?category=:1"],
    // [/^channel\/(.*)$/, "home/topic/index?category=:1"],
    // [/^column\/(.*)$/, "home/topic/list?category=:1"],
    // [/^detail\/(.*)$/, "home/topic/detail?id=:1"],
    // [/^sp\/(.*)$/, "home/sp/index?category=:1"]
];