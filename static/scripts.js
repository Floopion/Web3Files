/*#####################################################
#   Ajax Requests for Getting Countries and Users,    #
#   Adding Countries and Deleting Countries           #
#####################################################*/

    var rawdata ={};

/*##############################
#       GET Requests           #
###############################*/
function getAllCountries() {

    $.get(("/countries"), function (response) {
        console.log(response);
        $('#placeholder').text(response);
    });
};

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
    let pop = false;

    if ($('#cName').val().length != 0  ) {
        country["cName"] = $('#cName').val();
        console.log(country);
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

    if (pop && name) {

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
        $('#placeholder').text("Could not connect to Database " + error + " please try again later.");
    });

    var xValue = "cell_phones_total";
    var yValue = "life_expectancy_years";
    var running = false;
    var timer;
    $("#slider").value = 2010;
    $("#play").on("click", function() {
    var maxstep = 2015,
        minstep = 2010;
    if (running == true) {
        $("#play").html("Play");
        running = false;
        clearInterval(timer);
    } else if (running == false) {
        $("#play").html("Pause");
        sliderValue = $("#slider").val();
        timer = setInterval(function() {
            if (sliderValue >= maxstep) {
                clearInterval(timer);
                return;
            }
            sliderValue++;
            countryCircles(xValue, yValue, sliderValue);
            setTimeout(function() {
                $("#slider").val(sliderValue);
                $('#range').html(sliderValue);
                $("#slider").val(sliderValue);
                year = $("#slider").val();

            }, 500)
        }, 3000);
        running = true;
    }
    });


});

function countryCircles(xAxisDataKey,yAxisDataKey,year){

    // let year = 2016;
    // let xAxisDataKey = "cell_phones_total";
    // let yAxisDataKey = "life_expectancy_years";

    /*
        If theres any errort text clear it, Clear the svg so that a new
        one can be made.
    */
    $('#placeholder').empty();
    d3.selectAll("svg").remove();

    /*
        Set the size an dimensions for the new SVG to take place. 
    */
    const margin = {top: 20, right: 40, bottom: 20, left: 40},
    width = 1350 - margin.left - margin.right,
    height = 680- margin.top - margin.bottom;

    const svg = d3.select("#viz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style('background-color','grey')
    .style('overflow','visible')
    .style('border-radius','15px')
    .style('-webkit-filter','drop-shadow( 3px 3px 2px rgba(0, 0, 0, .7))')
    .style('filter','drop-shadow( 18px 23px 5px rgba(0, 0, 0, 0.7))')
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    /*
        Fitler response to only have entries that contain data in you chosen fields, thus preventing "foo" undefined errors later on.
    */
    let filteredData = rawdata.filter(function(d){ return  (d['data'][xAxisDataKey] && d['data'][yAxisDataKey]) });

    /*
        Scale the graph to the size of our SVG, Append the text to show what is
        on each axis.
    */

    console.log(filteredData)
    // Add X axis
    var x = d3.scaleLinear()
        .domain([0, d3.max(filteredData, function(d) { return +d['data'][xAxisDataKey][year]; })])
        .range([ 0, width ]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(3));

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height+50 )
        .text("Total Cellphones per Capita")
        .attr("class", "axisLabels");
        

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(filteredData, function(d) { return +d['data'][yAxisDataKey][year]; })])
        .range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -30 )
        .text("Life expectancy")
        .attr("text-anchor", "start")
        .attr("class", "axisLabels");

    svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", width-650)
    .attr("y", height-260)
    .text(year)
    .attr("text-anchor", "middle")
    .attr("fill", "#CDEAC0")
    .attr("font-weight", "bolder")
    .attr("font-size", "15rem")
    .attr("class", "yearLabel");;


    // Add dots
    svg.append('g')
    .selectAll("dot")
    .data(filteredData)
    .enter()
    .append("circle")
        .attr("fill",function(d,i){ return "#FFAC81" })
        .attr("class", function(d) { return "bubbles"})
        .attr("cx", function (d) { return x(d['data'][xAxisDataKey][year]); } )
        .attr("cy", function (d) { return y(d['data'][yAxisDataKey][year]); } )
        .attr("r", function (d) { return 5 } )
        .append("text").text(function(d){ return d['name'] });
};
