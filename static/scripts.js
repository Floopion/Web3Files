/*#####################################################
#   Ajax Requests for Getting Countries and Users,    #
#   Adding Countries and Deleting Countries           #
#####################################################*/

    var rawdata ={};
    var running = false;
    var svg = null;

/*##############################
#       GET Requests           #
###############################*/

function findCountry() {

    $.get("/countries/" + $('#cFind').val())
    .done(function(response){
        $('#placeholder').text(response);
    })
    .fail(function(xhr, status, error){
        if (error == "NOT FOUND") {
            $('#placeholder').text(error + " Please enter a valid country ID!");
        }else {
            $('#placeholder').text(error + " Please try again later.");
        }
    });
};

/*##############################
#       POST Requests          #
###############################*/
function getFormData() {

    let country = {};
    let name = false;

    if ($('#cName').val().length != 0  ) {
        country["cName"] = $('#cName').val();
        name = true;
    } else {
        alert("Please Enter a Country name");
    }

    if ($('#cPop').val().length != 0) {
        country["cName"] = $('#cName').val();
        console.log(country);
        pop = true;
    } else {
        alert("Please Enter a valid population number");
    }
    country["cName"] = $('#cName').val();
    country["cPop"] = $('#cPop').val();
    console.log(country);

    if (name) {

        $.post(("/countries"), country, function (data) {
            console.log(data);
        });

        $(':input', '#cForm')
            .not(':button, :submit, :reset, :hidden')
            .val('')
            .prop('checked', false)
            .prop('selected', false);
    }
};


/*##############################
#       DELETE Requests        #
###############################*/
function deleteCountry() {
    let toDelete = $('#cDel').val().toString();
    let country = {};
    country['name'] = toDelete;

     $.ajax({
          type: 'DELETE',
          url: "/countries",
          data: country,
        });
};


/*################
#       D3       #
##################*/

$( document ).ready(function() {
    
   /*
    *   Start the Get request for our country data, displaying a loder while it is being loaded
    *   If for any reason the data can be loaded display the returned error message. 
    */

    $.get("/countries")
    .done(function(response){
        rawdata = JSON.parse(response);
        $("#loader").hide();
        $("#showButton").show();
    })
    .fail(function(xhr, status, error){
        $("#loader").hide();
        $('#placeholder').text("Could not connect to database " + error + " please try again later.");
    });


    /* 
    *   Scripts for both the play button and the slider behaviours
    *
    */

    var timer;

    //Listen out for the play button to be clicked, when it is, assign the min and max levels ad check the viz is running or not. 
    // if it is, check if the slider is below the max ammount if its not stop the timer, if it is increment it and draw the next step in the sequence 
    $("#play").on("click", function() {
        var minstep = 1960,
            maxstep = 2016;

        if (running == true) {
            $("#play").html("Play");
            running = false;
            clearInterval(timer);
        } else {
            $("#play").html("Pause");
            sliderValue = $("#slider").val();
            timer = setInterval(function() {

                if (sliderValue >= maxstep) {
                    clearInterval(timer);
                    return;
                }

                sliderValue++;
                countryCircles(false);

                setTimeout(function() {
                    $("#slider").val(sliderValue);
                    $('#range').html(sliderValue);
                    $("#slider").val(sliderValue);
                    year = $("#slider").val();
                }, 500)

            }, 750);

            running = true;
        }
    });

    /**
     * Only update the graph based on slider movement if the play button is not running, This stops 
     * the unintended behavior of the graph updating twice when the user is playing the viz
     */

    $(document).on('input', '#slider', function() {
        if (running == false){
            sliderValue = $("#slider").val();
            countryCircles(false);
        }
    });


    // On change listen event to run the draw function when an option box is changed
    $('#xAxisOption, #yAxisOption').change(function() {
       countryCircles(false);
    });

});

/**
 * 
 *      This is the man Viz d3 draw method
 *      The learning material and alot of the 
 *      boiler-plate code was sourced from
 *      https://www.d3-graph-gallery.com/
 * 
 */

