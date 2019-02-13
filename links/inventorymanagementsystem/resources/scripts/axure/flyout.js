// ******* Flyout MANAGER ******** //
$axure.internal(function($ax) {
    var _flyoutManager = $ax.flyoutManager = {};

    var getFlyoutLabel = function(panelId) {
        return panelId + '_flyout';
    };

    var _unregisterPanel = function(panelId, keepShown) {
        $ax.geometry.unregister(getFlyoutLabel(panelId));
        if(panelToSrc[panelId]) {
            $ax.style.RemoveRolloverOverride(panelToSrc[panelId]);
            delete panelToSrc[panelId];
        }
        if(!keepShown) {
            $ax.action.addAnimation(panelId, $ax.action.queueTypes.fade, function() {
                $ax('#' + panelId).hide();
            });
        }
    };
    _flyoutManager.unregisterPanel = _unregisterPanel;

    var genPoint = $ax.geometry.genPoint;

    var _updateFlyout = function(panelId) {
        var label = getFlyoutLabel(panelId);
        if(!$ax.geometry.polygonRegistered(label)) return;
        var info = $ax.geometry.getPolygonInfo(label);
        var rects = info && info.rects;

        var targetWidget = $ax.getWidgetInfo(panelId);
        rects.target = $ax.geometry.genRect(targetWidget);

        // Src will stay the same, just updating
        $ax.flyoutManager.registerFlyout(rects, panelId, panelToSrc[panelId]);

        if(!$ax.geometry.checkInsideRegion(label)) _unregisterPanel(panelId);
    };
    _flyoutManager.updateFlyout = _updateFlyout;

    var panelToSrc = {};
    var _registerFlyout = function(rects, panelId, srcId) {
        var label = _getFlyoutLabel(panelId);
        var callback = function(info) {
            // If leaving object or already outside it, then unregister, otherwise just return
            if(!info.exiting && !info.outside) return;
            _unregisterPanel(panelId);
        };
        var points = [];

        var lastSrcId = panelToSrc[panelId];
        if(lastSrcId != srcId) {
            if(lastSrcId) $ax.style.RemoveRolloverOverride(lastSrcId);
            if(srcId) {
                $ax.style.AddRolloverOverride(srcId);
                panelToSrc[panelId] = srcId;
            } else delete panelToSrc[panelId];
        }

        // rects should be one or two rectangles
        if(!rects.src) {
            var rect = rects.target;
            points.push(genPoint(rect.Left(), rect.Top()));
            points.push(genPoint(rect.Right(), rect.Top()));
            points.push(genPoint(rect.Right(), rect.Bottom()));
            points.push(genPoint(rect.Left(), rect.Bottom()));
        } else {
            var r0 = rects.src;
            var r1 = rects.target;

            // Right left of right, left right of left, top below top, bottom above bottom
            var rlr = r0.Right() <= r1.right();="" var="" lrl="r0.Left()">= r1.Left();
            var tbt = r0.Top() >= r1.Top();
            var bab = r0.Bottom() <= r1.bottom();="" var="" info="{" rlr:="" rlr,="" lrl:="" lrl,="" tbt:="" tbt,="" bab:="" bab="" };="" if((rlr="" &&="" lrl)="" ||="" (tbt="" bab))="" {="" points="getSmallPolygon(r0," r1,="" info);="" }="" else="" $ax.geometry.registerpolygon(label,="" points,="" callback,="" rects:="" rects="" });="" _flyoutmanager.registerflyout="_registerFlyout;" _getflyoutlabel="function(panelId)" return="" panelid="" +="" '_flyout';="" _reregisterallflyouts="function()" for(var="" in="" paneltosrc)="" _reregisterflyout(panelid);="" _flyoutmanager.reregisterallflyouts="_reregisterAllFlyouts;" _reregisterflyout="function(panelId)" _registerflyout(rects,="" panelid,="" paneltosrc[panelid]);="" this="" is="" the="" reduced="" size="" polygon="" connecting="" r0="" to="" r1="" by="" means="" of="" horizontal="" or="" vertical="" lines.="" getsmallpolygon="function(r0," info)="" note:="" currently="" i="" make="" assumption="" that="" if="" lines="" from="" src="" hit="" target="" meaning="" horizontal,="" rlr="" and="" lrl="" are="" true,="" vertical,="" tbt="" true.="" r0left="r0.Left();" r0right="r0.Right();" r0top="r0.Top();" r0bottom="r0.Bottom();" r1left="r1.Left();" r1right="r1.Right();" r1top="r1.Top();" r1bottom="r1.Bottom();" points.push(genpoint(r1left,="" r1top));="" if(!info.tbt)="" points.push(genpoint(r0left,="" r0top));="" points.push(genpoint(r0right,="" points.push(genpoint(r1right,="" if(!info.rlr)="" r0bottom));="" r1bottom));="" if(!info.bab)="" if(!info.lrl)="" points;="" original="" algorithm="" connects="" most="" extream="" corners="" getlargepolygon="function(r0," top="" lefts="" if(info.tbt)="" if(info.lrl)="" rights="" if(info.rlr)="" bottom="" if(info.bab)="" *******="" placeholder="" manager="" *********="" $axure.internal(function($ax)="" _placeholdermanager="$ax.placeholderManager" =="" {};="" idtoplaceholderinfo="{};" _registerplaceholder="function(elementId," text,="" password)="" idtoplaceholderinfo[elementid]="{" text:="" password:="" password,="" active:="" false="" _placeholdermanager.registerplaceholder="_registerPlaceholder;" _placeholdermanager.refreshplaceholder="function" (elementid)="" (!info="" !info.active)="" return;="" $ax.style.setwidgetplaceholder(elementid,="" info.text,="" info.password);="" _updateplaceholder="function(elementId," active,="" cleartext)="" inputid="$ax.repeater.applySuffixToElementId(elementId," '_input');="" if(!info="" info.active="=" active)="" value="active" ?="" info.text="" :="" cleartext="" ''="" $jobj(inputid).val();="" value,="" _placeholdermanager.updateplaceholder="_updatePlaceholder;" _isactive="function(elementId)" boolean(info="" info.active);="" _placeholdermanager.isactive="_isActive;" _selectrange="function(elementId," start,="" end)="" $jobj(elementid).each(function()="" if(this.setselectionrange)="" validtypes="["text"," "search",="" "url",="" "tel",="" "password"];="" if(this.tagname.tolowercase()="" !="input" validtypes.indexof(this.type)=""> -1) {
                    this.focus();
                    this.setSelectionRange(start, end);
                }
            } else if(this.createTextRange) {
                var range = this.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            }
        });
    };
    _placeholderManager.selectRange = _selectRange;

    var _moveCaret = function(id, index) {
        var inputIndex = id.indexOf('_input');
        if(inputIndex == -1) return;
        var inputId = id.substring(0, inputIndex);

        if(!_isActive(inputId)) return;
        _selectRange(id, index, index);
    };
    _placeholderManager.moveCaret = _moveCaret;
});</=></=>