goCalApp.controller('mainController', ['$scope', 'calendarClient', '$filter',function ($scope, calendarClient, $filter) {
	//Defining Variables
	let eventId, eventStartDate, eventEndDate, eventDescription;

	//loading initial materialize property
	$(document).ready(function(){
		$('.datepicker').pickadate({
    		selectMonths: true, // Creates a dropdown to control month
    		selectYears: 15 // Creates a dropdown of 15 years to control year
  		});
		// the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
		$('.modal').modal();
		$('.timepicker').pickatime({
			default: 'now', // Set default time
			fromnow: 0,       // set default time to * milliseconds from now (using with default = 'now')
			twelvehour: false, // Use AM/PM or 24-hour format
			donetext: 'OK', // text for done-button
			cleartext: 'Clear', // text for clear-button
			canceltext: 'Cancel', // Text for cancel-button
			autoclose: false, // automatic close timepicker
			ampmclickable: true, // make AM PM clickable
			aftershow: function(){} //Function for after opening timepicker  
		  });
		$('.timepicker').on('change', function() {
			let receivedVal = $(this).val();
			$(this).val(receivedVal + ":00");
		});
		
	});

	//initializing events array
	let googleEvent = [];

	//function for fetching events
	let fetchEvents = (token) => {

		//calling service
		calendarClient.getEvents(token).then(function (response) {
			let result = response.data.items;

			for (var i = 0; i < result.length; i++) {
				googleEvent[i] = {
					end: result[i].end.dateTime || result[i].end.date,
					start: result[i].start.dateTime || result[i].start.date,
					title: result[i].description,
					id: result[i].id
				}
			}
			
			//initialising the calendar
			$('#calendar').fullCalendar({
				header: {
					left: 'prev,next today',
					center: 'title',
					right: 'month,agendaWeek,agendaDay,listWeek'
				},
				navLinks: true, // can click day/week names to navigate views
				editable: true,
				eventLimit: true, // allow "more" link when too many events
				events: googleEvent,
				dayClick: function(date, jsEvent, view) {
					$('#modal1').modal('open');
					$('.showDate').text(date.format());
					var dat = new Date(date.format());
					
				},
				eventClick: function(calEvent, jsEvent, view) {
					eventId = calEvent.id;
					eventStartDate = calEvent.start._i;
					eventEndDate = calEvent.end._i;
					eventDescription = calEvent.title;
					// change the border color just for fun
					$(this).css('border-color', 'red');
					$('.fixed-action-btn').openFAB();

   		 		}
			});		
		})
	}

	//handling ngClick event
	$scope.createEvent = () => {

		let description = $('#description').val();
		let startDate   = $('#startDate').val(); 
		let startTime   = $('.startTime').val() || '00:00:00';
		let endDate     = $('#endDate').val();
		let endTime     = $('.endTime').val() || '00:00:00';

		let fixedStartDate = new Date(startDate);
		let fixedEndDate = new Date(endDate);

		let sendStartDate = $filter("date")(fixedStartDate, "yyyy-MM-dd")+'T'+startTime+'Z';
		let sendEndDate = $filter("date")(fixedEndDate, "yyyy-MM-dd")+'T'+endTime+'Z';

		
		calendarClient.createEvents(sendStartDate, sendEndDate, sessionStorage.getItem('accessToken'), description).then(function (response) {
			Materialize.toast('Event Created successfully', 4000);
			setTimeout( function () {
				location.reload();
			}, 2000)
		})

	}

	//updating Events
	$scope.updateEvent = () => {

		let description = $('#description').val() || eventDescription;
		let startDate   = $('#startDate').val(); 
		let startTime   = $('.startTime').val();
		if(!startDate){
			fixedStartDate = eventStartDate;
		}
		let endDate     = $('#endDate').val();
		if(!endDate){
			fixedEndDate = eventEndDate;
		}
		let endTime     = $('.endTime').val() || '00:00:00';

		let fixedStartDate = new Date(startDate);
		let fixedEndDate = new Date(endDate);

		let sendStartDate = $filter("date")(fixedStartDate, "yyyy-MM-dd")+'T'+'00:00:00'+'Z';
		let sendEndDate = $filter("date")(fixedEndDate, "yyyy-MM-dd")+'T'+endTime+'Z';

		
		calendarClient.updateEvents(sendStartDate, sendEndDate, sessionStorage.getItem('accessToken'), description, eventId).then(function (response) {
			console.log(response);
			Materialize.toast('Event Updated successfully', 4000);
			setTimeout( function () {
				location.reload();
			}, 2000)
		})
	}

	//deleting events
	$scope.deleteEvents = () => {

		calendarClient.deleteEvent(sessionStorage.getItem('accessToken'), eventId).then(function (response) {

			Materialize.toast('Event Deleted successfully', 4000);
			setTimeout( function () {
				location.reload();
			}, 2000)
		})

	}

    if(!sessionStorage.getItem('accessToken')){

		$scope.loginForm = true;

	} else {

		let accessToken = sessionStorage.getItem('accessToken');
		fetchEvents(accessToken);
		$scope.calendarForm = true;

	}

	let config = {

		apiKey: "AIzaSyDCQTUbQv-nnu0Sb1vRQGXVFrX67lGadFM",
		authDomain: "gocal-26ac7.firebaseapp.com",
		databaseURL: "https://gocal-26ac7.firebaseio.com",
		projectId: "gocal-26ac7",
		storageBucket: "gocal-26ac7.appspot.com",
		messagingSenderId: "352766764017"

	};
	
	firebase.initializeApp(config);

	$scope.authorize = () => {

		let provider = new firebase.auth.GoogleAuthProvider();
		provider.addScope('https://www.googleapis.com/auth/calendar')
		firebase.auth().signInWithPopup(provider).then(function(result) {

			sessionStorage.setItem('accessToken', result.credential.accessToken);
			fetchEvents(sessionStorage.getItem('accessToken'));

		}).catch(function(error) {

			var errorCode = error.code;
			var errorMessage = error.message;
			var email = error.email;
			var credential = error.credential;

		});
		
		$scope.calendarForm = true;
	}
}]);