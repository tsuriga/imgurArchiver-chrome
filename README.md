# imgurArchiver-chrome

Chrome extension for creating barebone replicas of imgur albums for archiving

## CHANGELOG ##

* v1.0.0 (2015-10-10): first released version
* v1.1.0 (2015-11-11): feature, style and error handling improvements
  * post descriptions are now archived as well (omitted previously)
  * an image can now be zoomed in when another one is already zoomed in
  * added zoom in and zoom out cursors
  * small images don't have zoom in anchors anymore
  * empty image titles and descriptions are omitted
  * if an error occurs when fetching album data, failure message is now shown

## IDEAS ##

These are some of the ideas I might start working on if there's a need for
them. If I do, I will put them under a TODO header with a planned release
version. If you wish to develop this further, feel free to fork and either push
pull requests or create your own version.

* Enable opening a file saving dialog just by hitting the extension icon
* Figure out if it's possible to do this without writing all the data in the
  URL. Now all HTML content gets saved twice since Chrome will enter everything
  from the address bar into a comment at the top of the saved HTML page: "saved
  from url=..."
* Code cleanup. Move styles, scripts and fonts into separate files if possible
* Animate the zoom effect
* Maybe use offsetWidth instead of clientWidth so that there's no need to take
  borders into account manually. Related: many of the magic numbers have been
  winged and not really calculated to exact pixels
* Use imgur's actual API

## LICENSES ##

The Chrome extension is under MIT License and the embedded Google OpenSans
typefaces are under Apache License 2.0.

## AUTHORS ##

* Tsuri Kamppuri

## DISCLAIMER ##

NOT AFFILIATED WITH OR APPROVED BY IMGUR
