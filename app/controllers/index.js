
// Get displays on load, hide if necessary. 
noResults = $.noResults;
noResults.hide();
yesResults = $.yesResults;
yesResults.hide();
searchInputBox = $.searchInputBox;
fullResult = $.fullResult;
fullResult.hide(); 
numberFeedbackDialog = $.rateNumber;

// Initialise rating widget.
$.starwidget.init(); 

var resultsView = Ti.UI.createScrollView({
	top:130,
	layout: 'vertical'
}); 

$.index.add(resultsView);

// Delay function for when user types. 
var delay = (function(){
	var timer = 0;
	return function(callback, ms){
		clearTimeout (timer);
		timer = setTimeout(callback, ms);
	};
})();

// Global Variables
call_buttons = [];

searchInputBox.addEventListener('change', function(e) {
	// Strange bug, I have to declare fullResult in here or it results in an error.
	fullResult = $.fullResult;
	fullResult.hide();
	
	// Delay function will prevent bombardment of requests to the server.
	delay(function(){
		Ti.API.log("Time elapsed!");
		var searchInput = searchInputBox.value; // Get searchInput.
		// delete results if no input.
		if (searchInput.length == 0) {
			resultsView.hide();
			noResults.hide();
			yesResults.hide();
			resultsView.data = [];
		}
		// Show results view on first keyup.
		if (searchInput.length == 1) {
			resultsView.show();
		}
		// Check user has entered a character, if so, respond with results or no results. 
		if (searchInput.length > 1) {
			var url="";
			var checkStringNumber = IsNumeric(searchInput); // Check if only numbers, if so, assume it is a telephone number, else assume user is searching company name.
			if (checkStringNumber == true) {
				Ti.API.log("You have entered a number.");
				// var checkTelephonePremium = numberTelephoneCheckPremium(searchInput); // Check if premium number.
				// if (checkTelephonePremium == true) {
					// Ti.API.log("it's a premium number.");
					// url = "http://10.0.3.2/fa.dev/httpdocs/views/phone-numbers?field_premium_number_value=" + searchInput;
					// getUrlContents(url, type);
				// } 
			} 
			else {
				Ti.API.log("You have entered a name.");
				// Adjust URL to match name search. 			
				var url = "http://10.0.3.2/fa.dev/httpdocs/json/views/companies?name=" + searchInput;
				// Define type of search
				type = "search_by_name_number";
				Ti.API.log("URL", url);
				getUrlContents(url, type);
			}
		} 
		else {
			// Nothing entered, delete everything!
			Ti.API.log("Nothing has been entered, remove everything!");
		}
	}, 300 ); // This number is the delay for when the user types.
});

