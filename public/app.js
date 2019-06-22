//TO DO: Optimize the isMobile function. Mobile site still somewhat glitchy
const isMobile = function () {
  if(screen.width < 767){
    $(".btn-danger:visible").toggle()
  }else{
    $(".btn-danger:hidden").toggle()
  }
}
window.onload = function() {
  isMobile();
};

 $("#searchBar").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#results *").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });
// Loads results onto the page
function getResults() {
  // Empty any results currently on the page
  $("#results").empty();
  // Grab all of the current notes
  $.getJSON("/all", function(data) {
    // For each note...
    for (var i = 0; i < data.length; i++) {
      $("#results").prepend("<div class='data-entry' data-id=" + data[i]._id + "><button class='dataTitle btn' data-toggle='modal' data-target='#myModal' data-id=" +
        data[i]._id + ">" + data[i].title + "</button><span class='btn btn-danger'>Delete Entry</span></div>");
    }
  });
}

// Runs the getResults function as soon as the script is executed
getResults();

// When the #make-new button is clicked
$(document).on("click", "#make-new", function() {
  // AJAX POST call to the submit route on the server
  // This will take the data from the form and send it to the server
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/submit",
    data: {
      title: $("#title").val(),
      note: $("#note").val(),
      created: Date.now()
    }
  })
  // If that API call succeeds, add the title and a delete button for the note to the page
    .then(function(data) {
    // Add the title and delete button to the #results section
      $("#results").prepend("<div class='data-entry' data-id=" + data._id + "><button class='dataTitle btn' data-toggle='modal' data-target='#myModal' data-id=" +
      data._id + ">" + data.title + "</button><button class='btn btn-danger'>Delete Entry</button></div>");
      // Clear the note and title inputs on the page
      $("#note").val("");
      $("#title").val("");
    });
});


// When user clicks the delete button for a note
$(document).on("click", ".btn-danger", function() {
  // Save the p tag that encloses the button
  var selected = $(this).parent();
  // Make an AJAX GET request to delete the specific note
  // this uses the data-id of the p-tag, which is linked to the specific note
  $.ajax({
    type: "GET",
    url: "/delete/" + selected.attr("data-id"),

    // On successful call
    success: function(response) {
      // Remove the p-tag from the DOM
      selected.remove();
      // Clear the note and title inputs
      $("#note").val("");
      $("#title").val("");
      // Make sure the #action-button is submit (in case it's update)
      $("#action-button").html('<button id="make-new" class="btn btn-block btn-info">Submit</button>');
    }
  });
});

// When user click's on note title, show the note, and allow for updates
$(document).on("click", ".dataTitle", function() {
  // Grab the element
  var selected = $(this);
  // Make an ajax call to find the note
  // This uses the data-id of the p-tag, which is linked to the specific note
  $.ajax({
    type: "GET",
    url: "/find/" + selected.attr("data-id"),
    success: function(data) {
      console.log(data)
      // Fill the modal with the data that the ajax call collected
      $(".modal-title").html(data.title);
      $(".modal-body").html(data.note);
      $(".modal-footer").html("<button type='button' class='btn btn-success' id='editForm' data-dismiss='modal' data-id=" + selected.attr("data-id") +" >Edit Entry</button>")
    }
  });
});
//prefill form to edit the entry
$(document).on("click", "#editForm", function() {
  var selected = $(this);
  $.ajax({
    type: "GET",
    url: "/find/" + selected.attr("data-id"),
    success: function(data) {
      console.log(data)
      // Fill the inputs with the data that the ajax call collected
      $("#note").val(data.note);
      $("#title").val(data.title);
      $("#action-button").html("<button id='updater' class='btn btn-success btn-block' data-id=" + selected.attr("data-id") +">Edit</button>");
  }

})
})

// When user click's update button, update the specific note
$(document).on("click", "#updater", function() {
  // Save the selected element
  var selected = $(this);
  // Make an AJAX POST request
  // This uses the data-id of the update button,
  // which is linked to the specific note title
  // that the user clicked before
  $.ajax({
    type: "POST",
    url: "/update/" + selected.attr("data-id"),
    dataType: "json",
    data: {
      title: $("#title").val(),
      note: $("#note").val()
    },
    // On successful call
    success: function(data) {
      // Clear the inputs
      $("#note").val("");
      $("#title").val("");
      // Revert action button to submit
      $("#action-button").html("<button id='make-new' class='btn btn-block btn-info'>Submit</button>");
      // Grab the results from the db again, to populate the DOM
      getResults();
    }
  });
});
