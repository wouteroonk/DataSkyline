DSCMSView.run = function(DSCMSViewTools) {

    var jsonurl = $.grep(DSCMSViewTools.myConfig.configItems, function(item) {
        return item.key === "jsonurl";
    })[0].value;

    var listname = $.grep(DSCMSViewTools.myConfig.configItems, function(item) {
        return item.key === "listname";
    })[0].value;

    var label = $.grep(DSCMSViewTools.myConfig.configItems, function(item) {
        return item.key === "label";
    })[0].value;

    var value = $.grep(DSCMSViewTools.myConfig.configItems, function(item) {
        return item.key === "value";
    })[0].value;

    var w = $("#" + DSCMSViewTools.myWindows["Bar Graph"]).width(),
        h = $("#" + DSCMSViewTools.myWindows["Bar Graph"]).height();

    var svg = d3.select("#" + DSCMSViewTools.myWindows["Bar Graph"])
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    d3.json(jsonurl, function(json) {

        var data = listname === "" ? json : json[listname];

        var max_n = 0;
        for (var d in data) {
            max_n = Math.max(data[d][value], max_n);
        }

        var dx = w / max_n;
        var dy = h / data.length;

        var colors = ["dscms-bgBlue", "dscms-bgGreen", "dscms-bgPink", "dscms-bgOrange", "dscms-bgPurple"];
        var c = 0;
        // bars
        var bars = svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", function(d, i) {
                return "bar " + colors[c++ % colors.length];
            })
            .attr("x", function(d, i) {
                return 0;
            })
            .attr("y", function(d, i) {
                return dy * i;
            })
            .attr("width", function(d, i) {
                return dx * d[value];
            })
            .attr("height", dy);

        // labels
        var text = svg.selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .attr("class", function(d, i) {
                return "d3label " + d[label];
            })
            .attr("x", 5)
            .attr("y", function(d, i) {
                return dy * i + (dy / 2);
            })
            .text(function(d) {
                return label !== "" ? d[label] + " (" + d[value] + ")" : d[label];
            })
            .attr("font-size", 40 + "px")
            .style("font-weight", "bold");

    });

};
