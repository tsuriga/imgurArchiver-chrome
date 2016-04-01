init();

/**
 * Prechecks conditions and initializes archiving procedure
 */
function init() {
    if (window.location.hostname !== 'imgur.com' || window.location.pathname.indexOf('/gallery') !== 0) {
        return openErrorPage('imgur album ID not detected, make sure your current address is imgur.com/gallery/IDHERE');
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
                return openErrorPage('imgur returned unknown JSON, please contact the extension author');
            } else if (!albumData.data.images) {
                return buildAlbum(getTitle());
            }

            return buildAlbum(getTitle(), albumData.data.images);
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
 * @param string message
 */
function openErrorPage(message) {
    openTab(
        'archiving error',
        '<span style="color:white">Failed to create the archive: ' + message + '</span>'
    );
}

/**
 * Builds album HTML code. Any videos will be prefetched into data URLs
 *
 * @param string title
 */
function buildAlbum(title, media) {
    if (!media) {
        media = getAlbumDetailsFromDom();
    }

    var videoCount = 0,
        videoMetaLoadCount = 0,
        videos = {};

    function processVideoSrcLoad(e) {
        // Inject base64 encoded data URL src back into the general media map for final body build
        media[videos[e.detail.originalSrc].index].src = e.detail.baseSrc;

        // Gather video widths to enable CSS zoom animations
        var video = document.createElement('video');

        video.src = e.detail.baseSrc;
        video.originalSrc = e.detail.originalSrc;
        video.addEventListener('loadedmetadata', processVideoMetaReady);
        video.load();
    }

    function processVideoMetaReady() {
        media[videos[this.originalSrc].index].width = this.videoWidth <= 680 ? this.videoWidth : 680;

        // All videos loaded and their widths have been determined
        if (++videoMetaLoadCount === videoCount) {
            openTab(title, generateAlbumBody(media));
        }
    }

    function readVideo() {
        if (this.status === 200) {
            var responseUrl = this.responseURL,
                reader = new FileReader();

            reader.addEventListener('loadend', function () {
                // Loading issues may occur with larger web video albums albeit inconsistently
                if (!reader.result) {
                    return openErrorPage('error loading a video in the gallery, please retry');
                }

                // Pass the video base64 sources inside an event to get around variable scoping
                window.dispatchEvent(new CustomEvent('videoSrcLoaded', {
                    detail: {
                        originalSrc: responseUrl,
                        baseSrc: reader.result
                    }
                }));
            });

            reader.readAsDataURL(this.response);
        } else {
            return openErrorPage('a video in the gallery could not be loaded');
        }
    }

    for (var i = 0; i < media.length; i++) {
        media[i].ext = media[i].ext.replace('gif', 'webm');

        var src = 'http://i.imgur.com/' + media[i].hash + media[i].ext;

        if (['.webm', '.mp4'].indexOf(media[i].ext) !== -1) {
            videoCount++;
            videos[src] = { index: i };
        } else {
            media[i].src = src;
        }
    }

    if (videoCount === 0) {
        // Gather image widths to enable CSS zoom animations
        media = getImadeWidths(media);

        return openTab(title, generateAlbumBody(media));
    }

    // Fetch all videos as data URLs
    window.addEventListener('videoSrcLoaded', processVideoSrcLoad);

    for (var videoSrc in videos) {
        var xhr = new XMLHttpRequest();

        xhr.responseType = 'blob';

        xhr.addEventListener('load', readVideo);

        xhr.open('GET', videoSrc);
        xhr.send();
    }
}

/**
 * Parses album from current DOM. Only used for albums with one image.
 *
 * @return string
 */
function getAlbumDetailsFromDom() {
    var img = document.querySelector('.post-image img'),
        video = document.querySelector('.post-image source')
        description = document.querySelector('.post-image-description'),
        media = [
            {
                title: '', // omitted here to prevent the title from popping up twice
                hash: (img ? img : video).src.split('/').pop().split('.').shift(),
                description: description ? description.textContent : '',
                ext: '.' + (img ? img.src.split('.').pop() : video.src.split('.').pop()),
            }
        ];

    return media;
}

/**
 * Generates HTML code for the album body contents
 *
 * @param object media
 * @return string
 */
function generateAlbumBody(media) {
    var dom = document.documentElement,
        title = dom.querySelector('.post-title').textContent,
        authorAnchor = dom.querySelector('.post-title-meta a'),
        postDescriptionDiv = dom.querySelector('.post-description'),
        postDescription = postDescriptionDiv ? postDescriptionDiv.textContent : '',
        exactTime = dom.querySelector('.exact-time').title,

        titleMeta = authorAnchor ?
            'by <a href="' + authorAnchor.href + '">' + authorAnchor.textContent + '</a> · ' : '',
        albumContent = '<div class="post-container">';

    titleMeta += '<a href="' + window.location.href + '">' + exactTime + '</a>',
    albumContent += '<div class="post-header">' +
        '<h1 class="post-title font-opensans-bold">' + title + '</h1>' +
        '<p class="post-title-meta font-opensans-semibold">' + titleMeta + '</p>' +
    '</div>';

    for (var i = 0; i < media.length; i++) {
        albumContent += '<div class="post-image-container">';

        if (media[i].title.length > 0) {
            albumContent += '<h2 class="post-image-title font-opensans-semibold">' +
                media[i].title +
            '</h2>';
        }

        albumContent += '<div class="post-image"><div class="zoom">';

        if (['.webm', '.mp4'].indexOf(media[i].ext) === -1) {
            albumContent += '<img class="animatable" src="' + media[i].src + '" width="' + media[i].width + 'px" ' +
                'style="left: 0; position: relative; border: 0;" />';
        } else {
            albumContent += '<video class="animatable" src="' + media[i].src + '" width="' + media[i].width + 'px" ' +
                'style="left: 0; position: relative; border: 0;" ' +
                'autoplay autostart muted loop controls></video>';
        }

        albumContent += '</div></div>';

        if (media[i].description) {
            albumContent += '<p class="post-image-description font-opensans-reg">' +
                media[i].description +
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
 * Detects and stores widths of image elements
 *
 * @param object media
 * @return object
 */
function getImadeWidths(media) {
    for (var i = 0; i < media.length; i++) {
        var img = new Image();
        img.src = media[i].src;

        media[i].width = img.naturalWidth <= 680 ? img.naturalWidth : 680;
    }

    return media;
}

/**
 * @return string
 */
function getTitle() {
    return document.documentElement.querySelector('.post-title').textContent;
}
