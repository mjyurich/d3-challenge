// Create width and height, margins of svg being shown
var svgWidth = parseInt(d3.select("#scatter").style("width"));
var svgHeight = svgWidth - svgWidth / 3.9;
var margin = 20;

//Space for text
var labelArea = 110;

//Padding for text
var tPadBot = 40;
var tPadLeft = 40;

//Create svg and append to hold chart
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .attr("class", "chart");

//Set radius for each dot
var cirRadius;
function cGet() {
    if (svgWidth <= 530) {
        cirRadius = 5;
    }
    else {
        cirRadius = 10;
    }
}

cGet();

//Creating the axis labels
svg.append("g").attr("class", "xText");
var xText = d3.select(".xText");

//use transform to place label bottom of chart
function xTextRefresh() {
    xText.attr(
        "transform",
        "translate(" +
        ((svgWidth -labelArea) / 2 + labelArea) +
        ", " +
        (svgHeight - margin - tPadBot) +
        ")"
    );
}
xTextRefresh();

//Use xText to append 3 SVG files
xText
    .append("text")
    .attr("y", -26)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class", "aText active x")
    .text("In Poverty(%)");
xText
    .append("text")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x")
    .text("Age (Median)")
xText
    .append("text")
    .attr("y", 26)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x")
    .text("Household Income (Median)");

//Specify variables to make more readable
var leftTextX = margin + tPadLeft;
var leftTextY = (svgHeight + labelArea) / 2 - labelArea;

//Add second label group, place left of chart
svg.append("g").attr("class", "yText");

//yText to select group
var yText = d3.select(".yText");

//nest groups transform attr
function yTextRefresh() {
    yText.attr(
        "tranform",
        "translate(" + leftTextX + ", " + leftTextY + ")rotate(-90)"
    );
}
yTextRefresh();

//Append the Text
yText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "obesity")
  .attr("data-axis", "y")
  .attr("class", "aText active y")
  .text("Obese (%)");

  yText
  .append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText active y")
  .text("Smokes (%)");

  yText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");

//Import CSV data with D3
d3.csv("assets/data/data.csv").then(function(data) {
    visualize(data);
});

