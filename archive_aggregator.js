init();

/**
 * Prechecks conditions and initializes archiving procedure
 */
function init() {
    if (window.location.hostname !== 'imgur.com') {
        return openErrorPage('must be on imgur to archive an album');
    }

    var albumId = window.location.pathname.replace('/gallery/', '');

    if (albumId.length < 1) {
        return openErrorPage('could not read imgur album ID from URL');
    }

    loadAlbum(albumId);
}

/**
 * Sends a message to the background script to open a new tab
 *
 * @param string title
 * @param string body
 */
function openTab(title, body) {
    chrome.runtime.sendMessage({
        action: 'openTab',
        title: title,
        body: body
    });
}

/**
 * Loads album data from imgur, generates HTML code for
 * the album and sends the generated page to a new tab
 *
 * @param string albumId
 */
function loadAlbum(albumId) {
    var url = window.location.protocol + '//imgur.com/ajaxalbums/getimages/' + albumId + '/hit.json?all=true',
        xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function () {
        if (this.status === 200) {
            if (this.responseText.length < 1) {
                return openErrorPage('imgur returned empty content');
            }

            var albumData = JSON.parse(this.responseText.replace('\n', '<br/>'));

            if (!albumData || !albumData.data) {
                return openErrorPage('imgur returned unknown JSON');
            } else if (!albumData.data.images) {
                return openTab(getTitle(), generateAlbumFromDom());
            }

            return openTab(getTitle(), generateAlbumFromJson(albumData));
        } else {
            return openErrorPage('imgur returned status code ' + this.status);
        }
    });

    xhr.addEventListener('error', function () {
        openErrorPage('network error');
    });

    xhr.open('GET', url);
    xhr.send();
}

/**
 * @param string logMessage
 */
function openErrorPage(logMessage) {
    if (logMessage) {
        console.error('Archiving failed: ' + logMessage);
    }

    openTab(
        'Archiving error',
        'Failed to create the archive. Make sure you are browsing imgur.com/gallery/ when pressing the Archive button'
    );
}

/**
 * Parses album from current DOM. Only used for albums with one image.
 *
 * @return string
 */
function generateAlbumFromDom() {
    var dom = document.documentElement,
        img = dom.querySelector('.post-image img'),
        video = dom.querySelector('.post-image source')
        description = dom.querySelector('.post-image-description'),
        images = [
            {
                title: '', // omitted to avoid title popping up twice
                hash: (img ? img : video).src.split('/').pop().split('.').shift(),
                description: description ? description.textContent : '',
                ext: '.' + (img ? img.src.split('.').pop() : 'gif'),
            }
        ];

    return generateAlbumBody(images);
}

/**
 * Parses album image data from JSON. The rest of the album data is still read from DOM
 *
 * @param object albumData
 * @return string
 */
function generateAlbumFromJson(albumData) {
    return generateAlbumBody(albumData.data.images);
}

/**
 * Generates HTML code for the album body contents
 *
 * @param object images
 * @return string
 */
function generateAlbumBody(images) {
    var dom = document.documentElement,
        title = dom.querySelector('.post-title').textContent,
        authorAnchor = dom.querySelector('.post-title-meta a'),
        postDescriptionDiv = dom.querySelector('.post-description'),
        postDescription = postDescriptionDiv ? postDescriptionDiv.textContent : '',
        exactTime = dom.querySelector('.exact-time').title,

        titleMeta = authorAnchor ?
            'by <a href="' + authorAnchor.href + '">' + authorAnchor.textContent + '</a> · ' : '',
        albumContent = '<div class="post-container">';

    titleMeta += exactTime,
    albumContent += '<div class="post-header">' +
        '<h1 class="post-title font-opensans-bold">' + title + '</h1>' +
        '<p class="post-title-meta font-opensans-semibold">' + titleMeta + '</p>' +
    '</div>';

    for (var i = 0; i < images.length; i++) {
        albumContent += '<div class="post-image-container">';

        if (images[i].title.length > 0) {
            albumContent += '<h2 class="post-image-title font-opensans-semibold">' +
                images[i].title +
            '</h2>';
        }

        var imgSrc = 'http://i.imgur.com/' + images[i].hash + images[i].ext;

        albumContent += '<div class="post-image">' +
            '<a href="' + imgSrc + '" class="zoom">' +
                '<img src="' + imgSrc + '" style="max-width: 680px;" />' +
            '</a>' +
        '</div>';

        if (images[i].description) {
            albumContent += '<p class="post-image-description font-opensans-reg">' +
                images[i].description +
            '</p>';
        }

        albumContent += '</div>';
    }

    if (postDescription.length > 0) {
        albumContent += '<div class="post-description font-opensans-reg">' + postDescription + '</div>';
    }

    return albumContent + '</div>';
}

/**
 * @return string
 */
function getTitle() {
    return document.documentElement.querySelector('.post-title').textContent;
}
