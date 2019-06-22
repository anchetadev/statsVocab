//TO DO: Optimize the isMobile function. Mobile site still somewhat glitchy
const isMobile = function() {
  if (screen.width < 767) {
    $(".btn-danger:visible").toggle();
  } else {
    $(".btn-danger:hidden").toggle();
  }
};
window.onload = function() {
  isMobile();
};

$("#searchBar").on("keyup", function() {
  var value = $(this)
    .val()
    .toLowerCase();
  $("#results *").filter(function() {
    $(this).toggle(
      $(this)
        .text()
        .toLowerCase()
        .indexOf(value) > -1
    );
  });
});
function getResults() {
  $("#results").empty();
  $.getJSON("/all", function(data) {
    for (var i = 0; i < data.length; i++) {
      $("#results").prepend(
        "<div class='data-entry' data-id=" +
          data[i]._id +
          "><button class='dataTitle btn' data-toggle='modal' data-target='#myModal' data-id=" +
          data[i]._id +
          ">" +
          data[i].title +
          "</button><span class='btn btn-danger'>Delete Entry</span></div>"
      );
    }
  });
}
getResults();
$(document).on("click", "#make-new", function() {
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
      $("#results").prepend(
        "<div class='data-entry' data-id=" +
          data._id +
          "><button class='dataTitle btn' data-toggle='modal' data-target='#myModal' data-id=" +
          data._id +
          ">" +
          data.title +
          "</button><button class='btn btn-danger'>Delete Entry</button></div>"
      );
      $("#note").val("");
      $("#title").val("");
    });
});

$(document).on("click", ".btn-danger", function() {
  var selected = $(this).parent();
  $.ajax({
    type: "GET",
    url: "/delete/" + selected.attr("data-id"),
    success: function(response) {
      selected.remove();
      $("#note").val("");
      $("#title").val("");
      $("#action-button").html(
        '<button id="make-new" class="btn btn-block btn-info">Submit</button>'
      );
    }
  });
});

$(document).on("click", ".dataTitle", function() {
  var selected = $(this);
  $.ajax({
    type: "GET",
    url: "/find/" + selected.attr("data-id"),
    success: function(data) {
      console.log(data);
      $(".modal-title").html(data.title);
      $(".modal-body").html(data.note);
      $(".modal-footer").html(
        "<button type='button' class='btn btn-success' id='editForm' data-dismiss='modal' data-id=" +
          selected.attr("data-id") +
          " >Edit Entry</button>"
      );
    }
  });
});
$(document).on("click", "#editForm", function() {
  var selected = $(this);
  $.ajax({
    type: "GET",
    url: "/find/" + selected.attr("data-id"),
    success: function(data) {
      console.log(data);
      $("#note").val(data.note);
      $("#title").val(data.title);
      $("#action-button").html(
        "<button id='updater' class='btn btn-success btn-block' data-id=" +
          selected.attr("data-id") +
          ">Edit</button>"
      );
    }
  });
});

$(document).on("click", "#updater", function() {
  var selected = $(this);
  $.ajax({
    type: "POST",
    url: "/update/" + selected.attr("data-id"),
    dataType: "json",
    data: {
      title: $("#title").val(),
      note: $("#note").val()
    },
    success: function(data) {
      $("#note").val("");
      $("#title").val("");
      $("#action-button").html(
        "<button id='make-new' class='btn btn-block btn-info'>Submit</button>"
      );
      getResults();
    }
  });
});
