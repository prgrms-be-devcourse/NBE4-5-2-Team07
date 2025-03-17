"use client";

import { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export interface ChatMessage {
  roomId: number;
  sender: string; // "USER" | "GUEST" | "ADMIN" | "SYSTEM"
  content: string;
  timestamp: string;
}

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const systemMessageSentRef = useRef(false);
  const subscriptionRef = useRef<any>(null);
  const [lastUserMessageTime, setLastUserMessageTime] = useState<Date | null>(
    null
  );

  // 1) 사용자 정보 조회 (회원/비회원/관리자 구분) – /chat/auth/user 호출
  const fetchUserInfo = async () => {
    try {
      const res = await fetch("https://devapi.store/chat/auth/user", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Not logged in");
      const data = await res.json();

      // 관리자라면 플로팅 채팅 버튼을 숨김 (관리자 전용 페이지에서 관리)
      if (data.role === "ADMIN") {
        setIsAdmin(true);
        return;
      }
      if (data.userId) {
        // 회원: 회원 전용 채팅룸 조회/생성 API 호출
        await fetchChatRoomByUser(data.userId);
        setDisplayName(data.displayName || data.userId.toString());
      } else {
        // 비회원: 게스트 채팅룸 ID 할당
        await assignGuestRoomId();
      }
    } catch (err) {
      await assignGuestRoomId();
    }
  };

  // 1-1) 회원 전용 채팅룸 조회/생성 API 호출
  const fetchChatRoomByUser = async (userId: number) => {
    try {
      const res = await fetch(`https://devapi.store/chat/room/user/${userId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to get chat room for user");
      const data = await res.json();
      setRoomId(data.roomId);
    } catch (err) {
      console.error("fetchChatRoomByUser error:", err);
    }
  };

  // 2) 비회원: /chat/rooms/guest 호출하여 사용 가능한 음수 ID 할당
  const assignGuestRoomId = async () => {
    try {
      const res = await fetch("https://devapi.store/chat/room/guest", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to get guest id");
      const data = await res.json();
      setRoomId(data.guestId);
      setDisplayName(String(Math.abs(data.guestId)));
    } catch (err) {
      console.error("assignGuestRoomId error:", err);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  // 3) 채팅창 열기/닫기
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // 3-1) textArea 높이 자동 증가
  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    resizeTextarea();
  }, [message]);

  // 4) WebSocket 연결 (관리자 제외)
  useEffect(() => {
    if (isAdmin) return;
    if (!isOpen || roomId === null) return;
    // 이거 useRef로 바꾸기
    if (clientRef.current) {
      console.log("WebSocket already connected");
      return;
    }
    const socket = new SockJS("https://devapi.store/ws/chat");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        clientRef.current = stompClient;

        // 구독: /topic/chat/{roomId}
        stompClient.subscribe(`/topic/chat/${roomId}`, (msgFrame) => {
          const newMsg: ChatMessage = JSON.parse(msgFrame.body);
          setMessages((prev) => {
            const dup = prev.some(
              (m) =>
                m.sender === newMsg.sender &&
                m.content === newMsg.content &&
                m.timestamp === newMsg.timestamp
            );
            if (dup) return prev;
            return [...prev, newMsg];
          });
        });

        // onConnect 시 단 한 번만 시스템 메시지 전송
        if (!systemMessageSentRef.current) {
          systemMessageSentRef.current = true;
          sendSystemMessage("안녕하세요! 😊 무엇을 도와드릴까요?");
        }

        setTimeout(() => {
          if (!isConnected) {
            sendSystemMessage(
              "⚠️ 현재 상담원이 부재중입니다. 잠시만 기다려 주세요."
            );
          }
        }, 60000);
      },
      onDisconnect: () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        clientRef.current = null;
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
        }
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
    });
    stompClient.activate();

    return () => {
      stompClient.deactivate();
      clientRef.current = null;
    };
  }, [isOpen, roomId, isAdmin]);

  // 5) 채팅방 메시지 로드
  useEffect(() => {
    if (isAdmin) return;
    if (!isOpen || roomId === null) return;
    fetch(`https://devapi.store/chat/messages/${roomId}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch messages");
        return res.json();
      })
      .then((data: ChatMessage[]) => {
        setMessages(data);

        const lastMessageTime =
          data?.length > 0
            ? new Date(data[data.length - 1].timestamp)
            : new Date();
        console.log(lastMessageTime);
        setLastUserMessageTime(lastMessageTime);
      })
      .catch((err) => console.error("Load messages error:", err));
  }, [isOpen, roomId, isAdmin]);

  // 6) 메시지 전송 (UI 업데이트는 구독 콜백)
  const sendMessage = () => {
    if (!clientRef.current || !clientRef.current.connected) return;
    if (!roomId || message.trim() === "") return;
    const senderType = roomId > 0 ? "USER" : "GUEST";
    const msg: ChatMessage = {
      roomId,
      sender: senderType,
      content: message,
      timestamp: new Date().toISOString(),
    };
    try {
      clientRef.current.publish({
        destination: `/app/chat/user/${roomId}`,
        body: JSON.stringify(msg),
      });
      setMessage("");
    } catch (err) {
      console.error("Fail to send message:", err);
    }
  };

  // 7) 시스템 메시지 전송
  const sendSystemMessage = (content: string) => {
    if (!clientRef.current || roomId === null || !clientRef.current.connected)
      return;
    const sysMsg: ChatMessage = {
      roomId,
      sender: "SYSTEM",
      content,
      timestamp: new Date().toISOString(),
    };
    try {
      clientRef.current.publish({
        destination: `/app/chat/system/${roomId}`,
        body: JSON.stringify(sysMsg),
      });
    } catch (err) {
      console.error("Fail to send system message:", err);
    }
  };

  //
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUserMessageTime) {
        const now = new Date();
        const diff = (now.getTime() - lastUserMessageTime.getTime()) / 1000;

        // 3분 후 대화 종료 예정 메시지 전송
        if (diff > 180) {
          sendSystemMessage(
            "⏳ 대화가 종료될 예정입니다. 계속 상담을 원하시면 메시지를 입력해주세요."
          );

          setTimeout(() => {
            sendSystemMessage(
              "🔴 상담이 종료되었습니다. 상담을 원하시면 다시 입력해 주세요."
            );
          }, 30000); // 30초 후 종료 메시지 전송

          setLastUserMessageTime(null);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [lastUserMessageTime]);

  // 9) 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 관리자는 플로팅 채팅 버튼 자체를 렌더링하지 않음
  if (isAdmin) return null;

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-10 right-10 p-4 bg-blue-600 text-white rounded-full shadow-lg z-50"
      >
        💬
      </button>

      {isOpen && roomId !== null && (
        <div className="fixed bottom-10 right-40 w-96 h-[600px] bg-white shadow-lg rounded-lg flex flex-col z-50">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-3 bg-blue-500 text-white rounded-t-lg">
            <h1 className="text-lg font-bold">
              고객센터{" "}
              {roomId > 0
                ? `(회원 ${displayName})`
                : `(게스트 ${Math.abs(roomId)})`}
            </h1>
            {/* 일반 사용자(회원, 게스트)는 채팅 삭제 버튼(나가기) 미노출 */}
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-3">
            {messages.map((msg, index) => {
              const isMine = msg.sender === "USER" || msg.sender === "GUEST";
              return (
                <div
                  key={index}
                  className={`mb-2 flex ${
                    isMine ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-3 py-2 max-w-[70%] rounded-md ${
                      isMine
                        ? "bg-blue-500 text-white"
                        : msg.sender === "SYSTEM"
                        ? "bg-gray-300 text-black"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="p-3 bg-gray-100 rounded-b-lg">
            <div className="flex">
              <textarea
                className="flex-1 p-2 border rounded-md resize-none focus:outline-none"
                rows={1}
                placeholder="메시지를 입력하세요."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ overflow: "hidden", resize: "none" }}
              />
              <button
                onClick={sendMessage}
                disabled={!isConnected || message.trim() === ""}
                className={`ml-2 px-4 py-2 rounded-md ${
                  isConnected && message.trim() !== ""
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-500"
                }`}
              >
                전송
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChat;
