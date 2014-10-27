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
	htmltable.geTable = function(){
		return $("<table border='1' cellpadding='0' cellspacing='1' class='fl htmltable ' ></table>");
	}
	htmltable.get = function(tableData){
		var tablename = tableData.title;
		if(!tablename) tablename = "";
		tableData.$div = $("<div style='height:100%' tableTitle='"	+ tablename.replace(" ", "_") + "#" + (this.hash++) + "'></div>");
		var $header = tableData.$header = htmltable.geTable();
		var $row = htmltable.getRow();
		$row.addClass("headerRow");
		var iRow = 0, iCol = 0;
		if(tableData.title != undefined){
			$row.append(htmltable.getCell(tableData.title, 
					{"colspan" : tableData.structure.length, "iRow" : iRow++, "iCol" : iCol, 'class' : 'headerCell'}));
			$header.append($row);
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
			$header.append($headerow);
		}
		
		if(hasSubHeaders){
			iRow++; iCol=0;
			var subHeader = htmltable.getRow();
			subHeader.addClass("subHeaderRow");
			for(var index in tableData.structure){
				if(tableData.structure[index].subHeader){
					var colspan = tableData.structure[index].subHeader.colspan;
					if(!colspan) colspan = 1;
					var $subHeaderCell  = htmltable.getCell(tableData.structure[index].subHeader.title, 
							{"iRow" : iRow, "iCol" : iCol, 'class' : 'subHeaderCell',"colspan" : colspan},
							tableData.structure[index].subHeader);
					subHeader.append($subHeaderCell);
					iCol = iCol + (colspan - 0);
				}
				else if(iCol <= index){
					subHeader.append(htmltable.getCell("",{"iRow" : iRow, "iCol" : iCol, 'class' : 'subHeaderCell'}));
					iCol++;
				}
			}
			$header.append(subHeader);
		}
		
		var $table = tableData.$table = tableData.$header.clone();
		tableData.$header.css('position','absolute')
		tableData.$div.append(tableData.$header,$('<div style="overflow-x:hidden;overflow-y:auto"></div>').append(tableData.$table));
		
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
		tableData.parent.append(tableData.$div);
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
			
		tableData.$div.delegate(".cell:not(.deadcell)", "click", function(e){
			e.$cell = $(this);
			e.$row = $(this).parent(".row");
			e.iRow = e.$cell.attr('iRow');
			e.iCol = e.$cell.attr('iCol');
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
		if(structure && structure.formatType)
			dVal = utils.format.get(structure.formatType,{iVal : iVal}).dVal;
		else if(structure && structure.innerHTML){
			dVal = structure.innerHTML;
		}
		var $td = $("<td class='cell' value='" + iVal + "'>" + dVal + "</td>");
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