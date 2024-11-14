const socketUrl = "wss://REDACTED.execute-api.ap-northeast-2.amazonaws.com/dev";
let socket = new WebSocket(url);

socket.onopen = function() {
    console.log("Connected to WebSocket server");
    // socket.send("Hello from the browser!");
    socket.send(JSON.stringify({
        'type': 'auth-request',
        'action': 'auth',
        'data': "this is authorization token"
    }));
};

socket.onmessage = function(event) {
    console.log("Message from server:", event.data);
};

socket.onclose = function(event) {
    console.log("WebSocket closed:", event);
};

socket.onerror = function(error) {
    console.log("WebSocket error:", error);
};
