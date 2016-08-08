"use strict"
function router(basePath) {

    var pathToContent = basePath || "/content/";
    var linkCache = {};

    function hasFullPath(page) {
        return page && page.indexOf("/")
    }

    function getPath(page) {
        // Fullpath 
        if (hasFullPath(page)) return page;

        // Convetion based path
        var page = page || (location.hash.substr(2, location.hash.length - 2));
        return pathToContent + page + "/" + page + ".html";
    }

    function addHashChangeListener(view) {
        window.addEventListener("hashchange", function (e) {
            var path = getPath();
            loadView(view, path, null);
        });
    }

    function getAppView() {
        var view = document.getElementsByTagName("view-app")[0]
        if (!view) {
            console.error("You have to add a <view-app></view-app> element to the index.html page!")
        }
        return view;
    }

    function getInnerHtmlFromContent(content, view) {
        if (content) {
            return content.body.innerHTML;
        } else {
            console.error("Content if undefined. Could not find view: ", getPath(view.attributes["src"].value));
            return "<span style='color:red'>Error: could not find view '" + getPath(view.attributes["src"].value) + "'</span>"
        }
    }

    function getChildViewsFromContent(content) {
        return content ? content.body.getElementsByTagName("view") : []
    }

    function updateDOM(link, view, domUpdateChain) {
        // Ok I'd admit this was not part of the plan and does get complicated here with recursive crap
        // But subViews... come on it's such a boost! :)
        var content = link.import;
        if (content) {
            domUpdateChain.push(function () { view.innerHTML = getInnerHtmlFromContent(content, view); });
        }

        var views = getChildViewsFromContent(content);
        if (views.length > 0) {
            for (var i = 0; i < views.length; i++) {
                if (domUpdateChain.length > 10) {
                    console.error("This smells like a circular reference issue. Please check if you have included a view that references back to it self somewhere: " + JSON.stringify(domUpdateChain));
                    return;
                }
                loadView(views[i], getPath(views[i].attributes["src"].value), domUpdateChain);
            }
        } else {
            executeDOMUpdateChain(domUpdateChain);
        }
    }

    var domUpdateChain = [];

    function executeDOMUpdateChain(domUpdateChain) {
        var max = domUpdateChain.length;
        while (max--) {
            domUpdateChain[max]();
        }
    }

    function loadView(view, path, domUpdateChain) {
        if(view.attributes["manual"]) {
            return;
        }
        
        if (!domUpdateChain) {
            domUpdateChain = []
        }

        // get from cache first
        var link = linkCache[path];
        if (link) {
            updateDOM(link, view, domUpdateChain);
            executeDOMUpdateChain(domUpdateChain);
            return;
        }

        // Add new link element and add it's content to view
        link = document.createElement('link');
        link.rel = 'import';
        link.href = path;
        link.setAttribute('async', '');
        link.onload = function (e) {
            if (domUpdateChain.length > 10) {
                console.error("This smells like a circular reference issue. Please check if you have included a view that references back to it self somewhere: " + JSON.stringify(domUpdateChain));
                return;
            }
            updateDOM(link, view, domUpdateChain);
            executeDOMUpdateChain(domUpdateChain);
        };
        link.onerror = function (err) {
            console.error(err)
            executeDOMUpdateChain(domUpdateChain);
        };
        document.body.appendChild(link);

        // Push to cache
        linkCache[path] = link;
        return link;
    }

    function setup() {
        var view = getAppView();
        addHashChangeListener(view);
        loadView(view, getPath());
    }

    return {
        setup: setup
    };
}