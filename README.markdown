jQuery.netchanger
=================
simple extensions to the DOM onchange event  
[http://github.com/mmonteleone/jquery.netchanger][0]

What?
----

The native `onchange` DOM event fires when a control loses the input focus and its value has been modified since gaining focus, and is useful for tracking changes to a form.  While useful, it has limitations:  

* It only knows if a change is relative to when the input gained focus, not relative to other events, like when the page loaded.
  * For example, a user who clicks into a populated empty text input, changes it, blurs, then focuses, and changes it back... netchanger knows that a real change took place and was subsequently reverted.
* It only fires when the control loses focus

`jQuery.netchanger` is a simple jQuery plugin which provides extra events for detecting when a control's value has noticeably changed relative to its original value or when it has returned back to its original value from some other value.  Moreover, these new events are raised not only when the control loses focus, but also as the value changes while it still has focus.  This can be useful for various progressive form enhancements, such as visibly styling modified but not-yet-saved fields.

### Basic Example

Given the setup...

    $('input,select,textarea')
        .netchanger()
        .bind('netchange', function(){ this.addClass('modified'); })
        .bind('revertchange', function(){ this.removeClass('modified'); });

This registers all inputs on the page to raise the new events, and binds behavior to them to give them a `modified` class whenever their value is altered from its initial state when the page is loaded, and to remove the class whenever the value returns to its initial state.  

Requirements, installation, and notes
-------------------------------------

Simply download [jquery.netchanger.js][7] and include it.  

Alternatively, you can download the [zipped release][8] containing a minified build with examples and documentation or the development master with unit tests by cloning `git://github.com/mmonteleone/jquery.netchanger.git`.

jQuery.netchanger requires only [jquery][3] 1.3.2 or higher, and can be installed thusly:

    <script type="text/javascript" src="jquery-1.4.min.js"></script>
    <script type="text/javascript" src="jquery.netchanger.min.js"></script>

jQuery.netchanger includes a full unit test suite, and has been verified to work against Firefox 3.5, Safari 4, Internet Explorer 6,7,8, Chrome, and Opera 9 and 10.  Please feel free to test its suite against other browsers.

jQuery 1.4 Bonus
----------------

Netchanger works great with jQuery 1.3, but it's even better with 1.4.  When used with jQuery 1.4, jQuery.netchanger automatically assumes monitoring fields via `.live()` instead of `.bind()`, allowing for client code to bind to `netchange`,`refreshchange`, and `revertchange` via `.live()` instead of `.bind()` as well.

This behavior can be overridden by specifying the 'live' option.

Complete API
------------

### Activation

Within the `document.ready` event, call

    $('input,select,textarea').netchanger(options);
   
where options is an optional object literal of options.  This registers the matched controls to raise the new events.

As a shortcut,    

    $.netchanger(options);  

is an alias for `$('input,select,textarea,fileupload').netchanger(options);`  

### Options

* **selector**: default selector when using the $.netchanger() shortcut activation
  * *default*: `'input,select,textarea,fileupload'`
* **events**: events on which to check for changes to the control, and possibly raise own events.
  * *default*: `'change,keyup,paste'`
* **live**: whether to monitor fields via `live` instead of `bind`, allowing for live binding of `netchange`, `revertchange`, and `refreshchange` by calling code.  
  * *default*: `true` when using jQuery 1.4 or greater.  `false` otherwise.  Passing `true` without jQuery 1.4 or greater throws an exception.

### Events

* **netchange**:  raised whenever newly entered value of a control is different than its initial at any of the input's events (as specified by `events` option, `'change,keyup,paste'`)
* **revertchange**:  raised whenever newly entered value of a control has the same value as the initial value of the input on any of the input's events (as specified by `events` option, `'change,keyup,paste'`)
* **refreshchange**:  raised whenever current value of input is promoted to the new initiating value of the input in respose to an $.fn.refreshchange() call.  Only raised if the current value is different than the initial.

### Shortcut Methods

* **jQuery.fn.netchange(handler)**:  When passed a handler, binds handler to the `netchange` event on matched selection.  When not passed handler, artificially triggers `netchange` event on matched selection.

        $('input').netchange(function(){
            this.addClass('modified');        
        });
    
        $('input').netchange();

* **jQuery.fn.revertchange(handler)**:  When passed a handler, binds handler to the `revertchange` event on matched selection.  When not passed handler, changes the current value of matched controls back to their initial state and raises `revertchange` event on any that had a difference between their current and initial values.

        $('input').revertchange(function(){
            this.removeClass('modified');        
        });

        $('input').revertchange();

* **jQuery.fn.refreshchange(handler)**:  When passed a handler, binds handler to the `refreshchange` event on matched selection.  When not passed handler, promotes the current value of matched controls to be the new initial reference value and raises `refreshchange` event on any that had a difference between their current and initial values.

        $('input').refreshchange(function(){
            this.removeClass('modified');        
        });

        $('input').refreshchange();
    
Notes
-----

`jQuery.netchanger` attempts to intelligently compare control values.  For text inputs, text areas, and selects, it simply compares the result of `jQuery.fn.val()`.  For checkbox and radio inputs it compares the state of their `:checked` status.

How to Contribute
-----------------

Development Requirements (for building and test running):

* Ruby + Rake, PackR, rubyzip gems: for building and minifying
* Java: if you want to test using the included [JsTestDriver][6] setup

Clone the source at `git://github.com/mmonteleone/jquery.netchanger.git` and have at it.

The following build tasks are available:

    rake build     # builds package and minifies
    rake test      # runs jQuery.netchanger specs against QUnit testrunner in default browser
    rake server    # downloads, starts JsTestDriver server, binds common browsers
    rake testdrive # runs jQuery.netchanger specs against running JsTestDriver server
    rake release   # builds a releasable zip package

&lt;shameless&gt;Incidentally jQuery.netchanger's unit tests use QUnit along with one of my other projects, [Pavlov][4], a behavioral QUnit extension&lt;/shameless&gt;

Changelog
---------

* 0.9.1 - Added support for new 'live' option in conjunction with new jQuery 1.4 support
* 0.9.0 - Initial Release

License
-------

The MIT License

Copyright (c) 2009 Michael Monteleone, http://michaelmonteleone.net

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[0]: http://github.com/mmonteleone/jquery.netchanger "jQuery.netchanger"
[1]: http://michaelmonteleone.net "Michael Monteleone"
[3]: http://jquery.com "jQuery"
[4]: http://github.com/mmonteleone/pavlov "Pavlov"
[6]: http://code.google.com/p/js-test-driver/ "JsTestDriver"
[7]: http://github.com/mmonteleone/jquery.netchanger/raw/master/jquery.netchanger.js "raw netchanger script"
[8]: http://cloud.github.com/downloads/mmonteleone/jquery.netchanger/jquery.netchanger.zip "jQuery.netchanger Release"
