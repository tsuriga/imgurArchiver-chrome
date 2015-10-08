# imgurArchiver-chrome

Chrome extension for creating barebone replicas of imgur albums for archiving

## CHANGELOG ##

* v1.0.0 First functioning version
* v1.1.0 layout fixing to match original appearance on imgur
* v1.1.1 proper extension icon
* v1.1.2 updated icon
* v1.2.0 image resizing script bundled and ideas update

## TODO ##
* v1.3.0 wrap into a real chrome extension

## IDEAS ##

If you wish to develop this further, feel free to fork and either push pull
requests or create your own version. These are some of the ideas I might
start working on if there's a need for them. If I do (or you will), let's put
them in the TODO list as planned items with planned release version.

* Enable opening a file saving dialog just by hitting the extension icon
* Figure out if it's possible to do this without writing all the data in the
  URL. Now all HTML content gets saved twice since Chrome will enter everything
  from the address bar into a comment at the top of the saved HTML page: "Page
  saved from <URL>"
* Code cleanup. Move styles, scripts and fonts into separate files if possible
* Better icon. I created the current one from imgur's favicon with Paint.NET
* Improve the zooming to take window and image dimensions better into account.
  Currently the functionality is really barebone and probably has a lot of
  quirky behaviours with different image sizes. The animation could be animated
  too with either CSS or JavaScript

## LICENSES ##

The Chrome extension is under MIT License and the embedded Google OpenSans
typefaces are under Apache License 2.0.
