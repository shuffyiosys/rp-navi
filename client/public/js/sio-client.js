const socket = io("http://192.168.1.198:4070");

function joinRoom(roomName, characterName) {
	socket.emit("join room", {
		roomName: roomName,
		characterName: characterName,
	},
	(response) => {
		console.log("join room acked", response);
	});
}

function leaveRoom(roomName, characterName) {
	socket.emit("leave room", {
		roomName: roomName,
		characterName: characterName,
	},
	(response) => {
		console.log("leave room acked", response);
	});
}

function postChatMessage(roomName, characterName, message) {
	socket.emit(
		"post message",
		{
			roomName: roomName,
			characterName: characterName,
			message: message,
		},
		(response) => {
			console.log("post message acked", response);
		}
	);
}

socket.on("message posted", (resp) =>
	console.log("Handling message posted", resp)
);
socket.on("user joined", (resp) => console.log("Handling user joined", resp));
socket.on("user left", (resp) => console.log("Handling user left", resp));
