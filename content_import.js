/**
 * Imports an external resource to the document
 */
function importResource(filename, callback) {
    var src = chrome.extension.getURL(filename),
        ext = src.split('.').pop(),
        xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function () {
        var tag = '',
            type = '';

        if (ext === 'js') {
            tag = 'script';
            type = 'application/javascript';
        } else {
            tag = 'style';
            type = 'text/css';
        }

        var element = document.createElement(tag);

        element.setAttribute('type', type);
        element.appendChild(document.createTextNode(this.responseText));

        document.head.appendChild(element);

        if (callback) {
            callback();
        }
    });

    xhr.open('GET', src);
    xhr.send();
}

/**
 * Imports favicon as data URL
 */
function importFavicon(filename) {
    var src = chrome.extension.getURL(filename),
        xhr = new XMLHttpRequest();

    xhr.responseType = 'blob';

    xhr.addEventListener('load', function () {
        var reader = new FileReader();

        reader.addEventListener('loadend', function () {
            var link = document.createElement('link');

            link.setAttribute('type', 'image/icon');
            link.setAttribute('rel', 'shortcut icon');
            link.setAttribute('href', reader.result);

            document.head.appendChild(link);
        });

        reader.readAsDataURL(xhr.response);
    });

    xhr.open('GET', src);
    xhr.send();
}

/**
 * Builds the markup for the album contents with event listeners for zooming
 */
function buildAlbumBody(bodyHtml) {
    var body = document.createRange().createContextualFragment(bodyHtml),
        images = body.querySelectorAll('img'),
        videos = body.querySelectorAll('video');

    for (var i = 0; i < images.length; i++) {
        images[i].addEventListener('load', function () { setZooming(this); });
    }

    for (var i = 0; i < videos.length; i++) {
        videos[i].addEventListener('loadedmetadata', function () { setZooming(this); });
    }

    document.body.appendChild(body);
}

/**
 * Monitors all changes in header height for ~2 seconds or until 2 resizes
 * have been committed and applies them to the first image container's
 * top margin. This fixes a gap between the header and first image during
 * album creation.
 */
function fixHeaderOffsetHeight() {
    var postContainer = document.body.querySelector('.post-container'),
        postHeader = postContainer.children[0],
        firstImageContainer = postContainer.children[1],
        oldHeight = 0,
        checksPerformed = 0,
        resizesPerformed = 0;

    function checkHeaderHeight() {
        var newHeight = postHeader.offsetHeight;

        if (newHeight !== oldHeight) {
            firstImageContainer.style.marginTop = newHeight;
            resizesPerformed++;

            oldHeight = newHeight;
        }

        if (++checksPerformed < 80 && resizesPerformed !== 2) {
            window.setTimeout(checkHeaderHeight, 25);
        }
    }

    checkHeaderHeight();
}

chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.action === 'fillTemplate') {
        document.querySelector('title').textContent = request.title;
        importFavicon('icon_19.png');

        importResource('album.css', function () {
            importResource('album.js', function () {
                buildAlbumBody(request.body);
                fixHeaderOffsetHeight();
            });
        });

        var script = document.querySelector('head script');
        script.parentNode.removeChild(script);
    }
});
