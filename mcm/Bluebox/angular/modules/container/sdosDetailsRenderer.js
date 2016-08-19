'use strict';


function SdosSheetController($rootScope, $state, $scope, $mdDialog, $http) {

    var icon_file = "/angular/icons/d3/plusfile.svg";
    var icon_key = "/angular/icons/d3/key.svg";
    var icon_masterkey = "/angular/icons/d3/masterkey.svg";
    var icon_plusfile = "/angular/icons/d3/plusfile.svg";
    var icon_pluskey = "/angular/icons/d3/pluskey.svg";

    var dataset;
    var dataP;
    var inicialTree = [];
    var text;


    var margin = {top: 20, right: 120, bottom: 20, left: 120},
        width = 1000 - margin.right - margin.left,
        height = 800 - margin.top - margin.bottom;

    var i = 0,
        duration = 750,
        root;

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
                    $scope.sdosUsedPartitions = response.data;
                    getSdosMapping();

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
                    doRender();

                },
                function errorCallback(response) {
                    console.error("ERROR GETTING DETAILS FROM SERVER: " + response.data);
                });

    };


    getSdosPartitions();

    /*
     *
     * Renderer functions
     *
     *
     *
     *
     * */


    function doRender() {

        cascadeData.usedPartitions = $scope.sdosUsedPartitions;
        cascadeData.objectMapping = $scope.sdosPartitionMapping;
        dataP = cascadeData;
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

        var open = [];
        /* For the start configuration of the tree
         * takes the first node of each level and let
         * their open
         * */
        for (var i = 0; i < cascadeData.levels - 1; i++) {
            open.push(pidFop(cascadeData.partitionSize, i));
        }
        inicialTree = open;
        closeTree(root, open);
    }


    function leafPathName(name, data, path) {
        /* Receives the name of the object
         * and search for it in objectMapping
         * returning the number of the parent
         * */
        var parent = null;
        for (i in data.objectMapping) {
            for (var j = 0; j < data.objectMapping[i].length; j++) {
                if (data.objectMapping[i][j] != null && data.objectMapping[i][j].objName == name) {
                    parent = i;
                    break;
                }
            }
        }

        /* Founded the parent takes the path in the tree
         * */
        if (parent != null) {
            leafPath(parent, data.partitionSize, path);
        }

    }

    function leafPath(value, ps, path) {
        var aux = value.toString().split("|");
        var number = parseInt(aux[0]);
        var name = aux[1];
        /* By a number/key node name, finds all the path
         *  from the root to this current number
         *  returning it in a list
         * */
        if (number > 0) {
            var parent = parseInt((number - 1) / ps);
            path.push(number);
            leafPath(parent, ps, path);
        } else {
            path.push(0);
        }
    }

    function highlightObj(name, path) {
        /* Go through the root structure to change
         * the color of the object selected
         * */
        var i = 0;
        path.reverse();


    }

    function closeTree(source, openNodes) {
        /* Uses the click function to let just the nodes
         *  in the array openNodes open in the tree. the remain
         *  do not show its children
         * */
        var nodes = tree.nodes(source).reverse();

        nodes.forEach(function (d) {
            if (d.children != null && openNodes.indexOf(d.name) < 0) {
                click(d);
                //console.log(d);
            }
            else if (d._children != null && openNodes.indexOf(d.name) > -1) {
                click(d);
            }
        });
    }


    function update(source) {

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),  // list of the nodes objects, descending
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function (d) {
            d.y = d.depth * 100;
        }); // the distance between nodes

        // Update the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function () {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on("click", function (d) {
                if (d.type == "down" || d.type == "object_down")
                    return clickDown(d);
                else if (d.type == "up" || d.type == "object_up")
                    return clickUp(d);
                else return click(d)
            });

        // append circles and rectangles to the nodes
        nodeEnter.append("circle")
            .attr("r", 1e-6)
            .style("fill", function (d) {
                return d._children ? "lightsteelblue" : "#fff";
            });

        nodeEnter.append("rect")
            .attr("width", 0)
            .attr("height", 0)
            .style("fill", function (d) {
                if (d.type == "master") return "#f26363";
                else  return d._children ? "lightsteelblue" : "#fff";
            });


        nodeEnter.append("svg:image")
            .attr("xlink:href", function (d) {
                return d.type == "key" ? icon_key : ( d.type == "master" ? icon_masterkey : ( d.type == "object" ? icon_file :
                    (d.type == "up" || d.type == "down" ? icon_pluskey : icon_plusfile) ));
            })
            .attr("x", "-10px")
            .attr("y", "-24px")
            .attr("width", "37px")
            .attr("height", "37px");


        // the label of the node
        nodeEnter.append("text")
            .attr("x", function (d) {
                return d.children || d._children ? -13 : 25;
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

        // the new style after the transition


        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function () {
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
            .attr("d", function () {
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
            .attr("d", function () {
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

    function clickDown(d) {
        console.log(d.parent);
        // add the list up object
        if (d.parent.siblings_up.length == 0) {
            if (d.type == "object_down")
                d.parent.children.splice(0, 0, {"name": "up", "children": null, "type": "object_up"});
            else
                d.parent.children.splice(0, 0, {"name": "up", "children": null, "type": "up"});
        }
        /* Remove the last 5 children from the parent
         * */
        var newSiblings;

        if (d.parent.siblings_up.lenght == 0)
            newSiblings = d.parent.children.splice(0, d.parent.children.length - 1);
        else
            newSiblings = d.parent.children.splice(-6, 5);
        // Take new children from the siblings_down
        var newChildren = d.parent.siblings_down.splice(0, 5);
        newChildren.forEach(function (e) {
            d.parent.children.splice(-1, 0, e);
        });

        // put the old children in siblings_up
        d.parent.siblings_up = d.parent.siblings_up.concat(newSiblings);

        // if comes to the end of the list siblings_down, remove the list down objetc
        if (d.parent.siblings_down.length == 0)
            d.parent.children.splice(-1, 1);

        console.log(d.parent);
        update(d);
    }

    function clickUp(d) {

        // take the new children
        var newChildren = d.parent.siblings_up.splice(d.parent.siblings_up.length - 5, 5);

        var newSiblings;
        // remove children
        if (d.parent.siblings_down.length == 0) {
            newSiblings = d.parent.children.splice(1, d.parent.children.length - 1);

            if (d.type == "object_up")
                d.parent.children.splice(1, 0, {"name": "down", "children": null, "type": "object_down"});
            else
                d.parent.children.splice(1, 0, {"name": "down", "children": null, "type": "down"});
        }
        else {
            newSiblings = d.parent.children.splice(-6, 5);
        }

        newChildren.forEach(function (e) {
            d.parent.children.splice(-1, 0, e);
        });


        d.parent.siblings_down = newSiblings.concat(d.parent.siblings_down);

        if (d.parent.siblings_up.length == 0)
            d.parent.children.splice(0, 1);

        update(d);
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


    function jsonToFlare(data) {
        /* Start with the root of the tree that is always 0
         *  Then get all the other nodes recursively using getChildren
         * */
        var name = 0; //pidFop(data.partitionSize, 0);  it is always 0
        var children = getChildren(name, 1, data);
        return [{
            "name": name,
            "children": children[0],
            "siblings_up": null,
            "siblings_down": children[1],
            "type": "master"
        }];
    }

    function getChildren(parent, level, data) {
        var children = [];
        var siblings = [];
        var k = 0;
        var i;
        if (level == data.levels) {
            /* Case that maps the objects keys to the leafs
             *  their behavior is different since their name is not related to te tree structure
             *  as are the non-objects-partitions nodes
             * */
            var objects = data.objectMapping[parent];

            /* Sort the objects by the slot number
             * */
            objects.sort(function (a, b) {
                return a.slot - b.slot
            });

            if (objects != null) {

                if (objects.length > 5) {

                    /* Creates the first plus node with no siblings
                     * show: false , because it will not appear yet
                     * */
                    //children[0] = {name: "...", "children": null, "type": "object_up", "show": false};
                    /* Iterates in all children
                     * */
                    for (i = 0; i < 5; i++) {
                        /* Just plus nodes have siblings
                         * */
                        children[i] = {name: objects[i].objName, "children": null, "type": "object", "show": true};
                    }

                    for (i = 5; i < objects.length; i++) {
                        /* Hide the children
                         * */
                        siblings[i - 5] = {name: objects[i].objName, "children": null, "type": "object", "show": false};
                    }
                    /* Add the siblings to the plus nodes
                     * */
                    //children[0]["siblings"] = siblings;
                    children[5] = {name: "...", "children": null, "type": "object_down", "show": false};

                }
                else {
                    for (i = 0; i < objects.length; i++) {
                        children[i] = {name: objects[i].objName, "children": null, "type": "object"};
                    }
                }
            }
        }
        else {
            /* For the actual parent node it calculates the first and last children
             * and see if all its interval of children are in the used partition
             * and add the ones that are
             * */
            var first = (parent * data.partitionSize) + 1;
            var last = (parent + 1) * data.partitionSize;
            var childs;


            children[0] = {"name": "...", "children": null, "type": "up"};
            k = 1;
            for (i = first; i <= last; i++) { // for each child of this parent
                if (data.usedPartitions.indexOf(i) > -1) {

                    if (k < 6) {
                        childs = getChildren(i, level + 1, data);
                        children[k] = {
                            "name": i,
                            "children": childs[0],
                            "siblings_up": [],
                            "siblings_down": childs[1],
                            "type": "key"
                        };
                    }
                    else {
                        childs = getChildren(i, level + 1, data);
                        siblings[k - 6] = {
                            "name": i,
                            "children": null,
                            "_children": childs[0],
                            "siblings_up": [],
                            "siblings_down": childs[1],
                            "type": "key"
                        };
                    }

                    k++;
                }
                // if a node is not in used partitions, it is not showed

            }

            if (children.length < 7 && siblings.length == 0) {
                children.splice(0, 1);
            }
            else {
                children.splice(0, 1);
                children[children.length] = {"name": "...", "children": null, "type": "down"};
            }


        }
        return [children, siblings];

    }

    function pidFop(ps, level) {
        /* Calculates the first node of a level
         * */
        return (Math.pow(ps, level) - 1) / (ps - 1);
    }


}








































