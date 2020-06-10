

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
            .attr("fill",function(d,i){ return i % 2 == 0 ? "#FF928B" : "#FFAC81" });

        // add a text to each 'g'
        en.append("text").text(function(d){ return d.name });;

     });
};


