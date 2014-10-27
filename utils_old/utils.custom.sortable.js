select_namespace("utils.custom.sortable", function(sortable){
	
	sortable.id = 0;
	sortable.set = function($sel){
		var OBJ = { $container : $sel, id : this.id++,
			tiles : [], count : 0,
			curCol : 0, COLS : [], //totalCol : 0,
			add : function($tile){
				//this.$container.append($tile); return;
				this.COLS[this.curCol].append($tile);
				this.curCol = (++this.curCol)%this.COLS.length ;
				this.count++;
				$tile.attr('data-tile-id',this.count);
				this.tiles[this.count] = $tile;
			},
			resetCols : function(){
				var OLD_COLS = this.COLS;
				var OLD_TILES = this.tiles
				this.COLS = []; this.tiles = [];
				var cols = Math.round(this.$container.width()/120);
				this.addCol(cols);
				this.curCol = 0;
				for(var i in OLD_TILES){
					if(OLD_TILES[i]) this.add(OLD_TILES[i]);
				}
				for(var i in OLD_COLS){
					if(OLD_COLS[i]) OLD_COLS[i].remove();
				}
			},
			addColContainer : function($column){
				this.COLS.push($column);
				$sel.append($column);
			},
			resetEmpty : function(index){
				var $mov = this.COLS[index];
				this.COLS.splice(index, 1);
				this.addColContainer($mov);
			},
			checkEmpty : function($column){
				var order = $column.index();
				if($column.is(':empty')){
					this.resetEmpty(order);
				}
			},
			addCol : function(addC){
				var addC = addC || 1;
				for(var i=0; i<addC; i++){
					var $column = $('<div class="column sortsel'+this.id+'"></div>');
					this.addColContainer ($column);
					var THIS = this;
					$column.sortable({
						connectWith: '.sortsel'+this.id,
						// delay: 500
						helper: "clone", forceHelperSize : true,
						opacity: 0.5,
						//revert : true,
						remove : function(e,e2){
							THIS.checkEmpty($(this));
						}
					});
					$column.disableSelection();
				}
			}
		};
		$sel.addClass('sortableContianer');
		OBJ.resetCols();
		return OBJ;
	};
	
})

select_namespace("utils.custom.sortable.test", function(test){
	
	window.addTile = function(options){
		options = options || {};
		options.height = options.height || 50;
		options.width = options.width || 100;
		var $newDiv = test.$sample.clone();
		$newDiv.css('height',options.height);
		$newDiv.css('width',options.width);
		$newDiv.find('.rand').text(options.num);
		test.con.add($newDiv);
	};
	
	$(document).ready(function(){
		test.$sample = $('#sample');
		test.con = utils.custom.sortable.set($(".tileWrapper"))
		for(var i=0;i<20;i++){
			window.addTile({
				num : i,
				height : Math.round(50+(Math.random()*100))
			});
		}
		
		utils.onResize = function(){
			test.con.resetCols();
		};
		
	});
	
});

