QUnit.specify.globalApi = true;

QUnit.specify("jQuery.netchanger", function() {
    
    var specification = function() {        
        // capture local references to current jquery objects
        // since the globals may get out of sync in the async
        // test runner
        var $ = window.$,
            jQuery = window.jQuery;
            
        // setup some helpers        
        var is14OrGreater = Number($.fn.jquery.split('.').slice(0,2).join('.')) >= 1.4;
        var focusEvent = is14OrGreater ? 'focusin' : 'focus';

        var opts = {
            selector: 'input,select,textarea,fileupload',
            events: 'change,keyup,paste',
            live: is14OrGreater
        };            

        // shortcut for building up and breaking down stub forms
        var FormBuilder = {
            clear: function(){
                // remove all items
                $('div#testbed form').empty();
                $(opts.selector).die('focusin', String(this));                
            },
            addTextInput: function(name, value){
                var input = $('<input type="text" id="' + name + '" name="' + name + '" value="' + value + '" />');
                $('div#testbed form').append(input);
                return input;
            },
            addRadioInput: function(name, value, checked){
                var input = $('<input type="radio" id="' + name + '" name="' + name + '" value="' + value + '" ' + (checked ? 'checked="checked"' : '') + ' />');
                // webkit bug where cloneNode(true) doesn't copy 'checked' attribute
                if(checked) { input.attr('checked', 'checked'); }
                $('div#testbed form').append(input);
                return input;
            },
            addCheckboxInput: function(name, value, checked){
                var input = $('<input type="checkbox" id="' + name + '" name="' + name + '" value="' + value + '" ' + (checked ? 'checked="checked"' : '') + ' />');
                $('div#testbed form').append(input);
                return input;
            },
            addTextArea: function(name, value){
                var input = $('<textarea name="' + name + '" id="' + name + '">' + value + '</textarea>');
                $('div#testbed form').append(input);
                return input;
            },
            addSelect: function(name, value, opts){
                var options = $.map(opts,function(o){ return '<option value="'+o+'">'+o+'</option>' }).join('');
                var select = $('<select id="'+name+'" name="'+name+'">'+options+'</select>');
                $('div#testbed form').append(select);
                select.val(value);
                return select;
            }        
        };

        describe("jQuery.netchanger()", function(){
            after(function(){
                FormBuilder.clear();            
            });

            it("should be equivalent to calling jQuery( jQuery.fn.netchanger.defaults.selector ).netchanger( options );", function(){
                FormBuilder.addTextInput("text1","text1val1");
                FormBuilder.addTextInput("text2","text2val2");
                FormBuilder.addTextInput("text3","text3val3");

                var originalNetchanger = $.fn.netchanger;
                try{
                    var passedOptions;
                    var selection;
                    $.fn.netchanger = function(opts) {
                        passedOptions = opts;                                        
                        selection = this;
                    };
                    var someOpts = {a:1,b:2};
                    $.netchanger(someOpts);
                    assert(someOpts).isSameAs(passedOptions);
                    assert(selection.size()).equals(5);  // 3 added, plus 2 checkboxes already on page
                } finally {
                    $.fn.netchanger = originalNetchanger;
                }         
            });

            describe("defaults", function(){
                it("should have a selector of 'input,select,textarea,fileupload'", function(){
                    assert($.netchanger.defaults.selector).equals('input,select,textarea,fileupload');
                });
                it("should use events 'change,keyup,paste'", function(){
                    assert($.netchanger.defaults.events).equals('change,keyup,paste');
                });
                it("should have proper live setting (true if >= 1.4)", function(){
                    if(is14OrGreater) {
                        assert($.netchanger.defaults.live).isTrue("should be true");
                    } else {
                        assert($.netchanger.defaults.live).isFalse("should be false");                        
                    }
                });
            });        
        });

        describe("jQuery.fn.netchanger()", function(){
            after(function(){
                FormBuilder.clear();            
            });
            
            it("should not allow duplicate bindings", function(){
                FormBuilder.addTextInput('text1','textval1');
                FormBuilder.addTextInput('text2','textval2');

                var raisedCount = 0;
                $('input[type="text"]')
                    .netchanger(opts)
                    .netchanger(opts)
                    .netchanger(opts)
                    .netchanger(opts)
                    .bind('netchange', function(){
                        raisedCount++;                                                
                    })
                    .trigger(focusEvent)
                    .val('newval')
                    .change();
                    
                assert(raisedCount).equals(2);
            });
            
            it("should throw an exception when specifying live when jq version doesn't support (<1.4 only)", function(){
                if(is14OrGreater) {
                    try{
                        $.netchanger($.extend({},opts,{live:true}));
                    } catch(e) {
                        assert.fail('should have allowed live when 1.4')
                    }
                } else {
                    assert(function(){
                        $.netchanger($.extend({},opts,{live:true}));
                    }).throwsException('Use of the live option requires jQuery 1.4 or greater');
                }
            });

            describe("on text inputs", function(){
                before(function(){
                    FormBuilder.addTextInput('text1','textval1');
                    FormBuilder.addTextInput('text2','textval2');
                    $.netchanger(opts);
                });            

                it("should raise 'netchange' when event triggered on input with diff value than initial", function(){                    
                    var raised = false;
                    $('#text1')
                        .bind('netchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .val('textval2')
                        .change();
                    assert(raised).isTrue();
                });
                it("should not raise 'netchange' when event triggered on input with same value as initial", function(){
                    var raised = false;
                    $('#text1')
                        .bind('netchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .val('textval2')
                        .val('textval1')
                        .change();
                    assert(raised).isFalse();                    
                });
                it("should raise 'revertchange' when event triggered on input with same value as initial", function(){
                    var raised = false;
                    $('#text1')
                        .bind('revertchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .val('textval2')
                        .change()
                        .val('textval1')
                        .change();
                    assert(raised).isTrue();                    
                });
                it("should not raise 'revertchange' when event triggered on input with diff value from initial", function(){
                    var raised = false;
                    $('#text1')
                        .bind('revertchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .val('textval2')
                        .change();
                    assert(raised).isFalse();                    
                });
                it("should raise 'refreshchange' when refreshChange() on an input results in setting a new init value", function(){
                    var raised = false;
                    $('#text1')
                        .bind('refreshchange', function(){
                            raised = true;
                        })
                        .trigger(focusEvent)
                        .val('textval2')
                        .refreshchange()
                        .change();
                    assert(raised).isTrue();
                });
                it("should not raise 'refreshchange' when refreshChange() on an input does not result in new init", function(){
                    var raised = false;
                    $('#text1')
                        .bind('refreshchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .val('textval2')
                        .change()
                        .val('textval1')
                        .refreshchange()
                        .change();
                    assert(raised).isFalse();
                });
            });

            describe("on text areas", function(){
                before(function(){
                    FormBuilder.addTextArea('textarea1','textval1');
                    FormBuilder.addTextArea('textarea2','textval2');
                    $.netchanger(opts);
                });            

                it("should raise 'netchange' when event triggered on input with diff value than initial", function(){                    
                    var raised = false;
                    $('#textarea1')
                        .bind('netchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .val('textval2')
                        .change();
                    assert(raised).isTrue();
                });
                it("should not raise 'netchange' when event triggered on input with same value as initial", function(){
                    var raised = false;
                    $('#textarea1')
                        .bind('netchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .val('textval2')
                        .val('textval1')
                        .change();
                    assert(raised).isFalse();                    
                });
                it("should raise 'revertchange' when event triggered on input with same value as initial", function(){
                    var raised = false;
                    $('#textarea1')
                        .bind('revertchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .val('textval2')
                        .change()
                        .val('textval1')
                        .change();
                    assert(raised).isTrue();                    
                });
                it("should not raise 'revertchange' when event triggered on input with diff value from initial", function(){
                    var raised = false;
                    $('#textarea1')
                        .bind('revertchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .val('textval2')
                        .change();
                    assert(raised).isFalse();                    
                });
                it("should raise 'refreshchange' when refreshChange() on an input results in setting a new init value", function(){
                    var raised = false;
                    $('#textarea1')
                        .bind('refreshchange', function(){
                            raised = true;
                        })
                        .trigger(focusEvent)                    
                        .val('textval2')
                        .refreshchange()
                        .change();
                    assert(raised).isTrue();
                });
                it("should not raise 'refreshchange' when refreshChange() on an input does not result in new init", function(){
                    var raised = false;
                    $('#textarea1')
                        .bind('refreshchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .val('textval2')
                        .change()
                        .val('textval1')
                        .refreshchange()
                        .change();
                    assert(raised).isFalse();
                });
            });        

            describe("on radio inputs", function(){
                before(function(){
                    FormBuilder.addRadioInput('radio1','radioval1',true);
                    FormBuilder.addRadioInput('radio2','radioval2',false);
                    $.netchanger(opts);
                });            

                it("should raise 'netchange' when event triggered on input with diff value than initial", function(){                    
                    var raised = false;
                    $('#radio1')
                        .bind('netchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .removeAttr('checked')
                        .change();
                    assert(raised).isTrue();
                });
                it("should not raise 'netchange' when event triggered on input with same value as initial", function(){
                    var raised = false;
                    $('#radio1')
                        .bind('netchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .removeAttr('checked')
                        .attr('checked','checked')
                        .change();
                    assert(raised).isFalse();                    
                });
                it("should raise 'revertchange' when event triggered on input with same value as initial", function(){
                    var raised = false;
                    $('#radio1')
                        .bind('revertchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .removeAttr('checked')
                        .change()
                        .attr('checked','checked')
                        .change();
                    assert(raised).isTrue();                    
                });
                it("should not raise 'revertchange' when event triggered on input with diff value from initial", function(){
                    var raised = false;
                    $('#radio1')
                        .bind('revertchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)                    
                        .removeAttr('checked')
                        .change();
                    assert(raised).isFalse();                    
                });
                it("should raise 'refreshchange' when refreshChange() on an input results in setting a new init value", function(){
                    var raised = false;
                    $('#radio1')
                        .bind('refreshchange', function(){
                            raised = true;
                        })
                        .trigger(focusEvent)
                        .removeAttr('checked')
                        .refreshchange()
                        .change();
                    assert(raised).isTrue();
                });
                it("should not raise 'refreshchange' when refreshChange() on an input does not result in new init", function(){
                    var raised = false;
                    $('#radio1')
                        .bind('refreshchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .removeAttr('checked')
                        .change()
                        .attr('checked','checked')
                        .refreshchange()
                        .change();
                    assert(raised).isFalse();
                });
            });

            describe("on checkbox inputs", function(){
                before(function(){
                    FormBuilder.addCheckboxInput('cb1','cbval1',true);
                    FormBuilder.addCheckboxInput('cb2','cbval2',false);
                    $.netchanger(opts);
                });            

                it("should raise 'netchange' when event triggered on input with diff value than initial", function(){                    
                    var raised = false;
                    $('#cb1')
                        .bind('netchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .removeAttr('checked')
                        .change();
                    assert(raised).isTrue();
                });
                it("should not raise 'netchange' when event triggered on input with same value as initial", function(){
                    var raised = false;
                    $('#cb1')
                        .bind('netchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .removeAttr('checked')
                        .attr('checked','checked')
                        .change();
                    assert(raised).isFalse();                    
                });
                it("should raise 'revertchange' when event triggered on input with same value as initial", function(){
                    var raised = false;
                    $('#cb1')
                        .bind('revertchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .removeAttr('checked')
                        .change()
                        .attr('checked','checked')
                        .change();
                    assert(raised).isTrue();                    
                });
                it("should not raise 'revertchange' when event triggered on input with diff value from initial", function(){
                    var raised = false;
                    $('#cb1')
                        .bind('revertchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .removeAttr('checked')
                        .change();
                    assert(raised).isFalse();                    
                });
                it("should raise 'refreshchange' when refreshChange() on an input results in setting a new init value", function(){
                    var raised = false;
                    $('#cb1')
                        .bind('refreshchange', function(){
                            raised = true;
                        })
                        .trigger(focusEvent)
                        .removeAttr('checked')
                        .refreshchange()
                        .change();
                    assert(raised).isTrue();
                });
                it("should not raise 'refreshchange' when refreshChange() on an input does not result in new init", function(){
                    var raised = false;
                    $('#cb1')
                        .bind('refreshchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .removeAttr('checked')
                        .change()
                        .attr('checked','checked')
                        .refreshchange()
                        .change();
                    assert(raised).isFalse();
                });
            });

            describe("on selects", function(){
                before(function(){
                    FormBuilder.addSelect('select1','c',['a','b','c','d','e']);
                    FormBuilder.addSelect('select2','d',['a','b','c','d','e']);
                    $.netchanger(opts);
                });            

                it("should raise 'netchange' when event triggered on input with diff value than initial", function(){                    
                    var raised = false;
                    $('#select1')
                        .bind('netchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .val('b')
                        .change();
                    assert(raised).isTrue();
                });
                it("should not raise 'netchange' when event triggered on input with same value as initial", function(){
                    var raised = false;
                    $('#select1')
                        .bind('netchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .val('b')
                        .val('c')
                        .change();
                    assert(raised).isFalse();                    
                });
                it("should raise 'revertchange' when event triggered on input with same value as initial", function(){
                    var raised = false;
                    $('#select1')
                        .bind('revertchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .val('b')
                        .change()
                        .val('c')
                        .change();
                    assert(raised).isTrue();                    
                });
                it("should not raise 'revertchange' when event triggered on input with diff value from initial", function(){
                    var raised = false;
                    $('#select1')
                        .bind('revertchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .val('b')
                        .change();
                    assert(raised).isFalse();                    
                });
                it("should raise 'refreshchange' when refreshChange() on an input results in setting a new init value", function(){
                    var raised = false;
                    $('#select1')
                        .bind('refreshchange', function(){
                            raised = true;
                        })
                        .trigger(focusEvent)
                        .val('b')
                        .refreshchange()
                        .change();
                    assert(raised).isTrue();
                });
                it("should not raise 'refreshchange' when refreshChange() on an input does not result in new init", function(){
                    var raised = false;
                    $('#select1')
                        .bind('refreshchange', function(){
                            raised = true;                            
                        })
                        .trigger(focusEvent)
                        .val('b')
                        .change()
                        .val('c')
                        .refreshchange()
                        .change();
                    assert(raised).isFalse();
                });
            });                
        });
        describe('jQuery.fn.netchange()', function(){
            after(function(){
                FormBuilder.clear();            
            });

            describe("when not passed an fn", function(){
                it("should trigger 'netchange' event", function(){
                    FormBuilder.addTextInput('text1','val1');
                    var inputs = $('input[type="text"]');
                    var raised = false;
                    inputs.bind('netchange', function(){
                        raised = true;
                    }).netchange();
                    assert(raised).isTrue();
                });
            });
            describe("when passed an fn", function(){
                it("should bind fn to 'netchange' event", function(){
                    var originalBind = $.fn.bind;
                    var passedEvent, passedFn;                
                    $.fn.bind = function(evnt,fn) {
                        passedEvent = evnt;
                        passedFn = fn;
                    };
                    try{
                        var handler = function(){ };
                        $('input').netchange(handler);
                        assert(passedEvent).equals('netchange');
                        assert(passedFn).equals(handler);
                    } finally {
                        $.fn.bind = originalBind;
                    }
                });
            });
        });
        describe("jQuery.fn.refreshchange()", function(){
            after(function(){
                FormBuilder.clear();
            });

            describe("when not passed an fn", function(){
                it("should change update initial value to current value where they are different", function(){
                    FormBuilder.addTextInput('text1','val1');
                    FormBuilder.addTextInput('text2','val2');

                    $.netchanger(opts);

                    $('#text1').trigger(focusEvent).val('valnew').change();
                    $('input[type="text"]').refreshchange();                

                    var raisedCount = 0;
                    $('input[type="text"]')
                        .bind('refreshchange', function(e){
                            raisedCount++;
                        })
                        .trigger(focusEvent)
                        .val('valnew')
                        .refreshchange();

                    assert(raisedCount).equals(1);
                });
                it("should trigger 'refreshchange' on these same inputs", function(){
                    FormBuilder.addTextInput('text1','val1');
                    FormBuilder.addTextInput('text2','val2');
                    $.netchanger(opts);

                    var raisedCount = 0;
                    $('input[type="text"]').bind('refreshchange', function(){
                        raisedCount++;
                    });

                    $('#text1').trigger(focusEvent).val('valnew').change();
                    $('input[type="text"]').refreshchange();

                    assert(raisedCount).equals(1);                
                });
            });
            describe("when passed an fn", function(){
                it("should bind fn to 'refreshchange' event", function(){
                    var originalBind = $.fn.bind;
                    var passedEvent, passedFn;                
                    $.fn.bind = function(evnt,fn) {
                        passedEvent = evnt;
                        passedFn = fn;
                    };
                    try{
                        var handler = function(){ };
                        $('input').refreshchange(handler);
                        assert(passedEvent).equals('refreshchange');
                        assert(passedFn).equals(handler);
                    } finally {
                        $.fn.bind = originalBind;
                    }                
                });
            });
        });
        describe("jQuery.fn.revertchange()", function(){
            after(function(){
                FormBuilder.clear();            
            });

            describe("when not passed an fn", function(){
                it("should change current value of inputs back to initial value if they are different", function(){
                    FormBuilder.addTextInput('text1','val1');
                    FormBuilder.addTextInput('text2','val2');
                    $.netchanger(opts);

                    $('#text1').trigger(focusEvent).val('newval');
                    $('input').revertchange();

                    assert($('#text1').val()).equals('val1');
                    assert($('#text2').val()).equals('val2');
                });
                it("should trigger 'revertchange' event on these same inputs", function(){
                    FormBuilder.addTextInput('text1','val1');
                    FormBuilder.addTextInput('text2','val2');
                    $.netchanger(opts);

                    $('#text1').trigger(focusEvent).val('newval');

                    var raisedCount = 0;
                    $('input')
                        .bind('revertchange', function(){
                            raisedCount++;
                        })
                        .revertchange();

                    assert(raisedCount).equals(1);
                });
            });      
            describe("when passed an fn", function(){
                it("should bind fn to 'revertchange' event", function(){
                    var originalBind = $.fn.bind;
                    var passedEvent, passedFn;                
                    $.fn.bind = function(evnt,fn) {
                        passedEvent = evnt;
                        passedFn = fn;
                    };
                    try{
                        var handler = function(){ };
                        $('input').revertchange(handler);
                        assert(passedEvent).equals('revertchange');
                        assert(passedFn).equals(handler);
                    } finally {
                        $.fn.bind = originalBind;
                    }                
                });
            })
        });
    };

    /**
     * naive replication of $.each since 
     * jquery is not defined at this point
     */
    var each = function(items, fn) {
        for(var i=0;i<items.length;i++) {
            var item = items[i];
            fn(item);
        };
    };
    
    /**
     * run entire test suite against multiple loaded versions
     * of jquery.
     * 
     * Assumes they have each been loaded and set to notConflict(true)
     * aliased as jq14, jq13, etc.
     */
    each(["1.3.2","1.4.1","1.4.3"], function(version) {
        describe("in jQ " + version, function(){
            $ = jQuery = window['jq_' + version.replace(/\./g,'_')];
            specification();                    
        });        
    });
});

