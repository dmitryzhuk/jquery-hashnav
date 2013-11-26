/**
 * jQuery Hashnav plugin Implementation.
 *
 * This file is provided under terms and conditions of
 * Eclipse Public License v.1.0 http://www.opensource.org/licenses/eclipse-1.0
 *
 * Developed by Dmitry Zhuk.
 * 2013
 */

/*global define */
(function (factory) {

    'use strict';

    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['jquery'], factory);
    } else {
        // Browser globals:
        factory(window.jQuery);
    }

}(function ($) {

    /**
     * This plugin provides navigation functionality based on hash part of window.location.
     * Basically it just displays child DIV elements having data-frame attribute which value
     * is identical to window.location.hash value. Child DIV element having data-default
     * will be used when window.location.hash is empty. If there is no element having data-default
     * attribute, there will be first DIV with data-frame attribute used.
     *
     * View full documentation at https://github.com/dmitryzhuk/jquery-hashnav
     */

    'use strict';

    /** Default options for Hash Navigator Plugin */
    var defaults = {
            /** Name of $.data key to store context data */
            'context': '_context_'
        },
        /** Plugin name exposed to public */
        name = 'hashnav';

    /** Defines Hash Navigator Plugin constructor */
    function Hashnav(element, options) {

        var self = this, start;

        // set values for 'private' fields
        this.element = element;
        this.options = $.extend({}, defaults, options);

        // hide all children
        $(this.element).children('*').hide();

        // set up current frame
        this.current = undefined;

        // display starting frame
        start = this.frame();
        if (start !== undefined) {
            this.display(start);
        }

        // set up window hash change event listener
        $(window).on('hashchange', function () {
            self.display(self.frame());
        });
    }

    /** Plugin prototype definition */
    Hashnav.prototype = {

        /**
         * Returns name of the frame based on current window.location.hash value.
         * It is possible that this function will return false instead of frame name if
         * window.location.hash is empty and there is no children divs in container.
         */
        frame: function () {
            var start, children, frame;
            if (!window.location.hash || window.location.hash.trim().length === 0) {
                // no hash in request url or it is just empty #
                if (this.options.start) {
                    // try options start value
                    frame = this.options.start;
                } else {
                    // look for element marked as default by the attribute
                    start = $('div[data-default][data-frame]', this.element);
                    if (start.size() > 0) {
                        // there is a child marked as default
                        frame = start.attr('data-frame');
                    } else {
                        // if no default element found use just the first child div
                        children = $(this.element).children('div[data-frame]');
                        if (children.size() > 0) {
                            frame = children.eq(0).attr('data-frame');
                        }
                    }
                }
            } else {
                // or just use window hash value without actual hash sign as a frame name.
                frame = window.location.hash.substring(1).split(';')[0];
            }
            return frame;
        },

        /**
         * Returns or sets context data associated with target element.
         *
         * In read mode (when second parameter is not defined) this method
         * first checks if there is a context object associated with given frame.
         * If found, this object will be returned and then deleted from storage.
         * If there is no context object, this method checks if there is context
         * data passed through URL, which is expected to be a part of location
         * hash separated by semicolon from the frame name.
         *
         * In write mode (when second parameter is defined) this method stores
         * data in context.
         *
         * @param frame
         *          A name of frame to get context data for.
         * @param context
         *          Context object to associate with given frame.
         * @return Context object associated with transition destination.
         */
        context: function (frame, context) {
            var data, array;
            if (!!context) {
                data = $(this.element).data(this.options.context);
                if (data === undefined) {
                    data = {};
                    $(this.element).data(this.options.context, data);
                }
                data[frame] = context;
            } else {
                if (!!frame) {
                    data = $(this.element).data(this.options.context);
                    if (!!data) {
                        context = data[frame];
                        data[frame] = undefined;
                    }
                }
                if (context === undefined) {
                    if (!!window.location.hash && window.location.hash.trim().length > 0) {
                        array = window.location.hash.split(';');
                        if (array.length > 1) {
                            context = array[1];
                        }
                    }
                }
            }
            return context;
        },

        /**
         * Displays given frame fading out current frame if any.
         * Given frame will become current.
         *
         * @param frame
         *          A name of frame to display.
         */
        display: function (frame) {

            // only do something if given frame is not already current one
            if (this.current !== frame) {
                // get elements corresponding to current and given frames
                var prev = $('[data-frame="' + this.current + '"]', this.element),
                    next = $('[data-frame="' + frame + '"]', this.element),
                    url = next.attr('data-url'),
                    current = this.current,
                    element = this.element,
                    context = this.context(frame),
                    event = {
                        'prev': {
                            'name': current,
                            'element': prev.get(0)
                        },
                        'next': {
                            'name': frame,
                            'element': next.get(0)
                        },
                        'context': context
                    };

                // trigger event before transition
                $(element).trigger($.Event('before', event));

                // if previous frame exists we should hide it prior to everything else
                if (prev.size() > 0) {
                    prev.hide().trigger($.Event('hide'));
                }

                // if element for the next frame actually exists
                if (next.size() > 0) {
                    // check if target element defines url to load its contents from
                    // and if contents was not already loaded
                    if (!!url && next.children('*').size() === 0) {
                        // load contents and do visual transition
                        this.load(
                            frame,
                            // if succeeded trigger `show` and `after` events
                            // and actually make next frame visible
                            function () {
                                next.show().trigger($.Event('show', { 'context': context }));
                                $(element).trigger($.Event('after', event));
                            },
                            // if failed only trigger `after` event
                            function () {
                                $(element).trigger($.Event('after', event));
                            }
                        );
                    } else {
                        // otherwise simply show the next frame
                        // and trigger both `show` and `after` events
                        next.show().trigger($.Event('show', { 'context': context }));
                        $(element).trigger($.Event('after', event));
                    }
                }

                // set given frame as current one
                this.current = frame;
            }
        },

        /**
         * Force loads content of the given frame if there is a data-url attribute.
         * Note that this method will reload frame contents even if it was loaded before
         * or even if frame container is not empty for other reasons.
         *
         * @param frame
         *          A name of frame to force load.
         * @param success
         *          An optional function which will be invoked upon successful load completion.
         * @param error
         *          An optional function which will be invoked in case of failure.
         */
        load: function (frame, success, error) {
            var container = $('[data-frame="' + frame + '"]', this.element),
                url = container.attr('data-url'),
                element = this.element,
                event = {
                    name: frame,
                    element: container.get(0)
                };
            if (url) {
                // load contents and do visual transition
                $.get(url)
                    .done(function (contents) {
                        // success - filling div with actual contents
                        container.html(contents);
                        $(element).trigger($.Event('load', event));
                        if (!!success) {
                            success();
                        }
                    }).fail(function () {
                        // failure - adding hidden div just to prevent further loads
                        container.html('<div style="display:none"></div>');
                        $(element).trigger($.Event('fail', event));
                        if (!!error) {
                            error();
                        }
                    });
            } else {
                // if no url was found, treat it as a failure
                window.setTimeout(function () {
                    // failure - adding hidden div just to prevent further loads
                    container.html('<div style="display:none"></div>');
                    $(element).trigger($.Event('fail', event));
                    if (!!error) {
                        error();
                    }
                }, 0);
            }
        },

        /**
         * Executes command as specified in options.
         *
         * - { 'action': 'display', 'frame': <frame>, 'context': <object> }
         *          Displays frame with given name setting given object in context.
         * - { 'action': 'load', 'frame': <frame> }
         *          Forces loading of the frame with given name.
         */
        command: function (options) {
            if (options !== undefined) {
                if (options.action === 'display') {
                    this.context(options.frame, options.context);
                    window.location.hash = '#' + options.frame;
                } else if (options.action === 'load') {
                    this.load(options.frame);
                }
            }
        }

    };

    // Bind plugin instance to element
    $.fn[name] = function (options) {
        return this.each(function () {
            var key = 'plugin_' + name,
                plugin = $.data(this, name);
            if (plugin === undefined) {
                plugin = new Hashnav(this, options);
                $.data(this, name, plugin);
            }
            plugin.command(options);
        });
    };

}));
