(function($){
    var notdefined;
    var valueKey = 'netchanger.initialvalue';
    
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
        netchanger: function(options){
            var settings = $.extend({}, $.netchanger.defaults, options || {});
            
            return this.each(function(){    
                var elm = $(this);
                var existingValue = elm.data(valueKey);
                // only set up netchanger on matched inputs that 
                // haven't already had netchanger applied to them
                if(existingValue === notdefined) {
                    // capture current (initial) value
                    elm.data(valueKey,value(elm));
                    $.each(settings.events.split(','), function(i, eventName) {
                        // bind to all specified events
                        // to check the current value and raise custom events
                        // when necessary
                        elm.bind(eventName,function(){
                            var initialValue = elm.data(valueKey);
                            if(value(elm) !== initialValue) {
                                elm.trigger('netchange');
                            }
                            if(value(elm) === initialValue) {
                                elm.trigger('revertchange');
                            }
                        });
                    });
                }
            });
        },
            
        revertchange: function(handler) {
            return handler ?
                this.bind('revertchange', handler) : 
                this.each(function() {
                    var element = $(this);
                    if(element.data(valueKey) !== notdefined &&
                        element.data(valueKey) !== value(element)) {
                        value(element,element.data(valueKey));
                        element.change();
                    }
                });
        },
        
        refreshchange: function(handler) {
            return handler ? 
                this.bind('refreshchange', handler) :
                this.each(function(){
                    var element = $(this);
                    if(element.data(valueKey) !== notdefined && element.data(valueKey) !== value(element)) {
                        element.data(valueKey,value(element));
                        element.trigger('refreshchange');
                    }
                });
        },
        
        netchange: function(handler) {
            return handler ? 
                this.bind('netchange', handler) : 
                this.trigger('netchange');
        }
    });

    $.extend({
        netchanger: function(options){
            $($.netchanger.defaults.selector).netchanger(options);
        }
    });

    $.extend($.netchanger,{
        version: '0.9.0',
        defaults: {
            selector: 'input,select,textarea,fileupload',
            events: 'change,keyup,paste'
        }
    });
})(jQuery);