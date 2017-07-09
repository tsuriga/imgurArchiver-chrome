init();

/**
 * Turns simple links in the text into hyperlinks. Adapted code from
 * http://stackoverflow.com/a/3890175 by Travis, cloud8421, and Sam Hasler
 *
 * @param {string} inputText
 */
function linkify(inputText) {
    // URLs starting with http:// or https://
    var replacePattern1 = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;

    // URLs starting with "www." (without // before it, or it'd re-link the ones done above)
    var replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

    return inputText
        .replace(replacePattern1, '<a href="$1">$1</a>')
        .replace(replacePattern2, '$1<a href="http://$2">$2</a>');
}

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
 * @param {string} title
 * @param {string} body
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
 * @param {string} albumId
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
 * Opens a tab with an error message
 *
 * @param {string} message
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
 * @param {string} title - Album title
 * @param {array} media
 */
function buildAlbum(title, media) {
    if (!media) {
        media = getOneImageAlbumDetailsFromDom();
    }

    var videoCount = 0,
        videoMetaLoadCount = 0,
        imageCount = 0,
        imageMetaLoadCount = 0,
        mediaMetaLoadCount = 0,
        mediaTypes = [],
        videos = {};

    // Begins to load a video
    function processVideoSrcLoad(e) {
        // Inject base64 encoded data URL src back into the general media map for final body build
        media[videos[e.detail.originalSrc].index].src = e.detail.baseSrc;

        // Gather video width to enable CSS zoom animation
        var video = document.createElement('video');

        video.src = e.detail.baseSrc;
        video.originalSrc = e.detail.originalSrc;
        video.addEventListener('loadedmetadata', processVideoMetaReady);
        video.load();
    }

    // Saves a video's meta information, namely width for zooming purposes
    function processVideoMetaReady() {
        media[videos[this.originalSrc].index].width = this.videoWidth <= 680 ? this.videoWidth : 680;

        if (++videoMetaLoadCount === videoCount) {
            processMediaMetaReady();
        }
    }

    // Keeps checking whether all meta information has been loaded
    function processMediaMetaReady() {
        if (++mediaMetaLoadCount === mediaTypes.length) {
            openTab(title, generateAlbumBody(media));
        }
    }

    // Saves an image's meta information, namely width for zooming purposes
    function loadImageMeta(src, index) {
        var img = new Image();

        img.addEventListener('load', function () {
            media[index].width = this.naturalWidth <= 680 ? this.naturalWidth : 680;

            if (++imageMetaLoadCount === imageCount) {
                processMediaMetaReady();
            }
        });

        img.src = src;
    }

    function readVideo() {
        if (this.status === 200) {
            var responseUrl = this.responseURL,
                reader = new FileReader();

            reader.addEventListener('loadend', function () {
                // Loading issues may occur with larger web video albums, it's slightly inconsistent
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

    // Transform relative media sources into absolute URLs and load images' meta information
    for (var i = 0; i < media.length; i++) {
        media[i].ext = media[i].ext.replace('gif', 'mp4');

        var src = 'http://i.imgur.com/' + media[i].hash + media[i].ext;

        if (['.webm', '.mp4'].indexOf(media[i].ext) !== -1) {
            videoCount++;

            if (mediaTypes.indexOf('video') === -1) {
                mediaTypes.push('video');
            }

            videos[src] = { index: i };
        } else {
            imageCount++;

            if (mediaTypes.indexOf('image') === -1) {
                mediaTypes.push('image');
            }

            media[i].src = src;

            loadImageMeta(src, i);
        }
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
 * Parses one-image album from current DOM
 *
 * @return {array}
 */
function getOneImageAlbumDetailsFromDom() {
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
 * @param {array} media - Media objects
 * @return {string}
 */
function generateAlbumBody(media) {
    var dom = document.documentElement,
        title = dom.querySelector('.post-title').textContent,
        authorAnchor = dom.querySelector('.post-title-meta a'),
        postDescriptionDiv = dom.querySelector('.post-description'),
        postDescription = postDescriptionDiv ? postDescriptionDiv.textContent : '',
        exactTime = dom.querySelector('.post-title-meta span:last-child').title,

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

        albumContent += '<div class="post-image"><div class="zoom">';

        if (['.webm', '.mp4'].indexOf(media[i].ext) === -1) {
            albumContent += '<img class="animatable" src="' + media[i].src + '" width="' + media[i].width + 'px" ' +
                'style="left: 0; position: relative; border: 0;" />';
        } else {
            albumContent += '<video class="animatable" src="' + media[i].src + '" width="' + media[i].width + 'px" ' +
                'style="left: 0; position: relative; border: 0;" ' +
                'autoplay autostart muted loop controls></video>';
        }

        albumContent += '</div></div>'; // close .post-image .zoom

        albumContent += '<div class="post-image-meta">';

        if (media[i].title.length > 0) {
            albumContent += '<h2 class="post-image-title font-opensans-semibold">' + media[i].title + '</h2>';
        }

        if (media[i].description) {
            albumContent += '<p class="post-image-description font-opensans-reg">' +
                linkify(media[i].description) +
            '</p>';
        }

        albumContent += '</div>'; // end .post-image-meta
        albumContent += '</div>'; // end .post-image-container
    }

    if (postDescription.length > 0) {
        albumContent += '<div class="post-description font-opensans-reg">' + postDescription + '</div>';
    }

    return albumContent + '</div>';
}

/**
 * @return {string}
 */
function getTitle() {
    return document.documentElement.querySelector('.post-title').textContent;
}
