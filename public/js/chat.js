const socket = io();
//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#share-location');
const $messages = document.querySelector("#messages");



//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true});

// socket.on("countUpdated", (count) => {
//    console.log("The count has been updated", count);
// });
//
//
// document.querySelector("#increment").addEventListener('click', () => {
//     console.log("clicked");
//     socket.emit('increment');
// });

const autoScroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild;

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // console.log(newMessageStyles);
    //visible Height
    const visibleHeight = $messages.offsetHeight;

    //height of messages container
    const containerHeight = $messages.scrollHeight;

    //how far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
};

socket.on("message", (message) => {
   console.log(message);
   const html = Mustache.render(messageTemplate, {
       username: message.username,
       message: message.text,
       createdAt: moment(message.createdAt).format('h:mm a')
   });
   $messages.insertAdjacentHTML('beforeend', html);
   autoScroll();
});

socket.on('locationMessage', (message) => {
    console.log(message);
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});


$messageForm.addEventListener('submit', (e) => {
   e.preventDefault();
    //disable

    $messageFormButton.setAttribute('disabled', 'disabled');
   const message = e.target.elements.message.value;

   socket.emit('sendMessage', message, (error) => {
       //enable
       $messageFormButton.removeAttribute('disabled');
       $messageFormInput.value = '';
       $messageFormInput.focus();
       if (error) {
           return console.log(error);
       }
       console.log("The message was delivered", message);
   });
});

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
       room,
       users
    });

    document.querySelector("#sidebar").innerHTML = html;
})

/*====================================================================================================================
158. Share your location
GOAL : Share coordinates with other users
    1. Have client emit "sendLocation" with an object as the data (Object should contain latitude and longitude properties
    2. Server should listen for "sendLocation" (when fired, send "message" to all connected clients
     "Location:long, lat"====================================================================================================================*/

/*====================================================================================================================
160. Form and buttons states
GOAL : 1- Disable the send location button while location being sent
2- Disable the button just before getting the current position
3- Enable the button in the acknowledgement callback
4- Test your work
====================================================================================================================*/


/*====================================================================================================================
162. Render Location Message
GOAL : Create a separate event for location sharing message
1- Have server emit "locationMessage" with URL
2- Have client listen for "locationMessage" and print the URL to template
3- Test Your work!
====================================================================================================================*/
$sendLocationButton.addEventListener('click', () => {
   if (!navigator.geolocation) {
       return alert('Geolocation is not supported by your browser');
   }

   $sendLocationButton.setAttribute('disabled', 'disabled');

   navigator.geolocation.getCurrentPosition((position => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled');
            console.log("Location shared");
        });
   }));
});


socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});
