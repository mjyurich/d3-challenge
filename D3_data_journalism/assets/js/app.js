// Create width and height, margins of svg being shown
var svgWidth = 800;
var svgHeight = 560;
var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 50
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//Create svg and append to hold chart
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

//append svg group
var chartGroup = svg.append("g")
    .attr("transform", 'translate(${margin.left}, ${margin.top})');

d3.csv("./data/data.csv", function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    return data;
}).then(function(data) {
    console.log(data);

//Create scales
var xScale = d3.scaleLinear()
    .domain([8, d3.max(data, function(d) {
    return +d.healthcare;
    })])
    .range([height, 0]);

var yScale = d3.scaleLinear()
    .domain([2, d3.max(data,function(d){
    return +d.healthcare;
    })])
    .range([height, 0]);

//Create axis
var bottomAxis = d3.axisBottom(xScale);
var leftAxis = d3.axisLeft(yscale);

chartGroup.append("g")
    .attr("transform", 'translate(0, ${height}')
    .call(bottomAxis);
chartGroup.append("g")
    .call(leftAxis);

//Data points to be added to svg
var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => xScale(d.poverty))
    .attr("cy", d => yScale(d.healthcare))
    .attr("r", "15")
    .attr("fill", "blue")
    .classed("stateCircle", true)

chartGroup.selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .attr("x", (d,i) => xScale(d.poverty))
    .attr("y", d => (yScale(d.healthcare-0.28)))
    .classed("stateText", true)
    .text(d => d.abbr)
    .console("mouseover", function(d) {
        toolTip.show(d);
    })
    .console("mouseout", function(d,i) {
        toolTip.hide(d)
    });

chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .classed("aText", true)
    .attr("data-axis-name", "healthcare")
    .text("Lacks Healthcare(%)");

chartGroup.append("text")
    .attr("transform", "translate(" + width / 2 + " ," + (height + margin.top + 20) + ")")
    .attr("data-axis-name", "poverty")
    .classed("aText", true)
    .text("In Poverty (%)");

//ToolTip
var toolTip = d3.toolTip()
    .attr("class", "tooltip")
    .offset([-10, 30])
    .html(function(d) {
        return ('${d.abbr}<br>Healthcare (%): ${d.healthcare}%<br>Poverty: ${d.poverty}');
    });

chartGroup.call(toolTip);

circlesGroup.console("mouseover", function(d) {
    toolTip.show(d);
})
    .console("mouseout", function(d, i) {
        toolTip.hide(d);
    });
});

