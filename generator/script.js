$(document).ready(function(){
	$('[data-toggle="tooltip"]').tooltip(); 
	$("#fontFile").change(function(e){
		var fileName = $(this).val().split('\\').pop();
		var fileType = $(this).prop("files")[0]["type"];
		$(".custom-file-label").text(fileName);
		var fileReader = new FileReader();
		var container = $("<div></div>");
		var characters = [];
		var defaultList = "";
		for(i=33;i<127;i++) defaultList+=String.fromCharCode(i);
		$("#names").val(defaultList);
		var characterList = defaultList.split("");
		var gs = {
			slc:"round",
			slj:"round",
			bsw:.5,
			lh:0,
			tf:0
		};
	    fileReader.onload = function () {
	      	var data = fileReader.result;
	      	if(fileType != "image/svg+xml"){
	      		$("#filealert span").text("Please upload an SVG file.").parents("#filealert").show();
	      		return;
	      	}else{
	      		$("#filealert").hide();
	      	}
	      	var group = $(data).find("#main");
	      	var groups = $(data).find("#main > g");
	      	if(group.length < 1){
	      		$("#filealert span").text("The group with id `main` could not be found.").parents("#filealert").show();
	      		return;
	      	}
	      	if(groups.length < 1){
	      		$("#filealert span").text("There are no elements inside `main` element.").parents("#filealert").show();
	      		return;
	      	}
	      	$("#panel").show(150);
	      	$("#generated").html("");
	      	$("#shade").html("");
	      	d3.select('#svg').html(new XMLSerializer().serializeToString($(data).find("#main")[0]));
	      	var main = $("#main");
	      	var extracted = [];
	      	var named = {};
	      	var baseline = main.find("#baseline")[0];
	      	var tWidth = 0;
			main.find("g").each(function(ip,ep){
				var g = {
					paths:[]
				};
				tWidth+= ep.getBBox().width;
				g.w = ep.getBBox().width;
				if(ep.getBBox().height > gs.lh) gs.lh = ep.getBBox().height;
				var mx = 0;
				var mxi = $(ep).find("path").length > 0 ? svgPathToCommands($(ep).find("path")[0].getAttribute("d"))[0].values[0] : 0;
				$(ep).find("path").each(function(i,e){
					var pd = {};
					var d=  svgPathToCommands(e.getAttribute("d"));
					pd.my = baseline.getBBox().y-d[0].values[1];
					mx = svgPathToCommands(e.getAttribute("d"))[0].values[0] - mxi;
					pd.mx = mx;
					pd.dy = d[0].values[1];
					var d=  svgPathToCommands(e.getAttribute("d"));
					d[0].values = [0,0];
					pd.d = commandsToSvgPath(d);
					g.paths.push(pd);
				})
				extracted.push(g);
			})
			var avgWidth = tWidth / main.find("g").length;
			var scale;
			var rs = $("#size-reference .col").width();
			scale = (rs/avgWidth)/4; 
			gs.s = scale; 
			gs.space = avgWidth;
			extracted.forEach(function(e,i){
				var character = characterList[i] || " ";
				$("#generated").append(
					"<div class='col square col-sm-6 col-md-3 col-lg-2' data-name='"+(character.charCodeAt(0))+"'>"+
						"<div class='item'>"+
							"<svg width='100%' height='100%'></svg>"+
							"<p class='letter'>"+
								"<span class='badge badge-pill badge-light'>"+character+"</span>"+
							"</p>"+
							"<p class='options-button'><span class='badge badge-pill badge-info' data-toggle='modal' data-target='#popup'>&#8942;</span></p>"+
						"</div>"+
					"</div>"
				);
				var s = $("#generated").find("svg")[i];
				var paths = e.paths;
				var g = createNode("g",{
					class:"ch"
				});
				s.appendChild(g);
				paths.forEach(function(ec,ic){
					d3.select(g).append("path").attr("d",ec.d).attr("fill","none").attr("stroke-width",".5").attr("stroke","black").attr("stroke-linecap","round").attr("stroke-linejoin","round").attr("transform","translate("+(ec.mx)+","+(-ec.my)+")");
					var path = d3.select(g).select("path").node();
					var tf = e.paths[ic].my-path.getBBox().y;
					if(tf > gs.tf) gs.tf = tf;
				})
				var bbox = g.getBBox();
				var ls = $("#generated").find(".item").width() / 2;
				var moveX = (-bbox.x+ls - bbox.width/2)/scale;
				var moveY = (-bbox.y+ls - bbox.height/2)/scale;
				if(!characterList[i]) characterList.push("");
				d3.select(g).attr("transform","scale("+scale+") translate("+(moveX)+","+moveY+")");
				$("#generated").find(".col").eq(i).data("Data",{name:characterList[i].charCodeAt(0),item:e,p:g,mx:moveX,my:moveY,s:scale,mcx:0,mcy:0});
			})
			$("#generated").sortable();
    		$("#generated").disableSelection();
    		for(var x=0;x<characterList.length;x++){
    			$("#shade").append(
    				"<div class='col square col-sm-6 col-ms-3 col-lg-2'>"+
						"<div class='item'>"+
							"<h2>"+characterList[x]+"</h2>"+
						"</div>"+
					"</div>"
    			)
    		}
    		$("#name").click(function(e){
    			var letters = $("#names").val();
    			letters = letters.split(" ").join("");
    			$("#generated > .col").each(function(i,e){
    				var l = letters[i] || " ";
    				$(this).attr("data-name",l.charCodeAt(0));
    				$(this).data("Data").name = l.charCodeAt(0);
    				$(this).css("border-bottom","none");
				})
				$("#shade > .col").each(function(i,e){
    				var l = letters[i] || " ";
    				$(this).find("h2").text(l);
				})
				name();
    		})
    		$('#popup').on('show.bs.modal',function(e){
				var col = $(e.relatedTarget).parents(".col");
				var data = col.data("Data");
				var character = col.attr("data-name");
				$(this).attr("data-current",character);
				$(this).attr("data-pointsTo",col.index());
				$("#popup .letter").text(String.fromCharCode(character));
				$("#inp-character").val(String.fromCharCode(character));
				if(character == 32) $("#inp-character").val("");
				setTimeout(function(){$("#inp-character").focus();},250);
				$("#inp-scale").val(data.s);
				$("#inp-px").val(data.mcx);
				$("#inp-py").val(data.mcy);
				$("#inp-scale-main").val(gs.s);
			})
			$('#popup .modal-dialog').draggable({
			    handle: ".modal-header"
			 });
			$("#generated").on("mousedown",".col",function(e){
				if(e.which == 2){
					$("#mmb").hide();
					$(this).find(".badge").click();
				}
			})
			$("#inp-character").keypress(function(e){
				if(e.which == 13){
					$("#sub-character").click();
				}
			})
			$("#sub-character").on("click",function(e){
				var popup = $(this).parents("#popup");
				var id = parseInt(popup.attr("data-current"));
				var pointsTo = parseInt(popup.attr("data-pointsTo"));
				var character = popup.find("#inp-character").val() == "" ? 32 : popup.find("#inp-character").val().charCodeAt(0);
				if(id != character){
					if($(".col[data-name="+character+"]").length > 0){
						var prev = $(".col[data-name='"+character+"'");
						prev.attr("data-name",32);
						prev.data("Data").name = 32;
					}
					var col = $("#generated .col").eq(pointsTo);
					col.attr("data-name",character);
					col.data("Data").name = character;
					col.css("border-bottom","none");
					popup.find(".letter").text(String.fromCharCode(character));
					name();
				}
			})
			$("body").on("input",".ds.slider",function(e){
				var popup = $(this).parents("#popup");
				var col = $("#generated .col").eq(popup.attr("data-pointsTo"));
				set = $(this).attr("data-to");
				data = col.data("Data");
				data[set] = Number($(this).val());
				d3.select(data.p).attr("transform","scale("+(data.s)+") translate("+(data.mx+data.mcx)+","+(data.my+data.mcy)+")");
			})
			$("#gsubmit").click(function(){
				gs.slj = $("#inp-slj").val();
				gs.slc = $("#inp-slc").val();
				gs.bsw = $("#inp-sw").val();
				$("#generated .col").each(function(e){
					var g = $($(this).data("Data").p);
					g.find("path").each(function(i,e){
						d3.select(e).attr("stroke-linejoin",gs.slj).attr("stroke-linecap",gs.slc).attr("stroke-width",gs.bsw);
					})
				})
			})
    		$("#generate").click(function(e){
				var c = true;
				if($("#generated .col[data-name=32]").length > 0){
					c = confirm("There are unmarked characters in the list. Are you sure to generate without those characters ?");
					$("#generated .col[data-name=32]").css("border-bottom","2px solid #F44336");
				}
				if(c){
					var main = {
						c:{},
						p:{
							s:gs.s,
							slc:gs.slc,
							slj:gs.slj,
							bsw:gs.bsw,
							lh:gs.lh,
							space:gs.space,
							tf:gs.tf
						}
					};
					$("#generated .col").each(function(i,e){
						var data = $(this).data("Data");
						if(data.name != 32) main.c[data.name] = data.item;
					})
					downloadObjectAsJson(main,"font");
				}
			})
			$(window).scroll(function(e){
				if($(window).scrollTop() > $(".spacing").height()){
					$("#panel").addClass("fixed");
				}else{
					$("#panel").removeClass("fixed");
				}
			})
	    };
	    fileReader.readAsText($(this).prop('files')[0]);
	})
	function name(){
		$("#generated .col").each(function(i,e){
			$(this).find(".letter span").text(String.fromCharCode($(this).data("Data").name));
		})
	}
})

