select_namespace("utils.custom.chart", function(chart){

	chart.init = function(chartData){	
		$.fn.drawChart = function(chartData){
			if(!chartData.width){
				chartData.height = $(this).attr("width");
				if(chartData.height==undefined) chartData.height = $(this).width();
			}
			if(!chartData.height){
				chartData.height = $(this).attr("height");
				if(chartData.height==undefined) chartData.height = $(this).height();
			}
			chartData.$div = $(this);
			chart.draw(chartData);
		};
	};

	chart.draw = function(chartData){

		var seriesData = [];
		if(!chartData.legendLabels) chartData.legendLabels = [];
			//for(var i = 1; i < chartData.figData.length; i++){
		if(chartData.noCategories == true){
			for(var i = 1; i < chartData.figData.length; i++){
				var lgLabel = chartData.legendLabels[i];
				if(!lgLabel) lgLabel = "";
				var figData = chartData.figData[i];
				var data = [];
				for(var j = 0; j < figData.length; j++)
					data.push([chartData.figData[0][j], chartData.figData[i][j]]);
				seriesData.push({ name: lgLabel, data: data});
			}
		}else{
			for(var i = 1; i < chartData.figData.length; i++){
				var lgLabel = chartData.legendLabels[i];
				if(!lgLabel) lgLabel = "";
				seriesData.push({ name: lgLabel, data: chartData.figData[i] });
			}
		}
		var labels = {};
		if(chartData.yTitle_suffix)
			labels["formatter"] = function() {return this.value + chartData.yTitle_suffix;}

		var stepVal = 0;
		if(chartData.figData[0])
			stepVal = utils.math.getRoundValue((chartData.figData[0].length / 10), 0);	
		if(chartData.stepVal)
			stepVal = chartData.stepVal;

		if(chartData.chartID){
			var width = (chartData.width) ? chartData.width + "px" : "750px";
			var height = (chartData.height) ? chartData.height + "px" : "330px";
			chartData.$div.html('<div id="'+chartData.chartID+'" style="width: ' + width + '; float: left; height: '+ height +';"></div>');
			chartData.divId = chartData.chartID;
		}
		var chartObject = {
				chart: {
					xAxisGridLineStep : 7 ,
					renderTo: chartData.divId,
					defaultSeriesType: 'line',
					zoomType: 'x',
					resetZoomButton: {
		            theme: {
		                fill: 'white',
		                stroke: 'silver',
		                r: 0,
		                states: {
		                    hover: {
		                        fill: '#41739D',
		                        style: {
		                            	color: 'white',
										cursor: 'pointer'
										}
									}
								}
							}
						},
					spacingRight: 10,
					spacingLeft: 1,
					marginBottom: (chartData.marginBottom ? chartData.marginBottom : 40),
					events : {
						selection : function(event){
							if(event.xAxis){
								var stepVal = utils.math.getRoundValue(((event.xAxis[0].max - event.xAxis[0].min) / 10), 0);	
								chart.xAxis[0].update({
								    labels: {
								        step: stepVal
								    }
								});
							}else{
								var stepVal = 0;
								if(chartData.figData[0])
									stepVal = utils.math.getRoundValue((chartData.figData[0].length / 10), 0);
								chart.xAxis[0].update({
								    labels: {
								        step: stepVal
								    }
								});
							}
						}
					}
				},
				credits: {
		        	enabled: false
		    	},			
				legend: {				
		        	enabled: (chartData.legend ? chartData.legend : false),
		        	align	: 'right',
		        	layout	:	'vertical',
		        	borderWidth : 0,
		        	verticalAlign: 'top',
		        	x : -8,
		        	y : 18
		    	},
		        title: {
		        	text: (chartData.chartTitle == undefined) ? '' : chartData.chartTitle
		        },
				navigation: {
					buttonOptions: {
						enabled: false
						}
				},
				xAxis: {				
					categories: (chartData.noCategories) ? null : ((chartData.xAxis) ? chartData.xAxis : (chartData.figData[0])), 
					title: {						
						text: chartData.xTitle
					},
					labels:{
						rotation: (chartData.xrotation) ? chartData.xrotation : 0,
						step: (stepVal ? stepVal : 0),
						align : (chartData.xAlign) ? chartData.xAlign : 'center',
						y : (chartData.xY) ? chartData.xY : 15,
						format : (chartData.xRound) ? '{value:.'+chartData.xRound+'f}' : '{value}'
					},
					/*plotLines: [{
						value: 0,
						width: 1,
						color: '#808080'
					}],*/
					tickmarkPlacement: 'on'//To display the Tick value on the Tick 'on' 'between'
				},
				yAxis: {
					title: {
						text: chartData.yTitle
					},
					labels: labels,
					plotLines: [{
						value: 0,
						width: 1,
						color: '#808080'
					}],
					lineWidth : 1,
					lineColor : '#808080',
					format : (chartData.yRound) ? '{value:.'+chartData.yRound+'f}' : '{value}'
				},
				plotOptions: {
		            series: {
		            	cursor : (chartData.cursor ? chartData.cursor : ""),
		                connectNulls: true,
		                point : {
                            events : {
                                click : function(e){
                                	try{
                                		chartData.click(e, this);
                                	}catch(exc){}                                	
                                }
                            }
                        }
		            }
		        },
				
				tooltip: {
					shared: true,
					useHTML: true,
					headerFormat: '<small>' + ((chartData.tooltip && chartData.tooltip.xLabel) ? chartData.tooltip.xLabel + ': ' : '') 
									+ '{point.key'+((chartData.xRound) ? ':.'+chartData.xRound+'f' : '')+'}</small><table>',
					pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
					'<td style="text-align: right"><b>{point.y'+((chartData.yRound) ? ':.'+chartData.yRound+'f' : '')+'}</b></td></tr>',
					footerFormat: '</table>',
					valueDecimals: (chartData.valueDecimals != undefined ? chartData.valueDecimals : 2)
		    	},
		    	credits: {
		        	enabled: false
		    	},
		    	series:	seriesData
		};
		if(chartData.chartType)
			chartObject.chart.defaultSeriesType = chartData.chartType;
		var chart = new Highcharts.Chart(chartObject);
	};	
	
	chart.drawValues = function(chartData){

		var seriesData = [];

		for(var i = 0; i < chartData.figData[0].length; i++){
				seriesData.push([chartData.figData[0][i]-0, chartData.figData[1][i]-0]);
		}
		//console.log(seriesData)data: [[1,29.9], [3,30], [4,30.1], [10,35], [20,40], [40,50], [50,100]] 
		
		var chartObj = {
		        chart: {
		            renderTo: chartData.divId,
		            zoomType: 'x',
					resetZoomButton: {
		            theme: {
		                fill: 'white',
		                stroke: 'silver',
		                r: 0,
		                states: {
		                    hover: {
		                        fill: '#41739D',
		                        style: {
		                            	color: 'white',
										cursor: 'pointer'
										}
									}
								}
							}
						}
		        },
		        title: {
		            text: (chartData.chartTitle == undefined) ? '' : chartData.chartTitle
		        },
		        xAxis: {
		        	title: {
						text: chartData.xTitle
					},
					labels:{
						format : (chartData.xRound) ? '{value:.'+chartData.xRound+'f}' : '{value}'
					}
		        },
		        yAxis: {
					title: {
						text: chartData.yTitle
					},
					lineWidth : 1,
					lineColor : '#808080',
					labels:{
						format : (chartData.yRound) ? '{value:.'+chartData.yRound+'f}' : '{value}'
					}
				},
		        series: [{
		        	data : seriesData
		        }],
		        credits: {
		        	enabled: false
		    	},
		    	legend: {				
		        	enabled: false
		        },
		        tooltip: {
					shared: true,
					useHTML: true,
					headerFormat: '<table><tr><td style="color: {series.color}">' + i18n("fx.spot") + ': </td>' +
					'<td style="text-align: right"><b>'+
					'{point.key'+((chartData.xRound) ? ':.'+chartData.xRound+'f' : '')+'}'+
					'</b></td></tr>',
					pointFormat: '<tr><td style="color: {series.color}">' + i18n("common.premium") + ': </td>' +
					'<td style="text-align: right"><b>{point.y}</b></td></tr>',
					footerFormat: '</table>',
					valueDecimals: (chartData.valueDecimals != undefined ? chartData.valueDecimals : 2)
		    	}
		    };
		var chart = new Highcharts.Chart(chartObj);
	};
	
	chart.drawTwoAxis = function(chartData){

		var seriesData = [];
		if(!chartData.y1legendLabels) chartData.y1legendLabels = [];
		for(var i = 1; i < chartData.y1figData.length; i++){
			var lgLabel = chartData.y1legendLabels[i - 1];
			if(!lgLabel) lgLabel = "";			
			seriesData.push(	
				{				
	            name: lgLabel,                
	            yAxis: 1,
	            type: 'column',
	            data: chartData.y1figData[i]
	
				});
		}
		if(!chartData.y2legendLabels) chartData.y2legendLabels = [];
		for(var i = 1; i < chartData.y2figData.length; i++){
			var lgLabel = chartData.y2legendLabels[i - 1];
			if(!lgLabel) lgLabel = "";
			seriesData.push({
                name: lgLabel,
                data: chartData.y2figData[i]
            });
		}
		
		var stepVal = 0;
		if(chartData.y1figData[0])
			stepVal = utils.math.getRoundValue((chartData.y1figData[0].length / 10), 0);
		if(chartData.stepVal)
			stepVal = chartData.stepVal;

		if(chartData.chartID){
			var width = (chartData.width) ? chartData.width + "px" : "750px";
			var height = (chartData.height) ? chartData.height + "px" : "330px";
			chartData.$div.html('<div id="'+chartData.chartID+'" style="width: ' + width + '; float: left; height: '+ height +';"></div>');
			chartData.divId = chartData.chartID;			
		}
		var chartObject = {
				chart: {
					xAxisGridLineStep : 7 ,
					renderTo: chartData.divId,
					defaultSeriesType: 'line',
					zoomType: 'x',
					resetZoomButton: {
		            theme: {
		                fill: 'white',
		                stroke: 'silver',
		                r: 0,
		                states: {
		                    hover: {
		                        fill: '#41739D',
		                        style: {
		                            	color: 'white',
										cursor: 'pointer'
										}
									}
								}
							}
						},
					spacingRight: 10,
					spacingLeft: 1,
					marginBottom: 100
				},
				credits: {
		        	enabled: false
		    	},			
				legend: {				
		        	enabled: (chartData.legend ? chartData.legend : false),
		        	align	: 'right',
		        	layout	:	'vertical',
		        	borderWidth : 0,
		        	verticalAlign: 'top',
		        	x : -8,
		        	y : 18
		    	},
		        title: {
		            text: ''
		        },
				navigation: {
					buttonOptions: {
						enabled: false
						}
				},
				xAxis: {				
					categories:(chartData.xAxis) ? chartData.xAxis : (chartData.y1figData[0]), 
					title: {						
						text: chartData.xTitle
					},
					labels:{
						rotation: -60,
	                    align: 'right',
	                    y : 10,
	                    step: (stepVal ? stepVal : 0)
					},
					tickmarkPlacement: 'on'//To display the Tick value on the Tick 'on' 'between'
				},
				yAxis: [{ // Primary yAxis
	                labels: {
	                    formatter: function() {
	                        return this.value + (chartData.yTitle_suffix ? chartData.yTitle_suffix : "") + '%';
	                    }
	                },
	                /*title: {	                    
	                	text: chartData.y1Title     //To give the title on Y-axis
	                },*/
	                title: {	                    
	                	text: ''
	                },
	                opposite: true,
	                lineWidth: 1
	    
	            }, { // Secondary yAxis
	                gridLineWidth: 0,
	                /*title: {	                    
	                	text: chartData.y2Title     //To give the title on Y-axis
	                },*/
	                title: {	                    
	                	text: ''
	                },
	                labels: {
	                    formatter: function() {	                        
	                        return this.value + (chartData.yTitle_suffix ? chartData.yTitle_suffix : "");
	                    }
	                },
	                lineWidth: 1    
	            }],				
				plotOptions: {
		            series: {
		                connectNulls: true
		            }
		        },
				
				tooltip: {
					shared: true,
					useHTML: true,
					headerFormat: '<small>' + ((chartData.tooltip && chartData.tooltip.xLabel) ? chartData.tooltip.xLabel + ': ' : '')
						+ '{point.key}</small><table>',
					pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
					'<td style="text-align: right"><b>{point.y}</b></td></tr>',
					footerFormat: '</table>'
		    	},
		    	credits: {
		        	enabled: false
		    	},		    	
		    	series: seriesData
		}; 
		if(chartData.chartType)
			chartObject.chart.defaultSeriesType = chartData.chartType;	
		var chart = new Highcharts.Chart(chartObject);
		
	};
	
});

select_namespace("dff.chart_wrapper", function(namespace){
	
	namespace.draw = function(chartData){
		utils.custom.chart.draw(chartData);
	};	
	
	namespace.drawValues = function(chartData){
		utils.custom.chart.drawValues(chartData);
	};
	
	namespace.drawTwoAxis = function(chartData){
		utils.custom.chart.drawTwoAxis(chartData);
	};
});
