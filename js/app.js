/* eslint-disable */
var customSearch;

// 函数防抖 (只执行最后一次点击)
var Debounce = (fn, t) => {
  let delay = t || 200;
  let timer;
  return function () {
    let args = arguments;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, args);
    }, delay);
  };
};

(function ($) {
  "use strict";
  const isMobile = /mobile/i.test(window.navigator.userAgent);

  // 校正页面定位（被导航栏挡住的区域）
  var scrollCorrection = 80; // (header height = 64px) + (gap = 16px)
  var $headerAnchor = $(".l_header");
  if ($headerAnchor[0]) {
    scrollCorrection = $headerAnchor[0].clientHeight + 16;
  }

  //判断是否是pc设备
  function isPc() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = false;
        break;
      }
    }
    if (window.screen.width >= 768) {
      flag = true;
    }
    return flag;
  }
  // 尝试： 重设数据值
  function restData() {
    scrollCorrection = 80;
    $headerAnchor = $(".l_header");
    if ($headerAnchor[0]) {
      scrollCorrection = $headerAnchor[0].clientHeight + 16;
    }
  }

  // 校正页面定位（被导航栏挡住的区域）
  function scrolltoElement(elem, correction = scrollCorrection) {
    const $elem = elem.href ? $(decodeURI(elem.getAttribute("href"))) : $(elem);
    $("html, body").animate(
      {
        scrollTop: $elem.offset().top - correction,
      },
      500
    );
  }

  // 设置滚动锚点
  function setScrollAnchor() {
    const $postsBtn = $(".menu .active"); // 一级导航上的当前激活的按钮
    const $topBtn = $(".s-top"); // 向上
    const $titleBtn = $("h1.title", "#header-meta"); // 文章内标题
    const $bodyAnchor = $(".safearea"); // 页面主体

    if ($postsBtn.length && $bodyAnchor) {
      $postsBtn.click((e) => {
        e.preventDefault();
        e.stopPropagation();
        if ($postsBtn.attr("href") != "/")
          // TODO: fix it
          scrolltoElement($bodyAnchor);
        e.stopImmediatePropagation();
        $postsBtn.unbind("click");
      });
    }
    if ($titleBtn.length && $bodyAnchor) {
      $titleBtn.click((e) => {
        e.preventDefault();
        e.stopPropagation();
        scrolltoElement($bodyAnchor);
        e.stopImmediatePropagation();
        $titleBtn.unbind("click");
      });
    }
    if ($topBtn.length && $bodyAnchor) {
      $topBtn.click((e) => {
        e.preventDefault();
        e.stopPropagation();
        scrolltoElement($bodyAnchor);
        e.stopImmediatePropagation();
      });
    }

    //==========================================

    var enableCover = $("#pjax-enable-cover").text(); // Pjax 处理

    var showHeaderPoint = 0;
    var $coverHeight = 0;

    if (enableCover) {
      const $coverAnchor = $(".cover-wrapper");

      if ($coverAnchor[0]) {
        if ($(".cover-wrapper#half").css("display") !== "none")
          // Pjax 处理
          $coverHeight = 240;
        showHeaderPoint = $coverAnchor[0].clientHeight - $coverHeight;
      }
    }

    var pos = document.body.scrollTop + $coverHeight; // Pjax 处理

    $(document, window).scroll(
      Debounce(() => {
        let scrollTop = $(window).scrollTop(); // 滚动条距离顶部的距离

        scrollTop += $coverHeight; // Pjax 处理

        const del = scrollTop - pos;
        pos = scrollTop;
        if (scrollTop > 240) {
          $topBtn.addClass("show");
          if (del > 0) {
            $topBtn.removeClass("hl");
          } else {
            $topBtn.addClass("hl");
          }
        } else {
          $topBtn.removeClass("show").removeClass("hl");
        }
        if (scrollTop - showHeaderPoint > -1) {
          $headerAnchor.addClass("show");
        } else {
          $headerAnchor.removeClass("show");
        }
      })
    );
    //==========================================
  }

  // 设置导航栏
  function setHeader() {
    var HEXO_ISPAGE = $.trim($("#pjax-ispage").text());
    if (HEXO_ISPAGE == "true")
      window.subData = {
        title: $.trim($("#pjax-pageTitle").text()),
        tools: true,
      };

    if (!window.subData) return;
    const $wrapper = $("header .wrapper"); // 整个导航栏
    const $comment = $(".s-comment", $wrapper); // 评论按钮  桌面端 移动端
    const $toc = $(".s-toc", $wrapper); // 目录按钮  仅移动端

    $wrapper.find(".nav-sub .title").text(window.subData.title); // 二级导航文章标题

    // 决定一二级导航栏的切换
    let pos = document.body.scrollTop;
    $(document, window).scroll(
      Debounce(() => {
        const scrollTop = $(window).scrollTop();
        const del = scrollTop - pos;
        if (del >= 50 && scrollTop > 100) {
          pos = scrollTop;
          $wrapper.addClass("sub");
        } else if (del <= -50) {
          pos = scrollTop;
          $wrapper.removeClass("sub"); // <---- 取消二级导航显示
        }
      })
    );

    // bind events to every btn
    let $commentTarget = $(".l_body article#comments"); // 评论区域
    if ($commentTarget.length) {
      $comment.click((e) => {
        // 评论按钮点击后 跳转到评论区域
        e.preventDefault();
        e.stopPropagation();
        scrolltoElement($(".l_body article#comments"));
        e.stopImmediatePropagation();
      });
    } else $comment.remove(); // 关闭了评论，则隐藏

    const $tocTarget = $(".l_body .toc-wrapper"); // 侧边栏的目录列表  PC
    if ($tocTarget.length && $tocTarget.children().length) {
      $toc.click((e) => {
        e.stopPropagation();
        $tocTarget.toggleClass("active");
        $toc.toggleClass("active");
      });
      $(document).click(function (e) {
        e.stopPropagation();
        $tocTarget.removeClass("active");
        $toc.removeClass("active");
      });
      $(document, window).scroll(
        Debounce(() => {
          $tocTarget.removeClass("active");
          $toc.removeClass("active");
        }, 100)
      );
    } else $toc.remove();
  }

  // 多级分类
  function initCatagory() {
    var $parents = $(".category-parent");
    $parents.click(function (e) {
      let $icon = $(e.currentTarget).find("i");
      let open = $(e.currentTarget).find(".fa-chevron-down").length > 0;
      let $child = $(e.currentTarget.parentElement).find("ul");
      if (open) {
        $child.hide();
        $icon.removeClass("fa-chevron-down")
        $icon.addClass("fa-chevron-right")
      } else {
        $child.show();
        $icon.removeClass("fa-chevron-right")
        $icon.addClass("fa-chevron-down")
      }
    }
    )
  }

  // 设置导航栏菜单选中状态
  function setHeaderMenuSelection() {
    var $headerMenu = $("body .navigation");
    // 先把已经激活的取消激活
    $headerMenu.find("li a.active").removeClass("active");
    $headerMenu.find("div a.active").removeClass("active");
    // var $underline = $headerMenu.find('.underline');
    function setUnderline($item) {
      // if (!transition) $underline.addClass('disable-trans');
      if ($item && $item.length) {
        $item.addClass("active").siblings().removeClass("active");
      }
    }
    //set current active nav
    var $active_link = null;
    // replace '%' '/' '.'
    var idname = location.pathname.replace(/\/|%|\./g, "");
    if (idname.length == 0) {
      idname = "home";
    }
    var page = idname.match(/page\d{0,}$/g);
    if (page) {
      page = page[0];
      idname = idname.split(page)[0];
    }
    var index = idname.match(/index.html/);
    if (index) {
      index = index[0];
      idname = idname.split(index)[0];
    }
    // 转义字符如 [, ], ~, #, @
    idname = idname.replace(/(\[|\]|~|#|@)/g, "\\$1");
    if (idname && $headerMenu) {
      $active_link = $("#" + idname, $headerMenu);
      if ($active_link.length == 0) {
        $active_link = $("#home", $headerMenu);
      }
      setUnderline($active_link);
    }
  }

  // 设置全局事件
  function setGlobalHeaderMenuEvent() {
    if (isMobile) {
      // 手机端 点击展开子菜单
      $(".m-phone li").click(function (e) {
        e.stopPropagation();
        $($(e.currentTarget).children("ul")).show();
      });
    } else {
      // PC端 hover时展开子菜单，点击时隐藏子菜单
      $(".m-pc li > a[href]")
        .parent()
        .click(function (e) {
          e.stopPropagation();
          if (e.target.origin == e.target.baseURI) {
            $(".m-pc .list-v").hide();
          }
        });
    }
    setPageHeaderMenuEvent();
  }

  function setPageHeaderMenuEvent() {
    if (!isMobile) return;
    // 手机端 点击空白处隐藏子菜单
    $(document).click(function (e) {
      $(".m-phone .list-v").hide();
    });
    // 手机端 滚动时隐藏子菜单
    $(window).scroll(
      Debounce(() => {
        $(".m-phone .list-v").hide();
      })
    );
  }
  // 设置导航栏搜索框   fix √
  function setHeaderSearch() {
    var $switcher = $(".l_header .switcher .s-search"); // 搜索按钮   移动端
    var $header = $(".l_header"); // 移动端导航栏
    var $search = $(".l_header .m_search"); // 搜索框 桌面端
    if ($switcher.length === 0) return;
    $switcher.click(function (e) {
      e.stopPropagation();
      $header.toggleClass("z_search-open"); // 激活移动端搜索框
      $switcher.toggleClass("active"); // 搜索按钮
      $search.find("input").focus();
    });
    $(document).click(function (e) {
      $header.removeClass("z_search-open");
      $switcher.removeClass("active");
    });

    $search.click(function (e) {
      e.stopPropagation();
    });
    $header.ready(function () {
      $header.bind("keydown", function (event) {
        if (event.keyCode == 9) {
          return false;
        } else {
          var isie = document.all ? true : false;
          var key;
          var ev;
          if (isie) {
            //IE浏览器
            key = window.event.keyCode;
            ev = window.event;
          } else {
            //火狐浏览器
            key = event.which;
            ev = event;
          }
          if (key == 9) {
            //IE浏览器
            if (isie) {
              ev.keyCode = 0;
              ev.returnValue = false;
            } else {
              //火狐浏览器
              ev.which = 0;
              ev.preventDefault();
            }
          }
        }
      });
    });
  }

  // 设置导航栏搜索框
  function setTocToggle() {
    const $toc = $(".toc-wrapper"); // 侧边栏 TOC 移动端
    if ($toc.length === 0) return;
    $toc.click((e) => {
      e.stopPropagation();
      $toc.addClass("active");
    });
    $(document).click(() => $toc.removeClass("active"));

    $toc.on("click", "a", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.target.tagName === "A") {
        scrolltoElement(e.target, 0);
      } else if (e.target.tagName === "SPAN") {
        scrolltoElement(e.target.parentElement, 0);
      }
      $toc.removeClass("active");
      const $tocBtn = $(".s-toc");
      if ($tocBtn.length > 0) {
        $tocBtn.removeClass("active");
      }
    });

    let liElements = Array.from($toc.find("li a"));
    //function animate above will convert float to int.
    let getAnchor = () =>
      liElements.map((elem) =>
        Math.floor(
          $(decodeURI(elem.getAttribute("href"))).offset().top -
          scrollCorrection
        )
      );

    let anchor = getAnchor();
    let domHeigth = $(document).height();
    let scrollListener = () => {
      let scrollTop = $("html").scrollTop() || $("body").scrollTop();
      if ($(document).height() != domHeigth) {
        // dom 高度发生变化： 普遍来说，是图片懒加载造成的
        scrollTop = $("html").scrollTop() || $("body").scrollTop();
        domHeigth = $(document).height();
        anchor = getAnchor();
      }
      if (!anchor) return;
      //binary search.
      let l = 0,
        r = anchor.length - 1,
        mid;
      while (l < r) {
        mid = (l + r + 1) >> 1;
        if (anchor[mid] === scrollTop) l = r = mid;
        else if (anchor[mid] < scrollTop) l = mid;
        else r = mid - 1;
      }
      $(liElements).removeClass("active").eq(l).addClass("active");
    };

    $(window).scroll(
      Debounce(() => {
        scrollListener();
      })
    );

    // 监听窗口改变事件
    let resizeTimer = null;
    $(window).bind("resize", function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        anchor = getAnchor();
        scrollListener();
      }, 100);
    });

    scrollListener();
  }

  // 设置 tabs 标签
  function setTabs() {
    const $tabs = $(".tabs");
    if ($tabs.length === 0) return;
    let $navs = $tabs.find(".nav-tabs .tab");
    for (var i = 0; i < $navs.length; i++) {
      let $a = $tabs.find($navs[i].children[0]);
      $a.addClass($a.attr("href"));
      $a.removeAttr("href");
    }
    $(".tabs .nav-tabs").on("click", "a", (e) => {
      e.preventDefault();
      e.stopPropagation();
      let $tab = $(e.target.parentElement.parentElement.parentElement);
      $tab.find(".nav-tabs .active").removeClass("active");
      $tab.find(e.target.parentElement).addClass("active");
      $tab.find(".tab-content .active").removeClass("active");
      $tab.find($(e.target).attr("class")).addClass("active");
      return false;
    });
  }
  /*文章标题*/
  function setTitleFormat(cssSelector) {
    const $title = $(cssSelector);
    $title.each(function () {
      const $this = $(this);
      const text = $this.text();
      $this.text("");
      const title = `<span class="prefix"></span><span class="content">${text}</span><span class="suffix"></span>`;
      $this.prepend(title);
    });
  }
  function setTitle() {
    setTitleFormat("#nice h2");
    setTitleFormat("#nice h3");
  }

  // 移动端
  function selectTab() {
    var $headerMenu = $("body .l_tab");
    // 先把已经激活的取消激活
    $headerMenu.find(".active").removeClass("active");
    // replace '%' '/' '.'
    var idname = location.pathname.replace(/\/|%|\./g, "");
    if (idname.length == 0) {
      idname = "home";
    }
    var page = idname.match(/page\d{0,}$/g);
    if (page) {
      page = page[0];
      idname = idname.split(page)[0];
    }
    var index = idname.match(/index.html/);
    if (index) {
      index = index[0];
      idname = idname.split(index)[0];
    }
    // 转义字符如 [, ], ~, #, @
    idname = idname.replace(/(\[|\]|~|#|@)/g, "\\$1");
    if (idname && $headerMenu) {
      let $tab = $("#tab-" + idname, $headerMenu);
      if ($tab.length == 0) {
        $tab = $("#tab-home");
      }
      $tab.addClass("active")
    }
  }

  $(function () {
    setHeader();
    setHeaderMenuSelection();
    setGlobalHeaderMenuEvent();
    setHeaderSearch();
    setTocToggle();
    setScrollAnchor();
    setTabs();
    initCatagory();
    setTitle();
    selectTab();
    // 全屏封面底部箭头
    $(".scroll-down").on("click", function () {
      scrolltoElement(".safearea");
    });
  });
})(jQuery);

/*锚点定位*/
if (window.location.hash) {
  var checkExist = setInterval(function () {
    if (typeof jQuery == "undefined") {
      return;
    }
    if (
      $("#" + decodeURI(window.location.hash.split("#")[1]).replace(/\ /g, "-"))
        .length
    ) {
      $("html, body").animate(
        {
          scrollTop:
            $(
              "#" +
              decodeURI(window.location.hash.split("#")[1]).replace(
                /\ /g,
                "-"
              )
            ).offset().top - 40,
        },
        500
      );
      clearInterval(checkExist);
    }
  }, 100);
}