var originalWidth = 0;

function setZooming(element) {
    var zoomHandle = element.parentNode,
        trueWidth = element.tagName === 'IMG' ? element.naturalWidth : element.videoWidth;

    if (trueWidth < 710) {
        zoomHandle.parentNode.replaceChild(element, zoomHandle);

        if (element.tagName !== 'IMG') {
            element.play();
        }
    } else {
        zoomHandle.addEventListener('click', zoomIn, false);
    }
}

function zoomIn(event) {
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
        newWidth = trueWidth > screenX - 20 ? screenX - 20 : trueWidth,
        imageShiftLeft = screenX < 680 ? 0 : (680 - newWidth) / 2 - 5;

    originalWidth = element.clientWidth;

    element.id = 'zoomedElement';
    element.width = newWidth;
    element.style.border = '5px solid white';
    element.style.left = imageShiftLeft + 'px';

    event.stopPropagation();

    document.documentElement.style.cursor = 'zoom-out';
    document.addEventListener('click', zoomNormal, false);
}

function zoomNormal(event) {
    var zoomedElement = document.querySelector('#zoomedElement');

    zoomedElement.removeAttribute('id');
    zoomedElement.width = originalWidth;
    zoomedElement.style.border = 0;
    zoomedElement.style.left = 0;

    document.documentElement.style.cursor = 'auto';
    document.removeEventListener('click', zoomNormal, false);
}

window.addEventListener('DOMContentLoaded', function () {
    var images = document.querySelectorAll('img'),
        videos = document.querySelectorAll('video');

    function addZooming() {
        setZooming(this);
    }

    for (var i = 0; i < images.length; i++) {
        images[i].addEventListener('load', addZooming);
    }

    for (i = 0; i < videos.length; i++) {
        videos[i].addEventListener('loadedmetadata', addZooming);
    }
});
