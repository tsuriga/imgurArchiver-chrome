var bodyLoaded = false,
    bodyObserver = null;

function observeLoad() {
    if (!bodyLoaded) {
        prepareAlbum();

        bodyLoaded = true;

        if (bodyObserver) {
            bodyObserver.disconnect();
        }

        window.removeEventListener('load', observeLoad);
    }
}

/* Monitor body with a MutationObserver to monitor the loading of images
 * that were imported after the body was already loaded
 */
if (document.body !== null) {
    bodyObserver = new MutationObserver(function() {
        observeLoad();

        var images = document.querySelectorAll('img'),
            imagesTotal = images.length,
            imagesLoaded = 0,
            eventFired = false;

        function noticeImageLoad() {
            imagesLoaded++;

            monitorImageLoadStatus();

            this.removeEventListener('load', noticeImageLoad);
        }

        for (var i = 0; i < imagesTotal; i++) {
            if (images[i].naturalWidth === 0) {
                images[i].addEventListener('load', noticeImageLoad);
            } else {
                imagesLoaded++;
            }
        }

        function monitorImageLoadStatus() {
            if (eventFired) {
                return;
            }

            if (imagesLoaded === imagesTotal) {
                window.dispatchEvent(new CustomEvent('imagesLoaded'));
                eventFired = true;
            } else {
                // Check states manually in case some load event was missed
                var imageLoadCount = 0;

                for (var i = 0; i < imagesTotal; i++) {
                    if (images[i].naturalWidth === 0) {
                        break;
                    } else {
                        imageLoadCount++;
                    }
                }

                if (imageLoadCount === imagesTotal) {
                    /* This may leave some images with load event listeners but
                     * they won't do anything since we mark the event as fired
                     */
                    window.dispatchEvent(new CustomEvent('imagesLoaded'));
                    eventFired = true;
                } else {
                    window.setTimeout(monitorImageLoadStatus, 25);
                }
            }
        }

        monitorImageLoadStatus();
    });

    bodyObserver.observe(document.body, { childList: true });
}

window.addEventListener('load', function () {
    observeLoad();

    window.dispatchEvent(new CustomEvent('imagesLoaded'));
});

function prepareAlbum() {
    var originalWidth,
        originalHeight;

    function zoomIn(e) {
        e.preventDefault();

        var zoomedImage = document.querySelector('#zoomedImage'),
            img = this.children[0],
            screenX = document.documentElement.clientWidth,
            trueWidth = img.naturalWidth,
            trueHeight = img.naturalHeight,

            newWidth = trueWidth > screenX - 20 ? screenX - 20 : trueWidth,
            newHeight = trueHeight * newWidth / trueWidth,

            imageShiftLeft = screenX < 680 ? 0 : (680 - newWidth) / 2 - 5;

        if (zoomedImage !== null) {
            zoomNormal(e);

            if (img === zoomedImage) {
                return false;
            }
        }

        originalWidth = img.clientWidth;
        originalHeight = img.clientHeight;

        img.style.width = newWidth;
        img.style.height = newHeight;
        img.style.border = '5px solid white';
        img.style.position = 'relative';
        img.style.left = imageShiftLeft;
        img.style.cursor = 'zoom-out';
        img.id = 'zoomedImage';
        img.style.removeProperty('max-width');

        e.stopPropagation();

        document.addEventListener('click', zoomNormal, false);
    }

    function zoomNormal(e) {
        e.preventDefault();

        var zoomedImage = document.querySelector('#zoomedImage');

        zoomedImage.style.width = originalWidth;
        zoomedImage.style.height = originalHeight;
        zoomedImage.style.border = 0;
        zoomedImage.style.position = 'static';
        zoomedImage.style.maxWidth = 680;
        zoomedImage.style.cursor = 'zoom-in';
        zoomedImage.removeAttribute('id');
        zoomedImage.style.removeProperty('left');

        document.removeEventListener('click', zoomNormal, false);
    }

    /**
     * Monitors all changes in header height for ~2 seconds or until 2 resizes
     * have been committed and applies them to the first image container's
     * top margin. This fixes a gap between the header and first image during
     * album creation.
     */
    function fixHeaderOffsetHeight() {
        var postContainer = document.querySelector('.post-container'),
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

            if (checksPerformed++ < 80 && resizesPerformed !== 2) {
                window.setTimeout(checkHeaderHeight, 25);
            }
        }

        checkHeaderHeight();
    }

    window.addEventListener('imagesLoaded', function () {
        var zoomAnchors = document.querySelectorAll('.zoom');

        for (var i = 0; i < zoomAnchors.length; i++) {
            // Remove zooming anchors from images that don't need it
            var img = zoomAnchors[i].children[0];

            if (img.naturalWidth < 710) {
                zoomAnchors[i].parentNode.replaceChild(img, zoomAnchors[i]);
            } else {
                zoomAnchors[i].addEventListener('click', zoomIn, false);
            }
        }
    });

    fixHeaderOffsetHeight();
}
