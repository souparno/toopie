var web_service_url = "https://script.google.com/macros/s/AKfycbxF8sE4C-uG-PeVJx9yu8X-k47yTyD4YbPRMW6kLVmjx8ZgJHA/exec";
var imgur_client_id = "Client-ID 007f8b3ffbbbdfd";

$('#search').on('click', search);


function upload(file) {

  /* Is the file an image? */
  if (!file || !file.type.match(/image.*/)) return;

  /* Lets build a FormData object*/
  var fd = new FormData(); // I wrote about it: https://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
  fd.append("image", file); // Append the file
  var xhr = new XMLHttpRequest(); // Create the XHR (Cross-Domain XHR FTW!!!) Thank you sooooo much imgur.com
  xhr.open("POST", "https://api.imgur.com/3/image.json"); // Boooom!
  xhr.onload = function() {

    function showPos(position) {
      var latitude = position.coords.latitude;
      var longitude = position.coords.longitude;
      var imageurl = JSON.parse(xhr.responseText).data.link;

      $.ajax({
        url: web_service_url,
        data: {
          "action": "create",
          "latitude": latitude,
          "longitude": longitude,
          "imageurl": imageurl
        },
        type: "POST",
        success: function(data) {
          search();
        },
        error: function() {
          alert('fail');
        }
      });
    }
    navigator.geolocation.getCurrentPosition(showPos);
  }

  xhr.setRequestHeader('Authorization', imgur_client_id);
  xhr.send(fd);
}

function search(e) {
  $.ajax({
    url: web_service_url,
    data: {
      "action": "retrieve"
    },
    type: "POST",
    success: function(data) {
      function showPos(position) {
        var coords1 = {
            'latitude': position.coords.latitude,
            'longitude': position.coords.longitude
          };

        for (var d in data.values) {
          //var data = datas[i];
          var coords2 = {
            'latitude': d[1],
            'longitude': d[2]
          };

          if (haversineDistance(coords1, coords2) <= 1) {
            $("#main").prepend('<div class="nd2-card"><div class="card-media"><img src="' + d[3] + '"></div><div class="card-action"><div class="row between-xs"><div class="col-xs-12 align-right"><div class="box"><a href="#" class="ui-btn ui-btn-inline ui-btn-fab waves-effect waves-button waves-effect waves-button"><i class="zmdi zmdi-favorite"></i></a><a href="#" class="ui-btn ui-btn-inline ui-btn-fab waves-effect waves-button waves-effect waves-button"><i class="zmdi zmdi-bookmark"></i></a><a href="#" class="ui-btn ui-btn-inline ui-btn-fab waves-effect waves-button waves-effect waves-button"><i class="zmdi zmdi-mail-reply zmd-flip-horizontal"></i></a></div></div></div></div></div>');
          }
        }
      }
      navigator.geolocation.getCurrentPosition(showPos);
    },
    error: function() {
      alert('fail');
    }
  });
}

function haversineDistance(coords1, coords2) {
  function toRad(x) {
    return x * Math.PI / 180;
  }

  var lon1 = coords1.latitude;
  var lat1 = coords1.longitude;

  var lon2 = coords2.latitude;
  var lat2 = coords2.longitude;

  var R = 6371; // km

  var x1 = lat2 - lat1;
  var dLat = toRad(x1);
  var x2 = lon2 - lon1;
  var dLon = toRad(x2)
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;

  return d;
}
