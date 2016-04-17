"use strict"
function router() {

    var pathToContent = "/content/";
    var links = {};

    function getPath(page) {
        var page = page || (location.hash.substr(2, location.hash.length - 2));
        return pathToContent + page + "/" + page + ".html";
    }

    function addHashChangeListener(view) {
        // Couldn't figure out a way to implement client only routing with pushState so I used hash-bang instead
        window.addEventListener("hashchange", function (e) {
            var path = getPath();
            navigate(view, path, null);
        });
    }

    function createView() {
        var view = document.createElement('view');
        document.body.appendChild(view);
        return view;
    }

    function getInnerHtmlFromContent(content, view) {
        return content ? content.body.innerHTML :
            "<span class='error'>Error: could not find view '" +
            getPath(view.attributes["src"].value) +
            "'</span>"
    }

    function getChildViewsFromContent(content) {
        return content ? content.body.getElementsByTagName("view") : []
    }

    function updateDOM(link, view, domUpdates) {
        // Ok I'd admit this was not part of the plan and does get complicated here with recursive crap
        // But subViews... come on it's such a boost! :)
        var content = link.import;
        domUpdates = domUpdates || [];
        domUpdates.push(function () {
            view.innerHTML = getInnerHtmlFromContent(content, view);
        });

        var views = getChildViewsFromContent(content);
        if (views.length > 0) { // Process child-views
            for (var i = 0; i < views.length; i++) {
                navigate(views[i], getPath(views[i].attributes["src"].value), domUpdates);
            }
        } else {
            while (domUpdates.length > 0) {
                var func = domUpdates.pop();
                func();
            }
        }
    }

    function navigate(view, path, domUpdates) {
        // get from cache first
        var link = links[path];
        if (link) {
            updateDOM(link, view, domUpdates);
            return;
        }

        // Add new link element and add it's content to view
        link = document.createElement('link');
        link.rel = 'import';
        link.href = path;
        link.setAttribute('async', '');
        link.onload = function (e) {
            updateDOM(link, view, domUpdates);
        };
        link.onerror = function (err) {
            console.error(err)
            updateDOM(link, view, domUpdates);
        };
        document.body.appendChild(link);

        // Push to cache
        links[path] = link;
    }

    function setup() {
        var view = createView();
        addHashChangeListener(view);
        navigate(view, getPath());
    }

    return {
        setup: setup
    };
}