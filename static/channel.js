document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    
       
        // button.onclick = () => {
        //     msg = document.querySelector('#sentmsg').value;
        //     user = document.querySelector('#displayname').innerHTML;
        //     const li = document.createElement('li');
        //     li.innerHTML = `${user} ${msg}`;
        //     li.className = 'list-group-item'
        //     document.querySelector('.list-group').append(li);
        // };

    socket.on('connect', () => {

        button = document.querySelector('button');

        button.onclick = () => {

        }

             // Each button should emit a "submit vote" event
        document.querySelectorAll('button').forEach(button => {
            button.onclick = () => {
                const msg = document.querySelector('#sentmsg').value;
                socket.emit('send msg', {'msg': msg});
            };
        });
    });

    // When a new vote is announced, add to the unordered list
    socket.on('announce msg', data => {
        const li = document.createElement('li');
        li.className = 'list-group-item'
        li.innerHTML = `${data.msg}`;
        document.querySelector('.list-group').append(li);
    });
});