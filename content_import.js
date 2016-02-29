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

chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.action === 'fillTemplate') {
        document.querySelector('title').textContent = request.title;
        importFavicon('icon_19.png');

        importResource('album.css', function () {
            importResource('album.js', function () {
                document.body.appendChild(document.createRange().createContextualFragment(request.body));
            });
        });

        var script = document.querySelector('head script');
        script.parentNode.removeChild(script);
    }
});