// Call now button.
function callButton(id, call_button_number) {
	Ti.API.info('Call function id: ' + this.id);
	var call = 'tel: ' + this.id;
	Ti.API.info('Call'+ call);
	var telephoneNumberValue = this.id;
	numberFeedback(telephoneNumberValue);
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
function getUrlContents(url, type, companyID, companyName) {
	Ti.API.info("url="+url);
	Ti.API.info("company GETURL="+companyID);
	Ti.API.info("company name GETURL="+companyName);
	// Get contents from URL.
	var xhr = Ti.Network.createHTTPClient({
		ondatastream: function(e) {
			// function called as data is downloaded
		},
		// function called when the response data is available
		onload: function(e) {
			resultsView.removeAllChildren();
			jsonText = this.responseText;
			Ti.API.log("jsonText",jsonText);
			// parse the retrieved data, turning it into a JavaScript object
			var json = JSON.parse(this.responseText);
			var index;
			topprop = 0.1; // this is space between two labels one below the other
			if (type == "search_by_name_number") {
				resultNodes = json.companies; 
				resultsLength = JSON.stringify(resultNodes.length);
				if(resultsLength >= 1) {
					Ti.API.log("Results for company search: True");
					noResults.hide();
					yesResults.show();
				} 
				if(resultsLength == 0) {
					Ti.API.log("Results for company search: False");
					yesResults.hide();
					noResults.show();
				}
				for (index = 0; index < resultsLength; ++index) {
					resultNodeTitle = JSON.stringify(resultNodes[index].name);
					resultNodeID = JSON.stringify(resultNodes[index].term_id);
					var resultNodeTitleNoQuotes = resultNodeTitle.slice(1, -1);
					var row = createRowTitle(index, resultNodeTitleNoQuotes, resultNodeID, "companyRequest");
					resultsView.add(row);
					resultsView.show(); 
				}
			}
			if (type == "variations") {
				resultNodes = json.variations; 
				Ti.API.log("Variations JSON", JSON.stringify(resultNodes));
				resultsLength = JSON.stringify(resultNodes.length);
				for (index = 0; index < resultsLength; ++index) {
					resultNodeTitle = JSON.stringify(resultNodes[index].name);
					var companyIDNoQuotes = companyID.slice(1, -1);
					resultNodeID = companyIDNoQuotes + "," + resultNodes[index].term_id;
					var resultNodeTitleNoQuotes = companyName + " " + resultNodeTitle.slice(1, -1);
					var row = createRowTitle(index, resultNodeTitleNoQuotes, resultNodeID, "variationNumbersRequest");
					resultsView.add(row);
					resultsView.show(); 
				}
			}
			if (type == "companyNumbers") {
				Ti.API.log("CONNECT NUMBERS landed.");
				resultNodes = json.telephone_numbers; 
				resultsLength = JSON.stringify(resultNodes.length);
				Ti.API.log("Numbers JSON", JSON.stringify(resultNodes));
				for (index = 0; index < resultsLength; ++index) {
					resultNodeTitle = JSON.stringify(resultNodes[index].title);
					resultNodeID = resultNodes[index].title;
					resultNodeRating = resultNodes[index].rating;
					var resultNodeTitleNoQuotes = resultNodeTitle.slice(1, -1);
					var row = createRowTitle(index, resultNodeTitleNoQuotes, resultNodeID, "numbersRequest", resultNodeRating);
					resultsView.add(row);
					resultsView.show(); 
				}
				//createFullResultView(fullResult);
			}
			if (type == "search_by_id") {
				Ti.API.log("search_by_id");
				fullResult = resultNodes;
				createFullResultView(fullResult);
				
				for (index = 0; index < resultsLength; ++index) {
					
					resultNodeTitle = JSON.stringify(resultNodes[index].node.title);
					resultNodeID = JSON.stringify(resultNodes[index].node.Nid);
					var resultNodeTitleNoQuotes = resultNodeTitle.slice(1, -1);
					var row = createRowTitle(index, resultNodeTitleNoQuotes, resultNodeID);
				}
			}
			
	    },
	    onerror: function() {
	    	// function called when an error occurs, including a timeout
	    	Ti.API.log("Connection Error :/");
	    	serverConnectionError();
	    },
    	timeout: 5000 // in milliseconds
	});
	// Open URL.		
	xhr.open("GET", url);
	xhr.send();
}

function createRowTitle(index, resultNodeTitleNoQuotes, resultNodeID, typeOfAction, ratings) {
	Ti.API.log("Type of action:", typeOfAction);
	topprop = 0.1; // this is space between two labels one below the other
	var row = Ti.UI.createView({
	    height: 80,
	    top: 1, 
	    left: 0
    }); 
    if (ratings!=undefined) {
    	var call_buttons = Titanium.UI.createButton({
		  	id: resultNodeID,
		    title: "Rating: " + ratings + ", Tel: " + resultNodeTitleNoQuotes,
		    //keyboardType: Ti.UI.KEYBOARD_NUMBERS_PUNCTUATION,
		    font: { fontSize:23 },
		    top: 1, 
		    left: '3%',
			width: '94%', 
			height: '94%'
			//backgroundColor : "#80FF0000" 
	 	});
	 	var starImage = Ti.UI.createImageView({image:'../star.png', top: 60, height: 300, width: 300});
	 	//call_buttons.add(starImage);
    }
    else {
    	var call_buttons = Titanium.UI.createButton({
		  	id: resultNodeID,
		    title: resultNodeTitleNoQuotes,
		    keyboardType: Ti.UI.KEYBOARD_NUMBERS_PUNCTUATION,
		    top: 1, 
		    font: { fontSize:23 },
		    left: '3%',
			width: '94%', 
			height: '94%'
	 	});
    }
	
	
	  
	  if(typeOfAction == "companyRequest") {
	  	Ti.API.log("Company Requested");
		call_buttons.addEventListener('click', retriveVariations); 
	  }
	  if(typeOfAction == "variationNumbersRequest") {
	  	Ti.API.log("ids on button", call_buttons.id);
		call_buttons.addEventListener('click', retriveNumbers); 
	  }
	  if(typeOfAction == "numbersRequest") {
	  	Ti.API.log("ids on button", call_buttons.id);
		call_buttons.addEventListener('click', callButton); 
	  }
	  row.add(call_buttons);
	  // if(typeOfAction == "call_buttons") {
		// call_buttons.addEventListener('click', callButton); 
	  // }
	   
	  return row;
}

function retriveVariations() {
	fullResult = $.fullResult;
	yesResults.hide();
	type = "variations";
	var node_id = this.id;
	var companyID = node_id;
	Ti.API.log("retriveVariations() Node id " + node_id);
	var fullResultTitle = this.title+":"; 
	var companyName = this.title;
	var NodeIDNoQuotes = node_id.slice(1, -1);
	fullResult.setText(fullResultTitle);
	fullResult.show();
	var url = "http://10.0.3.2/fa.dev/httpdocs/json/views/company-variations/" + NodeIDNoQuotes;
	getUrlContents(url, type, companyID, companyName);
}

function retriveNumbers() {
	var node_id = this.id;
	var idSplitted = node_id.split(',');
	var companyIDLocal = idSplitted[0];
	var variationIDLocal = idSplitted[1];
	Ti.API.log("retriveNumbers() variation id ", idSplitted[0]);
	var fullResultTitle = this.title+":"; 
	fullResult.setText(fullResultTitle);
	fullResult.show();
	var url = "http://10.0.3.2/fa.dev/httpdocs/json/views/numbers/" + companyIDLocal + "/" + variationIDLocal;
	type = "companyNumbers";
	getUrlContents(url, type);
}

// Generates the feedback box after user dials a number.
function numberFeedback(telephoneNumberValue){
	delay(function(){
	Ti.API.log("Feedback"); 
	numberFeedbackDialog.setMessage("Thanks for using this service, please rate " + telephoneNumberValue + " to help other users.");
	
	// rateNumber
	numberFeedbackDialog.show();
	
	/*var dialog = Ti.UI.createAlertDialog({
	    cancel: 1,
	    buttonNames: ['Yes', 'No'],
	    message: 'Would you like to leave feedback for \n' + telephoneNumberValue + ' to help future users?',
	    title: 'Feedback For Telephone Number'
	  });
	  dialog.addEventListener('click', function(e){
	    if (e.index === e.source.cancel){
	      Ti.API.info('The cancel button was clicked');
	    }
	    Ti.API.info('e.cancel: ' + e.cancel);
	    Ti.API.info('e.source.cancel: ' + e.source.cancel);
	    Ti.API.info('e.index: ' + e.index);
	  });
	  */
	}, 800 ); // This number is the delay so popup box appears after call.
}
// Generates a message if the application fails to connect to the server. 
function serverConnectionError(){
	var serverConnectionError = Ti.UI.createAlertDialog({
	    cancel: 1,
	    // buttonNames: ['Yes', 'No'],
	    message: 'The application is having some problems connecting to the server.' + 
	    ' Could be the server but make sure your device has access to the internet.',
	    title: 'Server Connection Error'
	  });
	  serverConnectionError.addEventListener('click', function(e){
	    if (e.index === e.source.cancel){
	      Ti.API.info('The cancel button was clicked');
	    }
	    Ti.API.info('e.cancel: ' + e.cancel);
	    Ti.API.info('e.source.cancel: ' + e.source.cancel);
	    Ti.API.info('e.index: ' + e.index);
	  });
	  serverConnectionError.show();
}

var win = Titanium.UI.createWindow({  
  layout:'vertical',
  backgroundColor:'#fff',
});

var testData = [ 
  {title: 'Apples'}, {title: 'Bananas'},
  {title: 'Carrots'}, {title: 'Potatoes'} ];

var table = Ti.UI.createTableView({
  top:40,
  height:Ti.UI.SIZE,
  editable:true,
  data: testData
});

table.addEventListener("dragend", function(){
  log("Reset table with testData on dragend");
  table.setData(testData);
});

table.addEventListener("delete", function(e){
  var row_index = e.index; 
  var row_bkup = e.row;

  log("Swipe delete invoked, show the confirm dialog... \n\n" + 
      "But the " + testData[row_index].title + " are already gone (ouch!)");

  var dialog = Ti.UI.createAlertDialog({
      cancel: 1,
      buttonNames: ['Confirm', 'Cancel'],
      message: 'Confirm delete?',
      title: 'Delete'
   });
   
  dialog.addEventListener('click', function(e){
    if (e.index === e.source.cancel){
      log("Delete cancelled. Keeping " + testData[row_index].title +
          "\n\nTable Data after cancel: " + JSON.stringify( table.sections[0].getRows() ) + 
          "\n\nTest data: " + JSON.stringify( testData ) +
          "\n\nForce pushing the vanished row I choose to keep back into table data");
      var restored = table.sections[0].getRows();
      restored.splice(row_index, 0, row_bkup);
      table.setData(restored);

    } else if (e.index === 0) {
      log( testData.splice(row_index, 1) + " Deleted!" + "\n\nTable data: " + 
           JSON.stringify( table.sections[0].getRows() ) + 
           "\n\nTest data: " + JSON.stringify( testData ));
    }
  });
  dialog.show();
});

var logView = Ti.UI.createLabel({
  top:20,
  text: "Actions log"
});


function log(text){
  logView.setText(text);
}

win.add(table);
win.add(logView);

$.index.open();