//Create visualization function
function visualize(theData) {

    //data representation
    var curX = "poverty";
    var curY = "obesity";

    //Save variables for min and max values of x and y
    var xMin;
    var xMax;
    var yMin;
    var yMax;

    //Set up tooltip rules
    var toolTip = d3
        .tip()
        .attr("class", "d3-tip")
        .offset([40 -60])
        .html(function(d) {
            var theX;
            var theState = "<div>" + d.state + "</div>"
            var theY = "<div>" + curY + ": " + d[curY] + "%</div>";
            if (curX === "poverty") {
                theX = "<div>" + curX + ": " + d[curX] + "%</div>";
            }
            else {
                theX = "<div>" +
                    curX +
                    ": " +
                    parseFloat(d[curX]).toLocaleString("en") +
                    "</div>";
            }
            
            return theState + theX + theY;
        })
    //Call tooltip function
    svg.call(toolTip)
    
    //change min, max for x
    function xMinMax() {
        xMin = d3.min(theData, function(d) {
          return parseFloat(d[curX]) * 0.90;
        });
        xMax = d3.max(theData, function(d) {
          return parseFloat(d[curX]) * 1.10;
        });
      }
    
      //change the min and max for y
      function yMinMax() {
        
        yMin = d3.min(theData, function(d) {
          return parseFloat(d[curY]) * 0.90;
        });
        yMax = d3.max(theData, function(d) {
          return parseFloat(d[curY]) * 1.10;
        });
    }

    //Change the classes of texts when clicked
    function labelChange(axis, clickedText) {
        d3.selectAll(".aText")
            .filter("." + axis)
            .filter(".active")
            .classed("active", false)
            .classed("inactive", true);
            clickedText.classed("inactive", false).classed("active", true);        
    }

    //Grab min and max values of x and y
    xMinMax();
    yMinMax();

    //Create Scales
    var xScale = d3.scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, svgWidth - margin]);
    var yScale = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([svgHeight - margin - labelArea, margin]);
    
    //Pass the scales into axes
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale); 
    
    //Determine x and y tick counts
    function tickCount() {
        if (svgWidth <= 500) {
          xAxis.ticks(5);
          yAxis.ticks(5);
        }
        else {
          xAxis.ticks(10);
          yAxis.ticks(10);
        }
    }
    tickCount();
    
    //append the axes
    svg.append("g")
        .call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + (svgHeight - margin - labelArea) + ")");
    svg.append("g")
        .call(yAxis)
        .attr("class", "yAxis")
        .attr("transform", "translate(" + (margin + labelArea) + ", 0)");

    //Make grouping for dots and their labels
    var theCircles = svg.selectAll("g theCircles").data(theData).enter();

    //Append the circles for each row of data
    theCircles
        .append("circle")
        // We return the abbreviation to .text, which makes the text the abbreviation.
        .attr("cx", function(d) {
            return xScale(d[curX]);
        })
        // Now place the text using our scale.
        .attr("cy", function(d) {
            return yScale(d[curY]);
        })
        .attr("r", circRadius)
        .attr("class", function(d) {
            return "stateCircle " + d.abbr;
        })
        // Hover rules
        .on("mouseover", function(d) {
        // Show the tooltip
        toolTip.show(d, this);
        // Highlight the state circle's border
        d3.select(this).style("stroke", "#323232");
        })
        .on("mouseout", function(d) {
        // Remove the tooltip
        toolTip.hide(d);
        // Remove highlight
        d3.select(this).style("stroke", "#e3e3e3");
        });
    
    //Circles on our graph
    theCircles
        .append("text")
        // We return the abbreviation to .text, which makes the text the abbreviation.
        .text(function(d) {
          return d.abbr;
        })
        //Place the text using our scale.
        .attr("dx", function(d) {
          return xScale(d[curX]);
        })
        .attr("dy", function(d) {
          //Add to middle of the circle
          return yScale(d[curY]) + circRadius / 2.5;
        })
        .attr("font-size", cirRadius)
        .attr("class", "stateText")
        // Hover Rules
        .on("mouseover", function(d) {
        // Show the tooltip
        toolTip.show(d);
        // Highlight the state circle's border
        d3.select("." + d.abbr).style("stroke", "#323232");
        })
        .on("mouseout", function(d) {
        // Remove tooltip
        toolTip.hide(d);
        // Remove highlight
        d3.select("." + d.abbr).style("stroke", "#e3e3e3");
        });
    
    //Select all axis text and add event
    d3.selectAll(".aText").on("click", function() {
        var self = d3.select(this);

        if (self.classed("inactive")) {
            // Grab the name and axis saved in label.
            var axis = self.attr("data-axis");
            var name = self.attr("data-name");
      
            // When x is the saved axis, execute this:
            if (axis === "x") {
              // Make curX the same as the data name.
              curX = name;
      
              // Change the min and max of the x-axis
              xMinMax();
      
              // Update the domain of x.
              xScale.domain([xMin, xMax]);
      
              // Use a transition when we update the xAxis.
              svg.select(".xAxis").transition().duration(300).call(xAxis);
      
              //Update the location of the state circles.
              d3.selectAll("circle").each(function() {
                d3
                  .select(this)
                  .transition()
                  .attr("cx", function(d) {
                    return xScale(d[curX]);
                  })
                  .duration(300);
              });
      
              // Change the location of the state texts, too.
              d3.selectAll(".stateText").each(function() {
                //Give each state text the same motion tween as the matching circle.
                d3
                  .select(this)
                  .transition()
                  .attr("dx", function(d) {
                    return xScale(d[curX]);
                  })
                  .duration(300);
              });
      
              // Change the classes of the last active label and the clicked label.
              labelChange(axis, self);
            }
            else {
.
              curY = name;
      
              // Change the min and max of the y-axis.
              yMinMax();
      
              // Update the domain of y.
              yScale.domain([yMin, yMax]);
      
              // Update Y Axis
              svg.select(".yAxis").transition().duration(300).call(yAxis);
      
              //Update the location of the state circles.
              d3.selectAll("circle").each(function() {
                d3
                  .select(this)
                  .transition()
                  .attr("cy", function(d) {
                    return yScale(d[curY]);
                  })
                  .duration(300);
              });
      
              // Change the location of the state texts
              d3.selectAll(".stateText").each(function() {
                //Give each state text the same motion tween as the matching circle.
                d3
                  .select(this)
                  .transition()
                  .attr("dy", function(d) {
                    return yScale(d[curY]) + circRadius / 3;
                  })
                  .duration(300);
              });
      
              //Change the classes of the last active label and the clicked label.
              labelChange(axis, self);
            }
        }      
    });

    d3.select(window).on("resize", resize);

  function resize() {
    // Redefine the width, height and leftTextY 
    width = parseInt(d3.select("#scatter").style("width"));
    height = width - width / 3.9;
    leftTextY = (svgHeight + labelArea) / 2 - labelArea;

    // Apply the width and height to the svg canvas.
    svg.attr("width", width).attr("height", height);

    // Change the xScale and yScale ranges
    xScale.range([margin + labelArea, width - margin]);
    yScale.range([height - margin - labelArea, margin]);

    // With the scales changes, update the axes (and the height of the x-axis)
    svg
      .select(".xAxis")
      .call(xAxis)
      .attr("transform", "translate(0," + (height - margin - labelArea) + ")");

    svg.select(".yAxis").call(yAxis);

    // Update the ticks on each axis.
    tickCount();

    // Update the labels.
    xTextRefresh();
    yTextRefresh();

    // Update the radius of each dot.
    crGet();

    // With the axis changed, let's update the location and radius of the state circles.
    d3
      .selectAll("circle")
      .attr("cy", function(d) {
        return yScale(d[curY]);
      })
      .attr("cx", function(d) {
        return xScale(d[curX]);
      })
      .attr("r", function() {
        return cirRadius;
      });

    //Change the location and size of the state texts, too.
    d3
      .selectAll(".stateText")
      .attr("dy", function(d) {
        return yScale(d[curY]) + cirRadius / 3;
      })
      .attr("dx", function(d) {
        return xScale(d[curX]);
      })
      .attr("r", cirRadius / 3);
    }
}

    