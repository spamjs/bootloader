var ODArray = function(options){
	var options = options || {};
	if(!options.index){
		this.index = function(item){
			if(this._sort){
				for(var i in this.data){
					if(this._sort(this.data[i],item)>0) return i;
				}
			}
			return this.data.length;
		}
	}
	this.data = [];
	this.push = function(item){
		var index = this.index(item);
		console.log('index',index,item)
		this.data.splice(index, 0, item);
	};
	this._sort = options.sort;
	this.sort = function(cb){
		if(cb!=undefined){
			this._sort = cb;
		}
		this.data.sort(this._sort)
	};
	this.insert = function(index,item){
		this.data.push(item)
	};
};