var markerRegEx = /[MmLlSsQqLlHhVvCcSsQqTtAaZz]/g;
var digitRegEx = /-?[0-9]*\.?\d+/g;
function svgPathToCommands(str) {
    var results = []; 
    var match; while ((match = markerRegEx.exec(str)) !== null) { results.push(match); };
    return results
        .map(function(match) {
            return { marker: str[match.index], 
                     index: match.index };
        })
        .reduceRight(function(all, cur) {
            var chunk = str.substring(cur.index, all.length ? all[all.length - 1].index : str.length);
            return all.concat([
               { marker: cur.marker, 
                 index: cur.index, 
                 chunk: (chunk.length > 0) ? chunk.substr(1, chunk.length - 1) : chunk }
            ]);
        }, [])
        .reverse()
        .map(function(command) {
            var values = command.chunk.match(digitRegEx);
            return { marker: command.marker, values: values ? values.map(parseFloat) : []};
        })
}

function commandsToSvgPath(commands) {
    return commands.map(function(command) {
        return command.marker + ' ' + command.values.join(',');
    }).join(' ').trim();
}

function createNode(n, v) {
  	n = document.createElementNS("http://www.w3.org/2000/svg", n);
  	for (var p in v)
    	n.setAttributeNS(null, p.replace(/[A-Z]/g, function(m, p, o, s) { return "-" + m.toLowerCase(); }), v[p]);
  	return n
}

function getTranslation(transform) {
  	var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  	g.setAttributeNS(null, "transform", transform);
  	var matrix = g.transform.baseVal.consolidate().matrix;
  	return [matrix.e, matrix.f];
}

function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
