"use client";

import { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { sender: string; content: string; timestamp: string }[]
  >([]);
  const [roomId, setRoomId] = useState<number>(1);
  const [lastUserMessageTime, setLastUserMessageTime] = useState<Date | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  const [systemMessageSent, setSystemMessageSent] = useState(false);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const clientRef = useRef<Client | null>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) return;

    if (clientRef.current) {
      console.log("WebSocket 이미 연결됨");
      return;
    }

    const socket = new SockJS("http://localhost:8080/ws/chat");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("WebSocket 연결됨");
        setIsConnected(true);
        clientRef.current = stompClient;

        // 채팅 구독
        stompClient.subscribe(`/topic/chat/${roomId}`, (messageOutput) => {
          const newMessage = JSON.parse(messageOutput.body);

          setMessages((prevMessages) => [
            ...prevMessages,
            { ...newMessage, timestamp: new Date().toLocaleString("sv-SE") },
          ]);
          setLastUserMessageTime(new Date());
        });

        // 60초 후 상담원이 연결되지 않으면 메시지 출력
        setTimeout(() => {
          sendSystemMessage(
            "⚠️ 현재 상담원이 부재중입니다. 잠시만 기다려 주세요."
          );
        }, 60000);
      },
      onDisconnect: () => {
        console.log("WebSocket 연결 해제됨");
        setIsConnected(false);
        clientRef.current = null;
      },
      onStompError: (frame) => {
        console.error("STOMP 에러: ", frame);
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
      clientRef.current = null;
    };
  }, [isOpen, roomId]);

  useEffect(() => {
    if (!isOpen || !isConnected || systemMessageSent) return;

    sendSystemMessage("안녕하세요! 😊 고객센터입니다. 무엇을 도와드릴까요?");
    setSystemMessageSent(true);
  }, [isOpen, isConnected, systemMessageSent]);

  useEffect(() => {
    if (!isOpen) return;

    // 채팅방 메시지 초기 로드
    fetch(`http://localhost:8080/chat/messages/${roomId}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("서버에서 데이터를 가져오지 못했습니다.");
        }
        return response.json();
      })
      .then((data) => {
        setMessages((prevMessages) => {
          const newMessages = data || [];
          return [...newMessages];
        });

        // 메시지 로드 후 3분 동안 응답이 없으면 자동 종료 메시지를 설정
        const lastMessageTime =
          data?.length > 0
            ? new Date(data[data.length - 1].timestamp)
            : new Date();
        setLastUserMessageTime(lastMessageTime);
      })
      .catch((error) => {
        console.error("채팅 메시지 조회 실패:", error);
      });
  }, [isOpen, roomId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUserMessageTime) {
        const now = new Date();
        const diff = (now.getTime() - lastUserMessageTime.getTime()) / 1000;

        // 3분 후 대화 종료 예정 메시지 전송
        if (diff > 180 && !isSessionEnded) {
          sendSystemMessage(
            "⏳ 대화가 종료될 예정입니다. 계속 상담을 원하시면 메시지를 입력해주세요."
          );

          setTimeout(() => {
            sendSystemMessage(
              "🔴 상담이 종료되었습니다. 상담을 원하시면 다시 입력해 주세요."
            );
            setIsSessionEnded(true);
          }, 30000); // 30초 후 종료 메시지 전송

          setLastUserMessageTime(null);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [lastUserMessageTime, isSessionEnded]);

  // 사용자 메세지 보내기
  const sendMessage = () => {
    if (!clientRef.current || message.trim() === "") return;

    const messageObj = {
      roomId: roomId,
      sender: "USER",
      content: message,
      timestamp: new Date().toLocaleString("sv-SE"),
    };

    clientRef.current.publish({
      destination: `/app/chat/user/${roomId}`,
      body: JSON.stringify(messageObj),
    });

    setMessage("");
    setLastUserMessageTime(new Date());
    setIsSessionEnded(false);
  };

  // 시스템 메시지 보내기
  const sendSystemMessage = (content: string) => {
    if (!clientRef.current) {
      console.warn("WebSocket 연결 대기 중... 1초 후 재시도");
      return;
    }

    if (!clientRef.current.connected) {
      console.warn("STOMP WebSocket이 아직 활성화되지 않았습니다.");
      return;
    }

    const systemMessageObj = {
      roomId: roomId,
      sender: "SYSTEM",
      content: content,
      timestamp: new Date().toLocaleString("sv-SE"),
    };

    try {
      clientRef.current.publish({
        destination: `/app/chat/system/${roomId}`,
        body: JSON.stringify(systemMessageObj),
      });
    } catch (error) {
      console.error("STOMP 메시지 전송 실패:", error);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div>
      {/* 채팅 버튼 */}
      <button
        onClick={toggleChat}
        className="fixed bottom-10 right-10 p-4 bg-blue-600 text-white rounded-full shadow-lg"
      >
        💬
      </button>

      {/* 채팅 창 */}
      {isOpen && (
        <div className="fixed bottom-10 right-26 w-96 h-150 bg-white shadow-lg rounded-lg p-4">
          <div className="flex flex-col h-full">
            <h1 className="text-2xl font-bold">고객센터</h1>

            {/* 채팅 내용 */}
            <div className="flex flex-col h-full overflow-auto mt-5">
              <div className="p-2">
                <div className="flex flex-col space-y-2">
                  {messages.map((msg, index) => {
                    if (!msg) return null;

                    return (
                      <div
                        key={index}
                        className={`p-2 rounded-lg max-w-[80%] ${
                          msg.sender === "USER"
                            ? "bg-blue-500 text-white self-end"
                            : "bg-gray-100 text-black self-start"
                        }`}
                      >
                        {msg.content}
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* 맨 아래로 스크롤 */}
              <div ref={messagesEndRef} />
            </div>
            {/* 메시지 입력란 */}
            <div className="flex items-center justify-between p-2 bg-white mt-4">
              <input
                type="text"
                placeholder="메시지를 입력하세요."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 border rounded-lg mr-2"
              />
              <button
                onClick={sendMessage}
                className="p-2 bg-blue-600 text-white rounded-lg"
              >
                📤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChat;
