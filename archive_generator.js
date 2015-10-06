/*
The MIT License (MIT)

Copyright (c) 2015 Tsuri Kamppuri

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

loadAlbum(window.location.pathname.replace('/gallery/', ''));

function generateArchive(album) {
    var htmlContent = '<html>' +
        '<head>' +
            '<meta charset="utf-8">' +
            getStyles() +
            getScripts() +
        '</head>' +
        '<body>' +
            parseAlbum(album) +
        '</body>' +
    '</html>';

    chrome.runtime.sendMessage({
        action: 'getSource',
        source: htmlContent
    });
}

function getStyles() {
    var stylesStr = '<style>';

    stylesStr += 'body {' +
        'background-color: #121211;' +
        'font-size: 14px;' +
    '}';

    stylesStr += '.post-container {' +
        'width: 680px;' +
        'background: #2B2B2B;' +
        'border-radius: 5px;' +
        'margin: 0 auto;' +
    '}';

    stylesStr += '.post-header {' +
        'width: 640px;' +
        'padding: 10px 20px;' +
        'background: rgba(38, 38, 38, .9);' +
        'border-radius: 5px 5px 0 0;' +
        'box-shadow: 0 4px 4px -2px rgba(0, 0, 0, .2);' +
    '}';

    stylesStr += '.post-title {' +
        'color: #F2F2F2;' +
        'font-size: 16px;' +
    '}';

    stylesStr += '.post-title-meta {' +
        'color: #B2B2B2;' +
        'font-size: 12px;' +
        'padding: 0;' +
    '}';

    stylesStr += '.post-image-title {' +
        'padding: 16px 20px;' +
        'color: #CCC;' +
        'background: #2E2E2E;' +
        'font-size: 16px;' +
    '}';

    stylesStr += '.post-image {' +
        'background: #181817;' +
    '}';

    stylesStr += '.post-image-description {' +
        'background: #2E2E2E;' +
        'color: #CCC;' +
        'padding: 20px;' +
        'overflow: hidden;' +
        'white-space: pre-wrap;' +
        'word-wrap: break-word;' +
    '}';

    return stylesStr + '</style>';
}

function getScripts() {
    return '';
}

function parseAlbum(album) {
    var albumContent = '',

        dom = document.documentElement,
        title = dom.querySelector('.post-title').textContent,
        authorAnchor = dom.querySelector('.post-title-meta a'),
        exactTime = dom.querySelector('.exact-time').title,

        images = album.data.images,

        titleMeta = 'by <a href="' + authorAnchor.href + '">' +
            authorAnchor.textContent + '</a> · ' + exactTime,

        albumHtml = '<div class="post-container">';

    albumHtml += '<div class="post-header">' +
        '<h1 class="post-title">' + title + '</h1>' +
        '<p class="post-title-meta">' + titleMeta + '</p>' +
    '</div>';

    for (var i = 0; i < images.length; i++) {
        albumHtml += '<h2 class="post-image-title">' +
            images[i].title +
        '</h2>';

        albumHtml += '<div class="post-image">' +
            '<img src="http://i.imgur.com/' +
                images[i].hash + images[i].ext + '" />' +
        '</div>';

        albumHtml += '<p class="post-image-description">' +
            images[i].description +
        '</p>';
    }

    return albumHtml + '</div>';
}

function loadAlbum(albumId) {
    var url = 'http://imgur.com/ajaxalbums/getimages/' + albumId + '/hit.json?all=true',
        xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function () {
        var album = JSON.parse(this.responseText.replace('\n', '<br/>'));

        generateArchive(album);
    });

    xhr.open('GET', url);
    xhr.send(null);
}
