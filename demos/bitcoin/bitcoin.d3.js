/* globals d3, bitcoin */

// I am a complete newbie at d3, but wanted to see some graphs!!

(function (my) {
    'use strict';
    var width = 500, height=400 , padding = 50;

    window.addEventListener('load', function() {
        d3.select('#runButton')
            .on('click', function() {
                demoFunction();
            });
    });

    function demoFunction() {
        var N = 10;
        var results = bitcoin.genS_js(N);
        plotLines(results, 10);
        var total = 0;
        function iterate(i) {
            if(i < 10) {
                var N = 100000;
                var start = new Date();
                var results = bitcoin.genS_js(N);
                var end = new Date();
                d3.select('#output')
                    .append('p')
                    .text('took ' + (end - start) / 1000 +
                          ' seconds for ' + (N.toLocaleString()));
                var C0 = bitcoin.optionValuation(results);
                d3.select('#output')
                    .append('p')
                    .text('C0: ' + C0);
                total += C0;
                window.setTimeout(function() { iterate(i + 1); }, 100);
            } else {
                d3.select('#output')
                    .append('p')
                    .text('mean C0: ' + total / 10);
            }
        }

        window.setTimeout(function() { iterate(0); }, 100);

        // plotGauss(1000);

        // .append('g')


    };

    function plotGauss(N) {
        // Create svg element.
        var data = [];
        for(var i = 0; i < N; i += 1) {
            data.push([bitcoin.gauss(), bitcoin.gauss()]);
        }

        var title = d3.select('#output')
                .append('h2')
                .text('test of normal random data');

        var svg = d3.select('#output').append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('class', 'graph');

        var xScale = d3.scale.linear()
                .range([padding, width - padding])
                .domain([d3.min(data, function(d) { return d[0]; })  - 0.05,
                         d3.max(data, function(d) { return d[0]; }) + 0.05]);

        var yScale = d3.scale.linear()
                .range([height - padding, padding])
                .domain([d3.min(data, function(d) { return d[1]; }),
                         d3.max(data, function(d) { return d[1]; })]);

        // Add data to it
        var point = svg.selectAll('.point')
                .data(data)
                .enter() // Add unused data.
                .append('circle')
                .attr('class', 'point')
                .attr('cx', function(d) { return xScale(d[0]); })
                .attr('cy', function(d) { return yScale(d[1]); })
                .attr('r', 3);


        var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient('bottom')
                .ticks(5); // how many ticks we would like

        // Create a new group ('g'), hand the 'g' to the xAxis function.
        // USe the XVG transform to move it to the bottom of the graph.
        svg.append('g')
            .attr('class', 'axis') // give it a name
            .attr('transform', 'translate(0, ' + (height - padding) + ')')
            .call(xAxis);

        var yAxis = d3.svg.axis()
                .scale(yScale)
                .orient('left')
                .ticks(5); // how many ticks we would like

        // Create a new group ('g'), hand the 'g' to the xAxis function.
        // USe the XVG transform to move it to the bottom of the graph.
        svg.append('g')
            .attr('class', 'axis') // give it a name
            .attr('transform', 'translate(' + padding + ', 0)')
            .call(yAxis);
    }

    function plotLines(inputData, M) {
        // Create svg element.
        var allData = [];
        M = Math.min(M, inputData.length);
        for(var i = 0; i < M; i += 1) {
            allData[i] = inputData[i];
        }

        var title = d3.select('#output')
                .append('h2')
                .text('sanity check');

        var svg = d3.select('#output').append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('class', 'graph');
        var ymin = d3.min(allData, function(data) {
            return d3.min(data);
        });
        var ymax = d3.max(allData, function(data) {
            return d3.max(data);
        });


        var data = allData[0];
        var xScale = d3.scale.linear()
                .range([padding, width - padding])
                .domain([0, data.length]);
                // .domain([d3.min(data, function(d) { return d[0]; })  - 0.05,
                //          d3.max(data, function(d) { return d[0]; }) + 0.05]);


        var yScale = d3.scale.linear()
                .range([height - padding, padding])
                .domain([ymin, ymax]);

        var line = d3.svg.line()
                // .interpolate("basis")
                .x(function(d,i) { return xScale(i); })
                .y(function(d) { return yScale(d);});
        // http://stackoverflow.com/questions/8689498/drawing-multiple-lines-in-d3-js
        svg.selectAll('.line')
            .data(allData)
            .enter()
            .append('path')
            .attr('class', 'line')
            .attr('d', line);



        var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient('bottom')
                .ticks(5); // how many ticks we would like

        // Create a new group ('g'), hand the 'g' to the xAxis function.
        // USe the XVG transform to move it to the bottom of the graph.
        svg.append('g')
            .attr('class', 'axis') // give it a name
            .attr('transform', 'translate(0, ' + (height - padding) + ')')
            .call(xAxis);

        var yAxis = d3.svg.axis()
                .scale(yScale)
                .orient('left')
                .ticks(5); // how many ticks we would like

        // Create a new group ('g'), hand the 'g' to the xAxis function.
        // USe the XVG transform to move it to the bottom of the graph.
        svg.append('g')
            .attr('class', 'axis') // give it a name
            .attr('transform', 'translate(' + padding + ', 0)')
            .call(yAxis);

    }
}());
