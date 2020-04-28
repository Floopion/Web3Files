/*#####################################################
#   Ajax Requests for Getting Countries and Users,    #
#   Adding Countries and Deleting Countries           #
#####################################################*/

/*##############################
#       GET Requests           #
###############################*/
function changeText(type) {

    $.get(("/" + type), function (response) {
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
}