const socket = io();

//elements
const $messageform = document.querySelector("#message-form");
const $messageformbutton = $messageform.querySelector("button");
const $messageforminput = $messageform.querySelector("input");
const $locationbutton = document.querySelector("#send-loc");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector('#sidebar');

//templates
const messagetemplate = document.querySelector("#message-template").innerHTML;
const locationtemplate = document.querySelector("#location-template").innerHTML;
const sidebartemplate=document.querySelector('#sidebar-template').innerHTML

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // Visible height
  const visibleHeight = $messages.offsetHeight

  // Height of messages container
  const containerHeight = $messages.scrollHeight

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
      $messages.scrollTop = $messages.scrollHeight
  }
}

//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix: true})

socket.on("locationmessage", (loc) => {
  const html = Mustache.render(locationtemplate, {
    username:loc.username,
    loc:loc.loc,
    createdAt:moment(loc.createdAt).format('h:mm A')
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});

socket.on("roomuser",({room,users})=>{
  const html = Mustache.render(sidebartemplate, {
    room,
    users
  });
  $sidebar.innerHTML=  html
})

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messagetemplate, {
    username:message.username,
    message:message.text,
    createdAt : moment(message.createdAt).format('h:mm A')
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

$messageform.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageformbutton.setAttribute("disabled", "disabled");
  const message = e.target.elements.mess.value;
  socket.emit("display", message, (err) => {
    $messageformbutton.removeAttribute("disabled");
    $messageforminput.value = "";
    $messageforminput.focus();
    if (err) {
      return console.log(err);
    }
    console.log("the message has delivered!");
  });
});

$locationbutton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("geolocation not supported by your browser");
  }
  $locationbutton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((pos) => {
    socket.emit(
      "location",
      {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      },
      (message) => {
        $locationbutton.removeAttribute("disabled");
        console.log(message);
      }
    );
  });
});

socket.emit('join',{username,room},(error)=>{
  if(error){
  alert(error);
  location.href='/'
}})
