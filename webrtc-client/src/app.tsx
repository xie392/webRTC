import { useState } from "react";
import SelectUser from "./components/select-user";
import BaseWebRTC from "./components/base-webrtc";

function App() {
  // 用户 ID
  const [userId, setUserId] = useState<string>("");

  if (!userId) {
    return <SelectUser onSelect={setUserId} />;
  }

  return <BaseWebRTC userId={userId} />;
}

export default App;
