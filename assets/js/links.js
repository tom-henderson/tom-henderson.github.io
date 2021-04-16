$(document).ready(function() {
    console.log("running")
    $.ajax({
      url: "https://frozen-plateau-22554.herokuapp.com/api/recent/",
      crossDomain: true,
      dataType: "json",
      success: function (data) {
        Tempo.prepare("tempo-template").render(data);
      },
      error: function (xhr, status) {}
    });
});
