/**
 * jQuery.netchanger - rich extension to the DOM onchange event
 *
 * version 0.9.0
 * 
 * http://michaelmonteleone.net/projects/netchanger
 * http://github.com/mmonteleone/jquery.netchanger
 *
 * Copyright (c) 2009 Michael Monteleone
 * Licensed under terms of the MIT License (README.markdown)
 */
(function($){
    var notdefined;
    var valueKey = 'netchanger.initialvalue';
    
    /**
     * Extension to the jQuery.fn.val
     * Intelligently compares values based on type of input
     * @param {jQuery} elm selection of elements
     * @param {Object} val when passed, sets value as current value of input
     */
    var value = function(elm, val) {
        // setting
        if(val) {
            // checked inputs set their checked statuses
            // baed on true/false of val
            if(elm.is("input:checkbox,input:radio")) {
                return val ?
                    elm.attr('checked','checked') :
                    elm.removeAttr('checked');
            } else {
                return elm.val(val);                
            }
        // getting
        } else {
            // checked inputs return true/false 
            // based on checked status
            if(elm.is("input:checkbox,input:radio")) {
                return elm.is(":checked");
            } else {
                return elm.val();
            }
        }
    };

    $.fn.extend({
        /**
         * Main plugin method.  Ativates netchanger events on matched controls in selection.
         * 
         * @param {Object} options optional object literal options
         */
        netchanger: function(options){
            
            // return this.each(function(){    
            //     var elm = $(this);
            //     var existingValue = elm.data(valueKey);
            //     // only set up netchanger on matched inputs that 
            //     // haven't already had netchanger applied to them
            //     if(existingValue === notdefined) {
            //         // capture current (initial) value
            //         elm.data(valueKey,value(elm))
            //            .bind(settings.events.replace(/,/g,' '), function(){
            //                 // bind to all specified events
            //                 // to check the current value and raise custom events
            //                 // when necessary
            //                 var initialValue = elm.data(valueKey);
            //                 if(value(elm) !== initialValue) {
            //                     elm.trigger('netchange');
            //                 }
            //                 if(value(elm) === initialValue) {
            //                     elm.trigger('revertchange');
            //                 }
            //             });
            //     }
            // });
            
            var settings = $.extend({}, $.netchanger.defaults, options || {}),
                selection = this,
                elm, 
                initialValue;
            var binder = settings.live ? 'live' : 'bind';

            selection[binder](settings.live ? 'focusin' : 'focus', function(){
                elm = $(this);
                if(elm.data(valueKey) === undefined) {
                    elm.data(valueKey, value(elm));
                }                    
            });
            
            $.each(settings.events.split(','), function(){
                selection[binder](String(this), function(e){
                    elm = $(e.target);
                    initialValue = elm.data(valueKey);
                    if(value(elm) !== initialValue) { elm.trigger('netchange'); }
                    if(value(elm) === initialValue) { elm.trigger('revertchange'); }                    
                });
            });
            
            return selection;
        },
            
        /**
         * When passed a handler, binds handler to the `revertchange` event 
         * on matched selection.  When not passed handler, changes the current 
         * value of matched controls back to their initial state and raises 
         * `revertchange` event on any that had a difference between 
         * their current and initial values.
         * 
         * @param {Function} handler optional event handler
         */                
        revertchange: function(handler) {
            return handler ?
                this.bind('revertchange', handler) : 
                this.each(function() {
                    // if values are effectively different, 
                    // sets input back to initial value and triggers change
                    // which thus triggers a revertchange
                    var element = $(this);
                    if(element.data(valueKey) !== notdefined &&
                        element.data(valueKey) !== value(element)) {
                        value(element,element.data(valueKey));
                        element.change();
                    }
                });
        },
        
        /**
         * When passed a handler, binds handler to the `refreshchange` 
         * event on matched selection.  When not passed handler, promotes 
         * the current value of matched controls to be the new initial 
         * reference value and raises `refreshchange` event on any that 
         * had a difference between their current and initial values.
         * 
         * @param {Function} handler optional event handler
         */
        refreshchange: function(handler) {
            return handler ? 
                this.bind('refreshchange', handler) :
                this.each(function(){
                    // if values are effectively different,
                    // sets initial of input to current value
                    // and raises refreshchange event
                    var element = $(this);
                    if(element.data(valueKey) !== notdefined && element.data(valueKey) !== value(element)) {
                        element.data(valueKey,value(element));
                        element.trigger('refreshchange');
                    }
                });
        },
        
        /**
         * When passed a handler, binds handler to the `netchange` 
         * event on matched selection.  When not passed handler, 
         * artificially triggers `netchange` event on matched selection.
         * 
         * @param {Function} handler optional event handler
         */
        netchange: function(handler) {
            return handler ? 
                this.bind('netchange', handler) : 
                this.trigger('netchange');
        }
    });

    $.extend({
        /**
         * Shortcut alias for 
         * $('input,select,textarea,fileupload').netchanger(options);
         * 
         * @param {Object} options optional object literal of options
         */
        netchanger: function(options){
            $($.netchanger.defaults.selector).netchanger(options);
        }
    });

    $.extend($.netchanger,{
        version: '0.9.0',
        defaults: {
            live: false,
            selector: 'input,select,textarea,fileupload',
            events: 'change,keyup,paste'
        }
    });
})(jQuery);