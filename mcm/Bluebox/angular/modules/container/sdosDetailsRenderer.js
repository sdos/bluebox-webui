'use strict';


function SdosSheetController($rootScope, $state, $scope, $mdDialog, $http) {

    var dataset;


    var i = 0,
        duration = 750,
        root,
        height = 500,
        width = 3000;

    var tree = d3.layout.tree()
        .size([height, width]);

    var diagonal = d3.svg.diagonal()
        .projection(function (d) {
            return [d.y, d.x];
        });


    var svg;

    console.log(d3.select("#cascadeRendering"));

    var cascadeData = _.clone($scope.sdosStats);

    $scope.hide = function () {
        $mdDialog.hide();
    };
    $scope.cancel = function () {
        $mdDialog.cancel();
    };


    function getSdosPartitions() {
        $http
            .get('swift/containers/' + $scope.container.name + '/objects/__mcm__/sdos_used_partitions')
            .then(
                function successCallback(response) {
                    cascadeData.usedPartitions = response.data;
                    $scope.sdosUsedPartitions = response.data;
                    console.log(cascadeData);
                    dataset = jsonToFlare(cascadeData);
                    root = dataset[0];
                    root.x0 = height / 2;
                    root.y0 = 0;


                    svg = d3.select("#cascadeRendering").append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .append("g")
                        .attr("transform", "translate(20,0)");


                    update(root);

                    d3.select(self.frameElement).style("height", "500px");

                },
                function errorCallback(response) {
                    console.error("ERROR GETTING DETAILS FROM SERVER: " + response.data);
                });

    };


    function getSdosMapping() {
        $http
            .get('swift/containers/' + $scope.container.name + '/objects/__mcm__/sdos_partition_mapping')
            .then(
                function successCallback(response) {
                    $scope.sdosPartitionMapping = response.data;

                },
                function errorCallback(response) {
                    console.error("ERROR GETTING DETAILS FROM SERVER: " + response.data);
                });

    };


    getSdosMapping();
    getSdosPartitions();

    /*
     *
     * Renderer functions
     *
     *
     *
     *
     * */


    function update(source) {

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function (d) {
            d.y = d.depth * 180;
        });

        // Update the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on("click", click);

        nodeEnter.append("circle")
            .attr("r", 1e-6)
            .style("fill", function (d) {
                return d._children ? "lightsteelblue" : "#fff";
            });

        nodeEnter.append("text")
            .attr("x", function (d) {
                return d.children || d._children ? -13 : 13;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", function (d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function (d) {
                return d.name;
            })
            .style("fill-opacity", 1e-6);

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        nodeUpdate.select("circle")
            .attr("r", 10)
            .style("fill", function (d) {
                return d._children ? "lightsteelblue" : "#fff";
            });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        // Update the links…
        var link = svg.selectAll("path.link")
            .data(links, function (d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function (d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function (d) {
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }


// Toggle children on click.
    function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }

    var children;


    function jsonToFlare(data) { // Depth
        // the objecti is to have a structure with parents and children
        // FROM: {"partitionSize": 4, "levels":3, "usedPartitions": [0,1,5], "objectMapping": [{}]}
        // {name:"root", children: [{},{},{}]}
        var name = pidFop(data.partitionSize, 0);
        var children = getChildren(name, 1, data);
        return [{"name": name, "children": children}];
    }

    function getChildren(parent, level, data) {
        var first = (parent * data.partitionSize) + 1;
        var last = (parent + 1) * data.partitionSize;

        var children = [];
        var k = 0;
        for (var i = first; i <= last; i++) { // for each child of this parent
            if (data.usedPartitions.indexOf(i) > -1) {
                if (level < data.levels)
                    children[k] = {"name": i, "children": getChildren(i, level + 1, data)}
            }
            //else children[k] = null;
            k++;
        }
        return children;
    }

    function pidFop(ps, level) {
        return (Math.pow(ps, level) - 1) / (ps - 1);
    }


};











































