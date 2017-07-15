goCalApp.factory('calendarClient', ['$http', function ($http) {
    
    return{
        getEvents : function (token) {
            console.log('Bearer ' + token);
            return $http.get('https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true', {
		        headers:{'Authorization':'Bearer ' + token}
	        })
        },

        createEvents: function (startDate,endDate, token, description) {
            let eventDetails = {"start": {"dateTime":startDate}, "end": {"dateTime":endDate}, "description": description}
        
            return $http({
                method: 'POST',
                url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
                data: eventDetails,
                headers: {'Authorization':'Bearer '+token}
            })         
        },

        deleteEvent : function (token, eventId) {
            return $http({
                method: 'DELETE',
                url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events/'+eventId,
                headers:{'Authorization':'Bearer ' + token}
            })
        },

        updateEvents: function (startDate,endDate, token, description, eventId) {
            let eventDetails = {"start": {"dateTime":startDate}, "end": {"dateTime":endDate}, "description": description}
        
            return $http({
                method: 'PUT',
                url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events/'+eventId,
                data: eventDetails,
                headers: {'Authorization':'Bearer '+token}
            })         
        }

    }
}])