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
            navigate(view, path);
            console.log("Navigating to: %s", path);
        });
    }

    function createView() {
        var view = document.createElement('view');
        document.body.appendChild(view);
        return view;
    }

    function navigate(view, path, domUpdates) {
        // get from cache first
        var link = links[path];
        if (link) {
            var content = link.import;
            view.innerHTML = content.body.innerHTML;
            return;
        }

        // Add new link element and add it's content to view
        link = document.createElement('link');
        link.rel = 'import';
        link.href = path;
        link.setAttribute('async', '');
        link.onload = function (e) {
            var content = link.import;
            // Ok I'd admit this was not part of the plan and does get complicated here with recursive crap
            // But subViews... come on it's such a boost! :)
            domUpdates = domUpdates || []; 
            domUpdates.push(function () { view.innerHTML = content.body.innerHTML });

            var views = content.body.getElementsByTagName("view");
            if (views.length > 0) { // Process child-viewss
                for (var i = 0; i < views.length; i++) {
                    navigate(views[i], getPath(views[i].attributes["src"].value), domUpdates);
                }
            } else {
                while (domUpdates.length > 0) {
                    var updateDOM = domUpdates.pop();
                    updateDOM();
                }
            }
        };
        link.onerror = function (err) {
            console.error(err)
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