utils.selectNamespace("utils.custom.grid", function(grid) {

    grid.init = function() {
        $("body").delegate(".gridDiv", "keydown", function(e) {
            trapKeyFn(e);
        });
        $("body").delegate(".gridDiv", "keyup", function(e) {
            trapUpKeyFn(e);
        });
    };

    grid.onChange = function(callbacks, i, e, args) {
        var key = i + ":" + args.row + ":" + args.cell;
        var cb = callbacks[key];
        if (cb)
            cb(args.row, args.cell, args.grid);
    };
    grid.onSelect = function(callbacks, i, e, args) {
        var key = i + ":" + args.row + ":" + args.cell;
        var cb = callbacks[key];
        if (cb)
            cb(args.row, args.cell, args.grid);
    };

    grid.defaultCellStructure = {
        tagType: "inputbox",
        fieldType: "x",
        parentDivClass: "",
        value: "",
        row: 0,
        cellpadding: 0,
        cellspacing: 1,
        col: 0
    };

    grid.getStruct = function(struct, GRID) {
        if (struct.tagType == "button" || struct.tagType == "arrowtoggle") {
            struct.onClick = function(e) {
                if (!e.$widget.hasClass("dead")) {
                    e.iRow = e.$widget.attr("iRow");
                    e.iCol = e.$widget.attr("iCol");
                    e.fieldType = e.$widget.attr("fieldType");
                    var fieldType_onclick = e.fieldType + "_onclick";
                    if (GRID["_onclick"])
                        GRID._onclick(e);
                    if (GRID[fieldType_onclick])
                        GRID[e.fieldType + "_onclick"](e);
                }
            };
        } else {
            struct.onChange = function(e,uE) {
                e.$widget = e.$widget || uE.$widget;
                if (!e.$widget.hasClass("dead")) {
                    e.iRow = e.$widget.attr("iRow");
                    e.iCol = e.$widget.attr("iCol");
                    e.index = GRID.vertical ? e.iRow : e.iCol;
                    var fieldType = e.$widget.attr("fieldType")
                    e.fieldType = fieldType;
                    e.widgetValue = e.$widget.getValue();
                    //e.ID = this.onChange.ID
                    if (GRID.bulkType) {
                        GRID._setValueByFieldType(e.index, e.fieldType, e.widgetValue)
                    } else
                        GRID._setValue(e.iRow, e.iCol, e.widgetValue);
                    var fieldType_onchange = e.fieldType + "_onchange";
                    if (GRID[fieldType_onchange])
                        GRID[fieldType_onchange](e);
                    if (e.curChange) {
                        //e.$tagwrapper = e.$widget.parents(".tag.amount");
                        //e.iRow = e.$tagwrapper.attr("iRow");
                        //e.iCol = e.$tagwrapper.attr("iCol");
                        //e.ID = this.onChange.ID
                        e.fieldType = e.fieldType + "_cur"; //e.$widget.attr("fieldType");
                        GRID._setValueByFieldType(e.index, e.fieldType, e.curValue);
                        var fieldType_onchange = e.fieldType + "_onchange";
                        if (GRID[fieldType_onchange])
                            GRID[fieldType_onchange](e);
                        //if(GRID["_onchange"]) GRID._onchange(e);
                    }
                    e.fieldType = fieldType;
                    if (GRID["_onchange"])
                        GRID._onchange(e);
                }
            };
        }
        return struct;
    };

    grid.setOnChange = function(GRID) {
        GRID.$dataDiv.onChange(function(e) {
            if (!e.$widget.hasClass("dead")) {
                e.iRow = e.$widget.attr("iRow");
                e.iCol = e.$widget.attr("iCol");
                //e.ID = this.onChange.ID
                GRID._setValue(e.iRow, e.iCol, e.$widget.getValue());
                var fieldType = e.$widget.attr("fieldType")
                e.fieldType = fieldType;
                var fieldType_onchange = e.fieldType + "_onchange";
                if (GRID[fieldType_onchange])
                    GRID[fieldType_onchange](e);
                if (e.curChange) {
                    //e.$tagwrapper = e.$widget.parents(".tag.amount");
                    //e.iRow = e.$tagwrapper.attr("iRow");
                    //e.iCol = e.$tagwrapper.attr("iCol");
                    //e.ID = this.onChange.ID
                    e.index = GRID.vertical ? e.iRow : e.iCol;
                    e.fieldType = e.fieldType + "_cur"; //e.$widget.attr("fieldType");
                    GRID._setValueByFieldType(e.index, e.fieldType, e.curValue);
                    var fieldType_onchange = e.fieldType + "_onchange";
                    if (GRID[fieldType_onchange])
                        GRID[fieldType_onchange](e);
                    //if(GRID["_onchange"]) GRID._onchange(e);
                }
                e.fieldType = fieldType;
                if (GRID["_onchange"])
                    GRID._onchange(e);
            }
        })
    };

    grid.manager = {
        grid_id: 0,
        getID: function() {
            return ("dcg" + (this.grid_id++));
        }
    }

    grid.table = function(GRID, iObj) {
        //TODO: TABLE BASED GRID TO BE DONE:---
        GRID.id = grid.manager.getID();
        var $table = GRID.$table = $('<table class="customGridTable" cellspacing=' +
                GRID.cellspacing + ' cellpadding=' + GRID.cellpadding + '></table>');
        GRID.$header = null;
        GRID.$styleSheet = $('<style class="cssSheet"></style>');

        var totalRows = GRID.getRowCount();
        if (GRID.tabIndex == undefined)
            GRID.tabIndex = GRID.parent.attr("tabIndex");
        if (GRID.defaultColWidth !== undefined) {

            utils.custom.css.add("#" + GRID.id + " th, #" + GRID.id + " td", "width:" + GRID.defaultColWidth + "px;", undefined, GRID.$styleSheet);

        }
        if (GRID.hasHeaders && GRID.vertical) {
            var totalCols = GRID.getColCount();
            var $row_1 = $('<tr class="customGridRowHeader"></tr>');
            for (var j = 0; j < totalCols; j++) {
                $cell = grid.getHeaderCell(GRID, j);
                $row_1.append($cell);
            }
            $table.append($row_1);
        }
        if (GRID.hasHeaders || GRID.freezeHeader) {
            GRID.$header = $('<table class="customGridTable" cellspacing=' + GRID.cellspacing + ' cellpadding=' + GRID.cellpadding + '></table>');
        }

//		GRID.parent.empty();
//		var headerWidth = 0;
        var _strClass = "customGrid";
        GRID.$dataDiv = $('<div class="dataDiv block fl ' + GRID.dataDivClass + '" style="' + GRID.dataDivStyle + '"></div>');
        GRID.parent.html(GRID.$dataDiv.append(GRID.$table)).append(GRID.$styleSheet);
        grid.setOnChange(GRID);
        if (GRID.$header) {
            _str = "float:left";
            if (GRID.freezeHeader) {
                _strClass = _strClass + " headerFreeze";
                if (GRID.horizontal && GRID.snap) {
                    GRID.scrolAdjust = function(e) {
                        if (GRID.scrolAdjustable) {
                            if (false && !$.browser.msie) {
                                var $this = GRID.$dataDiv[0];
                                $this.scrollLeft = Math.round($this.scrollLeft / GRID.snap) * GRID.snap - 0 + 1;
                            }
                            if (GRID.onScroll)
                                GRID.onScroll(e);
                        }
                        GRID.scrolAdjustable = false;
                    }
                    GRID.$dataDiv[0].onscroll = function(e) {
                        //return utils.preventPropagation (e);
                        if (!GRID.scrolAdjustable) {
                            GRID.scrolAdjustable = true;
                            //setTimeout(GRID.scrolAdjust,0)
                            GRID.scrolAdjust(e);
                        }
                    }
                } else if (!GRID.horizontal) {
                    GRID.$header.append($(".customGridRowHeader", GRID.$table));
                    if (GRID.dataHeight !== undefined) {
                        GRID.$dataDiv.height(GRID.dataHeight).css('overflow', 'auto');
                    }
                }
            }
            GRID.$headerDiv = $('<div class="headerDiv fl" style="' + _str + '"></div>');
            GRID.parent.prepend(GRID.$headerDiv.append(GRID.$header));
            //var headerWidth = $headerDiv.width();
            //$headerDiv.width(headerWidth);
            //$dataDiv.css("margin-left",headerWidth)
            if (!GRID.horizontal) {
                GRID.$headerDiv.width("100%");
                GRID.$dataDiv.css('width', "100%");
            }
        }
        _strClass = _strClass + ((GRID.vertical) ? " alignY" : " alignX");
        GRID.parent.addClass(_strClass).attr('id', GRID.id);

        for (var i = 0; i < totalRows; i++) {
            grid.addRow(GRID, i);
        }
        if (GRID.onHeaderClick)
            $table.delegate(".customGridRowHeader td", "click", function(e) {
                e.$cell = $(this);
                GRID.onHeaderClick(e);
            });
        if (GRID.onKeyUp)
            $table.delegate(".customGridCell .tag", "keyup", function(e) {
                e.$widget = $(this);
                GRID.onKeyUp(e);
            });
        if (GRID.actions) {
            $(".headerDiv,.dataDiv", GRID.parent).delegate("span.action", "click", function(e) {
                var $this = $(this);
                e.action = $this.attr('action');
                e.$widget = $this.parent('.tag');
                e.iCol = e.$widget.attr('iCol');
                e.iRow = e.$widget.attr('iRow');
                e.fieldType = e.$widget.attr('fieldType');
                GRID.cb = GRID.actions[e.action];
                if (GRID.cb)
                    GRID.cb(e);
            });
        }
        if (GRID.navigate) {
            grid.refresh(GRID);
        }
        GRID.$tables = GRID.parent;
        if (GRID.resizable) {
            $table.colResizable(GRID.resizable);
        }
        return GRID;
    };
    grid.getHeaderCell = function(GRID, j) {
        var $header = "";
        var fieldType = "";
        var tagType = "";
        var $cell = "";
        var style = "";
        var title = "";
        if (GRID.structure[j]) {
            var struct = GRID.structure[j];
            $header = struct.header;
            fieldType = struct.fieldType;
            tagType = struct.tagType;
            if (struct.$header) {
                var __val;
                if (GRID.bulkType) {
                    __val = GRID._getValueByFieldType(-1, fieldType);
                }
                tagType = struct.$header.tagType;
                struct.$header.row = -1;
                struct.$header.col = j;
                if (struct.$header.formatter)
                    struct.$header.value = struct.$header.formatter(struct.$header.value, {iRow: -1, iCol: j});
                $header = utils.custom.tag(grid.getStruct(struct.$header, GRID));
            }
        }
        if (struct.width)
            style = style + ' width:' + struct.width + 'px';
        if (struct.title)
            title = title + ' title = "' + struct.title + '"';
        var tag = (GRID.useTH) ? 'th' : 'td';
        $cell = $('<div class=" ft_' + fieldType + ' tt_' + tagType + '" style="' + style + '"></div>').append($header);
        $cell = $('<' + tag + ' class="customGridCell ft_' + fieldType + ' tt_' + tagType + '" style="' + style + '"' + title + '></' + tag + '>').append($cell);
        return $cell;
    };

    grid.refresh = function(GRID) {
        GRID.parent.addClass("navigate").attr("tabindex", 0).attr("maxrow", GRID.getRowCount() + 2);
        GRID.parent.attr("maxcol", GRID.getColCount() + 2);
        if (GRID.hideDeadRow) {
            var totalRows = GRID.getRowCount();
            if (GRID.getColCount()) {
                for (var j = 0; j < totalRows; j++) {
                    var __struct = GRID.getStructure(j, 0);
                    if (__struct.hide) {
                        $('.customGridRow.rowNum_' + j, GRID.$tables).addClass("dn");
                    } else
                        $('.customGridRow.rowNum_' + j, GRID.$tables).removeClass("dn");
                }
            } else {
                for (var j = 0; j < totalRows; j++) {
                    var __struct = GRID.getStructure(j, 0);
                    if (!__struct.defaultHeader) {
                        __struct.hide = true;
                        $('.customGridRow.rowNum_' + j, GRID.$tables).addClass("dn");
                    } else
                        $('.customGridRow.rowNum_' + j, GRID.$tables).removeClass("dn");
                }
            }
        }
        if (GRID.onRefresh)
            GRID.onRefresh();
//		if(GRID.hasHeaders && GRID.horizontal && GRID.freezeHeader){
//			var h = GRID.$headerDiv.height();
//			GRID.$dataDiv.height(h);
//		}
    };
    grid.getAltStructureBy = function(GRID, fieldType) {
        var h = GRID.altFieldIndexMap[fieldType];
        return GRID._structure[h];
    };
    grid.getStructure = function(GRID, i, j) {
        var h = GRID.vertical ? j : i;
        return GRID.structure[h];
    };
    grid.getCell = function(GRID, i, j, _struct) {
        var h, index;
        if (GRID.vertical) {
            h = j;
            index = i
        } else {
            h = i;
            index = j
        }
        ;
//		/var index = GRID.horizontal ? j : i;
        if (_struct == undefined) {
            var __struct = GRID.getStructure(i, j);
            if (__struct)
                GRID._struct = __struct;
            var _struct = GRID._struct;
            var _altStruct = _struct;
            _struct.value = GRID.getValue(i, j);
            _struct.id = GRID.getID(i, j);
            _struct.dead = false;
            if (_struct.value == undefined) {
                //_struct.dead = true;
                GRID._setValue(i, j, _struct.defValue);
                _struct.value = _struct.defValue
                if (GRID.bulkType) {
                    if (_struct.defValue == undefined) {
                        _struct.dead = true;
                        for (var g in GRID._struct.altFieldTypes) {
                            var ft = GRID._struct.altFieldTypes[g];
                            var _value = GRID._getValueByFieldType(index, ft);
                            LOG.warn(_struct, ft, h, _value)
                            if (_value !== undefined) {
                                _altStruct = GRID.getStructureByFieldType(ft);
                                _altStruct.value = _value;
                                _altStruct.dead = false;
                                break;
                            }
                        }
                    }
                    //else _struct.dead = false;
                }
            }
            if (_altStruct.tagType == 'amount' && GRID.bulkType) {
                var index = GRID.vertical ? i : j;
                var _curValue = GRID._getValueByFieldType(index, _altStruct.fieldType + "_cur"); ///WORKING
                if (_curValue)
                    _altStruct.curValue = _curValue;
            }
            _altStruct.row = i;
            _altStruct.col = j;
        }
        _altStruct.tabIndex = GRID.tabIndex;
        var $cell = $('<td class="customGridCell ft_' + _altStruct.fieldType + ' tt_' + _altStruct.tagType + ' cid_' + _altStruct.id + ' "></td>');
        if (GRID) {
            _altStruct = grid.getStruct(_altStruct, GRID);
        }
        if (_struct.displayMap) {
            _altStruct._display = _altStruct.displayMap[_altStruct.value];
        }
        _struct.dead = _altStruct.dead;
        _struct.hide = (_struct.hide && _struct.dead);

        if (_altStruct.formatter)
            _altStruct.value = _altStruct.formatter(_altStruct.value, {iRow: i, iCol: j});
        $cell.html(utils.custom.tag(_altStruct));
        grid.defaultCellStructure.value = "";
        return $cell;
    };

    grid.addCol = function(GRID, j) {
        var totalRows = GRID.getRowCount();
        for (var i = 0; i < totalRows; i++) {
            $('.customGridRow.rowNum_' + i, GRID.$table).append(grid.getCell(GRID, i, j));
        }
        grid.refresh(GRID);
    };
    grid.deleteCol = function(GRID, j) {
        var totalRows = GRID.getRowCount();
        for (var i = 0; i < totalRows; i++) {
            $('.customGridRow.rowNum_' + i, GRID.$table).remove();
        }
        grid.refresh(GRID);
    };

    grid.addRow = function(GRID, i, reverse) {
        var $row = $('<tr class="customGridRow rowNum_' + i + '"></tr>');
        if (GRID.hasHeaders && GRID.horizontal) {
            var _$row = $('<tr class="customGridRow rowNum_' + i + '"></tr>');
            _$row.append(grid.getHeaderCell(GRID, i));
            GRID.$header.append(_$row);
        }

        var totalCols = GRID.getColCount();
        for (var j = 0; j < totalCols; j++) {
            $row.append(grid.getCell(GRID, i, j));
        }
        if (reverse)
            $(".customGridRowHeader", GRID.$table).after($row)
        else
            GRID.$table["append"]($row);
    };
    grid.deleteRow = function(GRID, i) {
        $('<tr class="customGridRow rowNum_' + i + '"></tr>', GRID.$tables).remove();
        GRID._deleteRow(i);
    };

    grid.get = function(GRID) {
        GRID.refresh = function() {
            return grid.refresh(this);
        };
        GRID.clear = function() {
            this.set({data: []});
            if (this.structureRefresh)
                this.structureRefresh();
            return grid.refresh(this);
        };
        GRID.set = function(iObj) {
            if (iObj == undefined) {
                iObj = {
                    data: this.data
                };
                GRID.refresh()
            }
            for (var i in iObj) {
                this[i] = iObj[i];
            }
            var ret = grid.table(this, iObj);
            if (this.onReset)
                this.onReset(this);
            return ret;
        };
        GRID.__setValue = function(r, c, value) {
            if (!GRID.data)
                GRID.data = [];
            if (GRID.data[r] == undefined)
                GRID.data[r] = [];
            GRID.data[r][c] = value;
        };

        GRID.addRow = function(rowList, reverse) {
            if (rowList == undefined)
                var rowList = [];
            var totalCols = GRID.getColCount();
            var curRow = GRID.getRowCount();
            for (var i = 0; i < totalCols; i++) {
                GRID._setValue(curRow, i, rowList[i]);
            }
            grid.addRow(GRID, curRow, reverse);
        };
        GRID.addCol = function(rowList) {
            if (rowList == undefined)
                var rowList = [];
            var totalRows = GRID.getRowCount();
            var curCol = GRID.getColCount();
            for (var i = 0; i < totalRows; i++) {
                GRID._setValue(i, curCol, rowList[i]);
            }
            grid.addCol(GRID, curCol);
            return curCol;
        };
        GRID.deleteRow = function(rowNum) {
            grid.deleteRow(this, rowNum);
        };
        GRID.deleteCol = function(i) {
            //TODO:-TO BE IMPLEMENTED:-
        };
        GRID._deleteRow = function(i) {
            if (this.vertical) {
                var totalCols = this.getColCount();
                for (var j = 0; j < totalCols; j++) {
                    this.data[j].splice(i, 1);
                }
            } else
                this.data.splice(i, 1);
        };

        GRID._struct = grid.defaultCellStructure;
        if (!GRID.structure)
            GRID.structure = [];
        if (GRID.horizontal)
            GRID.vertical = false;
        else
            GRID.vertical = true;
        if (GRID.navigate == undefined)
            GRID.navigate = true;
        if (GRID.displayData)
            GRID.hasDisplayMap = true;
        else
            GRID.displayData = [];
        if (GRID.cellpadding == undefined)
            GRID.cellpadding = 0;
        if (GRID.cellspacing == undefined)
            GRID.cellspacing = 1;
        if (GRID.focus == undefined)
            GRID.focus = {};
        GRID.getParam = function(i, key) {
            if (key == undefined)
                var key = "fieldType";
            if (this.structure[i])
                return this.structure[i][key];
            return null;
        };
        GRID.setFocusIndex = function(r, c) {
            this.focus.r = r;
            this.focus.c = c;
        };
        GRID.setFocus = function(r, c) {
            if (r != undefined && c != undefined) {
                this.$(r, c).onFocus();
            } else if (this.focus.r != undefined && this.focus.c != undefined) {
                this.$(this.focus.r, this.focus.c).onFocus();
                this.focus.r = null;
                this.focus.c = null;
            }
        };
        //$ DOM searchfunctions
        GRID.$ = function(rowNum, colNum) {
            return $(".tag.r" + rowNum + ".c" + colNum, this.parent);
        }
        GRID.$byFieldTypeByCID = function(fieldType, CID) {
            return $(".cid_ " + CID + " .tag." + fieldType, this.$table);
        };
        GRID.$byCID = function(rowNum, CID) {
            return $(".cid_ " + CID + " .tag.r" + rowNum, this.$table);
        };
        GRID.$byFieldType = function(index, fieldType) {
            if (this.horizontal) {
                console.log(this.$header)
                if (index < 0)
                    return $("td .ft_" + fieldType + " .tag", this.$header)
                return $(".tag." + fieldType + ".c" + index, this.$table);
            } else
                return $(".tag." + fieldType + ".r" + index, this.$table);
            ;
        };
        //
        GRID.setValue = function(rowNum, colNum, value) {
            if (rowNum >= 0)
                this._setValue(rowNum, colNum, value);
            return this.$(rowNum, colNum).setValue(value);
        };
        GRID.setValueByFieldTypeByCID = function(fieldType, CID, value) {
            var $tag = this.$byFieldTypeByCID(fieldType, CID);
            var colNum = $tag.attr('iCol') - 0;
            var rowNum = $tag.attr('iRow') - 0;
            if (rowNum >= 0)
                this._setValue(rowNum, colNum, value);
            return $tag.setValue(value);
        };
        GRID.setValueByFieldType = function(index, fieldType, value) {
            var $tag = this.$byFieldType(index, fieldType);
            if (this.horizontal) {
                $tag = $(".tag." + fieldType + ".c" + index, this.$table);
            } else
                $tag = $(".tag." + fieldType + ".r" + index, this.$table);
            var _value = value;
            if ($tag && $tag.length) {
//				var colNum = $tag.attr('iCol')-0;
//				var rowNum = $tag.attr('iRow')-0;
//				if(rowNum>=0) GRID._setValue(rowNum,colNum,value);
                _value = $tag.setValue(value);
            }
            this._setValueByFieldType(index, fieldType, _value);
            return _value;
        };
        GRID.getValueByFieldType = function(index, fieldType) {
            return this._getValueByFieldType(index, fieldType);
        };
        GRID.setValueByCID = function(rowNum, CID, value) {
            var $tag = this.$byCID(rowNum, CID);
            var colNum = $tag.attr('icol') - 0;
            if (rowNum >= 0)
                this._setValue(rowNum, colNum, value);
            return $tag.setValue(value);
        };

        GRID.forAllRows = function(_cb) {
            var rows = this.getRowCount();
            this._cb = _cb;
            for (var i = 0; i < rows; i++)
                this._cb(i);
        };
        GRID.forAllColumns = function(_cb) {
            var cols = this.getColCount();
            this._cb = _cb;
            for (var i = 0; i < cols; i++)
                this._cb(i);
        };
        GRID.getID = function(rowNum, colNum) {
            return "";
        }
        GRID.getStructure = function(i, j) {
            var h = this.vertical ? j : i;
            return this.structure[h];
        };

        if (GRID.bulkType)
            grid.getBulkGrid(GRID);
        else
            grid.getNormalGrid(GRID);

        if (GRID)
            GRID.set(GRID);
        return GRID;
    };

    grid.getBulkGrid = function(GRID) {
        GRID.fieldIndexMap = {};
        GRID.altFieldIndexMap = {};
        GRID.horizontal = true;

        GRID.structureRefresh = function() {
            for (var i in GRID.structure) {
                GRID.fieldIndexMap[GRID.structure[i]["fieldType"]] = i;
                GRID.structure[i].hide = true;
                GRID.structure[i].altFieldTypes = [];
            }
            for (var i in GRID._structure) {
                var fieldType = GRID._structure[i]["fieldType"];
                var _fieldType = GRID._structure[i]["_fieldType"];
                var _rowIndex = GRID.fieldIndexMap[_fieldType];
                GRID.structure[_rowIndex].altFieldTypes.push(fieldType);
                GRID.fieldIndexMap[fieldType] = _rowIndex;
                GRID.altFieldIndexMap[fieldType] = i;
                GRID._structure[i].hide = true;
            }
        };
        GRID.structureRefresh();

        GRID.getStructureByFieldType = function(fieldType) {
            var index = this.altFieldIndexMap[fieldType];
            if (index !== undefined) {
                return this._structure[index];
            }
            index = this.fieldIndexMap[fieldType];
            if (index !== undefined) {
                return this.structure[index];
            }
            return null;
        };
        ///FUNCTIONS FOR HORIZONTAL BULK_TYPE_GRID
        GRID.vertical = false;
        GRID.addRow = function(rowList) {
            if (rowList == undefined)
                var rowList = [];
            var totalCols = GRID.getColCount();
            var curRow = GRID.getRowCount();
            for (var i = 0; i < totalCols; i++) {
                GRID._setValue(curRow, i, rowList[i]);
            }
            grid.addRow(GRID, curRow);
        };
        GRID.cidcounter = 0;
        GRID.addCol = function(bulk) {
            if (bulk == undefined)
                var bulk = {};
            var totalRows = GRID.getRowCount();
            var curCol = GRID.getColCount();
            if (this.maxCols !== undefined && curCol >= this.maxCols) {
                return;
            }
//			for(var i=0; i<totalRows;i++){
//				var fieldType = GRID.structure[i]["fieldType"];
//				if(bulk[fieldType]!==undefined){
//					GRID.__setValue(curCol,fieldType,bulk[fieldType]);
//				}
//			}
            for (var fieldType in bulk) {
                GRID.__setValue(curCol, fieldType, bulk[fieldType]);
            }
            GRID.__setValue(curCol, 'id', this.cidcounter++);
            grid.addCol(GRID, curCol);
            return curCol;
        };
        GRID.deleteCol = function(i) {
            this.data.splice(i, 1);
            this.structureRefresh();
            this.set(this);
        };
        GRID.__setValue = function(index, fieldType, value) {
            if (index < 0) {
                if (!GRID.headerData)
                    GRID.headerData = {};
                GRID.headerData[fieldType] = value;
            } else {
                if (!GRID.data)
                    GRID.data = [];
                if (GRID.data[index] == undefined)
                    GRID.data[index] = {};
                GRID.data[index][fieldType] = value;
            }
        };
        GRID.__getValue = function(index, fieldType, value) {
            if (index < 0) {
                if (!GRID.headerData)
                    return null;
                return GRID.headerData[fieldType];
            } else {
                if (!GRID.data)
                    return null;
                if (GRID.data[index] == undefined)
                    return null;
                return GRID.data[index][fieldType];
            }
        };
        GRID.getRowCount = function() {
            return GRID.structure.length;
        }
        GRID.getColCount = function() {
            return GRID.data.length;
        }
        GRID.getValue = function(rowNum, colNum) {
            var fieldType = GRID.structure[rowNum].fieldType;
            if (colNum < 0)
                return GRID.headerData[fieldType];
            return GRID.data[colNum][fieldType];
        };
        GRID.getID = function(rowNum, colNum) {
            return (GRID.data[colNum] ? GRID.data[colNum].id : null);
        };
        GRID.getDisplayValue = function(rowNum, colNum) {
            return GRID.displayData[rowNum][colNum];
        };
        GRID._setValueByFieldType = function(index, fieldType, value) {
            GRID.__setValue(index, fieldType, value);
        };
        GRID._getValueByFieldType = function(index, fieldType) {
            return GRID.__getValue(index, fieldType);
        };
        GRID._setValue = function(rowNum, colNum, value) {
            if (!GRID.structure[rowNum])
                return;
            var fieldType = GRID.structure[rowNum].fieldType;
            GRID.__setValue(colNum, fieldType, value);
        };
        //TO EXTEND:--//
    };

    grid.getNormalGrid = function(GRID) {
        if (GRID.pivotCol == undefined)
            GRID.pivotCol = 0;
        if (!GRID.data[0])
            GRID.data[0] = [];

        if (GRID.vertical) {
            GRID.getRowCount = function(_col) {
                if (!_col)
                    var _col = GRID.pivotCol;
                return GRID.data[_col].length;
            }
            GRID.getColCount = function() {
                return GRID.data.length;
            }
            GRID.getValue = function(rowNum, colNum) {
                return GRID.data[colNum][rowNum];
            };
            GRID.getDisplayValue = function(rowNum, colNum) {
                return GRID.displayData[colNum][rowNum];
            };
            GRID._setValue = function(rowNum, colNum, value) {
                GRID.__setValue(colNum, rowNum, value);
            };
        } else {
            GRID.vertical = false;
            GRID.getRowCount = function() {
                return GRID.data.length;
            }
            GRID.getColCount = function(_row) {
                if (!_row)
                    var _row = 0;
                return GRID.data[_row].length;
            }
            GRID.getValue = function(rowNum, colNum) {
                return GRID.data[rowNum][colNum];
            };
            GRID.getID = function(rowNum, colNum) {
                return "";
            };
            GRID.getDisplayValue = function(rowNum, colNum) {
                return GRID.displayData[rowNum][colNum];
            };
            GRID._setValue = function(rowNum, colNum, value) {
                GRID.__setValue(rowNum, colNum, value);
            };
        }
        GRID._setValueByFieldType = function() {
        };
    }

    grid.defaulOptions = function(options) {
        var defOptions = {
            rows: 0,
            cols: 0,
            data: [[], []],
            defaultCellWidth: 70,
            hideTopPanel: true,
            showContextMenu: false,
            isCustomContextMenu: true,
            defaultCellHeight: 20,
            height: 396,
            width: 504,
            minHeight: 10,
            minWidth: 100,
            hasAutoWidth: true,
            hasAutoHeight: true,
            maxHeight: 10000,
            maxWidth: 10000,
            showInterpolationDiv: false,
            defaultEditableCellStyle: "gridCellBorder ",
            defaultOddEditableCellStyle: "oddGridCellBorder centerText ",
            defaultEvenEditableCellStyle: "evenGridCellBorder centerText ",
            defaultNonEditableCellStyle: "gridCellBorder centerText nonEditable",
            defaultOddNonEditableCellStyle: "nonEditOddGridCellBorder centerText nonEditable",
            defaultEvenNonEditableCellStyle: "nonEditEvenGridCellBorder centerText nonEditable",
            columnWidths: [70, 0, 70],
            defaultRowGap: 2,
            defaultColGap: 2,
            defaultTextAlign: "center"
        };
        for (var option in options) {
            defOptions[option] = options[option];
        }

        return defOptions;
    };

    grid.format = {
        formatTypes: {},
        set: function(key, cb) {
            if (this.formatTypes[key])
                LOG.warn('format type overridden', key);
            this.formatTypes[key] = cb;
        }, get: function(key, arg1, arg2, arg3, arg4) {
            if (this.formatTypes[key])
                return this.formatTypes[key](arg1, arg2, arg3, arg4);
            return null;
        }
    }

});
