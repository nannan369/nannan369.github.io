// ******* Expr MANAGER ******** //
$axure.internal(function($ax) {
    var _expr = $ax.expr = {};
    var _binOpHandlers = {
        '&&': function(left, right) { return _binOpOverride(left, right, function(left) { return $ax.getBool(left) && $ax.getBool(right()); }); },
        '||': function(left, right) { return _binOpOverride(left, right, function(left) { return $ax.getBool(left) || $ax.getBool(right()); }); },
        '==': function(left, right) { return isEqual(left, right, true); },
        '!=': function(left, right) { return !isEqual(left, right, true); },
        '>': function(left, right) { return _binOpNum(left, right, function(left, right) { return left > right; }); },
        '<': function(left,="" right)="" {="" return="" _binopnum(left,="" right,="" left="" <="" right;="" });="" },="" '="">=': function(left, right) { return _binOpNum(left, right, function(left, right) { return left >= right; }); },
        '<=': 1="" 2="" function(left,="" right)="" {="" return="" _binopnum(left,="" right,="" left="" <="right;" });="" }="" };="" var="" checkops="function(left," undefined="" ||="" right="=" undefined;="" isequal="function" (left,="" isfunction)="" if="" (isfunction)="" and="" is="" function,="" then="" get="" the="" value="" otherwise="" should="" be="" already="" we="" want="" if(checkops(left,="" right))="" false;="" if(left="" instanceof="" date="" &&="" date)="" if(left.getmilliseconds()="" !="right.getMilliseconds())" if(left.getseconds()="" if(left.getminutes()="" if(left.gethours()="" if(left.getdate()="" if(left.getmonth()="" if(left.getyear()="" true;="" object="" object)="" prop;="" go="" through="" all="" of="" lefts="" properties="" compare="" them="" to="" rights.="" for(prop="" in="" left)="" if(!left.hasownproperty(prop))="" continue;="" has="" a="" property="" that="" doesn't="" they="" are="" not="" equal.="" if(!right.hasownproperty(prop))="" any="" their="" equal,="" if(!isequal(left[prop],="" right[prop],="" false))="" final="" check="" make="" sure="" have="" some="" extra="" if(left.hasownproperty(prop)="" $ax.getbool(left)="=" $ax.getbool(right);="" _binopoverride="function(left," func)="" undefined)="" res="func(left," right);="" ?="" false="" :="" res;="" _binopnum="function(left," func(left,="" number(right));="" _exprhandlers="{};" _exprhandlers.array="function(expr," eventinfo)="" returnval="[];" for(var="" i="0;" expr.items.length;="" i++)="" returnval[returnval.length]="_evaluateExpr(expr.items[i]," eventinfo);="" returnval;="" _exprhandlers.binaryop="function(expr," expr.leftexpr="" _evaluateexpr(expr.leftexpr,="" expr.rightexpr="" _evaluateexpr(expr.rightexpr,="" _binophandlers[expr.op](left,="" _exprhandlers.block="function(expr," subexprs="expr.subExprs;" subexprs.length;="" _evaluateexpr(subexprs[i],="" ignore="" result="" _exprhandlers.booleanliteral="function(expr)" expr.value;="" _exprhandlers.nullliteral="function()" null;="" _exprhandlers.pathliteral="function(expr," if(expr.isthis)="" [eventinfo.srcelement];="" if(expr.isfocused="" window.lastfocusedcontrol)="" $ax('#'="" +="" window.lastfocusedcontrol).focus();="" [window.lastfocusedcontrol];="" if(expr.istarget)="" [eventinfo.targetelement];="" $ax.getelementidsfrompath(expr.value,="" _exprhandlers.paneldiagramliteral="function(expr," elementids="$ax.getElementIdsFromPath(expr.panelPath," elementidswithsuffix="[];" suffix="_state" expr.panelindex;="" elementids.length;="" elementidswithsuffix[i]="$ax.repeater.applySuffixToElementId(elementIds[i]," suffix);="" string($jobj(elementidswithsuffix).data('label'));="" _exprhandlers.fcall="function(expr," oldtarget="eventInfo.targetElement;" targets="[];" fcallargs="[];" exprargs="expr.arguments;" expr.arguments.length;="" exprarg="exprArgs[i];" fcallarg="" ;="" if(targets.length)="" j="0;" targets.length;="" j++)="" if(exprarg="=" null)="" fcallargs[j][i]="null;" eventinfo.targetelement="targets[j];" if(typeof="" (fcallarg)="=" 'undefined')="" '';="" else="" fcallargs[i]="null;" do="" support="" null="" exprargs...="" todo:="" this="" makes="" assumptions="" may="" change="" future.="" 1.="" pathliteral="" always="" first="" arg.="" 2.="" there="" only="" exprarg.exprtype="=" 'pathliteral')="" now="" an="" array="" args="" for(j="0;" fcallargs[j]="[[fcallArg[j]]];" preserve="" target="" element="" from="" outside="" function.="" retval="" backwards="" so="" item.="" for(i="targets.length" -="" 1;="">= 0; i--) {
                var args = fcallArgs[i];
                // Add event info to the end
                args[args.length] = eventInfo;
                retval = _exprFunctions[expr.functionName].apply(this, args);
            }
        } else fcallArgs[fcallArgs.length] = eventInfo;
        return targets.length ? retval : _exprFunctions[expr.functionName].apply(this, fcallArgs);
    };

    _exprHandlers.globalVariableLiteral = function(expr) {
        return expr.variableName;
    };

    _exprHandlers.keyPressLiteral = function(expr) {
        var keyInfo = {};
        keyInfo.keyCode = expr.keyCode;
        keyInfo.ctrl = expr.ctrl;
        keyInfo.alt = expr.alt;
        keyInfo.shift = expr.shift;

        return keyInfo;
    };

    _exprHandlers.adaptiveViewLiteral = function(expr) {
        return expr.id;
    };

    _exprHandlers.optionLiteral = function(expr) {
        return expr.value;
    }

    var _substituteSTOs = function(expr, eventInfo) {
        //first evaluate the local variables
        var scope = {};
        for(var varName in expr.localVariables) {
            scope[varName] = $ax.expr.evaluateExpr(expr.localVariables[varName], eventInfo);
        }

        // TODO: [ben] Date and data object (obj with info for url or image) both need to return non-strings.
        var i = 0;
        var retval;
        var retvalString = expr.value.replace(/\[\[(?!\[)(.*?)\]\](?=\]*)/g, function(match) {
            var sto = expr.stos[i++];
            if(sto.sto == 'error') return match;
            try {
                var result = $ax.evaluateSTO(sto, scope, eventInfo);
            } catch(e) {
                return match;
            }

            if((result instanceof Object) && i == 1 && expr.value.substring(0, 2) == '[[' &&
                expr.value.substring(expr.value.length - 2) == ']]') {
                // If the result was an object, this was the first result, and the whole thing was this expresion.
                retval = result;
            }
            return ((result instanceof Object) && (result.label || result.text)) || result;
        });
        // If more than one group returned, the object is not valid
        if(i != 1) retval = false;
        return retval || retvalString;
    };

    _exprHandlers.htmlLiteral = function (expr, eventInfo) {
        eventInfo.htmlLiteral = true;
        var html = _substituteSTOs(expr, eventInfo);
        eventInfo.htmlLiteral = false
        return html;
    };

    _exprHandlers.stringLiteral = function(expr, eventInfo) {
        return _substituteSTOs(expr, eventInfo);
    };

    var _exprFunctions = {};

    _exprFunctions.SetCheckState = function(elementIds, value) {
        var toggle = value == 'toggle';
        var boolValue = Boolean(value) && value != 'false';

        for(var i = 0; i < elementIds.length; i++) {
            var query = $ax('#' + elementIds[i]);
            query.selected(toggle ? !query.selected() : boolValue);
        }
    };

    _exprFunctions.SetSelectedOption = function(elementIds, value) {
        for(var i = 0; i < elementIds.length; i++) {
            var elementId = elementIds[i];
            var obj = $jobj($ax.INPUT(elementId));

            if(obj.val() == value) return;
            obj.val(value);

            if($ax.event.HasSelectionChanged($ax.getObjectFromElementId(elementId))) $ax.event.raiseSyntheticEvent(elementId, 'onSelectionChange');
        }
    };

    _exprFunctions.SetGlobalVariableValue = function(varName, value) {
        $ax.globalVariableProvider.setVariableValue(varName, value);
    };

    _exprFunctions.SetWidgetFormText = function(elementIds, value) {
        for(var i = 0; i < elementIds.length; i++) {
            var elementId = elementIds[i];
            var inputId = $ax.repeater.applySuffixToElementId(elementId, '_input');

            var obj = $jobj(inputId);
            if(obj.val() == value || (value == '' && $ax.placeholderManager.isActive(elementId))) return;
            obj.val(value);
            $ax.placeholderManager.updatePlaceholder(elementId, !value);
            if($ax.event.HasTextChanged($ax.getObjectFromElementId(elementId))) $ax.event.TryFireTextChanged(elementId);
        }
    };

    _exprFunctions.SetFocusedWidgetText = function(elementId, value) {
        if(window.lastFocusedControl) {
            var elementId = window.lastFocusedControl;
            var type = $obj(elementId).type;
            if ($ax.public.fn.IsTextBox(type) || $ax.public.fn.IsTextArea(type)) _exprFunctions.SetWidgetFormText([elementId], value);
            else _exprFunctions.SetWidgetRichText([elementId], value, true);
        }
    };

    _exprFunctions.GetRtfElementHeight = function(rtfElement) {
        if(rtfElement.innerHTML == '') rtfElement.innerHTML = '&nbsp;';
        return rtfElement.offsetHeight;
    };

    _exprFunctions.SetWidgetRichText = function(ids, value, plain) {
        // Converts dates, widgetinfo, and the like to strings.
        value = _exprFunctions.ToString(value);

        //Replace any newlines with line breaks
        var finalValue = value.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>');

        for(var i = 0; i < ids.length; i++) {
            var id = ids[i];

            // If calling this on button shape, get the id of the rich text panel inside instead
            var type = $obj(id).type;
            if(type != 'richTextPanel' && type != 'hyperlink') {
                id = $jobj(id).find('.text')[0].id;
            }

            var element = window.document.getElementById(id);
            $ax.visibility.SetVisible(element, value != '');

            $ax.style.transformTextWithVerticalAlignment(id, function() {
                var spans = $jobj(id).find('span');
                if(plain) {
                    // Wrap in span and p, style them accordingly.
                    var span = $('<span></span>');
                    if(spans.length > 0) {
                        span.attr('style', $(spans[0]).attr('style'));
                        span.attr('id', $(spans[0]).attr('id'));
                    }

                    // Can't set value as text because '<br>' doesn't actually do a line break
                    // Can't set vaule as html because it doesn't like '<' and="" ignores="" all="" after="" it="" create="" tags="" yourself="" var="" lines="value.split(/\r\n|\n/);" if(lines.length="=" 1)="" span.text(value);="" else="" {="" for(var="" i="0;" <="" lines.length;="" i++)="" if="" (i="" !="0)" span.append($('<br="">'));
                            var line = lines[i];
                            if(line.length == 0) continue;

                            var subSpan = $('<span>');
                            subSpan.text(line);
                            span.append(subSpan);
                        }
                    }

                    var p = $('<p></p>');
                    var ps = $jobj(id).find('p');
                    if(ps.length > 0) {
                        p.attr('style', $(ps[0]).attr('style'));
                        p.attr('id', $(ps[0]).attr('id'));
                    }
                    p.append(span);
                    finalValue = $('<div></div>').append(p).html();
                }

                element.innerHTML = finalValue;
            });

            if(!plain) $ax.style.CacheOriginalText(id, true);
        }
    };

    _exprFunctions.GetCheckState = function(ids) {
        return $ax('#' + ids[0]).selected();
    };

    _exprFunctions.GetSelectedOption = function (ids) {
        var inputs = $jobj($ax.INPUT(ids[0]));
        return inputs.length ? inputs[0].value : '';
    };

    _exprFunctions.GetNum = function(str) {
        //Setting a GlobalVariable to some blank text then setting a widget to the value of that variable would result in 0 not ""
        //I have fixed this another way so commenting this should be fine now
        //if (!str) return "";
        return isNaN(str) ? str : Number(str);
    };

    _exprFunctions.GetGlobalVariableValue = function(id) {
        return $ax.globalVariableProvider.getVariableValue(id);
    };

    _exprFunctions.GetGlobalVariableLength = function(id) {
        return _exprFunctions.GetGlobalVariableValue(id).length;
    };

    _exprFunctions.GetWidgetText = function(ids) {
        if($ax.placeholderManager.isActive(ids[0])) return '';
        var input = $ax.INPUT(ids[0]);
        return $ax('#' + ($jobj(input).length ? input : ids[0])).text();
    };

    _exprFunctions.GetFocusedWidgetText = function() {
        if(window.lastFocusedControl) {
            return $ax('#' + window.lastFocusedControl).text();
        } else {
            return "";
        }
    };

    _exprFunctions.GetWidgetValueLength = function(ids) {
        var id = ids[0];
        if(!id) return undefined;
        if($ax.placeholderManager.isActive(id)) return 0;
        var obj = $jobj($ax.INPUT(id));
        if(!obj.length) obj = $jobj(id);
        var val = obj[0].value || _exprFunctions.GetWidgetText([id]);
        return val.length;
    };

    _exprFunctions.GetPanelState = function(ids) {
        var id = ids[0];
        if(!id) return undefined;
        var stateId = $ax.visibility.GetPanelState(id);
        return stateId && String($jobj(stateId).data('label'));
    };

    _exprFunctions.GetWidgetVisibility = function(ids) {
        var id = ids[0];
        if(!id) return undefined;
        return $ax.visibility.IsIdVisible(id);
    };

    // *****************  Validation Functions ***************** //

    _exprFunctions.IsValueAlpha = function(val) {
        var isAlphaRegex = new RegExp("^[a-z\\s]+$", "gi");
        return isAlphaRegex.test(val);
    };

    _exprFunctions.IsValueNumeric = function(val) {
        var isNumericRegex = new RegExp("^[0-9,\\.\\s]+$", "gi");
        return isNumericRegex.test(val);
    };

    _exprFunctions.IsValueAlphaNumeric = function(val) {
        var isAlphaNumericRegex = new RegExp("^[0-9a-z\\s]+$", "gi");
        return isAlphaNumericRegex.test(val);
    };

    _exprFunctions.IsValueOneOf = function(val, values) {
        for(var i = 0; i < values.length; i++) {
            var option = values[i];
            if(val == option) return true;
        }
        //by default, return false
        return false;
    };

    _exprFunctions.IsValueNotAlpha = function(val) {
        return !_exprFunctions.IsValueAlpha(val);
    };

    _exprFunctions.IsValueNotNumeric = function(val) {
        return !_exprFunctions.IsValueNumeric(val);
    };

    _exprFunctions.IsValueNotAlphaNumeric = function(val) {
        return !_exprFunctions.IsValueAlphaNumeric(val);
    };

    _exprFunctions.IsValueNotOneOf = function(val, values) {
        return !_exprFunctions.IsValueOneOf(val, values);
    };

    _exprFunctions.GetKeyPressed = function(eventInfo) {
        return eventInfo.keyInfo;
    };

    _exprFunctions.GetCursorRectangles = function() {
        var rects = new Object();
        rects.lastRect = new $ax.drag.Rectangle($ax.lastMouseLocation.x, $ax.lastMouseLocation.y, 1, 1);
        rects.currentRect = new $ax.drag.Rectangle($ax.mouseLocation.x, $ax.mouseLocation.y, 1, 1);
        return rects;
    };

    _exprFunctions.GetWidgetRectangles = function (elementIds, eventInfo) {
        var elementId = elementIds[0];
        var rects = new Object();
        var jObj = $jobj(elementId);
        var axObj = $ax('#' + elementId);
        var invalid = jObj.length == 0;
        var parent = jObj;
        // Or are in valid if no obj can be found, or if it is not visible.
        while(parent.length != 0 && !parent.is('body')) {
            if(parent.css('display') == 'none') {
                invalid = true;
                break;
            }
            parent = parent.parent();
        }
        if(invalid) {
            rects.lastRect = rects.currentRect = new $ax.drag.Rectangle(-1, -1, -1, -1);
            return rects;
        }

        rects.lastRect = new $ax.drag.Rectangle(
                axObj.left(),
                axObj.top(),
                axObj.width(),
                axObj.height());

        rects.currentRect = rects.lastRect;
        return rects;
    };

    _exprFunctions.GetWidget = function(elementId) {
        return $ax.getWidgetInfo(elementId[0]);
    };

    _exprFunctions.GetAdaptiveView = function() {
        return $ax.adaptive.currentViewId || '';
    };

    _exprFunctions.IsEntering = function(movingRects, targetRects) {
        return !movingRects.lastRect.IntersectsWith(targetRects.currentRect) && movingRects.currentRect.IntersectsWith(targetRects.currentRect);
    };

    _exprFunctions.IsLeaving = function(movingRects, targetRects) {
        return movingRects.lastRect.IntersectsWith(targetRects.currentRect) && !movingRects.currentRect.IntersectsWith(targetRects.currentRect);
    };

    var _IsOver = _exprFunctions.IsOver = function(movingRects, targetRects) {
        return movingRects.currentRect.IntersectsWith(targetRects.currentRect);
    };

    _exprFunctions.IsNotOver = function(movingRects, targetRects) {
        return !_IsOver(movingRects, targetRects);
    };

    _exprFunctions.ValueContains = function(inputString, value) {
        return inputString.indexOf(value) > -1;
    };

    _exprFunctions.ValueNotContains = function(inputString, value) {
        return !_exprFunctions.ValueContains(inputString, value);
    };

    _exprFunctions.ToString = function(value) {
        if(value.isWidget) {
            return value.text;
        }
        return String(value);
    };

    var _evaluateExpr = $ax.expr.evaluateExpr = function(expr, eventInfo, toString) {
        if(expr === undefined || expr === null) return undefined;
        var result = _exprHandlers[expr.exprType](expr, eventInfo);
        return toString ? _exprFunctions.ToString(result) : result;
    };


});</span></'></=':></':>