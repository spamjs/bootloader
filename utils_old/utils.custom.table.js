select_namespace("utils.custom.table", function(table){

//	table.init = function(){
//		utils.custom.css.add(
//				".customTable .dataDiv .dataTable .dataRow.unread td",
//				"font-weight:bold;", "customTable.unread");
//	};
	table.createStructure = function(TABLE){
		var structure = TABLE.structure;
		if(!structure){
			structure = [];
			TABLE.cMD = {key : [],display : [], selectedKey : []};
			if(TABLE.order && TABLE.structureMeta){
				var _structure = {};
				for(var i=0;i<TABLE.structureMeta.length;i++){
					var struct  = TABLE.structureMeta[i];
					if(struct){
						_structure[struct.fieldType] = struct;
						TABLE.cMD.key.push(struct.fieldType);
						TABLE.cMD.display.push(struct.title|| struct.header);
					}
				}
				for(var i=0;i<TABLE.order.length;i++){
					var fieldType  = TABLE.order[i];
					if(_structure[fieldType]) structure.push(_structure[fieldType]);
				}
				TABLE.cMD.selectedKey = TABLE.order;
			}
			TABLE.getColumnMetaData = function(){
				return this.cMD;
			}
		}
		return structure;
	};
	table.get = function(TABLE){
		TABLE.set = function(iTABLE){
			for(var i in iTABLE){
				this[i] = iTABLE[i];
			}
			this.parent.empty();
			return table.get(this);
		};
		TABLE.id = table.manager.getID();
		TABLE.$HEADER_TABLE = table.getTable("header",TABLE);
		TABLE.$DATA_TABLE = table.getTable('data',TABLE);
		TABLE.$HEADER_ROW = $(".headerRow",TABLE.$HEADER_TABLE);
		TABLE.$newUpdates = $('<div class="newUpdates dn" style="width:100%;text-align:center">New(<span>0</span>)</div>');
		TABLE.$updateCount = $("span",TABLE.$newUpdates);
		TABLE.updateCount = 0;
		TABLE.$FILTER_ROW = $(".filterRow",TABLE.$HEADER_TABLE);
		TABLE.$styleSheet = $('<style class="cssSheet"></style>');
		TABLE.structure = table.createStructure(TABLE);
		TABLE.resetStructure = function(){
			delete this.structure;
			this.structure = table.createStructure(this);
		}
		TABLE.TOTAL_COLS = TABLE.structure.length;
		TABLE.fieldTypeIndex = {};
		//TABLE.rowaction
		
		if(TABLE.freezeHeader==undefined) TABLE.freezeHeader = true;
			
		TABLE.getAction = function(action,text,actionclass,helpTEXT,shortcut){
			return '<span class="axn '+actionclass+' K_'+shortcut+'" action="'+action+'" title="'+helpTEXT+'" >'+text+'</span>'
		};
		if(TABLE.defaultColWidth && false){
			TABLE.cssIndex = utils.custom.css.add(
					"#"+TABLE.id+" td",
					"width:" +TABLE.defaultColWidth+"px;",
					TABLE.id+"defaultColumnWidth",TABLE.$styleSheet
			);
		}
		for(var i =0; i<TABLE.TOTAL_COLS; i++){
			var fieldType = TABLE.structure[i].fieldType;
			var dataAlign = TABLE.structure[i].dataAlign;
			if(!TABLE.structure[i].getAction) TABLE.structure[i].getAction = TABLE.getAction;
			TABLE.fieldTypeIndex[fieldType] = i;
			TABLE.$HEADER = $('<td class="block ft_'+ fieldType
			+' tt_'+ dataAlign +'" _fieldType="'+fieldType+'" style="height: 22px;"><div class="tdcell">'+TABLE.structure[i].header+'</div></td>');
			//var $DRG = $('<div class="resizeHolder resize" ></div>');
			TABLE.$HEADER.change(function(e){
				var _fieldType = $(this).attr("_fieldType");
				table.syncWidthOfFieldType(TABLE,_fieldType);
			});
			//TABLE.$HEADER.append($DRG);
			TABLE.$HEADER_ROW.append(TABLE.$HEADER);

			if(TABLE.structure[i].defaultWidth){
				table.setWidthOfFieldType(TABLE,fieldType,TABLE.structure[i].defaultWidth)
			} else if(TABLE.defaultColWidth) table.setWidthOfFieldType(TABLE,fieldType,TABLE.defaultColWidth);
			if(TABLE.structure[i].resizable){
				TABLE.$HEADER.addClass('resizableCol');
			}
			if(TABLE.structure[i].filter)
				TABLE.$FILTER_ROW.append('<td class="ft_'+ fieldType + '" _fieldType="'+TABLE.structure[i].fieldType+'" ><div class="tdcell"><input tabindex=0 class="filter input" type="text"></div></td>');
			else TABLE.$FILTER_ROW.append('<td class="ft_'+ fieldType + '" _fieldType="'+TABLE.structure[i].fieldType+'" ><div class=""></div></td>');

		}
		TABLE.$FILTER_ROW.addClass("dn");
		TABLE.$DATA_TABLE_DIV  = $('<div class="dataDiv"></div>');
		TABLE.$DATA_BOTTOM_DIV = $('<div class="tableBottom"></div>')
		if(!TABLE.$DATA_BOTTOM) TABLE.$DATA_BOTTOM = '';
		else {
			TABLE.$DATA_BOTTOM = $(TABLE.$DATA_BOTTOM);
			TABLE.$DATA_BOTTOM_DIV.append(TABLE.$DATA_BOTTOM);
			if(TABLE.onBottomClick) TABLE.$DATA_BOTTOM.click(function(e){
				TABLE.onBottomClick(e,this);
			});
		}
		
		TABLE.$DATA_TABLE_DIV.append(TABLE.$DATA_TABLE,TABLE.$DATA_BOTTOM_DIV)
		TABLE.parent.append(TABLE.$HEADER_TABLE,TABLE.$newUpdates,TABLE.$DATA_TABLE_DIV).addClass("customTable").attr('id',TABLE.id);
		TABLE.parent.append(TABLE.$styleSheet);
		
		if(TABLE.freezeHeader){
			TABLE.parent.addClass("headerFreeze");
			var $scrollWidth = TABLE.$HEADER_TABLE.width()-10;
			TABLE.onScrollTop = function(){
				setTimeout(function(){
					TABLE.$newUpdates.addClass('dn');
					TABLE.updateCount = 0;
					TABLE.$updateCount.text(0);
				},500);
				$("tr.prepend",TABLE.$DATA_TABLE_DIV).removeClass('prepend').addClass('alt');
			};
			TABLE.$newUpdates.click(function(e){
				TABLE.$DATA_TABLE_DIV.scrollTop(0);
				TABLE.onScrollTop(e,'top');
			});
		}
		if(TABLE.resizable){
			//table.setResizable(TABLE);
			TABLE.toSetResizable = true;
			TABLE.toSyncWidth = true;
		}
		table.resetSize(TABLE);
		table.initFunctions(TABLE);
		
		for(var j in TABLE.data){
			table.addRow(TABLE,TABLE.data[j]);
		}
		
		if(TABLE.filter){
			table.addFilter(TABLE);
		}
		if(TABLE.onReset) TABLE.onReset();
		if(TABLE.PARENT_DIV_CLASS) TABLE.parent.addClass(TABLE.PARENT_DIV_CLASS);
		if(TABLE.DATA_DIV_CLASS) TABLE.$DATA_TABLE_DIV.addClass(TABLE.DATA_DIV_CLASS);
		return TABLE;
	}
	table.setResizable = function(TABLE){
		if(!TABLE.freezeHeader) return;
		if(TABLE.$HEADER_TABLE.onResize){
			TABLE.$HEADER_TABLE.onResize();
		} else {
			if(TABLE.minColWidth==undefined) TABLE.minColWidth = 25;
			//TABLE.$HEADER_TABLE.dragResize({grid:20, size:'x'});
			var $header = $(".headerRow td.resizableCol",TABLE.$HEADER_TABLE);
			var $allheader = $("tr.headerRow",TABLE.$HEADER_TABLE);
			if(!$header.resizable){
				TABLE.resizable = false;
				return;
			}
			$header.resizable({
				handle : { e : "resizeHolder" },
				ghost : true,
				start : function(){
					$allheader.css('position','static');
				},
				stop : function(e){
					var _fieldType = $(this).attr("_fieldType");
					table.syncWidthOfFieldType(TABLE,_fieldType);
					table.adjustDataTableWidth(TABLE,e);
				}
			});
			TABLE.swapAllColumns = function(oldI,newI){
				var diff = newI-oldI;
				if(diff==0) return;
				var fun = (diff>0) ? 'after' : 'before';
				$("tr:not(.headerRow)",this.parent).each(function(i,elem){
					var $dragged  = $('td:eq('+oldI+')',elem);
					var $this  = $('td:eq('+newI+')',elem);
					$this[fun]($dragged);
				});
				var _order = [];
				$('td',$allheader).each(function(i,elem){
					_order.push($(elem).attr('_fieldtype'))
				});
				this.order =_order;
				this.resetStructure();
				if(this.onColumnOrderChange) this.onColumnOrderChange(this.order);
			}
			$allheader.sortable({
				helper : 'clone',  opacity : 0.8, appendTo : 'body',
				//placeholder: "sortable-placeholder" ,
				forceHelperSize: true,
				start : function(e,ui){
					var oldSection = $(this);//.parents('.headerRow');
					TABLE.oldIndex = ui.item.index();
				}, stop : function(e,ui){
					var newSection = $(this);
					TABLE.newIndex = ui.item.index();
					TABLE.swapAllColumns(TABLE.oldIndex,TABLE.newIndex)
				}
			});
		}
	};
	table.setWidthOfFieldType = function(TABLE,fieldType,width){
		var i = TABLE.fieldTypeIndex[fieldType];
		if(!TABLE.structure[i].cssIndex) TABLE.structure[i].cssIndex = TABLE.id+"_"+i
		TABLE.structure[i].cssIndex = utils.custom.css.add(
				"#"+TABLE.id+" td.ft_"+fieldType,
				"width:" +width+"px;",//max-width:"+width+"px;min-width:"+width+"px;",
				TABLE.structure[i].cssIndex,TABLE.$styleSheet
		);
	};
	table.syncWidthOfFieldType = function(TABLE,fieldType){
		var elem = $(".ft_"+fieldType,TABLE.$HEADER_TABLE);
		var width = $(elem).width();
		table.setWidthOfFieldType(TABLE,fieldType,width);
	};
	table.syncWidth = function(TABLE,reverse){
		if(!TABLE) return;
		if(TABLE.$HEADER_TABLE.is(":visible")){
			var left = 0.5;
			for(var i =0; i<TABLE.TOTAL_COLS; i++){
				var fieldType = TABLE.structure[i].fieldType;
				table.syncWidthOfFieldType(TABLE,fieldType);
			}
			TABLE.toSyncWidth = false;
		}
	}
	table.resetSize = function(TABLE){
		if(!TABLE) return;
		if(TABLE.freezeHeader) table.adjustDataTableWidth(TABLE);
		table.setResizable(TABLE);
		TABLE.toSyncWidth = true; 
	};
	table.adjustDataTableWidth = function(TABLE,e){
		if(!TABLE) return;
		if(TABLE.$HEADER_TABLE.is(":visible")){
			TABLE.$DATA_TABLE_DIV.width(TABLE.$HEADER_TABLE.width());
		}
	};
	table.deleteRow = function(TABLE,rowObj){
		var ROWID = ((TABLE.indexKey!=undefined) ? rowObj[TABLE.indexKey] : "NOROWID");
		TABLE.deleteRow(ROWID);
	};
	table.addRow = function(TABLE,rowObj,reverse){
		var fun = (reverse ? "prepend" : "append");
		var ROWID = ((TABLE.indexKey!=undefined) ? rowObj[TABLE.indexKey] : "NOROWID");
		var _fun = (TABLE.$DATA_TABLE_DIV.scrollTop() || (TABLE.$CUR_ROW && TABLE.$CUR_ROW.length) && TABLE._scrollable)? fun : null;
		if(TABLE.showUpdateColumn && _fun && reverse){
			if(TABLE.$newUpdates.hasClass('dn')){
				TABLE.$newUpdates.removeClass('dn');
				//TODO:- adjust scrooll when row added
			};
			TABLE.$updateCount.text(++TABLE.updateCount);
		}
		if(_fun!=='prepend') _fun = 'alt'// else 
		var $DATA_ROW = $('<tr class="dataRow '+_fun+'" id='+TABLE.id + ROWID+' tabindex=-1 ></tr>');
		for(var i =0; i<TABLE.TOTAL_COLS; i++){
			var fieldType = TABLE.structure[i].fieldType;
			var dataAlign = TABLE.structure[i].dataAlign;
			var $CELL = $('<div class="tdcell">'+innerHTML+'</div>');
			var innerHTML = table.getHTML(TABLE.structure[i],rowObj[fieldType],
			{ iCol : i, rowID : ROWID, $ROW : $DATA_ROW, $CELL : $CELL },rowObj);
			if(TABLE.structure[i].title) $CELL.attr('title',rowObj[fieldType]);
			$DATA_ROW["append"]($('<td class="ft_'+fieldType+' tt_'+dataAlign+'"></td>').append($CELL.html(innerHTML)));
		}
		table.funRow[fun](TABLE.$DATA_TABLE,$DATA_ROW);
		TABLE.$SET_ROW(ROWID,$DATA_ROW);
		table.addParams(TABLE,$DATA_ROW,rowObj);
		return $DATA_ROW;
	};
	table.addParams = function(TABLE,$DATA_ROW,rowObj){
		for(var i in TABLE.params){
			var fieldType = TABLE.params[i];
			if(rowObj[fieldType]!==undefined){
				$DATA_ROW.attr(fieldType,rowObj[fieldType]);
			}
		}
		if(TABLE.rowaction && TABLE.rowaction.update) TABLE.rowaction.update({$ROW : $DATA_ROW, DATA : rowObj});
	};
	table.getDisplayValue = function(STRUCT,value){
		if(STRUCT.options){
			if(STRUCT.options[value]!==undefined) return STRUCT.options[value];
		} return value;
	};
	table.getHTML = function(STRUCT,value,e,rowObj){
		//if(STRUCT.innerHTML) return STRUCT.innerHTML;
		if(value==undefined) var value = "";
		if(STRUCT.onHTML) STRUCT.onHTML(value,e);
		if(STRUCT.innerHTML){
			var innerHTML = '';
			var valueList;
			if($.isArray(value)){
				valueList = value
			} else valueList = (value+"").split(":");
			if(typeof(STRUCT.innerHTML)=='function'){
				innerHTML = STRUCT.innerHTML(valueList,STRUCT.options);
			} else {
				innerHTML = STRUCT.innerHTML;
				for(var i in valueList){
					innerHTML = innerHTML.replace("$"+(i-0+1),table.getDisplayValue(STRUCT,valueList[i]));
					innerHTML = innerHTML.replace("@"+(i-0+1),valueList[i]);
				}
				innerHTML = innerHTML.replace(/\@[1-9]*/gi,"");
				innerHTML = innerHTML.replace(/\$[1-9]*/gi,"");
			}
			return innerHTML;
		} else if(STRUCT.formatter){
			return STRUCT.formatter(value,e,rowObj);
		} else if(STRUCT.formatType){
			STRUCT.iVal = value;
			return utils.format.get(STRUCT.formatType,STRUCT).dVal
		}
		return value;
	};
	table.funRow = {
		append : function($DATA_TABLE,$DATA_ROW){
			return $DATA_TABLE.append($DATA_ROW);
		},
		prepend : function($DATA_TABLE,$DATA_ROW){
			$DATA_ROW.addClass('unread')
			return $DATA_TABLE.prepend($DATA_ROW);
		}
	}
	table.initFunctions = function(TABLE){
		TABLE.ROW_CACHE = {};
		TABLE.$SET_ROW = function(ROWID,$ROW){
			if($ROW.length){
				$ROW.CELL_CACHE = {};
				this.ROW_CACHE[ROWID] = $ROW;
			}
		}
		TABLE.$DEFROW = $();
		TABLE.$ROW = function(ROWID){
			var ROW = this.ROW_CACHE[ROWID];
			if(ROW) return ROW;
			//return TABLE.$DEFROW;
			ROW = $('#'+this.id+ROWID,this.$DATA_TABLE);
			if(ROW.length) this.ROW_CACHE[ROWID] = ROW;
			return ROW;
		};
		TABLE.$CELL = function(fieldType,$DATA_ROW){
			return $('td.ft_'+fieldType +" div.tdcell",$DATA_ROW);
			/*
			var CACHE = $DATA_ROW.CELL_CACHE || {}; $DATA_ROW.CELL_CACHE = CACHE;
			var CELL = CACHE[fieldType];
			if(CELL) return CELL;
			CELL = $('td.ft_'+fieldType +" div.tdcell",$DATA_ROW);
			if(CELL.length) CACHE[fieldType] = CELL;
			return CELL;
			*/
		};
		
		TABLE.emptyTable = function(){
			this.ROW_CACHE = {};
			$(".dataRow",this.$DATA_TABLE).remove();
			this.updateCount = 0;
			this.$CUR_ROW = null;
		}
		TABLE.appendRow = function(rowObj){
			table.addRow(this,rowObj);
		};
		TABLE.prependRow = function(rowObj){
			table.addRow(this,rowObj,true);
		};
		TABLE.sortmap = { '*' : { next : null, root : true } };
		TABLE.updateRow = function(rowID,rowObj,reverse,move, ifExists){
			var fun = (reverse ? "prepend" : "append");
			var $DATA_ROW = this.$ROW(rowID,this.$DATA_TABLE);
			if(ifExists && !$DATA_ROW.length) return;
			if($DATA_ROW.length){
				for(var i =0; i<this.TOTAL_COLS; i++){
					var fieldType = this.structure[i].fieldType;
					if(rowObj[fieldType]!==undefined){
						var $CELL = this.$CELL(fieldType,$DATA_ROW);
						var innerHTML = table.getHTML(this.structure[i],rowObj[fieldType],{
							iCol : i, rowID : rowID, $CELL : $CELL,$ROW : $DATA_ROW},rowObj);
						if(this.structure[i].title) $CELL.attr('title',rowObj[fieldType]);
						$CELL.html(innerHTML);
					}
				}
				table.addParams(this,$DATA_ROW,rowObj);
				if(move) table.funRow[fun](this.$DATA_TABLE,$DATA_ROW);
			} else $DATA_ROW = table.addRow(this,rowObj,reverse);
			if(this.compare){
				if(!TABLE.sortmap[rowID]) TABLE.sortmap[rowID] = { next : null, data : {}, prev : null}
				TABLE.sortmap[rowID].data = $.extend(true,TABLE.sortmap[rowID].data,rowObj);
				TABLE.sortmap[rowID].$DATA_ROW = $DATA_ROW
				TABLE.sortMe(rowID);
			}
		};
		TABLE.popMe = function(rowID){
			var sortObj = TABLE.sortmap[rowID];
			if(sortObj.prev) sortObj.prev.next = sortObj.next;
			if(sortObj.next) sortObj.next.prev = sortObj.prev;
			sortObj.next = null;sortObj.prev = null;
			return sortObj;
		}
		TABLE.sortMe = function(rowID){
			var sortObj = this.popMe(rowID);
			var nowObj = this.sortmap['*'];
			var pos = 0; cont  =true;
			for(var i in this.sortmap)
				if(cont && nowObj.next){
    				var prevObj = nowObj;
    				nowObj = nowObj.next;
    				if(this.compare(nowObj.data, sortObj.data)){
    					nowObj = prevObj;
    					cont = false;
    				} else pos++;
    			}
			var nextObj = nowObj.next;
			nowObj.next = sortObj;  sortObj.prev = nowObj;
			
			if(nextObj){
				nextObj.prev = sortObj; sortObj.next = nextObj;
			}
			//sortObj.$DATA_ROW.remove();
			if(pos>0){
				nowObj.$DATA_ROW.after(sortObj.$DATA_ROW);
			} else this.$DATA_TABLE.prepend(sortObj.$DATA_ROW);
		}
		TABLE.deleteRow = function(rowID){
			var $DATA_ROW = this.$ROW(rowID,this.$DATA_TABLE);
			delete this.ROW_CACHE[rowID];
			$DATA_ROW.remove();
		}
		TABLE.getRowParam = function(param,rowID){
			if(rowID==undefined) var rowID = this.irowID;
			var $DATA_ROW = this.$ROW(rowID,this.$DATA_TABLE);
			return $DATA_ROW.attr(param);
		}
		if(TABLE.action){
			TABLE.$DATA_TABLE.delegate("tr .axn", "click", function(e){
				var $this = $(this)
				if(!$this.hasClass("disable")){
					var $row = $this.parents("tr");
					var _rowID = $row.attr("id");
					var rowID = _rowID.replace(TABLE.id,"");
					var _action = $this.attr("action");
					TABLE.irowID = rowID;
					TABLE.$this = $this;
					TABLE.$iRow = $row;
					TABLE.executeFn = TABLE.action[_action];
					TABLE.executeFn({
						_rowID : _rowID,
						rowID : rowID,
						action : _action,
						$cell : $this
					});
				}
				preventPropagation(e);
			});
		}
		if(TABLE.rowaction){
			if(!TABLE.rowaction["click"]) TABLE.rowaction["click"] = function(e){
          		 $(".dataRow",TABLE.$DATA_TABLE).removeClass("selected focused");
         		$("#"+e._rowID,TABLE.$DATA_TABLE).addClass("selected").removeClass('unread');
			}
			for(var event in TABLE.rowaction){
				TABLE.$DATA_TABLE.delegate("tr", event, function(e){
					e.$ROW = $(this);
					e._rowID = e.$ROW.attr("id");
					e.rowID = e._rowID.replace(TABLE.id,"");
					TABLE.irowID = e.rowID;
					TABLE.executeFn = TABLE.rowaction[e.type];
					TABLE.executeFn(e);
					preventPropagation(e);
				});
			}
		}
		if(TABLE.navigate){
			TABLE.$DATA_TABLE.keydown(function(e){
				var $curRow = $("tr.focused",TABLE.$DATA_TABLE);
				if(!$curRow.length) $curRow = $("tr.selected",TABLE.$DATA_TABLE);
				if(!$curRow.length) $curRow = $("tr.dataRow:eq(0)",TABLE.$DATA_TABLE);
				$("tr.dataRow",TABLE.$DATA_TABLE).removeClass("focused");
				preventPropagation(e);
				var key = (e.keyCode || e.which);
				var $next = null;
				if(key==38){  //UP
					$next = $curRow.prev();
				} else if(key==40) {  //down
					$next = $curRow.next();
				} else if(key==13){
					$next = $curRow;
				} else {
					var charKey = utils.custom.hotkeys.charForCode(key);
					$next = $curRow;
					var $axn = $(".axn.K_"+charKey,$next);
					if($axn.length) $axn.click();
				}
				if($next){
					if(!$next.hasClass("dataRow")) $next = $curRow;
					if($next.length && key==13){
						$next.addClass("focused").focus().click();
					} else if($next.length){
						$next.addClass("focused").focus();
					}
					TABLE.$CUR_ROW = $next;
					utils.executeOnce(function(){
						TABLE.onScroll();
					});
				} 
			});
		}
		TABLE.openColumnManager = function(){
			this.$COLUMN_MGR.removeClass('dn');
			utils.custom.listselector.show({
				atleastOne : true,
				data : this.getColumnMetaData(),
				parent : $('.content',this.$COLUMN_MGR).empty(),
				masterTitle : 'Available Column',
				selectedTitle : 'Visible Column'
			});
		
		};
//		TABLE.$HEADER_ROW[0]['oncontextmenu'] = function(e){
//			utils.custom.contextmenu.show(e,{
//				data : { key : ['manage'], display : ['Change Columns'] },
//				onclick : function(e){
//					if(e.action=='manage'){
//						TABLE.openColumnManager();
//					}
//				}
//			})
//			return false;
//		}
		TABLE.resetColumns = function(_order){
			this.order =_order;
			delete this.structure;
			this.set();
			if(this.filterOnChange) this.filterOnChange({ userInput : "", fieldType : this.indexKey});
			utils.custom.table.resetSize(this);
		};
		TABLE.$COLUMN_MGR = $('<div class="popup clmngr dn"><div class= "fp contentWrap"><div class="pTitle">Column Manager</div><div class="content">'
				+'</div><input type="button" class="ok button fr" value="Apply"><input type="button" class="cancel button fr" value="Cancel"></div><div class="fp overlay"></div></div>');
		$('.ok',TABLE.$COLUMN_MGR).click(function(e){
			var _order = [];
			$('.selected_columns .option',TABLE.$COLUMN_MGR).each(function(i,elem){
				_order.push($(elem).attr('value'));
			});
			if(_order.length){
				TABLE.resetColumns(_order);
				if(TABLE.onColumnOrderChange) TABLE.onColumnOrderChange(TABLE.order);
				TABLE.$COLUMN_MGR.addClass('dn');
			}
		});
		$('.cancel',TABLE.$COLUMN_MGR).click(function(e){
			TABLE.$COLUMN_MGR.addClass('dn');
		});
		TABLE.parent.append(TABLE.$COLUMN_MGR);
	};
	
	table.addFilter = function(TABLE){
		TABLE.toggleFilter = function(){
			this.$FILTER_ROW.toggleClass("dn");
			//TODO:-@amit to check
			TABLE.parent.parents('div.slimScrollDiv').toggleClass('filterOn');
			return !this.$FILTER_ROW.hasClass('dn');
		};
		TABLE.clearFilter = function(){
			$("input.filter.input",this.$FILTER_ROW).val("");
			this.filterMap = {};
			this.filterOnChange({ userInput : "", fieldType : this.indexKey})
		};
		if(!TABLE.filterOnChange){
			TABLE.filterOnChange = function(e){
				var $ROWS = $("tr.dataRow",TABLE.$DATA_TABLE);
				//$("tr.dataRow",TABLE.$DATA_TABLE).addClass("dn");
				e.userInput = e.userInput.toUpperCase();
				$ROWS.each(function(i,elem){
					$(elem).removeClass(e.fieldType+0 + " " + e.fieldType+1);
					var text = $("td.ft_"+e.fieldType +" div.tdcell" ,$(elem)).text().toUpperCase();
					if(text.indexOf(e.userInput)==-1)
					$(elem).addClass(e.fieldType+0);
					else $(elem).addClass(e.fieldType+1);
					TABLE.syncFilter($ROWS);
				});
			}
		};
		TABLE.applyFilter = function($this,e){
			e.userInput = $this.val();
			e.fieldType = $this.parents("td").attr("_fieldType");
			TABLE.filterOnChange(e);
			return utils.preventPropagation(e);
		};
		
		$("input.filter.input",TABLE.$FILTER_ROW).change(function(e){
			return TABLE.applyFilter($(this),e);
		});
		$("input.filter.input",TABLE.$FILTER_ROW).keydown(function(e){
			var key = (e.keyCode || e.which);
			if(key==13){
				return TABLE.applyFilter($(this),e)
			}
		});
		
		TABLE.syncFilter = function($ROWS){
			//var $ROWS = $("tr.dataRow",TABLE.$DATA_TABLE);
			$ROWS.removeClass("dn");
			for(var i =0; i<TABLE.TOTAL_COLS; i++){
				$("tr.dataRow."+TABLE.structure[i].fieldType+0,TABLE.$DATA_TABLE).addClass("dn");
			}
		};
	};
	table.getTable = function(tableType,TABLE){
		var cellspacing = (TABLE.cellspacing!==undefined) ? TABLE.cellspacing : 1;
		if(tableType=="header")
			return $('<table class="headerTable" cellspacing="'+cellspacing+'" cellpadding="0"><tr class="headerRow" ></tr><tr class="filterRow"></tr></table>');
		return $('<table class="dataTable" cellspacing="'+cellspacing+'" cellpadding="0"></table>');
	};
	table.manager = {
			table_id : 0,
			getID : function(){
					return ("dct"+(this.table_id++));
			}
	};
});
