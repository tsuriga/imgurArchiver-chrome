# imgurArchiver-chrome

Chrome extension for creating barebone replicas of imgur albums for archiving.
The created copies are meant to be saved as fully offline versions to one's
computer. They mimic the appearances and functionality of albums on imgur.

## CHANGELOG ##

* **v1.0.0 (2015-10-10)**: first released version
* **v1.1.0 (2015-11-11)**: feature, style and error handling improvements
  * post descriptions are now archived as well (omitted previously)
  * an image can now be zoomed in when another one is already zoomed in
  * added zoom in and zoom out cursors
  * small images don't have zoom in anchors anymore
  * empty image titles and descriptions are omitted
  * if an error occurs when fetching album data, failure message is now shown
* **v1.2.0 (2015-11-17)**: bug fixes and stylistic improvements
  * archiving now works also for albums with only one image
  * username link now has normal link cursor
  * omitted post description won't stop archiving anymore
  * errors are now logged to console and functions have docblocks
  * the Archive button now shows an error page if pressed while not browsing an
    imgur gallery
  * both single and multiple image albums with videos (gifs) should now work
* **v1.2.1 (2015-11-17)**: debug printing now includes a message on network error
* **v1.2.2 (2015-11-18)**: slightly improved zooming that mimics imgur better
* **v1.2.3 (2015-11-27)**: fixed to work when browsing over HTTPS
* **v1.2.4 (2016-01-15)**: fixed to work with albums that have unknown authors
* **v1.2.5 (2016-01-25)**: improved empty description checks
* **v2.0.0 (2016-02-29)**: load resources from within the extension to build albums
* **v2.1.0 (2016-03-07)**: file format and functionality improvements
  * save animated gifs as base64 encoded web videos instead
  * time of the post now links back to original URL for easier re-discovery

This is a huge change as videos are saved as base64 encoded data URLs directly
in the HTML document in order for Chrome to actually save them locally. The
encoding itself increases file size by ~37% but the web video files are smaller
than their gif counterparts by a gigantic margin (we're talking 1-2 % of the
gif file size) and thus work much smoother.

* **v2.2.0 (2016-04-01)**: style improvements and fix to a problem in zooming
  * post title's rounded borders fixed to appear not at top but bottom
  * zooming videos works correctly now
  * zooming is now CSS3 animated
* **v2.2.1 (2016-04-03)**: fix to initial image widths

## IDEAS ##

These are some of the ideas I might implement at some point. If you wish to help
or are experiencing problems with this, feel free to fork and push pull requests
or create issues in here.

* Enable opening a file saving dialog just by hitting the extension icon
* Use imgur's actual API becauses the current JSON end-point may close at any point
* Save web video files locally as separate files to save space and de-clutter the HTML file

## LICENSES ##

The Chrome extension is under MIT License and the embedded Google OpenSans
typefaces are under Apache License 2.0.

## AUTHORS ##

* Tsuri Kamppuri

## DISCLAIMER ##

NOT AFFILIATED WITH OR APPROVED BY IMGUR
