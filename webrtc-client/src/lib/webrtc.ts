class WebRTC {
  // 获取音视频流
  getMediaStream() {
    return navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  }

  // 关闭视频流
  stopMediaStream(stream: MediaStream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  // 创建 PeerConnection
  createPeerConnection(stream: MediaStream) {
    const pc = new RTCPeerConnection();
    // 添加本地流
    for (const track of stream.getTracks()) {
      pc.addTrack(track);
    }
  }
}

export default WebRTC;
