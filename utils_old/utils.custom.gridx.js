select_namespace("utils.custom", function(custom){
	custom.grids = {};
	custom.defineGrid = function(name,fun){
		custom.grids[name] = custom.grids[name] || [];
		var gridDef = custom.grids[name];
		
		gridDef.from = function(from_name){
			for(var i in custom.grids[from_name]){
				this.push(custom.grids[from_name][i]);
			}
		};
		if(fun) gridDef.push(fun);
		return gridDef;
	};
	custom.getGrid = function(name,options){
		var GRID = options || {};
		for(var i in custom.grids[name]){
			custom.grids[name][i](GRID);
		}
		GRID.init();
		return GRID;
	}
});
utils.custom.defineGrid('bulkgrid',function(GRID){
	
	GRID.init = function(){
    	GRID.id = grid.manager.getID();
		var $table = GRID.$table = $('<table class="customGridTable" cellspacing='+
				GRID.cellspacing+' cellpadding='+GRID.cellpadding+'></table>');
		GRID.$header = null;
		GRID.$styleSheet = $('<style class="cssSheet"></style>');
		
		var totalRows = GRID.getRowCount();
		if(GRID.tabIndex==undefined) GRID.tabIndex = GRID.parent.attr("tabIndex");
		if(GRID.defaultColWidth !==undefined){
			utils.custom.css.add("#"+GRID.id+" th, #"+GRID.id+" td","width:" +GRID.defaultColWidth+"px;",undefined,GRID.$styleSheet);
		}
		console.log(GRID.hasHeaders, GRID.vertical)
		if(GRID.hasHeaders && GRID.vertical){
			var totalCols = GRID.getColCount();
			var $row_1 = $('<tr class="customGridRowHeader"></tr>');
			for(var j=0; j<totalCols; j++){
				$cell = grid.getHeaderCell(GRID,j);
				$row_1.append($cell.toString());
			} console.log($row_1);$table.append($row_1);
		} 
		if(GRID.hasHeaders || GRID.freezeHeader){
			GRID.$header = $('<table class="customGridTable" cellspacing='+GRID.cellspacing+' cellpadding='+GRID.cellpadding+'></table>');
		}
		
//		GRID.parent.empty();
//		var headerWidth = 0;
		var _strClass = "customGrid";
		GRID.$dataDiv = $('<div class="dataDiv block fl '+GRID.dataDivClass+'" style="'+GRID.dataDivStyle+'"></div>');
		GRID.parent.html(GRID.$dataDiv.append(GRID.$table)).append(GRID.$styleSheet);
		grid.setOnChange(GRID);
		if(GRID.$header){
			_str = "float:left";
			if(GRID.freezeHeader) {
				_strClass = _strClass + " headerFreeze";
				if(GRID.horizontal && GRID.snap){
					GRID.scrolAdjust = function(e){
						if(GRID.scrolAdjustable){
							if(false && !$.browser.msie){
								var $this = GRID.$dataDiv[0];
								$this.scrollLeft = Math.round($this.scrollLeft/GRID.snap)*GRID.snap-0+1;
							}
							if(GRID.onScroll) GRID.onScroll(e);
						} GRID.scrolAdjustable = false;
					}
					GRID.$dataDiv[0].onscroll = function(e){
						//return utils.preventPropagation (e);
						if(!GRID.scrolAdjustable){
							GRID.scrolAdjustable = true;
							//setTimeout(GRID.scrolAdjust,0)
							GRID.scrolAdjust(e);
						}
					}
				} else if(!GRID.horizontal){
					GRID.$header.append($(".customGridRowHeader",GRID.$table));
					if(GRID.dataHeight!==undefined){
						GRID.$dataDiv.height(GRID.dataHeight).css('overflow','auto');
					}
				}
			}
			GRID.$headerDiv = $('<div class="headerDiv fl" style="'+_str+'"></div>');
			GRID.parent.prepend(GRID.$headerDiv .append(GRID.$header));
			//var headerWidth = $headerDiv.width();
			//$headerDiv.width(headerWidth);
			//$dataDiv.css("margin-left",headerWidth)
			if(!GRID.horizontal){
				GRID.$headerDiv.width("100%");
				GRID.$dataDiv.css('width',"100%");
			}
		}
		_strClass = _strClass + ((GRID.vertical)? " alignY" : " alignX");
		GRID.parent.addClass(_strClass).attr('id',GRID.id);
		
		for(var i=0; i<totalRows; i++){
			grid.addRow(GRID,i);
		}
		if(GRID.onHeaderClick) $table.delegate(".customGridRowHeader td", "click", function(e){
			e.$cell = $(this);
			GRID.onHeaderClick(e);
		});
		if(GRID.onKeyUp) $table.delegate(".customGridCell .tag", "keyup", function(e){
			e.$widget = $(this);
			GRID.onKeyUp(e);
		});
		if(GRID.actions){
			$(".headerDiv,.dataDiv",GRID.parent).delegate(".action", "click", function(e){
				var $this = $(this);
				e.action = $this.attr('action') || $this.attr('name');
				e.$widget = $this.parent('.tag');
				e.iCol = e.$widget.attr('iCol');
				e.iRow = e.$widget.attr('iRow');
				e.fieldType = e.$widget.attr('fieldType');
				GRID.cb = GRID.actions[e.action];
				if(GRID.cb) GRID.cb(e);
			});
		} 
		if(GRID.navigate){
			grid.refresh(GRID);
		}
		GRID.$tables = GRID.parent;
		if(GRID.resizable){
			$table.colResizable(GRID.resizable);
		}
		return GRID;
	}
	
})
