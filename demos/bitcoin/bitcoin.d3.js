/* global d3 */

import * as bitcoin from "./bitcoin.js";

const width = 500,
      height = 400,
      padding = 50;

function start() {
    d3.select('#runButton')
        .on('click', function() {
            demoFunction();
        });
}

window.addEventListener('load', start);

const delay = ms => new Promise(resolve => window.setTimeout(resolve, ms));

async function demoFunction() {
    const results = bitcoin.genS_js(10);
    const table = d3.select('#output')
          .append('table');
    plotLines(results, 10);
    const N = 100000;
    const loops = 10;
    table.classed("table", true);
    let heads = ["N", "C0", "time"];
    table.append('thead').append('tr')
        .selectAll("th")
        .data(heads)
        .enter()
        .append("th")
        .text(d => d);
    const tbody = table.append('tbody');
    const format = d3.format(".2f");
    const C0s = [];
    const times = [];
    for(let i = 0; i < loops; i += 1) {
        await delay(10);

        const start = new Date();
        const results = bitcoin.genS_js(N);
        const end = new Date();
        const C0 = bitcoin.optionValuation(results);
        const time = (end - start) / 1000;
        C0s.push(C0);
        times.push(time);
        tbody.append('tr').
            selectAll('td').
            data([N.toLocaleString(), format(C0), time]).
            enter()
            .append("td").text(d => d);
    }
    tbody.append('tr').
        selectAll('td').
        data(["Mean", format(d3.mean(C0s)), format(d3.mean(times))]).
        enter()
        .append("td").text(d => d);
}

function plotLines(inputData, M) {
    // Create svg element.
    const allData = [];
    M = Math.min(M, inputData.length);
    for(var i = 0; i < M; i += 1) {
        allData[i] = inputData[i];
    }

    d3.select('#output')
        .append('h2')
        .text('sanity check');

    const svg = d3.select('#output').append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'graph');
    const ymin = d3.min(allData, data => d3.min(data));
    const ymax = d3.max(allData, data => d3.max(data));
    const data = allData[0];
    const xScale = d3.scale.linear()
        .range([padding, width - padding])
        .domain([0, data.length]);

    const yScale = d3.scale.linear()
        .range([height - padding, padding])
        .domain([ymin, ymax]);

    const line = d3.svg.line()
    // .interpolate("basis")
          .x((d,i) => xScale(i))
          .y(d => yScale(d));
    // http://stackoverflow.com/questions/8689498/drawing-multiple-lines-in-d3-js
    svg.selectAll('.line')
        .data(allData)
        .enter()
        .append('path')
        .attr('class', 'line')
        .attr('d', line);

    const xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(5); // how many ticks we would like

    // Create a new group ('g'), hand the 'g' to the xAxis function.
    // USe the XVG transform to move it to the bottom of the graph.
    svg.append('g')
        .attr('class', 'axis') // give it a name
        .attr('transform', 'translate(0, ' + (height - padding) + ')')
        .call(xAxis);

    const yAxis = d3.svg.axis()
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
