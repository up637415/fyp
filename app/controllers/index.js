// Get displays on load, hide if necessary. 
noResults = $.noResults;
noResults.hide();
yesResults = $.yesResults;
yesResults.hide();
searchInputBox = $.searchInputBox;

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

// Activity indication loader.
// var activity = Ti.UI.createActivityIndicator({
  // message: 'Loading..'
// });
// $.index.add(activity);

var len=searchInputBox.value.length;

searchInputBox.addEventListener('change', function(e) {
	// Strange bug, I have to declare fullResult in here or it results in an error.
	fullResult = $.fullResult;
	fullResult.hide();
	
	// Define type of search
	type = "search_by_name_number"; // type 1 is searching for a company by number or name.
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
			Ti.API.log("User has entered something, respond to them!");
			var url="";
			var checkStringNumber = IsNumeric(searchInput); // Check if only numbers, if so, assume it is a telephone number, else assume user is searching company name.
			if (checkStringNumber == true) {
				Ti.API.log("You have entered a number.");
				var checkTelephonePremium = numberTelephoneCheckPremium(searchInput); // Check if premium number.
				if (checkTelephonePremium == true) {
					Ti.API.log("it's a premium number.");
					url = "http://10.0.3.2/fa.dev/httpdocs/views/phone-numbers?field_premium_number_value=" + searchInput;
					getUrlContents(url, type);
				} 
			} 
			else {
				Ti.API.log("You have entered a name.");
				// Adjust URL to match name search. 			
				var url = "http://10.0.3.2/fa.dev/httpdocs/views/phone-numbers?title=" + searchInput; 
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

// Function to check if numeric number is in String.
function numberTelephoneCheckPremium(searchInput) {
	if(searchInput.indexOf('0845') >= 0 || searchInput.indexOf('0870') >= 0 || searchInput.indexOf('0844') >= 0){
		return true;
	}
}

// Get JSON for name search
function getUrlContents(url, type) {
	Ti.API.info("url="+url);
	// Get contents from URL.
	var xhr = Ti.Network.createHTTPClient({
		ondatastream: function(e) {
			// function called as data is downloaded
		},
		// function called when the response data is available
		onload: function(e) {
			resultsView.removeAllChildren();
			jsonText = this.responseText;
			// parse the retrieved data, turning it into a JavaScript object
			var json = JSON.parse(this.responseText);
			resultNodes = json.nodes; 
			Ti.API.info(JSON.stringify(resultNodes));
			resultsLength = JSON.stringify(json.nodes.length);
			var index;
			topprop = 0.1; // this is space between two labels one below the other
			if (type == "search_by_name_number") { 
				typeOfAction = "company_links";
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
					resultNodeTitle = JSON.stringify(resultNodes[index].node.title);
					resultNodeID = JSON.stringify(resultNodes[index].node.Nid);
					var resultNodeTitleNoQuotes = resultNodeTitle.slice(1, -1);
					var row = createRowTitle(index, resultNodeTitleNoQuotes, resultNodeID, typeOfAction);
					resultsView.add(row);
					resultsView.show(); 
				}
			}
			if (type == "search_by_id") {
				fullResult = resultNodes;
				createFullResultView(fullResult);
				/*
				for (index = 0; index < resultsLength; ++index) {
					
					resultNodeTitle = JSON.stringify(resultNodes[index].node.title);
					resultNodeID = JSON.stringify(resultNodes[index].node.Nid);
					var resultNodeTitleNoQuotes = resultNodeTitle.slice(1, -1);
					var row = createRowTitle(index, resultNodeTitleNoQuotes, resultNodeID);
				}
				*/
			}
			
	    },
	    onerror: function() {
	    	// function called when an error occurs, including a timeout
	    	Ti.API.log("Connection Error :/");
	    },
    	timeout: 5000 // in milliseconds
	});
	// Open URL.		
	xhr.open("GET", url);
	xhr.send();
}

function createRowTitle(index, resultNodeTitleNoQuotes, resultNodeID, typeOfAction) {
  topprop = 0.1; // this is space between two labels one below the other
  var row = Ti.UI.createView({
    height: 80,
    top: 1, 
    left: 0
  }); 
  var call_buttons = Titanium.UI.createButton({
  	id: resultNodeID,
    title: resultNodeTitleNoQuotes,
    keyboardType: Ti.UI.KEYBOARD_NUMBERS_PUNCTUATION,
    top: 1, 
    left: '3%',
    width: '94%', 
    height: '94%'
  });
  row.add(call_buttons);
  if(typeOfAction == "company_links") {
  	call_buttons.addEventListener('click', retriveResult); 
  }
  if(typeOfAction == "call_buttons") {
  	call_buttons.addEventListener('click', callButton); 
  }
   
  return row;
}

function retriveResult() {
	fullResult = $.fullResult;
	yesResults.hide();
	type = "search_by_id";
	var node_id = this.id;
	var fullResultTitle = this.title+":";
	var NodeIDNoQuotes = node_id.slice(1, -1);
	fullResult.setText(fullResultTitle);
	fullResult.show();
	var url = "http://10.0.3.2/fa.dev/httpdocs/views/phone-numbers?nid=" + NodeIDNoQuotes;
	getUrlContents(url, type);
	
}

function createFullResultView(fullResult) {
	typeOfAction = "call_buttons";
	freeNumbers = JSON.stringify(fullResult[0].node.freePhone);
	standardNumbers = JSON.stringify(fullResult[0].node.standardNumber);
	premiumNumbers = JSON.stringify(fullResult[0].node.premiumNumber);

	var numberseNoQuotes = freeNumbers.slice(1, -1) + "," +standardNumbers.slice(1, -1) + "," + premiumNumbers.slice(1, -1);
	var numbersSplit = numberseNoQuotes.split(',');
	Ti.API.log("Full Result:" + numbersSplit + numbersSplit.length);
	for (index = 0; index < numbersSplit.length; ++index) {
		numberItem = numbersSplit[index];
		// Ti.API.log("Number Item: " + freeNumberItem); 
		resultNodeTitle = numberItem;
		var row = createRowTitle(index, resultNodeTitle, resultNodeTitle, typeOfAction);
		resultsView.add(row);
		resultsView.show(); 
	} 
	// Loop through freephone
}

$.index.open();
