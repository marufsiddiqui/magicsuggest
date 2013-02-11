/**
 * All auto suggestion boxes are fucked up or badly written.
 * This is an attempt to create something that doesn't suck...
 *
 * Requires: jQuery and the Class class for OOP.
 *
 * Author: Nicolas Bize
 * Date: Feb. 8th 2013
 * Licence: MagicSuggest is licenced under MIT licence (http://www.opensource.org/licenses/mit-license.php)
 */

var MagicSuggest = Class.create({
    /**
     * Initializes the MagicSuggest component
     * @param cfg - see config below
     */
    init: function(cfg){
        /**
         * @cfg {Boolean} allowFreeEntries
         * <p>Restricts or allows the user to validate typed entries </p>
         * Defaults to <code>true</code>.
         */
        this.allowFreeEntries = cfg.allowFreeEntries !== undefined ? cfg.allowFreeEntries : true;

        /**
         * @cfg {Boolean} preselectSingleSuggestion
         * <p>If a single suggestion comes out, it is preselected.</p>
         * Defaults to <code>true</code>.
         */
        this.preselectSingleSuggestion = cfg.preselectSingleSuggestion !== undefined ? cfg.preselectSingleSuggestion : true;

        /**
         * @cfg {String} cls
         * <p>A custom CSS class to apply to the field's underlying element</p>
         * Defaults to <code>''</code>.
         */
        this.cls = cfg.cls || '';

        /**
         * @cfg {Array / String} data
         * <p>JSON Data source used to populate the combo box. 3 options are available here:</p>
         * <p><b>No Data Source (default)</b></p><br/>
         * <p>When left null, the combo box will not suggest anything. It can still enable the user to enter
         *    multiple entries if allowFreeEntries is set to true (default).</p>
         * <p><b>Static Source</b></p><br/>
         * <p>(If this is defined, you <b>must</b> define the nameField and valueField config properties.)</p>
         *    You can pass directly an array of JSON objects as the data source.<br/>
         *    For ex. data: [{id:0,name:"Paris"}, {id: 1, name: "New York"}]<br/></p>
         * <p><b>Url</b></p><br/>
         * <p>(If this is defined, you <b>must</b> define the nameField and valueField config properties.)</p>
         *    You can pass the url from which the component will fetch its JSON data.<br/>
         *    Data will be fetched using a POST ajax request that will include the entered text as 'query' parameter<br/></p>
         * Optional. Defaults to <code>null</code>, will only serve as a multiple free-choice component.
         */
        this.data = cfg.data !== undefined ? cfg.data : null;

        /**
         * @cfg {String} displayField
         * <p>name of JSON object property displayed in the combo list</p>
         * Defaults to <code>name</code>.
         */
        this.displayField = cfg.displayField || 'name';

        /**
         * @cfg {Boolean} editable
         * <p>Set to false if you only want mouse interaction
         *    When set to false, the combo will automatically expand on focus</p>
         * Defaults to <code>true</code>.
         */
        this.editable = cfg.editable !== undefined ? cfg.editable : true;

        /**
         * @cfg {String} emptyText
         * <p>The default placeholder text when nothing has been entered</p>
         * Defaults to <code>'Type or click here'</code> or just <code>'Click here'</code> if not editable.
         */
        this.emptyText = cfg.emptyText || (this.editable === true ? 'Type or click here' : 'Click here');

        /**
         * @cfg {String} emptyTextCls
         * <p>A custom CSS class to style the empty text</p>
         * Defaults to <code>'ms-empty-text'</code>.
         */
        this.emptyTextCls = cfg.emptyTextCls || 'ms-empty-text';

        /**
         * @cfg {Boolean} expanded
         * <p>Set starting state for combo.</p>
         * Defaults to <code>false</code>.
         */
        this.expanded = !!cfg.expanded;

        /**
         * @cfg {Boolean} expandOnFocus
         * <p>Automatically expands combo on focus.</p>
         * Defaults to <code>false</code>.
         */
        this.expandOnFocus = this.editable === false ? true : !!cfg.expandOnFocus;

        /**
         * @cfg {Boolean} hideTrigger
         * <p>Set to true to hide the trigger on the right</p>
         * Defaults to <code>false</code>.
         */
        this.hideTrigger = !!cfg.hideTrigger;

        /**
         * @cfg {Boolean} highlight
         * <p>Set to true to highlight search input within displayed suggestions</p>
         * Defaults to <code>true</code>.
         */
        this.highlight = cfg.highlight !== undefined ? cfg.highlight : true;

        /**
         * @cfg {Boolean} matchCase
         * <p>Set to true to filter data results according to case. Useless if the data is fetched remotely</p>
         * Defaults to <code>false</code>.
         */
        this.matchCase = !!cfg.matchCase;

        /**
         * @cfg {Integer} maxDropHeight (in px)
         * <p>Once expanded, the combo's height will take as much room as the # of available results.
         *    In case there are too many results displayed, this will fix the drop down height.</p>
         * Defaults to 300 px.
         */
        this.maxDropHeight = cfg.maxDropHeight || 300;

        /**
         * @cfg {Integer} maxResults
         * <p>The maximum number of results displayed in the combo drop down at once.
         *    Set to false to remove the limit.</p>
         * Defaults to 10.
         */
        this.maxResults = cfg.maxResults || 10;

        /**
         * @cfg {Integer} maxSelection
         * <p>The maximum number of items the user can select if multiple selection is allowed.
         *    Set to false to remove the limit.</p>
         * Defaults to false.
         */
        this.maxSelection = cfg.maxSelection || 10;

        /**
         * @cfg {Integer} minChars
         * <p>The minimum number of characters the user must type before the combo expands and offers suggestions.
         *    You can set this to 0 if you want the drop down to expand as soon as the component gains focus.</p>
         * Defaults to <code>0</code> when <code>data</code> is not set or set to a local array, <code>2</code> otherwise.
         */
        this.minChars = $.isNumeric(cfg.minChars) ? cfg.minChars : (typeof(this.data) === 'string' ? 2 : 0);

        /**
         * @cfg (input DOM Element) renderTo
         * <p>The input tag that will be transformed into the component</p>
         * <b>Required</b>
         */
        this.renderTo = cfg.renderTo;
        if(this.renderTo === undefined){
            throw "Missing renderTo parameter";
        }

        /**
         * @cfg {String} selectionCls
         * <p>A custom CSS class to add to a selected item</p>
         * Defaults to <code>''</code>.
         */
        this.selectionCls = cfg.selectionCls || '';

        /**
         * @cfg {String} selectionPosition
         * <p>Where the selected items will be displayed. Only 'right', 'bottom' and 'inner' are valid values</p>
         * Defaults to <code>'inner'</code>, meaning the selected items will appear within the input box itself.
         */
        if($.type(cfg.selectionPosition) === 'string'){
            if(['right', 'bottom', 'inner'].indexOf(cfg.selectionPosition.toLowerCase()) === -1){
                throw "selectionPosition is not valid. Only 'right', 'bottom' and 'inner' are accepted";
            }
            this.selectionPosition = cfg.selectionPosition.toLowerCase();
        } else {
            this.selectionPosition = 'inner';
        }

        /**
         * @cfg {Boolean} selectionStacked
         * <p>Set to true to stack the selectioned items when positioned on the bottom
         *    Requires the selectionPosition to be set to 'bottom'</p>
         * Defaults to <code>false</code>.
         */
        this.selectionStacked = !!cfg.selectionStacked;
        if(this.selectionStacked === true && this.selectionPosition !== 'bottom'){
            throw "Selection cannot be stacked elsewhere than at the bottom";
        }

        /**
         * @cfg {Boolean} single
         * <p>Determines whether or not the component allows multiple or single selection</p>
         * Defaults to <code>false</code>.
         */
        this.single = !!cfg.single;

        /**
         * @cfg {String} sortDir
         * <p>Direction used for sorting. Only 'asc' and 'desc' are valid values</p>
         * Defaults to <code>'asc'</code>.
         */
        if($.type(cfg.sortDir) === 'string'){
            if(['asc', 'desc'].indexOf(cfg.sortDir.toLowerCase()) === -1){
                throw "sortDir is not valid. Only 'asc' and 'desc' are accepted";
            }
            this.sortDir = cfg.sortDir.toLowerCase();
        } else {
            this.sortDir = 'asc';
        }

        /**
         * @cfg {String} sortOrder
         * <p>name of JSON object property for local result sorting.
         *    Leave null if you do not wish the results to be ordered or if they are already ordered remotely.</p>
         *
         * Defaults to <code>null</code>.
         */
        this.sortOrder = cfg.sortOrder !== undefined ? cfg.sortOrder : null;

        /**
         * @cfg {Boolean} useTabKey
         * <p>If set to true, tab won't blur the component but will be registered as the ENTER key</p>
         * Defaults to <code>false</code>.
         */
        this.useTabKey = !!cfg.useTabKey;

        /**
         * @cfg {Boolean} useZebraStyle
         * <p>Determines whether or not the results will be displayed with a zebra table style</p>
         * Defaults to <code>true</code>.
         */
        this.useZebraStyle = cfg.useZebraStyle !== undefined ? cfg.useZebraStyle : true;

        /**
         * @cfg {String} valueField
         * <p>name of JSON object property that represents its underlying value</p>
         * Defaults to <code>id</code>.
         */
        this.valueField = cfg.valueField || 'id';

        /**
         * @cfg {Integer} width (in px)
         * <p>Width of the component</p>
         * Defaults to underlying element width.
         */
        this.width = cfg.width || $(this.renderTo).width();

        this._events = [
        /**
         * @event afterrender
         * Fires when the component has finished rendering.
         * @param this
         */
            'afterrender',

        /**
         * @event blur
         * Fires when the component looses focus.
         * @param this
         */
            'blur',

        /**
         * @event collapse
         * Fires when the combo is collapsed.
         * @param this
         */
            'collapse',

        /**
         * @event expand
         * Fires when the combo is expanded.
         * @param this
         */
            'expand',

        /**
         * @event focus
         * Fires when the component gains focus.
         * @param this
         */
            'focus',

        /**
         * @event selectionchange
         * Fires when the selected values have changed.
         * @param this
         * @param selected items
         */
            'selectionchange'

        ];


        // private array holder for our selected objects
        this._selection = [];

        // This is the starting point where all the magic happens
        this._doRender();
    },

    /**
     * Expand the drop drown part of the combo.
     */
    expand: function(){
        if(!this.expanded && this.input.val().length >= this.minChars){
            this._processSuggestions();
            this.combobox.appendTo(this.container);
            this.expanded = true;
            $(this).trigger('expand', [this]);
        }
    },

    /**
     * Collapse the drop down part of the combo
     */
    collapse: function(){
        if(this.expanded === true){
            this.combobox.detach();
            this.container.removeClass('ms-ctn-bootstrap-focus');
            this.expanded = false;
            $(this).trigger('collapse', [this]);
        }
    },

    /**
     * Add one or multiple json items to the current selection
     * @param items - json object or array of json objects
     */
    addToSelection: function(items){
        if(!$.isArray(items)){
            items = [items];
        }
        var ref = this, valuechanged = false;
        $.each(items, function(index, json){
            if(ref.getSelectedValues().indexOf(json[ref.valueField]) === -1){
                ref._selection.push(json);
                valuechanged = true;
            }
        });
        if(valuechanged === true){
            this._renderSelection();
            this.input.val('');
            $(this).trigger('selectionchange', [this, this.getSelectedItems()]);
        }
    },

    /**
     * Remove one or multiples json items from the current selection
     * @param items - json object or array of json objects
     */
    removeFromSelection: function(items){
        if(!$.isArray(items)){
            items = [items];
        }
        var ref = this, valuechanged = false;
        $.each(items, function(index, json){
            var i = ref.getSelectedValues().indexOf(json[ref.valueField]);
            if(i > -1){
                ref._selection.splice(i, 1);
                valuechanged = true;
            }
        });
        if(valuechanged === true){
            this._renderSelection();
            $(this).trigger('selectionchange', [this, this.getSelectedItems()]);
            if(this.expanded){
                this._processSuggestions();
            }
        }
    },

    /**
     * Retrieve an array of selected json objects
     * @return {Array}
     */
    getSelectedItems: function(){
        return this._selection;
    },

    /**
     * Retrieve an array of selected values
     */
    getSelectedValues: function(){
        var ref = this;
        return $.map(this._selection, function(o) {
            return o[ref.valueField];
        });
    },

    /**
     * Render the component to the given input DOM element
     * @private
     */
    _doRender: function(){
        // holds the main div, will relay the focus events to the contained input element.
        this.container = $('<div/>', {
            id: 'ms-ctn-' + $('div[id^="ms-ctn"]').length, // auto-increment IDs in case of multiple suggest components
            // class is a reserved word
            'class': 'ms-ctn ' + this.cls +
                (this.editable === true ? '' : ' ms-ctn-readonly'),
            style: 'width: ' + this.width + 'px;'
        });
        this.container.focus($.proxy(this._onContainerFocus, this));
        this.container.blur($.proxy(this._onContainerBlur, this));
        this.container.keydown($.proxy(this._onHandleKeyDown, this));
        this.container.keyup($.proxy(this._onHandleKeyUp, this));

        // holds the input field
        this.input = $('<input/>', {
            id: 'ms-input-' + $('input[id^="ms-input"]').length,
            type: 'text',
            'class': this.emptyTextCls + (this.editable === true ? '' : ' ms-input-readonly'),
            value: this.emptyText,
            readonly: !this.editable,
            style: 'width: ' + (this.width - (this.hideTrigger ? 16 : 38)) + 'px;'
        });
        this.input.focus($.proxy(this._onInputFocus, this));

        // holds the trigger on the right side
        if(this.hideTrigger === false){
            this.trigger = $('<div/>', {
                id: 'ms-trigger-' + $('div[id^="ms-trigger"]').length,
                'class': 'ms-trigger',
                html: '<div class="ms-trigger-ico"></div>'
            });
            this.trigger.click($.proxy(this._onTriggerClick, this));
            this.container.append(this.trigger);
        }

        // holds the suggestions. will always be placed on focus
        this.combobox = $('<div/>', {
            id: 'ms-res-ctn-' + $('div[id^="ms-res-ctn"]').length,
            'class': 'ms-res-ctn',
            style: 'width: ' + this.width + 'px; height: ' + this.maxDropHeight + 'px;'
        });

        this.selectionContainer = $('<div/>', {
            id: 'ms-sel-ctn-' +  $('div[id^="ms-sel-ctn"]').length,
            'class': 'ms-sel-ctn'
        });
        this.selectionContainer.click($.proxy(this._onContainerFocus, this));

        if(this.selectionPosition === 'inner'){
            this.selectionContainer.append(this.input);
        } else {
            this.container.append(this.input);
        }

        // Render the whole thing
        $(this.renderTo).replaceWith(this.container);

        switch(this.selectionPosition){
            case 'bottom':
                this.selectionContainer.insertAfter(this.container);
                if(this.selectionStacked === true){
                    this.selectionContainer.width(this.container.width());
                    this.selectionContainer.addClass('ms-stacked');
                }
                break;
            case 'right':
                this.selectionContainer.insertAfter(this.container);
                this.container.css('float', 'left');
                break;
            default:
                this.container.append(this.selectionContainer);
                break;
        }

        $(this).trigger('afterrender', [this]);
        var ref = this;
        $("body").click(function(e) {
            if(ref.container.has(e.target).length === 0){
                ref._onContainerBlur();
            }
        });
    },

    /**
     * Triggered when focusing on the container div. Will focus on the input field instead.
     * @private
     */
    _onContainerFocus: function(){
        this.input.focus();
    },

    /**
     * Triggered when focusing on the input text field.
     * @private
     */
    _onInputFocus: function(){
        this.container.addClass('ms-ctn-bootstrap-focus');
        if(this.input.val() === this.emptyText){
            this.input.removeClass(this.emptyTextCls);
            this.input.val('');
        }
        if((this.expandOnFocus === true && this.input.val().length === 0) ||
            this.input.val().length > this.minChars){
            this.expand();
        }
        $(this).trigger('focus', [this]);
    },

    /**
     * Triggered when blurring out of the component.
     * @private
     */
    _onContainerBlur: function(){
        if(!this.input.is(":focus")){
            this._forceBlur();
        }
    },

    /**
     * Force the component to blur itself
     * @private
     */
    _forceBlur: function(){
        this.container.removeClass('ms-ctn-bootstrap-focus');
        if(this.input.val() === ''){
            this.input.addClass(this.emptyTextCls);
            this.input.val(this.emptyText);
        }
        this.collapse();
        $(this).trigger('blur', [this]);
    },

    /**
     * Triggered when the user presses a key while the component has focus
     * This is where we want to handle all keys that don't require the user input field
     * since it hasn't registered the key hit yet
     * @param e keyEvent
     * @private
     */
    _onHandleKeyDown: function(e){
        // check how tab should be handled
        var active = this.combobox.find('.ms-res-item-active:first'),
            freeInput = this.input.val() !== this.emptyText ? this.input.val() : '';
        if(e.keyCode === 9 && (this.useTabKey === false ||
            (this.useTabKey === true && active.length === 0 && this.input.val().length === 0))){
            this._forceBlur();
            return;
        }
        switch(e.keyCode) {
            case 8: //backspace
                if(freeInput.length === 0 && this.getSelectedItems().length > 0 && this.selectionPosition === 'inner'){
                    this._selection.pop();
                    this._renderSelection();
                    $(this).trigger('selectionchange', [this, this.getSelectedItems()]);
                    this.input.focus();
                    e.preventDefault();
                }
                break;
            case 9: // tab
                e.preventDefault();
                break;
            case 40: // down
                e.preventDefault();
                this._moveSelectedRow("down");
                break;
            case 38: // up
                e.preventDefault();
                this._moveSelectedRow("up");
                break;
        }
    },

    /**
     * Triggered when a key is released while the component has focus
     * @param e
     * @private
     */
    _onHandleKeyUp: function(e){
        var freeInput = this.input.val() !== this.emptyText ? this.input.val() : '',
            inputValid = this.input.val().length > 0 && this.input.val() !== this.emptyText,
            selected,
            obj = {},
            ref = this;
        // ignore a bunch of keys
        if((e.keyCode === 9 && this.useTabKey === false) || (e.keyCode > 13 && e.keyCode < 32)){
            return;
        }
        switch(e.keyCode) {
            case 40:case 38: // up, down
                e.preventDefault();
                break;
            case 13:case 9:// enter, tab
                e.preventDefault();
                if(this.expanded){ // if a selection is performed, select it and reset field
                    selected = this.combobox.find('.ms-res-item-active:first');
                    if(selected.length > 0){
                        selected.click();
                        return;
                    }
                }
                // if no selection or if freetext entered and free entries allowed, add new obj to selection
                if(inputValid === true && this.allowFreeEntries === true){
                    obj[this.displayField] = obj[this.valueField] = freeInput;
                    this.addToSelection(obj);
                    this.collapse(); // cause the combo suggestions to reset
                    ref.input.focus();
                }
                break;
            default:
                if(this.expanded === true){
                    this._processSuggestions();
                } else if(freeInput.length >= this.minChars && this.expanded === false){
                    this.expand();
                }
                break;
        }
    },

    /**
     * Triggered when clicking on the small trigger in the right
     * @private
     */
    _onTriggerClick: function(){
        if(this.expanded === true){
            this.collapse();
        } else {
            this.input.focus();
            this.expand();
        }
    },

    /**
     * According to given data and query, sort and add suggestions in their container
     * @private
     */
    _processSuggestions: function(){
        if(this.data !== null){
            if(typeof(this.data) === 'string'){ // get results from ajax
                var ref = this;
                $.ajax({
                    type: 'post',
                    url: this.data,
                    data: JSON.stringify({query: this.input.val()}),
                    success: function(items){
                        ref._displaySuggestions(ref._sortAndTrim(JSON.parse(items)));
                    },
                    error: function(){
                        throw("Could not reach server");
                    }
                });
            } else { // local array
                this._displaySuggestions(this._sortAndTrim(this.data));
            }
        }
    },

    /**
     * Sorts the results and cut them down to max # of displayed results at once
     * @param data
     * @private
     */
    _sortAndTrim: function(data){
        var ref = this,
            q = this.input.val() !== this.emptyText ? this.input.val() : '',
            filtered = [],
            newSuggestions = [],
            selectedValues = this.getSelectedValues();
        // filter the data according to given input
        if(q.length > 0){
            $.each(data, function(index, obj){
                var name = obj[ref.displayField];
                if((ref.matchCase === true && name.indexOf(q) > -1) ||
                   (ref.matchCase === false && name.toLowerCase().indexOf(q.toLowerCase()) > -1)){
                    filtered.push(obj);
                }
            });
        } else {
            filtered = data;
        }
        // take out the ones that have already been selected
        $.each(filtered, function(index, obj){
            if(selectedValues.indexOf(obj[ref.valueField]) === -1){
                newSuggestions.push(obj);
            }
        });
        // sort the data
        if(this.sortOrder !== null){
            newSuggestions.sort(function(a,b){
                if(a[ref.sortOrder] < b[ref.sortOrder]){
                    return ref.sortDir === 'asc' ? -1 : 1;
                }
                if(a[ref.sortOrder] > b[ref.sortOrder]){
                    return ref.sortDir === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        // trim it down
        if(this.maxResults !== false && this.maxResults > 0){
            newSuggestions = newSuggestions.slice(0, this.maxResults);
        }
        return newSuggestions;
    },

    /**
     * Empties the result container and refills it with the array of json results in input
     * @param data
     * @private
     */
    _displaySuggestions: function(data){
        this.combobox.empty();
        var ref = this,    // i hate the way jQuery handles scopes
            resHeight = 0; // total height taken by displayed results.
        $.each(data, function(index, value){
            var resultItemEl = $('<div/>', {
                'class': 'ms-res-item ' + (index % 2 === 1 && ref.useZebraStyle === true ? 'ms-res-odd' : ''),
                html: ref.highlight === true ? ref._highlightSuggestion(value[ref.displayField]) : value[ref.displayField]
            }).data('json', value);
            resultItemEl.click($.proxy(ref._onComboItemSelected, ref));
            resultItemEl.mouseover($.proxy(ref._onComboItemMouseOver, ref));
            ref.combobox.append(resultItemEl);
            resHeight += 29;
        });
        if(resHeight < this.combobox.height() || resHeight < this.maxDropHeight){
            this.combobox.height(resHeight);
        } else if(resHeight >= this.combobox.height() && resHeight > this.maxDropHeight){
            this.combobox.height(this.maxDropHeight);
        }
        if(data.length === 1 && this.preselectSingleSuggestion === true){
            this.combobox.children().addClass('ms-res-item-active');
        }
    },

    /**
     * Replaces html with highlighted html according to case
     * @param html
     * @private
     */
    _highlightSuggestion: function(html){
        var q = this.input.val() !== this.emptyText ? this.input.val() : '';
        if(q.length === 0){
            return html; // nothing entered as input
        }
        if(this.matchCase === true){
            html = html.replace(new RegExp('(' + q + ')','g'), '<em>$1</em>');
        } else {
            html = html.replace(new RegExp('(' + q + ')','gi'), '<em>$1</em>');
        }
        return html;
    },

    /**
     * Triggered when hovering an element in the combo
     * @param e
     * @private
     */
    _onComboItemMouseOver: function(e){
        this.combobox.children().removeClass('ms-res-item-active');
        $(e.currentTarget).addClass('ms-res-item-active');
    },

    /**
     * Triggered when an item is chosen from the list
     * @param e
     * @private
     */
    _onComboItemSelected: function(e){
        var ref = this;
        this.addToSelection($(e.currentTarget).data('json'));
        $(e.currentTarget).removeClass('ms-res-item-active');
        this.collapse();
        ref.input.focus();
    },

    /**
     * Renders the selected items into their container.
     * @private
     */
    _renderSelection: function(){
        var ref = this, w = 0, inputOffset = 0;
        if(this.selectionPosition === 'inner'){
            this.input.detach();
        }
        this.selectionContainer.empty();
        $.each(this._selection, function(index, value){
            var selectedItemEl, delItemEl;
            // tag representing selected value
            selectedItemEl = $('<div/>', {
                'class': 'ms-sel-item ' + ref.selectionCls,
                html: value[ref.displayField]
            }).data('json', value);

            // small cross img
            delItemEl = $('<span/>', {
                'class': 'ms-close-btn'
            }).data('json', value).appendTo(selectedItemEl);

            delItemEl.click($.proxy(ref._onRemoveFromSelection, ref));
            ref.selectionContainer.append(selectedItemEl);
        });
        if(this.selectionPosition === 'inner'){
            // this really sucks... trying to figure out the best way to fill out the remaining space
            this.selectionContainer.append(this.input);
            this.input.width(0);
            if(this.editable === true || this._selection.length === 0){
                inputOffset = this.input.offset().left - this.selectionContainer.offset().left;
                w = this.container.width() - inputOffset - 32 - (this.hideTrigger === true ? 0 : 36);
                this.input.width(w < 100 ? 100 : w);
            }
            this.container.height(this.selectionContainer.height());
        }
    },

    /**
     * Triggered when clicking upon cross for deletion
     * @param e
     * @private
     */
    _onRemoveFromSelection: function(e){
        this.removeFromSelection($(e.currentTarget).data('json'));
    },

    /**
     * Moves the selected cursor amongst the list item
     * @param dir - 'up' or 'down'
     * @private
     */
    _moveSelectedRow: function(dir){
        if(!this.expanded){
            this.expand();
        }
        var list, start, active, scrollPos;
        list = this.combobox.find(".ms-res-item");
        if(dir === 'down'){
            start = list.eq(0);
        } else {
            start = list.filter(':last');
        }
        active = this.combobox.find('.ms-res-item-active:first');
        if(active.length > 0){
            if(dir === 'down'){
                start = active.next();
                if(start.length === 0){
                    start = list.eq(0);
                }
                scrollPos = this.combobox.scrollTop();
                this.combobox.scrollTop(0);
                if(start[0].offsetTop + start.height() > this.combobox.height()){
                    this.combobox.scrollTop(scrollPos + 29);
                }
            } else {
                start = active.prev();
                if(start.length === 0){
                    start = list.filter(':last');
                    this.combobox.scrollTop(29 * list.length);
                }
                if(start[0].offsetTop < this.combobox.scrollTop()){
                    this.combobox.scrollTop(this.combobox.scrollTop() - 29);
                }
            }
        }
        list.removeClass("ms-res-item-active");
        start.addClass("ms-res-item-active");
    }



});


