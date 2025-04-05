const socket = io();
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const startCallBtn = document.getElementById("startCall");

let localStream;
let peer;
let roomId = "123"; // Static room ID (you can make it dynamic)

// ✅ Get user camera & microphone
async function getMedia() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
    } catch (error) {
        console.error("Error accessing media devices.", error);
    }
}

// ✅ Call getMedia() immediately to request permissions
getMedia();

startCallBtn.addEventListener("click", () => {
    peer = new Peer();

    peer.on("open", (peerId) => {
        console.log("My Peer ID:", peerId);
        socket.emit("join-room", roomId, peerId);
    });

    peer.on("call", (call) => {
        call.answer(localStream);
        call.on("stream", (remoteStream) => {
            remoteVideo.srcObject = remoteStream;
        });
    });

    socket.on("user-connected", (peerId) => {
        console.log("New user connected:", peerId);
        const call = peer.call(peerId, localStream);
        call.on("stream", (remoteStream) => {
            remoteVideo.srcObject = remoteStream;
        });
    });
});
