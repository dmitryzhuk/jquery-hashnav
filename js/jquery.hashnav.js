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
    var defaults = { /* Nothing here */ },
        /** Plugin name exposed to public */
        name = 'hashnav';

    /** Defines Hash Navigator Plugin constructor */
    function Hashnav(element, options) {
        // set values for 'private' fields
        this.element = element;
        this.options = $.extend({}, defaults, options);

        // hide all children
        $(this.element).children('*').hide();

        // set up starting and current frame
        this.start = this.frame();
        this.current = '';

        // if we were able to define starting frame
        // set up window hash listener and display starting frame
        if (this.start) {
            // set up window hash change event listener
            $(window).on('hashchange', function () { this.display(this.frame()); }.bind(this));
            // display starting frame
            this.display(this.start);
        }
    }

    /** Plugin prototype definition */
    Hashnav.prototype = {

        /** Returns name of the frame based on current window.location.hash value.
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
                        frame = start.get(0).getAttribute('data-frame');
                    } else {
                        // if no default element found use just the first child div
                        children = $(this.element).children('div[data-frame]');
                        if (children.size() > 0) {
                            frame = children.get(0).getAttribute('data-frame');
                        }
                    }
                }
            } else {
                // or just use window hash value without actual hash sign as a frame name.
                frame = window.location.hash.substring(1);
            }
            return frame;
        },

        /** Displays given frame fading out current frame if any.
         * Given frame will become current.
         *
         * @param frame a name of frame to display.
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
                    event = {
                        prev: {
                            name: current,
                            element: prev.get(0)
                        },
                        next: {
                            name: frame,
                            element: next.get(0)
                        }
                    },
                    trigger = function () {
                        $(element).trigger($.Event('after', event));
                    };

                // trigger event before slide
                $(element).trigger($.Event('before', event));

                // if element for the next frame actually exists
                if (next.size() > 0) {
                    // check if target element defines url to load its contents from
                    // and if contents was not already loaded
                    if (url && next.children('*').size() === 0) {
                        // load contents and do visual transition
                        $.get(url)
                            .done(function (contents) {
                                // success - filling div with actual contents
                                next.html(contents);
                            }).fail(function () {
                                // failure - adding hidden div just to prevent further loads
                                next.html('<div style="display:none"></div>');
                            }).always(function () {
                                // anyways - perform visual transition
                                if (prev.size() > 0) {
                                    prev.fadeOut(function () { next.fadeIn(trigger); });
                                } else {
                                    next.fadeIn(trigger);
                                }
                            });
                    } else {
                        // no url specified or contents already loaded
                        // just do visual transition
                        if (prev.size() > 0) {
                            prev.fadeOut(function () { next.fadeIn(trigger); });
                        } else {
                            next.fadeIn(trigger);
                        }
                    }
                } else {
                    // there is no element for the next frame, just fade out current one
                    prev.fadeOut(trigger);
                }

                // set given frame as current one
                this.current = frame;
            }
        },

        /** Executes command with options on given element */
        command: function (element, options) {
            if (options.action === 'display') { window.location.hash = '#' + options.frame; }
        }

    };

    // Bind plugin instance to element
    $.fn[name] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + name)) {
                $.data(this, "plugin_" + name, new Hashnav(this, options));
            } else {
                $.data(this, "plugin_" + name).command(this, options);
            }
        });
    };

}));
