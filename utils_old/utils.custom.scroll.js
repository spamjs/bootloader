select_namespace("utils.custom.scroll", function(scroll){
	var scrollSet, linkedDivs, maxScroll,nowTop,maxTop,nowLeft,maxLeft;
	var $linkedScrollSet,$side,$bottom;
	var $linkedYDivs,$scrollDivY,$handleY,$YContent;
	var $linkedXDivs,$scrollDivX,$handleX,$XContent;
	
	scroll.init = function(){
		$("body").delegate('.linkedScrollSetY,.linkedScrollSetX', 'mouseenter', function(e){
			$(this).customScroll();
		});
		$("body").delegate('.linkedScrollSetY,.linkedScrollSetX', 'mouseleave', function(e){
			//$(this).customScroll();
		});
		$("body").delegate('.linkedScrollSetY .scrollDivY,.linkedScrollSetX .scrollDivX', 'click', function(e){
			//$(this).customScroll();
			var $draggableBlock = $(this).parents('.draggableBlock');
			var $target = $(".handle",$draggableBlock);
			$draggableBlock[0].ondragstart(e)
			utils.custom.drag.to($target,e);
		});
	};
	
	$.fn.onWheel = function(_onWheel){
		if (window.addEventListener) {
			this[0].addEventListener('DOMMouseScroll', _onWheel, false);
			this[0].addEventListener('mousewheel', _onWheel, false);
		} else {
			var $this = this;
			document.attachEvent("onmousewheel", function(e){
				var e = e || window.event;
				if ($.contains($this[0], e.srcElement)) {
					$this._onWheel = _onWheel
					return $this._onWheel(e)
				}
			})
		}
	};
	$.fn.customScroll = function(options){
		$linkedScrollSet = $(this);
		var xScroll = false;
		var yScroll = false;
		
		if(this.hasClass("linkedScrollSetX")){
			$wrapperX = $('.sbwrapperX', $linkedScrollSet)
			$bottom = $('.scrollBarX', $linkedScrollSet);
	      	$linkedXDivs = $('.linkedScrollDivX', $linkedScrollSet);
			$scrollDivX = $(".scrollDivX", $bottom);
			$handleX = $(".handle", $bottom);
			$XContent = $(".XContent", $scrollDivX);
			maxLeft = $XContent.width() - $scrollDivX.width();
			
			if (!this.data("has-scrollX")) {
				xScroll = this.customXScroll(options);
			} else
				xScroll = true;
			if(!$linkedXDivs.length) $wrapperX[0].style.display = 'none';
			else $wrapperX[0].style.display = 'block';
		}
		
        if(this.hasClass("linkedScrollSetY")){
        	$side = $('.scrollBarY', $linkedScrollSet);
        	$linkedYDivs = $('.linkedScrollDivY', $linkedScrollSet);
			$scrollDivY = $(".scrollDivY", $side);
			$handleY = $(".handle", $side);
			$YContent = $(".YContent", $scrollDivY);
			maxTop = $YContent.height() - $scrollDivY.height();
			
        	if (!this.data("has-scrollY")) {
        		yScroll = this.customYScroll(options)
        	} else
        		yScroll = true;
        }

		if (xScroll){
			scroll.resetLinkedScrollWidth(this, this.data("left"));
			scroll.resetXBarPosition();
		}
		if (yScroll){
			scroll.resetLinkedScrollHeight(this, this.data("top"));
			scroll.resetYBarPosition();
		}
		if (options){
			if(options.$div){
				var copyBoth = (options.adjust==undefined) || options.adjust;
				if(xScroll && (copyBoth==true || copyBoth=='x')) $scrollDivX[0].scrollLeft = options.scrollLeft || options.$div.scrollLeft();
				if(yScroll && (copyBoth==true || copyBoth=='y')) $scrollDivY[0].scrollTop = options.scrollTop || options.$div.scrollTop();
			} else if(options.scrollLeft){
				$scrollDivX[0].scrollLeft = options.scrollLeft;
			}
			if(options.onScrollEnd){
				this[0].onScrollEnd = options.onScrollEnd;
			}
			if(options.onScrollStop) this[0].onScrollStop = options.onScrollStop;
		}
	};
	
	$.fn.customYScroll = function(options){
		if ($side && $side.length) {
			this.data("has-scrollY", true).addClass('hasScrollY');
			var topPadding = this.attr('data-top');
			this.attr('top', (!topPadding) ? 0 : topPadding);

			$scrollDivY.scroll(function(e){
				if($linkedScrollSet && $linkedYDivs){
					nowTop = e.target.scrollTop;
					$linkedYDivs.scrollTop(nowTop);
					scroll.resetYBarPosition();
					scroll.onYScroll($linkedScrollSet,{ nowTop : nowTop ,maxTop : maxTop});
				}
			});
			$side[0].ondragstart = function(e){
				if($linkedScrollSet && $YContent && $scrollDivY){
					maxScroll = $YContent.height() - $scrollDivY.height();
					(maxScroll<0) && (maxScroll=0) 
				}
			};
			$side[0].ondrag = function(e){
				if ($linkedScrollSet && $linkedYDivs){
					nowTop = maxScroll * e.top / e.maxTop;
					$scrollDivY.scrollTop(nowTop)
					//$linkedYDivs.scrollTop(nowTop);
					//scroll.onYScroll($linkedScrollSet,{ nowTop : nowTop ,maxTop : maxTop});
				}
			};
			$side[0].ondragend = function(e){
				scrollSet = null;
				linkedDivs = null;
				maxScroll = 0;
			};
			this.onWheel(function(wE){
				var delta = 1;
				if (wE.wheelDelta) {
					delta = -wE.wheelDelta / 120;
				}
				if (wE.detail) {
					delta = wE.detail / 3;
				}
				var curscrTop = $scrollDivY.scrollTop();
				var diff =  curscrTop + delta * 20;
				var nowDIFF = $scrollDivY.scrollTop(diff).scrollTop();;
				if(nowDIFF!=curscrTop){
					return utils.preventPropagation(wE);
				}
			});
			return true;
		} return false;
	};
	
	$.fn.customXScroll = function(options){
		if ($bottom.length) {
			this.data("has-scrollX", true).addClass('hasScrollX');
			var leftPadding = this.attr('data-left');
			this.attr('left', (!leftPadding) ? 0 : leftPadding);
			$scrollDivX.scroll(function(e){
				if($linkedScrollSet && $linkedXDivs){
					nowLeft = e.target.scrollLeft;
					$linkedXDivs.scrollLeft(nowLeft);
					scroll.resetXBarPosition();
					scroll.onXScroll($linkedScrollSet,{ nowLeft : nowLeft ,maxLeft : nowLeft});
				}
			});
			$bottom[0].ondragstart = function(e){
				if($linkedScrollSet && $XContent && $scrollDivX){
					maxScroll = $XContent.width() - $scrollDivX.width();
					(maxScroll<0) && (maxScroll=0) 
				}
			};
			$bottom[0].ondrag = function(e){
				if ($linkedScrollSet && $linkedXDivs){
					nowLeft = maxScroll * e.left / e.maxLeft;
					//$linkedXDivs.scrollLeft(nowLeft);
					$scrollDivX.scrollLeft(nowLeft);
					//scroll.onXScroll($linkedScrollSet,{ nowLeft : nowLeft ,maxLeft : nowLeft});
				}
			};
			$bottom[0].ondragend = function(e){
				scrollSet = null;
				linkedDivs = null;
				maxScroll = 0;
			};
			return true;
		} return false;
	};
	
	scroll.resetYBarPosition = function(){
		if($handleY && $side && $YContent && $scrollDivY){
			$handleY.css('top', ($side.height() - $handleY.height()) * $scrollDivY.scrollTop()
					/ ($YContent.height() - $scrollDivY.height()));
		}
	};
	scroll.resetXBarPosition = function(){
		if($handleX && $bottom && $XContent && $scrollDivX){
			$handleX.css('left', ($bottom.width() - $handleX.width()) * $scrollDivX.scrollLeft()
					/ ($XContent.width() - $scrollDivX.width()));
		}
	};
	scroll.resetLinkedScrollWidth = function($this, leftPadding){
		var leftPadding = leftPadding ? leftPadding : 0;
		var $parent = $this;
		var $linked = $(".linkedScrollDivX", $parent);
		var _$scrollDivX = $('.scrollDivX', $this);
		var mxHt = _$scrollDivX.width() - leftPadding;
		var _mxHt = 0;
		var _top = 0;

		$linked.each(function(i, elem){
			_mxHt = Math.max(_mxHt, elem.scrollWidth)
			_top = Math.max(_top, elem.scrollLeft)
		})
		$(".XContent", $parent).width(_mxHt - 0 + leftPadding);
		var barWidth = parseInt(Math.max((mxHt / _mxHt) * mxHt, 30));
		var __top = (mxHt - barWidth) * _top / (_mxHt - _mxHt)
		//if(mxHt<)
		
		$('.scrollBarX .draggable', $parent).css({
			width : barWidth + 'px', position : 'absolute', left : __top
		});
		return $parent;
	}
	scroll.resetLinkedScrollHeight = function($this, topPadding){
		var topPadding = topPadding ? topPadding : 0;
		var $parent = $this;
		var $linked = $(".linkedScrollDivY", $parent);
		var mxHt = $('.scrollDivY', $this).height() - topPadding;
		var _mxHt = 0;
		var _top = 0;

		$linked.each(function(i, elem){
			_mxHt = Math.max(_mxHt, elem.scrollHeight)
			_top = Math.max(_top, elem.scrollTop)
		})
		$(".YContent", $parent).height(_mxHt - 0 + topPadding);
		var barHeight = parseInt(Math.max((mxHt / _mxHt) * mxHt, 30));
		var __top = (mxHt - barHeight) * _top / (_mxHt - _mxHt)
		$('.scrollBarY .draggable', $parent).css({
			height : barHeight + 'px', position : 'absolute', top : __top
		});
		// .draggable',$this).height())
		return $parent;
	}
	
	scroll.onYScroll = function(_$ls,a){
		if($linkedScrollSet && $linkedScrollSet[0] && $linkedScrollSet[0].onScrollStop && $side){
			utils.executeOnce(function(screen,$ls){
				$linkedScrollSet[0].onScrollStop({
					top : $side[0].scrollTop,
					atTop : ((nowTop-1)<=0),
					atBottom : (maxTop<=(nowTop+1)),
					maxTop : maxTop
				})
				$side[0].scrollTop = nowTop
			})
		}
	};
	scroll.onXScroll = function(_$ls,a){
		if($linkedScrollSet && $linkedScrollSet[0] && $linkedScrollSet[0].onScrollStop && $bottom){
			utils.executeOnce(function(screen,$ls){
				$linkedScrollSet[0].onScrollStop({
					left : $bottom[0].scrollLeft,
					atLeft : ((nowLeft-1)<=0),
					atRight : (maxLeft<=(nowLeft+1)),
					maxLeft : maxLeft
				})
				$bottom[0].scrollLeft = nowLeft;
			})
		}
	};

	scroll.init2 = function(){

		$.fn.setLinkedScrollHeight = function(bottom, top, minHeight){
			var winHeight = $(window).height();
			var availHeight = winHeight - this.offset().top - bottom;
			var minHeight = this.css('min-height');
			this.height(availHeight).css("overflow", "hidden");
			if (minHeight != undefined) {
				minHeight = minHeight.replace('px') - top;
				$(".scrollor", this).height(availHeight - top).css('min-height', minHeight);
				$(".scrollBarHolder", this).css('bottom', availHeight - top);
			}
			return this;
		};
		$.fn.resetLinkedScrollHeight = function(searchParent){
			var $parent = this.hasClass('linkedScrollDiv') ? this : (searchParent ? this.parents(".linkedScrollDiv") : $(
					".linkedScrollDiv", this));
			var $linked = $(".linkedScroll", $parent);
			var mxHt = 0;
			$linked.each(function(i, elem){
				var _mxHt = $(elem).children().height();
				mxHt = (mxHt > _mxHt) ? mxHt : _mxHt;
			})
			$(".scrollholder", $parent).height(mxHt)
			return $parent;
		};
		$('body').delegate(".linkedScrollDiv", "mouseenter", function(e){
			var el = $(this);
			if (!el.data("has-wheel")) {
				el.resetLinkedScrollHeight();
				el.data("has-wheel", true);
				el.onWheel(function(wE){
					var delta = 1;
					if (wE.wheelDelta) {
						delta = -wE.wheelDelta / 120;
					}
					if (wE.detail) {
						delta = wE.detail / 3;
					}
					// scroll content
					var $handle = $(".scrollor", el);
					$handle.scrollTop($handle.scrollTop() + delta * 20);
					scroll.onscroll($handle, e);
					utils.preventPropagation(wE);
				});
			}
		});
		$('body').delegate(".scrollor", "mousedown", function(e){
			var el = $(this);
			scroll.onscroll(el, e);
		});
	};

	scroll.onscroll = function(el, e){
		if (!el.data("has-scroll")) {
			el.parents(".linkedScrollDiv").resetLinkedScrollHeight();
			el.data("has-scroll", true);
			el.scroll(function(){
				// utils.executeOnce(function(){
				var $parent = el.parents(".linkedScrollDiv");
				$('.linkedScroll', $parent).scrollTop(el.scrollTop());
				// })
			});
		}
	}
});
