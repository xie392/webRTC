import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import { cva } from "class-variance-authority";
import { users } from "../data/users";
import WebRTC from "../lib/webrtc";

const SOCKET_URL = "http://localhost:4000/webrtc";

// 房间 ID
const ROOM_ID = "room1";

const buttonVariants = cva("rounded-md text-xs  rounded flex-shrink-0", {
  variants: {
    variant: {
      default: "bg-blue-500 text-white hover:bg-blue-600",
      destructive: "bg-red-500 text-white hover:bg-red-600",
    },
    size: {
      default: "text-sm px-2 py-1",
      large: "text-sm px-3.5 py-1.5",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const webrtc = new WebRTC();

function BaseWebRTC({ userId }: { userId: string }) {
  const socketRef = useRef<Socket>();
  const streamRef = useRef<MediaStream>();
  const videoRef = useRef<HTMLVideoElement>(null);

  // 是否是发送者
  const [isSender, setIsSender] = useState<boolean>(false);
  // 是否是接收者
  const [isReceiver, setIsReceiver] = useState<boolean>(false);
  // 是否在通话中
  const [isCalling, setIsCalling] = useState<boolean>(false);
  // 用户列表
  const [userList, setUserList] = useState<typeof users>([]);

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      query: {
        userId,
      },
    });

    // 简体是否连接成功
    socketRef.current.once("connect", () => {
      console.log("webRTC 连接成功");
    });

    // 获取在线用户
    socketRef.current.on("online-users", (onlineUsers) => {
      if (!Array.isArray(onlineUsers)) return;
      const userList = onlineUsers.map((id) => {
        const user = users.find((user) => user.id === id);
        if (!user) return;
        return user;
      }) as typeof users;
      setUserList(userList);
    });

    // 监听收到的视频请求
    socketRef.current?.on("start-call", () => {
      // 如果当前是发送者，则不处理
      if (isSender) return;
      // 设置接收者状态
      setIsReceiver(true);
      // 设置通话状态
      setIsCalling(true);

      // 加入房间
      socketRef.current?.emit("join-room", {
        roomId: ROOM_ID,
        userId,
      });
    });

    // 监听视频通话结束
    socketRef.current?.on("end-call", () => {
      if (isSender) return;
      setIsReceiver(false);
      setIsCalling(false);
      console.log("对方结束了通话");
    });

    const disconnect = () => {
      socketRef.current?.disconnect();
    };

    // 页面关闭
    window.addEventListener("beforeunload", disconnect);

    return () => {
      window.removeEventListener("beforeunload", disconnect);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // 发起视频
  const handleStartCall = async (id: string) => {
    // 设置发送者状态
    setIsSender(true);
    // 设置通话状态
    setIsCalling(true);
    // 开启视频通话
    streamRef.current = await webrtc.getMediaStream();
    // 如果有视频元素，则播放视频
    if (videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play();
    }

    // 加入房间
    socketRef.current?.emit("join-room", {
      roomId: ROOM_ID,
      userIds: id,
    });
    // 发送消息
    socketRef.current?.emit("start-call", {
      roomId: ROOM_ID,
      userIds: [id],
    });
    console.log("发起视频通话");
  };

  // 结束视频
  const handleEndCall = (id: string) => {
    // 设置发送者状态
    setIsSender(false);
    // 设置通话状态
    setIsCalling(false);
    // 停止视频播放且关闭视频流
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      webrtc.stopMediaStream(streamRef.current!);
    }
    // 发送消息
    socketRef.current?.emit("end-call", {
      roomId: ROOM_ID,
      userIds: [id],
    });
    console.log("结束视频通话");
  };

  return (
    <div className="h-screen overflow-hidden p-10 bg-gray-100">
      <div className="flex bg-white h-full rounded shadow-xl w-[800px] mx-auto">
        <div className="flex-1 flex-shrink-0 border-r border-gary-300 relative bg-gray-100">
          {isReceiver && (
            <div className="absolute bg-white z-10 w-fit px-10 left-1/2 -translate-x-1/2 py-3 top-1/2 -translate-y-1/2 shadow-2xl rounded">
              <h1 className="text-sm text-blue-500 mb-3 text-center">
                接收到视频请求
              </h1>
              <div className="flex justify-center space-x-4">
                <button className={buttonVariants({ size: "large" })}>
                  同意
                </button>
                <button
                  className={buttonVariants({
                    variant: "destructive",
                    size: "large",
                  })}
                >
                  拒绝
                </button>
              </div>
            </div>
          )}

          <video ref={videoRef} className="w-full h-full object-cover"></video>
        </div>
        <div className="w-1/3 flex-shrink-0 min-w-[300px] space-y-2 flex-col flex h-full p-4">
          <div>
            <h2 className="text-sm mb-2 pb-2 border-b border-gray-300">
              在线用户（
              <span className="text-blue-500">
                {userList.find((user) => user.id === userId)?.name}
              </span>
              ）
            </h2>

            <div className="overflow-auto max-h-96 pt-1">
              {userList.map((user) =>
                user?.id === userId ? null : (
                  <div key={user?.id} className="flex items-center mb-3">
                    <div className="flex items-center flex-1">
                      <img
                        src={user?.avatar}
                        alt={user?.name}
                        className="size-8 rounded-full mr-2"
                      />
                      <span className="text-sm">{user?.name}</span>
                    </div>

                    {isCalling || isSender ? (
                      <button
                        className={buttonVariants({ variant: "destructive" })}
                        onClick={() => handleEndCall(user?.id)}
                      >
                        结束视频
                      </button>
                    ) : (
                      <button
                        className={buttonVariants()}
                        onClick={() => handleStartCall(user?.id)}
                      >
                        发起视频
                      </button>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BaseWebRTC;
