#jquery-hashnav

This plugin provides navigation functionality based on hash part of window.location.
Basically it just displays child DIV elements having data-frame attribute which value
is identical to window.location.hash value. Child DIV element having data-default
will be used when window.location.hash is empty. If there is no element having data-default
attribute, there will be first DIV with data-frame attribute used.

## Supported HTML5 attributes:

<table>

<tr>
<th>data&#8209;frame</th>
<td>
    Name of the frame corresponding to window.location.hash value.
</td>
</tr>

<tr>
<th>data&#8209;start</th>
<td>
    Indicates that the frame will be used as default when window.location.hash is empty.
    No value required, any given value is silently ignored.
</td>
</tr>

<tr>
<th>data&#8209;url</th>
<td>
    An URL to load frame contents from. If this attribute is provided, there must be
    no child elements in DIV element initially. Hashnav plugin will asynchronously
    load contents from that URL and embed it as DIV contents. This must happen only once.
    If DIV initially has any child elements, data-url attribute will be silently ignored.
</td>
</tr>

</table>

Example HTML:

    <div id="hashnav">
        <div data-frame="home" data-start></div>
        <div data-frame="login"></div>
        <div data-frame="profile" data-url="/profile.json"></div>
    </div>

Example javascript:

    $('#hashnav').hashnav();

## Supported options:

<table>

<tr>
<th>start</th>
<td>
    Name of frame to start with. If this option is specified HTML5 attribute data-start
    will be ignored and this value will be used instead.
</td>
</tr>

</table>


Example javascript:

    $('#hashnav').hashnav({ start: 'login' });

will override HTML-defined frame home and instructs plugin to use login frame as default.

## Commands:

Commands are passed to initialized plugin instance via options object. Such object must include
action property to specify an action name to take and optionally action parameters.

Example javascript:

    $('#hashnav').hashnav({ action: 'actionname', param1: 'param1', param2: 2 });

<table>

<tr>
    <th>display</th>
    <td>
        Displays specific frame programmatically.
        <pre><code>
$('#hashnav').hashnav({ action: 'display', frame: 'login', context: object });
        </code></pre>
        will display DIV with data-frame="login" passing given context object into a corresponding event.
    </td>
</tr>

<tr>
    <th>load</th>
    <td>
        Forces loading of the particular frame.
        <pre><code>
$('#hashnav').hashnav({ action: 'load', frame: 'login' });
        </code></pre>
        will load contents of div with data-frame="login" using value of data-url attribute.
    </td>
</tr>

</table>

## Events:

<table>

<tr>
    <th>load</th>
    <td>
        Triggered upon successful completion of frame loading. Loading process is initiated
        when hashnav plugin navigates to frame which was not loaded before or by means of
        'load' command. An event object contains two fields: name of the loaded frame and 
        actual HTMl element representing this frame { name: 'frameName', element: htmlElement }.
        <pre><code>
$('#hashnav').hashnav().on('load', function (e) {
    console.log(e.name);
});
        </code></pre>
        will output name of the loaded frame to console.
        Event is triggered on HTML element to which this plugin is bound (frame container).
    </td>
</tr>
<tr>
    <th>fail</th>
    <td>
        Triggered if frame loading failed for some reason. Event object has the same structure as
        for 'load' event.
        <pre><code>
$('#hashnav').hashnav().on('fail', function (e) {
    console.log('Failed loading ' + e.name);
});
        </code></pre>
        will output name of the frame which failed to be loaded.
        Event is triggered on HTML element to which this plugin is bound (frame container).
    </td>
</tr>
<tr>
    <th>before</th>
    <td>
        Triggered before actual frame transition. Event structure is following:
        <pre><code>
{
    prev: {
        name: 'previousFrameName',
        element: previousFrameHTMLElement
    },
    next: {
        name: 'nextFrameName',
        element: nextFrameHTMLElement
    },
    context: object
}
        </code></pre>
        Context object is the one which was passed in 'display' command or, if none, the text
        following semicolon (;) character in hash part of URL. If none provided, is undefined.
        Event is triggered on HTML element to which this plugin is bound (frame container).
        Examle:
        <pre><code>
$('#hashnav').hashnav().on('before', function (e) {
    console.log('Before transition from ' + e.prev.name ' to ' + e.next.name);
});
        </code></pre>
    </td>
</tr>
<tr>
    <th>after</th>
    <td>
        Triggered immediately after frame transition complete. Event structure is the same as for
        `before` event described above.
        Event is triggered on HTML element to which this plugin is bound (frame container).
        Examle:
        <pre><code>
$('#hashnav').hashnav().on('before', function (e) {
    console.log('After transition from ' + e.prev.name ' to ' + e.next.name);
});
        </code></pre>
    </td>
</tr>
<tr>
    <th>show</th>
    <td>
        Triggered when particular HTML element representing frame was shown. No special event
        properties provided.
        Example:
        <pre><code>
$('#frame1').on('show', function () {
    console.log('Frame ' + $(this).attr('data-frame') + ' is now visible');
});
        </code></pre>
    </td>
</tr>
<tr>
    <th>hide</th>
    <td>
        Triggered when particular HTML element representing frame was hidden. No special event
        properties provided.
        Example:
        <pre><code>
$('#frame1').on('hide', function () {
    console.log('Frame ' + $(this).attr('data-frame') + ' is now hidden');
});
        </code></pre>
    </td>
</tr>

</table>
