    google.load("maps", "3",  {other_params:"sensor=false"});

    //risolvere che zooma sempre

    var locs={};
    var wifi={};
    var aplist={};
    var poslist={};
    var lastpos;
    var lasttime=0;

    var map;
    var geoXml;
    var toggleState = 1;

    var zoomed = false;



    function distance(X,Y) {

      var lat_diff=X.lat()-Y.lat();
      var lng_diff=X.lng()-Y.lng();

      return Math.sqrt(Math.pow(lat_diff,2)+Math.pow(lng_diff,2))

    }

  // Strip out malicious tags from wilocate scan json
  function htmlEncode(s)
  {
    var el = document.createElement("div");
    el.innerText = el.textContent = s;
    s = el.innerHTML;
    delete el;
    return s;
  }


    function autozoom() {

	var toZoom=false;
	var bounds = new google.maps.LatLngBounds ();
	for (a in aplist) {
	  if(!bounds.contains(aplist[a].getPosition())) {
	    bounds.extend (aplist[a].getPosition());
	    toZoom=true;

	  }
	}


	if(toZoom) {
 	  map.fitBounds (bounds);
	}
    }

    function updateBoxInfo(m,b) {

	wf=wifi[m];

	var blockprint = '<table id="marker_info_table">';
// 	blockprint += '<tr><td></td><td></td></tr>';
// 	blockprint += '</table>';

	blockprint += '<tr><td>' + htmlEncode(wf['ESSID']) + '</td><td>' + m  + '</td></tr>';
	if('Encryption' in wf) {
	    for (e in wf['Encryption']) {
	      blockprint += '<tr><td>' + e + '</td><td>';
	      for (c in wf['Encryption'][e]) {
		blockprint += wf['Encryption'][e][c] + ' ';
		}
		blockprint += '<td></tr>';
	    }
	}


	j2=wf['location'];

	if('address' in j2) {


	  blockprint += '<tr><td>Address</td><td>';

	  if('street' in j2['address'])
	    blockprint +=  j2['address']['street'] + ' ';

	  if('street_number' in j2['address'])
	    blockprint +=  j2['address']['street_number'] + ' ';

	  blockprint+='</td></tr><tr><td>City</td><td>';

	  if ('country' in j2['address'])
	    blockprint += j2['address']['country'] + ' ';

	  if ('country_code' in j2['address'])
	    blockprint +=  '(' + j2['address']['country_code'] + ') ';

	  if('region' in j2['address'])
	    blockprint +=  j2['address']['region'] + ' ';

	  if('postal_code' in j2['address'])
	    blockprint +=  j2['address']['postal_code'] + ' ';

	  if('county' in j2['address'])
	    county = j2['address']['county'] + ' ';

	  if('city' in j2['address'])
	    city = j2['address']['city'] + ' ';

	  if (county != city)
	    blockprint +=  city + ' ' + county + ' ';
	  else if (!city)
	    blockprint +=  county + ' ';
	  else
	    blockprint +=  city + ' ';


	  }


	  if ('latitude' in j2 && 'longitude' in j2) {
	    blockprint += '<tr><td>Coordinate</td><td>' + j2['latitude'] + ',' + j2['longitude'] + '</td></tr>';


	  }


	blockprint += '</table>';
	return blockprint
    }

    function updateMarker(m) {


	var pos = new google.maps.LatLng(wifi[m]['location']['latitude'],wifi[m]['location']['longitude']);

	var marker = new google.maps.Marker({
	    position: pos,
	    map: map,
	    title:wifi[m]['ESSID'] + '\n' + m,
	    icon:'img/wifi.png'
	});

	aplist[m]=marker;

	google.maps.event.addListener(marker, 'mouseover', function(event) {
// 	    alert(marker.getTitle());
	    document.getElementById('marker_info').innerHTML = updateBoxInfo(m,b);
	});



    }



    function updateList(m) {

	wf=wifi[m];

	blockprint = '<tr><td>' + htmlEncode(wf['ESSID']) + '</td><td>' + m  + '</td>';

	blockprint+='<td>';
	if('Encryption' in wf) {
	   for (e in wf['Encryption']) {
	      blockprint += e + ' ';
	      if(wf['Encryption'][e]) {
		blockprint += '(';
		for (c in wf['Encryption'][e]) {
		  blockprint += wf['Encryption'][e][c] + ' ';
		  }
		blockprint+=')';
	      }
	      blockprint+='<br/>'
	    }

	}
	blockprint += '</td>';


	blockprint+='<td>';
	if('Channel' in wf) {
	  blockprint+= wf['Channel'];
	}

	blockprint+='</td>';

	j2=wf['location'];


	blockprint+='<td>';
	if('address' in j2) {

	  if('street' in j2['address'])
	    blockprint +=  j2['address']['street'] + ' ';

	  if('street_number' in j2['address'])
	    blockprint +=  j2['address']['street_number'] + ' ';
	}


	blockprint+='</td><td>';



	  if('county' in j2['address'])
	    county = j2['address']['county'] + ' ';

	  if('city' in j2['address'])
	    city = j2['address']['city'] + ' ';

	  if (county != city)
	    blockprint +=  city + ' ' + county + ' ';
	  else if (!city)
	    blockprint +=  county + ' ';
	  else
	    blockprint +=  city + ' ';


	if('address' in j2) {
	  if ('country' in j2['address'])
	    blockprint += j2['address']['country'] + ' ';

	  if ('country_code' in j2['address'])
	    blockprint +=  '(' + j2['address']['country_code'] + ') ';

	  if('region' in j2['address'])
	    blockprint +=  j2['address']['region'] + ' ';

	  if('postal_code' in j2['address'])
	    blockprint +=  j2['address']['postal_code'] + ' ';

	}

	blockprint+='</td><td>';

	  if ('latitude' in j2 && 'longitude' in j2) {
	    blockprint += j2['latitude'] + ',' + j2['longitude'];


	  }

	blockprint+='</td><td>';

	  if ('reliable' in j2) {
	    if (j2['reliable'] == 1) {
	      blockprint += 'Yes';
	    }
	    else {
		blockprint += 'No';
	    }

	  }

	  blockprint+='</td>'
	return blockprint
    }




    function update(text) {
	j=eval("(" + text + ")");
	locs=j['locations'];
	wifi=j['wifi'];

	if(locs) {
// 	  document.getElementById('marker_info').innerHTML = "APs datas loaded.";

	  for (b in locs) {

	    if(b>lasttime) {

	      lasttime=b

	      if('APs' in locs[b]) {

		  for (m in locs[b]['APs']) {

		      if(m in aplist) {

		      }
		      else if(b in locs && 'APs' in locs[b] && m in locs[b]['APs'] && m in wifi && 'location' in wifi[m] && 'latitude' in wifi[m]['location'] && 'longitude' in wifi[m]['location']) {

			if (locs[b]['APs'][m] == 1) {
			    updateMarker(m);
			}
			$("#myTable/tbody:first").append(updateList(m));


		      }


		  }
	      }

	      if('position' in locs[b]) {

		    var actual_pos = new google.maps.LatLng(locs[b]['position'][0],locs[b]['position'][1]);
		    map.setCenter(actual_pos, 20);

		    if(!lastpos) {

			map.setCenter(actual_pos, 15);
			var marker = new google.maps.Marker({
			    position: actual_pos,
			    map: map,
			    title:"Current position"
			});

		      lastpos=marker;

		    }
		    else {
			dist = distance(actual_pos,lastpos.getPosition());
			// Tra 1.113 km e 111.3 m
			if(dist > 0.001) {

			  lastpos.setPosition(actual_pos);

			}
		    }

	      }

	      if (!zoomed) {
		autozoom();
	      }

	    }

 	  }

    $("#myTable").trigger('update');

	}

    }

    function request() {

      setTimeout("request()",5000);

      var client = new XMLHttpRequest();
      function handler() {

	if(client.readyState == 4 && client.status == 200) {
	  if(client.responseText != null && client.responseText != "") {
	    update(client.responseText);

	  }
	  else {
	    toprint = 'Error getting json (null) ' + client.readyState + ' ' + client.status;
	    document.getElementById('marker_info').innerHTML = toprint;
	  }
	} else if (client.readyState == 4 && client.status != 200) {
	  toprint = 'Error getting json (!=200)';
	  document.getElementById('marker_info').innerHTML = toprint;
	}
      }

      client.onreadystatechange = handler;
      client.open("GET", "http://localhost:8000/wilocate.json", true);
      client.send();

    }



    function initialize() {

      request()

      var myLatlng = new google.maps.LatLng(-34.397, 150.644);
      var myOptions = {
	zoom: 16,
// 	center: myLatlng,
	mapTypeId: google.maps.MapTypeId.HYBRID
      };
      map = new google.maps.Map(document.getElementById("map_canvas"),myOptions);

      google.maps.event.addListener(map, 'bounds_changed', function() {
	zoomed=true;
      });

      $("#myTable")
      .tablesorter({debug: false, widgets: ['zebra'], sortList: [[0,0]]})
      .tablesorterFilter({filterContainer: $("#filter-box"),
                          filterClearContainer: $("#filter-clear-button"),
                          filterColumns: [0],
                          filterCaseSensitive: false});


    }


