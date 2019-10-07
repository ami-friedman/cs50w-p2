
document.addEventListener('DOMContentLoaded', () => {

    var socket;

    connectToSocket().on('connect', () => {
        initAddChannelButton();

        refreshChannelOnClick();
    
        initChannelSocket();

        initMsgSocket();
    
        const lastChannel = getLastChannel();
        const channelList = getExistingChannels();
        if (lastChannel 
            && channelsInclude(channelList, lastChannel)) { // Handle edge case of local channel out of sync with server's channel list
            clearChatBox();
            setActiveChannel(lastChannel);
            setChatBoxTitle(lastChannel);
            setLastMessagesOnChannel(lastChannel);
            unhideChatBox();
            initSendBtn();
        }
    })
});

function connectToSocket(){
    socket =  io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    return socket;
}

function initAddChannelButton(){
    const addChannelBtn = document.querySelector('#add-channel');
    
    addChannelBtn.onclick = () => {
        const field = document.querySelector('#channel-name');
        const channel = field.value;

        if (!validChannel(channel)) {
            alert('Must enter a valid channel');
        } else {
            const channelsEls = getExistingChannels();
            if (!channelsInclude(channelsEls, channel)) {
                field.value = '';
                socket.emit('add channel', { 'channel': channel });
            }
            else {
                alert('Sorry! Channel exists')
            }    
        }
    }
}

function validChannel(channel){
    return channel.trim() != '';
}

function refreshChannelOnClick(){
    const channels = getExistingChannels();

    if (channels) {
        channels.forEach( buttonEl => {
            buttonEl.onclick = () => {
                channel = buttonEl.innerText;
                clearActiveChannel();
                clearChatBox();
                setActiveChannel(channel);
                setLastMessagesOnChannel(channel);
                unhideChatBox();
                setChatBoxTitle(channel);
                saveLastChannel(channel);
                initSendBtn();
            }
        });
    }
}

function initChannelSocket() {
    socket.on('announce channel', channel => {
        addChannel(channel);
    });
}


function clearActiveChannel(){
    const activeChannel = document.querySelector('.active')
    if (activeChannel) {
        activeChannel.classList.remove('active')
    }
}

function setActiveChannel(channel){
    channelList = getExistingChannels();
    for (i=0;i < channelList.length;i++) {
        if (channel == channelList[i].innerText){
            channelList[i].classList.add('active');
        }
    }
}

function clearChatBox(){
    getChatBody().innerHTML = '';
}

function addChannel(channel){
    let channelBtn = document.createElement('button');
    channelBtn.classList.add(...['list-group-item', 'list-group-item-action', 'channel']);
    channelBtn.innerText = channel
    document.querySelector('#channel-list').appendChild(channelBtn);
    refreshChannelOnClick();
}

function getExistingChannels(){
    return document.querySelectorAll('#channel-list>button');
}

function channelsInclude(channelsEls, channel) {
    for (i = 0;i < channelsEls.length;i++) {
        if (channelsEls[i].innerText == channel) {
            return true;
        }
    }
    return false;
}

function unhideChatBox(){
    document.querySelector('#chat-box').classList.remove('hide');
}

function setChatBoxTitle(channel){
    document.querySelector('#chat-title').innerText = channel;
}

function saveLastChannel(channel){
    window.localStorage.setItem('lastChannel', channel)
}

function getLastChannel(){
    return window.localStorage.getItem('lastChannel');
}

function initSendBtn(){
    const sendBtn = document.querySelector('#send-msg');

    sendBtn.onclick = () => {
        const field = document.querySelector('#msg');
        const msg = field.value;
        field.value = '';
        socket.emit('send msg', {'msg':msg, 'channel':getLastChannel()})
    }
}

function initMsgSocket() {
    socket.on('announce msg', data => {
        console.log(`Message received: ${data}`)
        if (data.channel == getLastChannel()){
            addMessageToChat(data.msg)
        }
    });
}

function addMessageToChat(msg) {
    let li = document.createElement('li');
    li.innerText = msg;
    getChatBody().appendChild(li);

}

function getChatBody(){
    return document.querySelector('#chat-body');
}

async function setLastMessagesOnChannel(channel){
    let res = await fetch(`/messages/${channel}`);
    if (res.ok) {
        let json = await res.json();
        for (i=0;i < json.messages.length;i++) {
            addMessageToChat(json.messages[i]);
        }
    } else {
        console.log(res.status)
    }
}






