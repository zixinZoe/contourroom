var width = 0;
var height = 0;
var start = 0;
var end = 0;
var step = 0;
var xs =[]
var ys = []
var canvasx = 300;
var canvasy = 150;
var sample_distance = 0;

function validInput(){
    // var input = document.getElementById("line").value; "e.g. anchorLoc=1500,1500;1500,2500;2500,1500;2500,2500&roomSize=4000*4000&gradient=0;3000;100&sampleDistance=200&maxErrShown=10000&iniSeed=roomCenter/origin/custom&customSeed=20,20&dop=all/best"
    var anchorLoc = document.getElementById("anchorloc").value;
    var roomSize = document.getElementById("roomsize").value;
    var gradient = document.getElementById("gradient").value;
    var sample_distance = document.getElementById("sampledistance").value;
    var maxErrShown = document.getElementById("maxerrshown").value;
    var iniSeed = document.getElementById("iniseed").value;
    var customSeed = document.getElementById("customseed").value;
    var dop = document.getElementById("dop").value;

    var curWidth = parseInt(document.getElementById("contour").style.width);
    // if(userinput){

        const input = "anchorLoc="+anchorLoc+"&roomSize="+roomSize+"&gradient="+gradient+"&sampleDistance="+sample_distance+"&maxErrShown="+maxErrShown+"&iniSeed="+iniSeed+"&customSeed="+customSeed+"&dop="+dop
        const coors = roomSize.split("*");
        // console.log(coors);
        width = parseInt(coors[0]);
        height = parseInt(coors[1]);
        var scale = height/width;
        gradient = gradient.split(';');
        start = gradient[0];
        end = gradient[1];
        step = gradient[2];
        sample_distance = parseInt(sample_distance);
        // console.log(inputs[1])
        const anchors = anchorLoc.split(";");
        const canvas = document.getElementById("canvas");
        var ctx = document.getElementById("canvas").getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // console.log(anchors);
        for(var i =0; i<anchors.length;i++){
            const locs = anchors[i].split(",");
            // console.log(locs);
            // console.log(parseInt(locs[0])*300/width);
            xs.push(parseInt(locs[0])*canvasx/width);
            ys.push(canvasy-parseInt(locs[1])*canvasy/height);
        }
        // console.log(xs);
        // console.log(ys);
        document.getElementById("contour").style.height = (scale*curWidth).toString()+"px";
        var pointSize = 3;
    

        function createCORSRequest(method, url){
            var xhr = new XMLHttpRequest();
            if ("withCredentials" in xhr){
                xhr.open(method, url, true);
            } else if (typeof XDomainRequest != "undefined"){
                xhr = new XDomainRequest();
                xhr.open(method, url);
            } else {
                xhr = null;
            }
            return xhr;
        }

        const url = "https://localhost:8081/path?"+input;
        var http = createCORSRequest("get", url);
        // console.log(url)
        contour_map = document.getElementById('contour');
        map = document.getElementById('map');

        http.onload = function ()
        {
            if (this.status >= 200 && this.status < 400)
            {
                // Success!
                // console.log("get here")
                // console.log(this.response)
                var data = JSON.parse(this.response);
                var x_axis = [];
                for (var i = 0; i <= width;i = i+sample_distance) {
                    // console.log(i);
                    x_axis.push(i);
                }
                var y_axis = [];
                for (var i = 0; i <= height;i = i+sample_distance) {
                    y_axis.push(i);
                }
                var contour_data = [{
                    z: data,
                    type: 'contour',
                    // colorscale:{range: [0,10000]},
                    // colorscale:"Jet",
                    x: x_axis,
                    y: y_axis,
                    contours : {
                        start :start,
                        end :end,
                        size :step},
                    contours: {
                        coloring: 'heatmap',
                        showlabels: true,
                        labelfont: {
                            family: 'Raleway',
                            size: 12,
                            color: 'white',
                        }
                        }
                }];

                // var layout = {
                //     title: 'Colorscale for Contour Plot'
                //   };
                  var layout = {
                    autosize: false,
                    width: 500*(width/height),
                    height: 500,
                    title: 'Colorscale for Contour Plot',
                    automargin: false,

                    xaxis:{range: [0,width]},
                    yaxis:{range: [0,height]},
                }
                Plotly.newPlot(contour_map, contour_data, layout);
                console.log(data);
                
                for (var i = 0; i< xs.length; i++){
                    console.log('reach here')
                    getPosition(xs[i],ys[i]);
                }
                xs = [];
                ys = [];
            } else
            {
                // We reached our target server, but it returned an error.
                console.log("Error status not between 200 and 400.");
            }
        };

        http.onerror = function (e)
        {
            // There was a connection error of some sort.
            console.log(e);
        };

        http.send();
}
