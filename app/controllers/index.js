// Get displays on load, hide if necessary. 
noResults = $.noResults;
noResults.hide();
resultsView = $.resultsView;
resultsView.hide();
searchInputBox = $.searchInputBox;

// Global Variables
call_buttons = [];

// Activity indication loader.
var activity = Ti.UI.createActivityIndicator({
  message: 'Loading..'
});
$.index.add(activity);

searchInputBox.addEventListener('change', function(e) {

  // Get searchInput.
  var searchInput = searchInputBox.value;

  // Show results view on first keyup.
  if (searchInput.length == 1) {
    resultsView.show();
  }

  // Hide results view if no values.
  if (searchInput.length == 0) {
    resultsView.hide();
  }

  // Check user has entered a character, if so, respond with results or no results. 
  if (searchInput.length > 1) {
    Ti.API.log("User has entered something, respond to them!");
	var url="";

    // Check if only numbers, if so assume it is a telephone number, else assume user is searching company name.
    var checkStringNumber = IsNumeric(searchInput);
    if (checkStringNumber == true) {
      Ti.API.log("You have entered a number.");
    } else {
      Ti.API.log("You have entered a name.");
      // Adjust URL to match name search. 			
      var url = "http://up637415.co.uk/views/phone-numbers?title=" + searchInput;
    }
    getUrlContents(url);
  } else {
    // Nothing entered, delete everything!
    Ti.API.log("Nothing has been entered, remove everything!");
  }

  

});

// Call now button.
function callNowButton(id, call_button_number) {

  Ti.API.info('Call function id: ' + this.id);

  var call = 'tel: ' + this.id;
  // Ti.API.info('Call'+ call);
  var intent = Ti.Android.createIntent({
    action: Ti.Android.ACTION_CALL,
    data: call
  });
  Ti.Android.currentActivity.startActivity(intent);

}

// Function to check if numeric number is in String.
function IsNumeric(searchInput) {
  return (searchInput - 0) == searchInput && ('' + searchInput).trim().length > 0;
}

// Get JSON for name search
function getUrlContents(url) {
  Ti.API.log("Url=" + url);

  // Get contents from URL.
  var xhr = Ti.Network.createHTTPClient({

    // function called when the response data is available
    onload: function() {
      Ti.API.log("JSON:" + this.responseText);
      jsonText = this.responseText;

      // parse the retrieved data, turning it into a JavaScript object
      var json = JSON.parse(this.responseText);
      jsonList = JSON.stringify(json['list']);
      Ti.API.log("JSON Length:" + jsonList.length);
      
      
      /*if (jsonList.length > 2) {

        Ti.API.log("Somethign is in the array!!!");
        var json_free_phone_numbers = json['list']['0']['field_free_phone'];

        Ti.API.log("Field_FREE_PHONE:::  " + json_free_phone_numbers);

        // Iterate over each result. Generate button to call. 	
        var index;
        topprop = 0.1; // this is space between two labels one below the other
        for (index = 0; index < json_free_phone_numbers.length; ++index) {
          var call_buttons = Titanium.UI.createButton({
            id: json_free_phone_numbers[index],
            top: 15 + index * topprop,
            width: "94%",
            height: "60dp",
            title: json_free_phone_numbers[index],
            font: {
              fontSize: '30'
            },
          });

          scrollView.add(call_buttons);
          call_buttons.addEventListener('click', callNowButton);

        }
      } else {
        noResults.show();

      }*/
    },
    // function called when an error occurs, including a timeout
    onerror: function() {
      Ti.API.log("Error:::  ERRORRR!!!!!!!");
    },
    timeout: 5000 // in milliseconds
  });

  // Open URL.		
  xhr.open("GET", url);
  xhr.send();
}

$.index.open();














/*
    // 	Check if value is a phone number. 
	if (searchInput.length >= 11) {
		
		var number = searchInput;
		
		// Set JSON URL. 		 
		var url = "http://up637415.co.uk/views/phone-numbers" + number;
		var json;
		
        // Get contents from URL.
		var xhr = Ti.Network.createHTTPClient({
			// function called when the response data is available
			onload: function() {

				Ti.API.log("JSON:::  " + this.responseText);  
				jsonText = this.responseText;
				
				// parse the retrieved data, turning it into a JavaScript object
				var json = JSON.parse(this.responseText);

				jsonList = JSON.stringify(json['list']);
				if (jsonList.length > 2) {
					
					Ti.API.log("Somethign is in the array!!!");
					var json_free_phone_numbers = json['list']['0']['field_free_phone'];  
	
					Ti.API.log("Field_FREE_PHONE:::  " + json_free_phone_numbers);  
		
		            // Iterate over each result. Generate button to call. 	
		            var index;
		            topprop = 0.1; // this is space between two labels one below the other
					for (index = 0; index < json_free_phone_numbers.length; ++index) {
						var call_buttons = Titanium.UI.createButton({
							id: json_free_phone_numbers[index],
					        top: 15+ index * topprop,
					        width : "94%",
					        height : "60dp",
					        title : json_free_phone_numbers[index],
					        font: {fontSize: '30'},
					    });
		
					    scrollView.add(call_buttons);
					    call_buttons.addEventListener('click', callNowButton); 
					    
					}
				}
				else {
					noResults.show(); 
					
				}
			},
			 // function called when an error occurs, including a timeout
		     onerror : function() {
		         Ti.API.log("Error:::  ERRORRR!!!!!!!");
		     },
		     timeout : 5000  // in milliseconds
		});
		
        // Open URL.		
		xhr.open("GET", url); 
		xhr.send();
	
	}
	else {
		noResults.show();
	}
	*/