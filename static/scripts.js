

/*#####################################################
#   Ajax Requests for Getting Countries and Users,    #
#   Adding Countries and Deleting Countries           #
#####################################################*/

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

    $.get(("/countries/" + $('#cFind').val()), function (response) {
        console.log(response);
        $('#placeholder').text(response);
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

/*##################
#       D3         #
###################*/

/*function d3Svg(){

    d3.selectAll("svg > *").remove();

    const svg = d3.select('svg');
    svg.style('background-color','purple');

    const width = +(svg.attr('width'));
    const height = +(svg.attr('height'));

    const circle = svg.append('circle')
        .attr('r',230)
        .attr('cy', height / 2)
        .attr('cx', width / 2);

    const leftEye = svg.append('circle')
        .attr('r',30)
        .attr('cy', height / 2 - 100)
        .attr('cx', width / 2 - 60 )
        .attr('fill', 'orange');

    const rightEye = svg.append('circle')
        .attr('r',30)
        .attr('cy', height / 2 - 100)
        .attr('cx', width / 2 + 60)
        .attr('fill', 'orange');

        const nose = svg.append('circle')
        .attr('r',20)
        .attr('cy', height / 2)
        .attr('cx', width / 2)
        .attr('fill', 'orange');

    const  g = svg.append('g')
        .attr('transform', 'translate(480, 250)');

    const Mouth = g.append('path')
    .attr('d', d3.arc()({
        innerRadius:140,
        outerRadius: 170,
        startAngle: Math.PI /2,
        endAngle: Math.PI * 3 / 2
    }))
    .attr('fill', 'orange');
};*/

function countryCircles(){

     $('#placeholder').empty();

     d3.selectAll("svg > *").remove();

     const svg = d3.select('svg');
     svg.style('background-color','grey');


     $.get(("/countries"), function (response) {
         var responseObj = JSON.parse(response);
         console.log("Wait");

        // a common thing is to 'wrap' some elements in a 'g' container (group)
        // this is like wrapping html elements in a container div
        const g = d3.select("svg").selectAll("g").data(responseObj);

        // create new 'g' elements for each country
        var en = g.enter().append("g")
            .attr("transform",function(d){
            return "translate("+ (Math.random() * 1095) + 40 + "," + (Math.random() * 650) + 40 +")"
        });

        // add a circle to each 'g'
        var circle = en.append("circle")
            .attr("r",function(d){ return Math.random() * 20 })
            .attr("fill",function(d,i){ return i % 2 == 0 ? "blue" : "orange" });

        // add a text to each 'g'
        en.append("text").text(function(d){ return d.name });;

     });
};


// function circles(){
//
//     d3.selectAll("svg > *").remove();
//
//     const svg = d3.select('svg');
//     svg.style('background-color','grey');
//
//
//     var data = [
//         { "name" : "Canada" },
//         { "name" : "New Zealand" }
//     ];
//
//     var g = d3.select("svg").selectAll("g").data(data);
//
//     var enter = g.enter().append("g")
//     .attr("transform",function(d){
//     return "translate("+ (Math.random() * 100) + 40 + "," + (Math.random() * 100) + 40 +")"
//     });
//
//     var circle = enter.append("circle")
//     .attr("r",function(d){ return Math.random() * 20 })
//     .attr("fill",function(d,i){ return i % 2 == 0 ? "red" : "blue" });
//
//     enter.append("text").text(function(d){ return d.name });
// }