function countryCircles(create){
    
    // Get the Keys from the option box values
    let xAxisDataKey = $('#xAxisOption').val();
    let yAxisDataKey = $('#yAxisOption').val();

    // Use the text from the Option box to label the Axis
    let xAxisLabel = $( "#xAxisOption option:selected" ).text();
    let yAxisLabel = $( "#yAxisOption option:selected" ).text();


    // Now that the function is split into create and update i need d3 to remove the lines and year to prevent ovelapping
    // I cant just remove the whole svg as that will remove the original circle positions and the transition will not work.
    if(create){
        d3.selectAll("svg").remove();
    }else{
        d3.selectAll("text").remove();
        d3.selectAll("line").remove();
    }

    let year = $('#slider').val();
    /*
        If theres any error text clear it, Clear the svg so that a new
        one can be made.
    */
    $('#placeholder').empty();

    /*
        Set the size an dimensions for the new SVG to take place. 
    */
    const margin = {top: 20, right: 40, bottom: 20, left: 40},
    width = 1350 - margin.left - margin.right,
    height = 600- margin.top - margin.bottom;

    //Create the SVG and give it a nice drop shadow\
    if(create){
         svg = d3.select("#viz").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style('background-color','grey')
        .style('overflow','visible')
        .style('border-radius','15px')
        .style('-webkit-filter','drop-shadow( 3px 3px 2px rgba(0, 0, 0, .7))')
        .style('filter','drop-shadow( 18px 23px 5px rgba(0, 0, 0, 0.7))')
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    }

    /*
        Fitler response to only have entries that contain data in you chosen fields, thus preventing "foo" undefined errors later on.
    */
    let filteredData = rawdata.filter(function(d){ return  (d['data'][xAxisDataKey] && d['data'][yAxisDataKey]) });

    /*
        Scale the graph to the size of our SVG, Append the text to show what is
        on each axis.
    */

    
    // Add X axis
    var x = d3.scaleLinear()
        .domain([0, d3.max(filteredData, function(d) { return +d['data'][xAxisDataKey][2017]})]) //Get the max of the last availible year as that will be the mas the graph gets too
        .range([ 0, width ]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(8).tickSize(-height).tickSizeOuter(0));

    // Add Y axis set the max on the axis to the max for the last year that we display, I have assumed in most cases all of the data increments so the max of our final year should be the max for the whole dataset.
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height+50 )
        .text(xAxisLabel)
        .attr("class", "axisLabels");
        
    // Add Y axis set the max on the axis to the max for the last year that we display, I have assumed in most cases all of the data increments so the max of our final year should be the max for the whole dataset.
    var y = d3.scaleLinear()
        .domain([0, d3.max(filteredData, function(d) { return +d['data'][yAxisDataKey][2017]})])    //Get the max of the last availible year as that will be the mas the graph gets too
        .range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).ticks(8).tickSize(-width).tickSizeOuter(0));

    // Add Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -30 )
        .text(yAxisLabel)
        .attr("text-anchor", "start")
        .attr("class", "axisLabels");

    // Add the year to the center of the svg  
    svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", width-650)
    .attr("y", height-220)
    .text(year)
    .attr("text-anchor", "middle")
    .attr("fill", "#CDEAC0")
    .attr("font-weight", "bolder")
    .attr("font-size", "15rem")
    .attr("class", "yearLabel");;

      // Add a scale for bubble size
    var z = d3.scaleLinear()
    .domain([200000, 1310000000])
    .range([ 4, 40]);

    // -1- Create a tooltip div that is hidden by default:
    var tooltip = d3.select("#viz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "black")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("color", "white")

    //Tool tip fuctions to show and hide them on bubble rollover
    // Ive modified the tool tip to be dynamic, Accepting and displaying information based on the currently selected x and y labels and years.
    // It also displays the countries population size, which i have based the circle radius size from.
  var showTooltip = function(d) {
    tooltip
      .transition()
      .duration(200)
    tooltip
      .style("opacity", 1)
      .html("Country: " + d['name'] + "<br>" + xAxisLabel + ": " + d['data'][xAxisDataKey][year] + "<br>" + yAxisLabel + ": " + (+d['data'][yAxisDataKey][year]) + "<br>" + "Population: " + d['data']['population_total'][year] )
      .style("left", (d3.mouse(this)[0]+30) + "px")
      .style("top", (d3.mouse(this)[1]-30) + "px")
  }
  var moveTooltip = function(d) {
    tooltip
      .style("left", (d3.mouse(this)[0]+30) + "px")
      .style("top", (d3.mouse(this)[1]+30) + "px")
  }
  var hideTooltip = function(d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }

    // Add dots appending the x y and radius attributes, and teling it what to show / hode the tooltip, when the mouse hovers ove the circle
    if(create){
        svg.append('g')
        .selectAll("dot")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("fill",function(d,i){ return "#FF928B" })
        .attr("class", function(d) { return "bubbles"})
        .attr("cx", function (d) { return x(+d['data'][xAxisDataKey][year]); } )
        .attr("cy", function (d) { return y(d['data'][yAxisDataKey][year]); } )
        .attr("r",  function (d) { return z(d['data']['population_total'][year]); } )
        .on("mouseover", showTooltip )
        .on("mousemove", moveTooltip )
        .on("mouseleave", hideTooltip );
    }else{
        d3.selectAll("circle")
        .data(filteredData)
        .transition()
        .duration(900)
        .attr("cx", function (d) { return x(+d['data'][xAxisDataKey][year]); } )
        .attr("cy", function (d) { return y(d['data'][yAxisDataKey][year]); } )
        .attr("r",  function (d) { return z(d['data']['population_total'][year]); } );
        
        setTimeout(function() {
            countryCircles(true);
        }, 900);
        
    }

};


// This function shows the viz controls and hides all the CRUD Buttons. 
function changeControls()
{
    $('#vizControls').show();
    $('#axisSelects').show();
    $('#showButton').hide();
}
