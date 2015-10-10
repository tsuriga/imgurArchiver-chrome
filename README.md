# imgurArchiver-chrome

Chrome extension for creating barebone replicas of imgur albums for archiving

## CHANGELOG ##

* v1.0.0 first released version

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
* Test the zooming with a variety of different image sizes in different window
  sizes, it may have some quirky behaviours for combinations I did not test
  for. The effect could be animated too with either CSS or JavaScript
* Maybe use offsetWidth instead of clientWidth so that there's no need to take
  borders into account manually. Related: many of the magic numbers have been
  winged and not really calculated to exact pixels
* Only attach event listeners to images that need zoom and remove links from
  those that don't – like it is on imgur
* Use imgur's actual API
* Add error handling: I have not tested what the button does on other web pages
  other than imgur

## AUTHORS ##

* Tsuri Kamppuri

## LICENSES ##

The Chrome extension is under MIT License and the embedded Google OpenSans
typefaces are under Apache License 2.0.

## DISCLAIMER ##

NOT AFFILIATED WITH OR APPROVED BY IMGUR
