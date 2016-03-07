var originalWidth = 0,
    originalHeight = 0;

function setZooming(element) {
    var zoomHandle = element.parentNode,
        width = element.tagName === 'IMG' ? element.naturalWidth : element.videoWidth;

    if (width < 710) {
        zoomHandle.parentNode.replaceChild(element, zoomHandle);

        if (element.tagName !== 'IMG') {
            element.play();
        }
    } else {
        zoomHandle.addEventListener('click', zoomIn, false);
    }
}

function zoomIn(event) {
    event.preventDefault();

    var zoomedElement = document.querySelector('#zoomedElement'),
        element = this.children[0];

    if (zoomedElement !== null) {
        zoomNormal(event);

        if (element === zoomedElement) {
            return false;
        }
    }

    var screenX = document.documentElement.clientWidth,
        trueWidth = element.tagName === 'IMG' ? element.naturalWidth : element.videoWidth,
        trueHeight = element.tagName === 'IMG' ? element.naturalHeight : element.videoHeight,

        newWidth = trueWidth > screenX - 20 ? screenX - 20 : trueWidth,
        newHeight = trueHeight * newWidth / trueWidth,

        imageShiftLeft = screenX < 680 ? 0 : (680 - newWidth) / 2 - 5;

    originalWidth = element.clientWidth;
    originalHeight = element.clientHeight;

    element.style.width = newWidth;
    element.style.height = newHeight;
    element.style.border = '5px solid white';
    element.style.position = 'relative';
    element.style.left = imageShiftLeft;
    element.style.cursor = 'zoom-out';
    element.id = 'zoomedElement';
    element.style.removeProperty('max-width');

    event.stopPropagation();

    document.addEventListener('click', zoomNormal, false);
}

function zoomNormal(event) {
    event.preventDefault();

    var zoomedElement = document.querySelector('#zoomedElement');

    zoomedElement.style.width = originalWidth;
    zoomedElement.style.height = originalHeight;
    zoomedElement.style.border = 0;
    zoomedElement.style.position = 'static';
    zoomedElement.style.maxWidth = 680;
    zoomedElement.style.cursor = 'zoom-in';
    zoomedElement.removeAttribute('id');
    zoomedElement.style.removeProperty('left');

    document.removeEventListener('click', zoomNormal, false);
}

window.addEventListener('DOMContentLoaded', function () {
    var images = document.querySelectorAll('img'),
        videos = document.querySelectorAll('video'),
        imageLoadCount = 0,
        videoLoadCount = 0;

    for (var i = 0; i < images.length; i++) {
        images[i].addEventListener('load', function () { setZooming(this); });
    }

    for (var i = 0; i < videos.length; i++) {
        videos[i].addEventListener('loadedmetadata', function () { setZooming(this); });
    }
});
