$axure.internal(function($ax) {
    var _move = {};
    $ax.move = _move;

    var widgetMoveInfo = {};
    var _getMoveInfo = $ax.move.RegisterMoveInfo = function (id, x, y, to, options, jobj) {
        var fixedInfo = jobj ? {} : $ax.dynamicPanelManager.getFixedInfo(id);

        var widget = $jobj(id);
        var query = $ax('#' + id);
        var isLayer = $ax.getTypeFromElementId(id) == $ax.constants.LAYER_TYPE;
        var rootLayer = _move.getRootLayer(id);

        if(rootLayer) {
            $ax.visibility.pushContainer(rootLayer, false);
            if(isLayer) widget = $ax.visibility.applyWidgetContainer(id, true);
        }
        if (!jobj) jobj = widget;

        var horzProp = 'left';
        var vertProp = 'top';
        var horzX = to ? x - query.locRelativeIgnoreLayer(false) : x;
        var vertY = to ? y - query.locRelativeIgnoreLayer(true) : y;

        if (fixedInfo.horizontal == 'right') {
            horzProp = 'right';
            horzX = to ? $(window).width() - x - Number(jobj.css('right').replace('px', '')) - query.width() : -x;
        } else if(fixedInfo.horizontal == 'center') {
            horzProp = 'margin-left';
            if (to) horzX = x - $(window).width() / 2;
        }

        if (fixedInfo.vertical == 'bottom') {
            vertProp = 'bottom';
            vertY = to ? $(window).height() - y - Number(jobj.css('bottom').replace('px', '')) - query.height() : -y;
        } else if (fixedInfo.vertical == 'middle') {
            vertProp = 'margin-top';
            if (to) vertY = y - $(window).height() / 2;
        }

        //todo currently this always save the info, which is not needed for compound vector children and maybe some other cases
        //let's optimize it later, only register if registerid is valid..
        widgetMoveInfo[id] = {
            x: horzX,
            y: vertY,
            options: options
        };

        return {
            horzX: horzX,
            vertY: vertY,
            horzProp: horzProp,
            vertProp: vertProp,
            rootLayer: rootLayer,
            jobj: jobj
        };
    };
    $ax.move.GetWidgetMoveInfo = function() {
        return $.extend({}, widgetMoveInfo);
    };

    _move.getRootLayer = function (id) {
        var isLayer = $ax.getTypeFromElementId(id) == $ax.constants.LAYER_TYPE;
        var rootLayer = isLayer ? id : '';

        var parentIds = $ax('#' + id).getParents(true, '*')[0];
        for(var i = 0; i < parentIds.length; i++) {
            var parentId = parentIds[i];
            // Keep climbing up layers until you hit a non-layer. At that point you have your root layer
            if($ax.public.fn.IsLayer($ax.getTypeFromElementId(parentId))) rootLayer = parentId;
            else break;
        }

        return rootLayer;
    };

    $ax.move.MoveWidget = function (id, x, y, options, to, animationCompleteCallback, shouldFire, jobj, moveInfo) {
        $ax.drag.LogMovedWidgetForDrag(id, options.dragInfo);

        if(!moveInfo) moveInfo = _getMoveInfo(id, x, y, to, options, jobj);

        jobj = moveInfo.jobj;

        _moveElement(id, options, animationCompleteCallback, shouldFire, jobj, moveInfo);

        $ax.event.raiseSyntheticEvent(id, "onMove");
        var object = $obj(id);
        if(object && $ax.public.fn.IsLayer(object.type)) {
            var childrenIds = $ax.public.fn.getLayerChildrenDeep(id, true);
            for(var i = 0; i < childrenIds.length; i++) $ax.event.raiseSyntheticEvent(childrenIds[i], 'onMove');
        }
    };

    var _moveElement = function (id, options, animationCompleteCallback, shouldFire,  jobj, moveInfo){
        var cssStyles = {};

        if(!$ax.dynamicPanelManager.isPercentWidthPanel($obj(id))) cssStyles[moveInfo.horzProp] = '+=' + moveInfo.horzX;
        cssStyles[moveInfo.vertProp] = '+=' + moveInfo.vertY;

        // I don't think root layer is necessary anymore after changes to layer container structure.
        //  Wait to try removing it until more stable.
        var rootLayer = moveInfo.rootLayer;

        var query = $addAll(jobj, id);
        if(options.easing == 'none') {
            query.animate(cssStyles, { duration: 0, queue: false });

            if(animationCompleteCallback) animationCompleteCallback();
            if(rootLayer) $ax.visibility.popContainer(rootLayer, false);
            //if this widget is inside a layer, we should just remove the layer from the queue
            if(shouldFire) $ax.action.fireAnimationFromQueue(id, $ax.action.queueTypes.move);
        } else {
            var completeCount = query.length;
            query.animate(cssStyles, {
                duration: options.duration, easing: options.easing, queue: false, complete: function () {
                    if (animationCompleteCallback) animationCompleteCallback();
                    completeCount--;
                    if(completeCount == 0 && rootLayer) $ax.visibility.popContainer(rootLayer, false);
                    if(shouldFire) $ax.action.fireAnimationFromQueue(id, $ax.action.queueTypes.move);
                }});
        }

        //        //moveinfo is used for moving 'with this'
        //        var moveInfo = new Object();
        //        moveInfo.x = horzX;
        //        moveInfo.y = vertY;
        //        moveInfo.options = options;
        //        widgetMoveInfo[id] = moveInfo;


    };

    _move.nopMove = function(id, options) {
        var moveInfo = new Object();
        moveInfo.x = 0;
        moveInfo.y = 0;
        moveInfo.options = {};
        moveInfo.options.easing = 'none';
        moveInfo.options.duration = 0;
        widgetMoveInfo[id] = moveInfo;

        // Layer move using container now.
        var obj = $obj(id);
        if($ax.public.fn.IsLayer(obj.type)) if(options.onComplete) options.onComplete();

        $ax.event.raiseSyntheticEvent(id, "onMove");
    };

    //rotationDegree: total degree to rotate
    //centerPoint: the center of the circular path


    var _noRotateOnlyMove = function (id, moveDelta, rotatableMove, fireAnimationQueue, easing, duration, completionCallback) {
        moveDelta.x += rotatableMove.x;
        moveDelta.y += rotatableMove.y;
        if (moveDelta.x == 0 && moveDelta.y == 0) {
            if(fireAnimationQueue) {
                $ax.action.fireAnimationFromQueue(id, $ax.action.queueTypes.rotate);
                $ax.action.fireAnimationFromQueue(id, $ax.action.queueTypes.move);
            }
        } else {
            $jobj(id).animate({ top: '+=' + moveDelta.y, left: '+=' + moveDelta.x }, {
                duration: duration,
                easing: easing,
                queue: false,
                complete: function () {
                    if(fireAnimationQueue) {
                        $ax.action.fireAnimationFromQueue(id, $ax.action.queueTypes.move);
                        $ax.action.fireAnimationFromQueue(id, $ax.action.queueTypes.rotate);
                    }
                    if (completionCallback) completionCallback();
                }
            });
        }
    }


    _move.circularMove = function (id, degreeDelta, centerPoint, moveDelta, rotatableMove, resizeOffset, options, fireAnimationQueue, completionCallback) {
        var elem = $jobj(id);
        var moveInfo = $ax.move.RegisterMoveInfo(id, moveDelta.x, moveDelta.y, false, options);
        // If not rotating, still need to check moveDelta and may need to handle that.
        if (degreeDelta === 0) {
            _noRotateOnlyMove(id, moveDelta, rotatableMove, fireAnimationQueue, options.easing, options.duration, completionCallback);
            return;
        }

        var stepFunc = function(newDegree) {
            var deg = newDegree - rotation.degree;
            var widgetCenter = $ax.public.fn.getWidgetBoundingRect(id).centerPoint;
            //console.log("widget center of " + id + " x " + widgetCenter.x + " y " + widgetCenter.y);
            var widgetNewCenter = $axure.fn.getPointAfterRotate(deg, widgetCenter, centerPoint);

            // Start by getting the move not related to rotation, and make sure to update center point to move with it.
            var ratio = deg / degreeDelta;

            var xdelta = (moveDelta.x + rotatableMove.x) * ratio;
            var ydelta = (moveDelta.y + rotatableMove.y) * ratio;
            if(resizeOffset) {
                var resizeShift = {};
                resizeShift.x = resizeOffset.x * ratio;
                resizeShift.y = resizeOffset.y * ratio;
                $axure.fn.getPointAfterRotate(rotation.degree, resizeShift, { x: 0, y: 0 });
                xdelta += resizeShift.x;
                ydelta += resizeShift.y;
            }
            centerPoint.x += xdelta;
            centerPoint.y += ydelta;

            // Now for the move that is rotatable, it must be rotated
            rotatableMove = $axure.fn.getPointAfterRotate(deg, rotatableMove, { x: 0, y: 0 });

            // Now add in circular move to the mix.
            xdelta += widgetNewCenter.x - widgetCenter.x;
            ydelta += widgetNewCenter.y - widgetCenter.y;

            if(xdelta < 0) elem.css('left', '-=' + -xdelta);
            else if(xdelta > 0) elem.css('left', '+=' + xdelta);

            if(ydelta < 0) elem.css('top', '-=' + -ydelta);
            else if(ydelta > 0) elem.css('top', '+=' + ydelta);
        };

        var onComplete = function() {
            if(fireAnimationQueue) $ax.action.fireAnimationFromQueue(id, $ax.action.queueTypes.move);
            if(completionCallback) completionCallback();
            if(moveInfo.rootLayer) $ax.visibility.popContainer(moveInfo.rootLayer, false);
            var isPercentWidthPanel = $ax.dynamicPanelManager.isPercentWidthPanel($obj(id));
            if(isPercentWidthPanel) {
                $ax.dynamicPanelManager.updatePanelPercentWidth(id);
                $ax.dynamicPanelManager.updatePanelContentPercentWidth(id);
            }
            if(elem.css('position') == 'fixed') {
                if(!isPercentWidthPanel) elem.css('left', '');
                elem.css('top', '');
            }
        };

        var rotation = { degree: 0 };

        if(!options.easing || options.easing === 'none' || options.duration <= 0="" 8="" 0)="" {="" stepfunc(degreedelta);="" oncomplete();="" }="" else="" $(rotation).animate({="" degree:="" degreedelta="" },="" duration:="" options.duration,="" easing:="" options.easing,="" queue:="" false,="" step:="" stepfunc,="" complete:="" oncomplete="" });="" };="" rotate="" a="" widget="" by="" degree,="" center="" is="" 50%="" _move.rotate="function" (id,="" easing,="" duration,="" to,="" shouldfire,="" completioncallback)="" var="" currentdegree="_getRotationDegree(id);" if(to)="" degree="degree" -="" currentdegree;="" if(degree="==" if="" (shouldfire)="" $ax.action.fireanimationfromqueue(id,="" $ax.action.queuetypes.rotate);="" return;="" query="$jobj(id).add($jobj(id" +="" '_ann')).add($jobj(id="" '_ref'));="" stepfunc="function(now)" rotation.degree;="" newdegree="currentDegree" degreedelta;="" query.css($ax.public.fn.settransformhowever("rotate("="" "deg)"));="" if(shouldfire)="" $ax.action.fireanimationfromqueue($ax.public.fn.compoundidfromcomponent(id),="" if(completioncallback)="" completioncallback();="" rotation="{" no="" animation,="" setting="" duration="" to="" 1,="" prevent="" rangeerror="" in="" loops="" without="" animation="" if(!easing="" ||="" easing="==" 'none'="" <="0)" stepfunc(degree);="" _move.compoundrotatearound="function" degreedelta,="" centerpoint,="" movedelta,="" rotatablemove,="" resizeoffset,="" fireanimationqueue,="" (degreedelta="==" _norotateonlymove($ax.public.fn.compoundidfromcomponent(id),="" completioncallback,="" elem="$jobj(id);" (!easing="" ;="" it="" doesn't="" matter="" anymore="" here...="" originalwidth="Number(elem.css('width').replace('px'," ''));="" originalheight="Number(elem.css('height').replace('px'," originalleft="Number(elem.css('left').replace('px'," originaltop="Number(elem.css('top').replace('px'," function="" (newdegree)="" transform="$ax.public.fn.transformFromElement(elem[0]);" originalcenter="{" x:="" 0.5="" *="" originalwidth,="" y:="" originalheight};="" componentcenter="{" originalcenter.x="" transform[4],="" originalcenter.y="" transform[5]="" deg="newDegree" ratio="deg" xdelta="(moveDelta.x" rotatablemove.x)="" ratio;="" ydelta="(moveDelta.y" rotatablemove.y)="" (resizeoffset)="" resizeshift="{};" resizeshift.x="resizeOffset.x" resizeshift.y="resizeOffset.y" $axure.fn.getpointafterrotate(rotation.degree,="" resizeshift,="" 0,="" rotationmatrix="$ax.public.fn.rotationMatrix(deg);" compositiontransform="$ax.public.fn.matrixMultiplyMatrix(rotationMatrix," m11:="" transform[0],="" m21:="" transform[1],="" m12:="" transform[2],="" m22:="" transform[3]="" console.log("widget="" of="" "="" id="" x="" widgetcenter.x="" y="" widgetcenter.y);="" widgetnewcenter="$axure.fn.getPointAfterRotate(deg," componentcenter,="" centerpoint);="" newmatrix="$ax.public.fn.matrixString(compositionTransform.m11," compositiontransform.m21,="" compositiontransform.m12,="" compositiontransform.m22,="" widgetnewcenter.x="" xdelta,="" widgetnewcenter.y="" ydelta);="" elem.css($ax.public.fn.settransformhowever(newmatrix));="" ()="" (fireanimationqueue)="" $ax.action.fireanimationfromqueue(elem.parent()[0].id,="" _getrotationdegree="_move.getRotationDegree" =="" function(elementid)="" if($ax.public.fn.islayer($obj(elementid).type))="" return="" $jobj(elementid).data('layerdegree');="" element="document.getElementById(elementId);" if(element="=" null)="" nan;="" transformstring="element.style.transform" element.style.otransform="" element.style.mstransform="" element.style.moztransform="" element.style.webkittransform;="" element.style['-o-transform']="" element.style['-ms-transform']="" element.style['-moz-transform']="" element.style['-webkit-transform'];="" if(transformstring)="" rotateregex="/rotate\(([-?0-9]+)deg\)/;" degreematch="rotateRegex.exec(transformString);" if(degreematch="" &&="" degreematch[1])="" parsefloat(degreematch[1]);="" if(window.getcomputedstyle)="" st="window.getComputedStyle(element," null);="" console.log('rotation="" not="" supported="" for="" ie="" and="" below="" this="" version="" axure="" rp');="" 0;="" tr="st.getPropertyValue("transform")" st.getpropertyvalue("-o-transform")="" st.getpropertyvalue("-ms-transform")="" st.getpropertyvalue("-moz-transform")="" st.getpropertyvalue("-webkit-transform");="" if(!tr="" 'none')="" values="tr.split('(')[1];" b="values[1];" radians="Math.atan2(b," a);="" if(radians="" math.pi);="" angle="Math.round(radians" (180="" math.pi));="" angle;="" generatefilter="function(deg)" rot,="" cos,="" sin,="" matrix;="" rot="deg">=0 ? Math.PI*deg/180 : Math.PI*(360+deg)/180;
//        cos=Math.cos(rot);
//        sin=Math.sin(rot);
//        matrix='M11='+cos+',M12='+(-sin)+',M21='+sin+',M22='+cos+',SizingMethod="auto expand"';
//        return 'progid:DXImageTransform.Microsoft.Matrix('+matrix+')';
//    }
});</=>