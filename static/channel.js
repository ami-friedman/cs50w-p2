document.addEventListener('DOMContentLoaded', () => {

    window.history.pushState("Ami", "New", "http://localhost:5000/");

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    var currentChannel = '';

    socket.on('connect', () => {

        const sendBtn = document.querySelector('#send');
        const addChannelBtn = document.querySelector('#add-channel');

        refreshChannelList();
  
        sendBtn.onclick = () => {
            console.log(`current channel:${currentChannel}`)
            const msg = document.querySelector('#sentmsg').value;
            socket.emit('send msg', { 'msg': msg , 'channel': currentChannel });
        }

        addChannelBtn.onclick = () => {
            const field = document.querySelector('#channel-name');
            const channel = field.value;
            field.value = ''
            socket.emit('add channel', { 'channel': channel });
        }
    });

    socket.on('announce msg', data => {
        addMessageToConversation(data.msg);
    });

    socket.on('announce channel', channel => {
        addChannelToPanel(channel);       
        refreshChannelList();
    });

    function addMessageToConversation(message) {
        const li = document.createElement('li');
        li.className = 'list-group-item borderless'
        li.innerHTML = message;
        document.querySelector('#conversations').append(li);
    }

    function addChannelToPanel(channel) {
        const a = document.createElement('a');
        a.className = 'nav-link'
        a.innerHTML = channel;
        a.setAttribute('href', '#' + channel);
        const li = document.createElement('li');
        li.id = channel
        li.appendChild(a)
        document.querySelector('#channel-list').append(li);
    }

    function refreshChannelList(){
        var channels = document.querySelectorAll('#channel-list>li');
       
        channels.forEach(element => {
            element.onclick = () =>{
                currentChannel = element.textContent.replace(/(\r\n|\n|\r|\s)/gm,"");
                clearConversationWindow();
                fetch(`/channels/${currentChannel}`)
                .then( res => {
                    return res.json();
                })
                .then( json => {
                    messages = json.messages;
                    for (i=0;i < messages.length;i++) {
                        addMessageToConversation(messages[i]);
                    }
                })
            };
        });
    }

    function clearConversationWindow() {
        document.querySelector('#conversations').innerHTML = ''
    }
});