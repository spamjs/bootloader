/*
 * This js file contains code for generating simple html table.
 * It supports following functionalities :
 * 1) displaying values in a table
 * 2) performing some action on selection of a row
 */
select_namespace("utils.custom.htmltable", function(htmltable){
	htmltable.init = function(){
		this.hash = 0;
	}
	htmltable.get = function(tableData){
		var noOfColumns = 0;
		if(tableData.structure)
			noOfColumns = tableData.structure.length;
		
		tableData.$TABLE = $("<div class='htmlTableWrapper' style='height:100%;overflow:hidden' noOfColumns='" + noOfColumns + "'></div>");
		tableData.$DATA = $("<div class='htmlDataDiv linkedScrollDivY' style='floatx:left'></div>");
		if(tableData.height==undefined){
			//tableData.height = tableData.parent.height();
		}
		if(tableData.height!==undefined){
			//tableData.$TABLE.height(tableData.height)
			tableData.$DATA.height(tableData.height);
		}
		
		if(tableData.width){
			tableData.$TABLE.width(tableData.width)
		}
		if(tableData.linkScroll){
			tableData.$DATA.css("overflow" , "hidden");
			//tableData.$DATA.addClass(tableData.scrollClass);
		} else {
			tableData.$DATA.css("overflow-y" , "auto").css("overflow-x" , "hidden");
		}
		
		var tablename = tableData.title;
		if(!tablename) tablename = "";
		var $table = tableData.$table = $("<table border='1' cellpadding='0' cellspacing='1' class='htmltable ' tableTitle='"
						+ tablename.replace(" ", "_") + "#" + (this.hash++) + "'></table>");
		
		
		var $row = htmltable.getRow();
		$row.addClass("headerRow");
		var iRow = 0, iCol = 0;
		if(tableData.title != undefined){
			$row.append(htmltable.getCell(tableData.title, 
					{"colspan" : tableData.structure.length, "iRow" : iRow++, "iCol" : iCol, 'class' : 'headerCell'}));
			$table.append($row);
		}
		var textList = [];
		var hasSubHeaders = false;
		if(!tableData.hideSubHeader){
			var $headerow = htmltable.getRow();
			$headerow.addClass("subHeaderRow");
			for(var index in tableData.structure){
				$headerow.append(htmltable.getCell(tableData.structure[index].title, 
						{"iRow" : iRow, "iCol" : iCol++, 'class' : 'subHeaderCell'}));
				if(tableData.structure[index].subHeader)
					hasSubHeaders = true;
			}
			$table.append($headerow);
		}
		if(tableData.colWidths){
			for(var j in tableData.structure){
				//if(!tableData.structure[j]) tableData.structure[j]
				tableData.structure[j].style = tableData.structure[j].style + 
				';min-width:'+tableData.colWidths[j]+ 'px;max-width:'+tableData.colWidths[j]+'px';
			}
		}
		
		if(hasSubHeaders){
			iRow++; iCol=0;
			var subHeader = htmltable.getRow();
			subHeader.addClass("subHeaderRow");
			for(var index in tableData.structure){
				if(tableData.structure[index].subHeader){
					tableData.structure[index].subHeader.style = tableData.structure[index].style
					var colspan = tableData.structure[index].subHeader.colspan;
					if(!colspan) colspan = 1;
					var $subHeaderCell  = htmltable.getCell(tableData.structure[index].subHeader.title, 
							{"iRow" : iRow, "iCol" : iCol, 'class' : 'subHeaderCell',"colspan" : colspan},
							tableData.structure[index].subHeader,true);
					subHeader.append($subHeaderCell);
					iCol = iCol + (colspan - 0);
				}
				else if(iCol <= index){
					subHeader.append(htmltable.getCell("",{"iRow" : iRow, "iCol" : iCol, 'class' : 'subHeaderCell'}));
					iCol++;
				}
			}
			$table.append(subHeader);
		}
		tableData.$HEADER = $("<div style=''></div>").html($table.clone());
		//tableData.$HEADER.css("position","absolute");
		//tableData.$table.css("width" , "105%");
		if(tableData.colWidths){
			$(".row",$table).css('display', "none");
		} else $(".row",$table).css('visibility', "collapse");
		
		//add cell styling
		for(var i in tableData.data){
			iRow++; 	iCol = 0;
			var $row = htmltable.getRow();
			for(var j in tableData.params){
				var key = tableData.params[j];
				$row.attr(key, tableData.data[i][key]);
			}
			for(var j in tableData.structure){
				var fieldType = tableData.structure[j].fieldType;
				$row.append(htmltable.getCell(tableData.data[i][fieldType], {"iRow" : iRow, "iCol" : iCol++}, tableData.structure[j]));				
			}
			$table.append($row);
		}
		var len = tableData.data.length;
		var maxRows = tableData.maxRows;
		if(maxRows != undefined && maxRows > len){
			var $row = htmltable.getRow();
			for(var i = len; i < maxRows; i++){
				var $row = htmltable.getRow();
				$row.addClass("deadrow");
				for(var j in tableData.structure){
					$row.append(htmltable.getCell("", {"iRow" : iRow, "iCol" : iCol++, "class" : "deadcell"}, ""));				
				}
				$table.append($row);
			}
		}
		tableData.$DATA.html($table);
		tableData.parent.append(tableData.$TABLE.html(tableData.$HEADER).append(tableData.$DATA));
		tableData.selectRow = function($row, select){
			if(select==undefined) var select = true;
			var $cell = $('.cell', $row);
			if(select){
				$cell.addClass('selected')
			} else {
				$cell.removeClass('selected');
			}
		};
		tableData.selectCol = function(e){

		};
			
		tableData.$TABLE.delegate(".cell:not(.deadcell)", "click", function(e){
			e.$cell = $(this);
			e.$row = $(this).parent(".row");
			e.iRow = e.$cell.attr('iRow');
			e.iCol = e.$cell.attr('iCol');
			e.noOfColumns = tableData.$TABLE.attr("noOfColumns");
			if(!e.$cell.hasClass("headerCell") && !e.$cell.hasClass("subHeaderCell")
					 && !e.$cell.hasClass("noselect")){
				if(e.$cell.hasClass('selected')){
					e.$cell.removeClass('selected');
					if(tableData.onCellDeselect) tableData.onCellDeselect(e);
				} else {
					e.$cell.addClass('selected');
					if(tableData.onCellSelect) tableData.onCellSelect(e);
				}
			}
		});
		return tableData;
	}
	
	htmltable.getRow = function(){
		return $("<tr class='row'></tr>");
	}
	htmltable.getCell = function(iVal, attrMap,structure){
		var dVal = iVal;
		var style = '';
		if(structure && structure.formatType)
			dVal = utils.format.get(structure.formatType,{iVal : iVal , round : structure.round}).dVal;
		else if(structure && structure.innerHTML){
			dVal = structure.innerHTML;
		}
		if(structure && structure.style){
			style = structure.style;
		}
		var $td = $("<td class='cell' value='" + iVal + "' style='"+style+"'>" + dVal + "</td>");
		if(structure && structure.fieldType)
			$td.attr("fieldType", structure.fieldType);
		if(attrMap != undefined)
			for(var attr in attrMap)
				$td.attr(attr, attrMap[attr]);
		$td.addClass("cell htmltable");
		return $td; 
	}
	htmltable.insertRow = function(rowData, $table, position){
		var data = rowData.data;
		var $row = htmltable.getRow();
		var params = rowData.params;
		for(var j in params){
			var param = params[j];
			$row.attr(param, data[param]);
		}
		var structure = rowData.structure;
		for(var i in structure){
			$row.append(htmltable.getCell(data[structure[i].fieldType], undefined, structure[i]));
		}
		if(position != undefined){
			if(position == -1)
				$("tr", $table).eq(1).after($row);
			else
			$("tr:not(.headerRow, .subHeaderRow)", $table).eq(position).after($row);
		}else
			$table.append($row);
	}
	htmltable.deleteRow = function($row){
		$row.remove();
	}
	htmltable.resetRow = function(rowData){
		var data = rowData.data;
		for(var i in data){
			var selectionParam = rowData.selectionParam;
			var $row = $(".row[" + selectionParam + "='" + data[i][selectionParam] + "']");
			var params = rowData.params;
			for(var j in params){
				var param = params[j];
				var $cell = $(".cell[fieldType='" + param + "']", $row);
				$cell.attr("value", data[i][param]);
				$cell.text(utils.format.get(rowData.formatType[j],{iVal : data[i][param]}).dVal);
			}
		}
	};
});