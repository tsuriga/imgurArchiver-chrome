# imgurArchiver-chrome

Chrome extension for creating barebone replicas of imgur albums for archiving

## CHANGELOG ##

* v1.0.0 First functioning version
* v1.1.0 layout fixing to match original appearance on imgur
* v1.1.1 proper extension icon
* v1.1.2 updated icon

## TODO ##

* v1.2.0 image resizing script bundled
* v1.3.0 wrap into a chrome extension

## IDEAS ##

If you wish to develop this further, feel free to fork and either push pull
requests or create your own version.

* Enable opening a file saving dialog just by hitting the extension icon
* Figure out if it's possible to do this without writing all the data in the
  URL. Now the HTML content gets saved twice since Chrome will enter everything
  from the address bar into a comment at the top of the saved HTML page: "Page
  saved from <URL>"
* Code cleanup. Move styles, scripts and fonts into separate files if possible

## LICENSES ##

The Chrome extension is under MIT License and the embedded Google OpenSans
typefaces are under Apache License 2.0.
