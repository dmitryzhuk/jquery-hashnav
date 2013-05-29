jquery-hashnav
==============

This plugin provides navigation functionality based on hash part of window.location.
Basically it just displays child DIV elements having data-frame attribute which value
is identical to window.location.hash value. Child DIV element having data-default
will be used when window.location.hash is empty. If there is no element having data-default
attribute, there will be first DIV with data-frame attribute used.

Supported HTML5 attributes:

data-frame       Name of the frame corresponding to window.location.hash value.
data-default     Indicates that the frame will be used as default when window.location.hash is empty.
                 No value required, any given value is silently ignored.
data-url         An URL to load frame contents from. If this attribute is provided, there must be
                 no child elements in DIV element initially. Hashnav plugin will asynchronously
                 load contents from that URL and embed it as DIV contents. This must happen only once.
                 If DIV initially has any child elements, data-url attribute will be silently ignored.

Example HTML:
<div id="hashnav">
    <div data-frame="home" data-default></div>
    <div data-frame="login"></div>
    <div data-frame="profile" data-url="/profile.json"></div>
</div>

Example javascript:
$('#hashnav').hashnav(options);

Supported options:
start            Name of frame to start with. If this option is specified and there is a DIV with
                 the same data-frame value, HTML5 attribute data-default will be ignored and this
                 value will be used instead.