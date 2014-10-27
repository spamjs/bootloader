select_namespace("utils.custom.drag", function(drag){

	var isDragMouseDown = false;
	var dragX = true;
	var dragY = true;
	var maxTop = 0;
	var maxLeft = 0;
	var dragHeight = 0;
	var dragWidth = 0;
	var onDrag = null;
	var dragPos = null;

	var isResizeMouseDown = false;

	// to track the current element being dragged
	var currentElement = null;
	var currentBlock = null;
	var $target = null;
	var target

	// global position records
	var lastMouseX;
	var lastMouseY;
	var lastElemTop;
	var lastElemLeft;
	var lastElemWidth;
	var lastElemHeight;
	

	drag.init = function(){
		$("body").bind('mousemove', drag.mousemove);
		$("body").delegate('.draggableBlock', 'mousedown', drag.mousedown);
		$("body").bind('mouseup', drag.mouseup);
		$("body").bind('mouseleave', drag.mouseup);
	};
	drag.mousemove = function(e){
		if (isDragMouseDown) {
			dragPos = updatePosition(e, {});
			if (currentBlock && currentBlock.ondrag) {
				currentBlock.ondrag(dragPos, e);
				// currentBlock.onelementdrag(pos,e)
			}
			return false;
		}
	};
	drag.mouseup = function(e){
		if (isDragMouseDown) {
			isDragMouseDown = false;
			if (currentBlock && currentBlock.ondragend) {
				currentBlock.ondragend(dragPos, e);
			}
			currentElement = null;
			currentBlock = null;
			onDrag = null
			//$target = null;
//			/target = null;
		}
	};
	drag.mousedown = function(e){
		$target = $(e.target);
		if ($target.hasClass('handle')) {
			target = e.target;// $(e.target).parents('.draggable')[0];
			currentElement = $target.hasClass('draggable') ? target : $target.parents('.draggable')[0];
			currentBlock = this;
			
			isDragMouseDown = true;
			updateDirections(e);
			updateMaxOfset(e);
			var pos = getMousePosition(e);
			lastMouseX = pos.x;
			lastMouseY = pos.y;
			
			updateLastOfset(e);
			dragPos = updatePosition(e, {});
			if (currentBlock && currentBlock.ondragstart) {
				currentBlock.ondragstart(dragPos, e);
			}
		}
		return false;
	};
	
	drag.to = function($handle,e){
		var $draggableBlock = $handle.parents('.draggableBlock');
		
		$target = $handle;
		target = $handle[0]; // { target : $target[0] }
		currentElement = $target.hasClass('draggable') ? target : $target.parents('.draggable')[0];
		currentBlock = $draggableBlock[0];
		
		isDragMouseDown = true;
		updateDirections(e);
		updateMaxOfset(e);
		
		updateLastOfset(e);
		var pos = getMousePosition(e);
		lastMouseX =currentBlock.offsetLeft + lastElemLeft-0+$target.width()/2;
		lastMouseY = currentBlock.offsetTop  + lastElemTop-0+$target.height()/2;
		
		// 322 490 210 = 42,
		// 289 255 210 = 244
		
//		dragPos = updatePosition(e, {});
//		if (currentBlock && currentBlock.ondragstart) {
//			currentBlock.ondragstart(dragPos, e);
//		}
		///currentElement.dragend
		drag.mousemove(e)
		drag.mouseup(e);
		//drag.mousedown(e);
	};
	
	var updateDirections = function(e){
		dragX = $target.hasClass('dragX');
		dragY = $target.hasClass('dragY');
		if (!(dragX || dragY)) {
			dragY = true;
			dragX = true;
		}
	}
	var updateLastOfset = function(e){
		lastElemLeft = target.offsetLeft;
		lastElemTop = target.offsetTop;
	}
	var updateMaxOfset = function(e){
		if (dragY) {
			if (currentBlock.scrollTopMax)
				maxTop = currentBlock.scrollHeight - currentBlock.scrollTopMax - target.scrollHeight;
			else
				maxTop = $(currentBlock).height() - $target.height();
		}
		if (dragX) {
			if (this.scrollLeftMax)
				maxLeft = currentBlock.scrollWidth - currentBlock.scrollLeftMax - target.scrollWidth;
			else
				maxLeft = $(currentBlock).width() - $target.width();
		}
	}
	
	// returns the mouse (cursor) current position
	var getMousePosition = function(e){
		if (e.pageX || e.pageY) {
			var posx = e.pageX;
			var posy = e.pageY;
		} else if (e.clientX || e.clientY) {
			var posx = e.clientX
			var posy = e.clientY
		}
		return {
			'x' : posx, 'y' : posy
		};
	};

	var offset_snap_grip = function(grid, size){
		var limit = grid / 2;
		if ((size % grid) > limit) {
			return grid - (size % grid);
		} else {
			return -size % grid;
		}
	}

	// updates the position of the current element being dragged
	var updatePosition = function(e, opts){
		var pos = getMousePosition(e);

		pos.left = (pos.x - lastMouseX) + lastElemLeft;
		pos.top = (pos.y - lastMouseY) + lastElemTop;
		if (pos.top < 0)
			pos.top = 0;
		if (pos.left < 0)
			pos.left = 0;

		if ($(currentElement).hasClass('snap-to-grid')) {
			pos.left = pos.left + offset_snap_grip(opts.grid, pos.left)
			pos.top = pos.top + offset_snap_grip(opts.grid, pos.top)
		}
		pos.maxTop = maxTop;
		if (pos.top > maxTop)
			pos.top = maxTop;
		pos.maxLeft = maxLeft;
		if (pos.left > maxLeft)
			pos.left = maxLeft;

		if (dragY)
			currentElement.style['top'] = pos.top + 'px';
		if (dragX)
			currentElement.style['left'] = pos.left + 'px';
		
		
		return pos;
	};

	
	
	
//	var updateSize = function(e, opts){
//		var pos = getMousePosition(e);
//
//		var _width = (pos.x - lastMouseX + lastElemWidth);
//		var _height = (pos.y - lastMouseY + lastElemHeight);
//
//		if (_width < 50)
//			_width = 50;
//		if (_height < 50)
//			_height = 50;
//
//		var __width = _width;
//		var __height = _height;
//		if ($(currentElement).hasClass('snap-to-grid')) {
//			_width = _width + offset_snap_grip(opts.grid, _width)
//			_height = _height + offset_snap_grip(opts.grid, _height)
//		}
//
//		if (opts.sizeX) {
//			_width = _width + 'px';
//			if (currentElement.style['width'] != _width) {
//				currentElement.style['width'] = _width;
//				$(currentElement).change();
//			}
//		}
//		if (opts.sizeY)
//			currentElement.style['height'] = _height + 'px';
//	};
	
	

	// set children of an element as draggable and resizable
//	$.fn.dragResize = function(opts){
//
//		if (opts.size == 'x')
//			opts.sizeX = true;
//		else if (opts.size == 'y')
//			opts.sizeY = true;
//		else {
//			opts.sizeX = true;
//			opts.sizeY = true;
//		}
//
//		return this.each(function(){
//
//			// when the mouse is moved while the mouse button is pressed
//			$(this).mousemove(function(e){
//				if (isDragMouseDown) {
//					updatePosition(e, opts);
//					return false;
//				} else if (isResizeMouseDown) {
//					updateSize(e, opts);
//					return false;
//				}
//			});
//
//			// when the mouse button is released
//			$(this).mouseup(function(e){
//				isDragMouseDown = false;
//				isResizeMouseDown = false;
//			});
//
//			// when an element receives a mouse press
//			$(this).mousedown(function(e){
//
//				if ($(e.target).hasClass('handle')) {
//
//					var el = $(e.target).parents('.block')[0];
//
//					isDragMouseDown = true;
//					currentElement = el;
//
//					// retrieve positioning properties
//					var pos = getMousePosition(e);
//					lastMouseX = pos.x;
//					lastMouseY = pos.y;
//
//					lastElemLeft = el.offsetLeft;
//					lastElemTop = el.offsetTop;
//
//					updatePosition(e, opts);
//				}
//
//				if ($(e.target).hasClass('resize')) {
//					var el = $(e.target).parents('.block')[0];
//
//					isResizeMouseDown = true;
//					currentElement = el;
//
//					var pos = getMousePosition(e);
//					lastMouseX = pos.x;
//					lastMouseY = pos.y;
//
//					lastElemWidth = parseInt(el.style['width'], 10);
//					lastElemHeight = parseInt(el.style['height'], 10);
//
//					updateSize(e, opts);
//				}
//				return false;
//			});
//		});
//	};
});
