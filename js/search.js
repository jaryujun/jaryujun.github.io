// Local search adapted from hexo-generator-search. No runtime dependency on jQuery.
/* exported searchFunc */
var searchFunc = function(path, searchId, contentId) {
  "use strict";

  function stripHtml(html) {
    return html
      .replace(/<style([\s\S]*?)<\/style>/gi, "")
      .replace(/<script([\s\S]*?)<\/script>/gi, "")
      .replace(/<figure([\s\S]*?)<\/figure>/gi, "")
      .replace(/<\/(div|li|ul|p)>/gi, "\n")
      .replace(/<li>/gi, "  *  ")
      .replace(/<br\s*[/]?>/gi, "\n")
      .replace(/<[^>]+>/gi, "");
  }

  function getAllCombinations(keywords) {
    var result = [];
    for (var i = 0; i < keywords.length; i++) {
      for (var j = i + 1; j < keywords.length + 1; j++) {
        result.push(keywords.slice(i, j).join(" "));
      }
    }
    return result;
  }

  var input = document.getElementById(searchId);
  var resultContent = document.getElementById(contentId);
  if (!input || !resultContent) return;

  fetch(path)
    .then(function(response) {
      if (!response.ok) throw new Error("Search index request failed");
      return response.text();
    })
    .then(function(xmlText) {
      var xml = new DOMParser().parseFromString(xmlText, "application/xml");
      var data = Array.from(xml.querySelectorAll("entry")).map(function(entry) {
        var title = entry.querySelector("title");
        var content = entry.querySelector("content");
        var link = entry.querySelector("link");
        return {
          title: title ? title.textContent : "Untitled",
          content: content ? content.textContent : "",
          url: link ? link.getAttribute("href") : "#"
        };
      });

      input.addEventListener("input", function() {
        var query = input.value.trim().toLowerCase();
        resultContent.innerHTML = "";
        if (!query) return;

        var keywords = getAllCombinations(query.split(/\s+/))
          .sort(function(a, b) { return b.split(" ").length - a.split(" ").length; });
        var results = [];

        data.forEach(function(item) {
          var title = item.title.trim() || "Untitled";
          var content = stripHtml(item.content.trim());
          var lowerTitle = title.toLowerCase();
          var lowerContent = content.toLowerCase();
          var matches = 0;
          var firstOccur = -1;

          keywords.forEach(function(keyword) {
            var titleIndex = lowerTitle.indexOf(keyword);
            var contentIndex = lowerContent.indexOf(keyword);
            if (titleIndex >= 0 || contentIndex >= 0) {
              matches += 1;
              if (firstOccur < 0) firstOccur = Math.max(contentIndex, 0);
            }
          });

          if (matches > 0) {
            var start = Math.max(firstOccur - 20, 0);
            var end = Math.min(start === 0 ? 100 : firstOccur + 80, content.length);
            var excerpt = content.substring(start, end);
            var escapedKeywords = keywords.map(function(keyword) {
              return keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            });
            var matcher = new RegExp(escapedKeywords.join("|"), "gi");
            excerpt = excerpt.replace(matcher, function(keyword) {
              return "<em class=\"search-keyword\">" + keyword + "</em>";
            });
            results.push({
              rank: matches,
              html: "<li><a href=\"" + item.url + "\" class=\"search-result-title\">" + title +
                "</a><p class=\"search-result\">" + excerpt + "...</p></li>"
            });
          }
        });

        if (results.length) {
          results.sort(function(a, b) { return b.rank - a.rank; });
          resultContent.innerHTML = "<ul class=\"search-result-list\">" +
            results.map(function(result) { return result.html; }).join("") + "</ul>";
        }
      });
    })
    .catch(function(error) {
      console.error(error);
    });
};
