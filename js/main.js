(function() {
  "use strict";

  function setVisible(element, visible) {
    if (element) element.style.display = visible ? "" : "none";
  }

  function isVisible(element) {
    return !!element && window.getComputedStyle(element).display !== "none";
  }

  function toggle(element) {
    setVisible(element, !isVisible(element));
  }

  document.querySelectorAll("[data-toggle]").forEach(function(trigger) {
    trigger.addEventListener("click", function(event) {
      event.preventDefault();
      toggle(document.getElementById(trigger.dataset.toggle));
    });
  });

  document.querySelectorAll("[data-scroll-top]").forEach(function(trigger) {
    trigger.addEventListener("click", function(event) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-hover-label]").forEach(function(trigger) {
    var label = document.getElementById(trigger.dataset.hoverLabel);
    trigger.addEventListener("mouseenter", function() { setVisible(label, true); });
    trigger.addEventListener("mouseleave", function() { setVisible(label, false); });
    trigger.addEventListener("focus", function() { setVisible(label, true); });
    trigger.addEventListener("blur", function() { setVisible(label, false); });
  });

  var mobileNavTrigger = document.querySelector("#header > #nav > ul > .icon");
  if (mobileNavTrigger) {
    mobileNavTrigger.addEventListener("click", function(event) {
      event.preventDefault();
      mobileNavTrigger.parentElement.classList.toggle("responsive");
    });
  }

  var headerPost = document.getElementById("header-post");
  if (headerPost) {
    var menu = headerPost.querySelector(":scope > #menu");
    var nav = menu ? menu.querySelector(":scope > #nav") : null;
    var menuIcons = [
      document.getElementById("menu-icon"),
      document.getElementById("menu-icon-tablet")
    ].filter(Boolean);
    var tabletMenuIcon = document.getElementById("menu-icon-tablet");
    var tabletTopIcon = document.getElementById("top-icon-tablet");

    if (window.innerWidth >= 1440) {
      setVisible(menu, true);
      menuIcons.forEach(function(icon) { icon.classList.add("active"); });
    }

    menuIcons.forEach(function(icon) {
      icon.addEventListener("click", function(event) {
        event.preventDefault();
        var willShow = !isVisible(menu);
        setVisible(menu, willShow);
        menuIcons.forEach(function(item) { item.classList.toggle("active", willShow); });
      });
    });

    var footerPost = document.getElementById("footer-post");
    var footerTop = footerPost ? footerPost.querySelector("#top") : null;
    var lastScrollTop = window.scrollY;

    window.addEventListener("scroll", function() {
      var scrollTop = window.scrollY;

      if (menu) {
        if (scrollTop < 50) setVisible(nav, true);
        if (scrollTop > 100) setVisible(nav, false);

        if (!isVisible(document.getElementById("menu-icon"))) {
          setVisible(tabletMenuIcon, scrollTop < 50);
          setVisible(tabletTopIcon, scrollTop > 100);
        }
      }

      if (footerPost) {
        setVisible(footerPost, scrollTop <= lastScrollTop);
        setVisible(footerTop, scrollTop > 100);
        ["nav-footer", "toc-footer", "share-footer"].forEach(function(id) {
          setVisible(document.getElementById(id), false);
        });
      }

      lastScrollTop = Math.max(scrollTop, 0);
    }, { passive: true });
  }

  if (window.jQuery && window.jQuery.fn.justifiedGallery) {
    window.jQuery(".article-gallery").justifiedGallery({
      rowHeight: 140,
      margins: 4,
      lastRow: "justify"
    });
  }
})();
