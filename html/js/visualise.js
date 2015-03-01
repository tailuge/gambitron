var drawAll = function(tree) {

    var width = 1496,
        height = 800;

    var color = d3.scale.category20();

    var force = d3.layout.force().charge(-100).linkDistance(20).size([width, height]);

    var svg = d3.select("body").append("svg").attr("width", width).attr("height", height);

    d3.json("kga.json", function(error, json) {
        var graph = {};
        walkJson(json, null);
        graph.nodes = nodes;
        graph.links = links;
        force.nodes(graph.nodes).links(graph.links).start();

        var link = svg.selectAll(".link").data(graph.links).enter().append("line").attr("class", "link").style("stroke-width", function(d) {
            return Math.sqrt(d.value);
        });



        // Create the groups under svg
        var gnodes = svg.selectAll('g.gnode').data(graph.nodes).enter().append('g').classed('gnode', true);

        // Add one circle in each group
        var node = gnodes.append("circle").attr("class", "node").attr("r", 5).style("fill", function(d) {
            return color(d.group);
        }).call(force.drag);

        // Append the labels to each group
        var labels = gnodes.append("text").text(function(d) {
            return d.name;
        });



        force.on("tick", function() {
            link.attr("x1", function(d) {
                return d.source.x;
            }).attr("y1", function(d) {
                return d.source.y;
            }).attr("x2", function(d) {
                return d.target.x;
            }).attr("y2", function(d) {
                return d.target.y;
            });

            // Translate the groups
            gnodes.attr("transform", function(d) {
                return 'translate(' + [d.x, d.y] + ')';
            });

        });

    });

};

var nodes = [];
var links = [];

var uuid = 1;
var nextUuid = function() {
    return uuid++;
};

var walkJson = function(jsonObject, parentNode) {

    if (typeof jsonObject.uuid !== "undefined") {
        // already visited
        console.log("visited uuid:" + jsonObject.uuid);
        return;
    }

    // mark with uuid and add graph node
    jsonObject.uuid = nextUuid();
    var mainNode = {
        name: "",
        group: uuid
    };
    nodes.push(mainNode);

    // link to parent
    if (parentNode !== null) {
        links.push({
            source: nodes.indexOf(parentNode),
            target: nodes.indexOf(mainNode)
        });
    }

    // walk over items within this object
    for (var key in jsonObject) {
        if (jsonObject.hasOwnProperty(key) && (key !== "uuid")) {
            var item = jsonObject[key];
            if (Object.prototype.toString.call(item) === '[object Array]') {
                // found sub array
                for (var i in item) {
                    walkJson(item[i], mainNode);
                }
            }
            else if (item !== null && typeof item === 'object') {
                // sub object
                walkJson(item, mainNode);
            }
            else {
                var attributeNode = {
                    name: key + " -> " + item,
                    group: uuid
                };
                nodes.push(attributeNode);
                links.push({
                    source: nodes.indexOf(mainNode),
                    target: nodes.indexOf(attributeNode)
                });
            }
        }
    }
};

drawAll(null);

/*
$(document).ready(function() {
    var url = 'https://c9.io/tailuge/gambit/workspace/example.json';
    $.getJSON(url, function(data) {
        walkJson(data, null);
        console.log(JSON.stringify(nodes, null, 1));
        console.log(JSON.stringify(links, null, 1));
        drawAll(data);
    });
});
*/
