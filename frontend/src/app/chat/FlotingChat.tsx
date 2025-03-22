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
  const [role, setRole] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const systemMessageSentRef = useRef(false);
  const [lastUserMessageTime, setLastUserMessageTime] = useState<Date | null>(null);

  // 사용자 정보 조회 (/chat/room/info API 호출) – 회원/게스트/관리자 구분
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch("http://localhost:8080/chat/room/info", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch user info");

        const data = await res.json(); // API 응답: { roomId, nickname, role }

        setRoomId(data.roomId);
        setNickname(data.nickname);
        setRole(data.role); // ADMIN도 이로써 감지됨

      } catch (err) {
        console.error("사용자 정보 불러오기 실패", err);

      }
    };

    fetchUserInfo();
  }, []);

  // 사용자 정보 로딩 중인 경우 null 반환
  if (role === null) {
    return null; // 아직 사용자 정보 로딩 중
  }


  // 채팅창 열기/닫기 토글
  const toggleChat = () => setIsOpen(prev => !prev);

  // 메시지 입력창 자동 높이 조절
  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    resizeTextarea();
  }, [message]);

  // WebSocket 연결 (/topic/chat/{roomId})
  useEffect(() => {
    if (!isOpen || roomId === null || !role || role === "ADMIN") return;
    if (clientRef.current) return;

    const socket = new SockJS("http://localhost:8080/ws/chat");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        clientRef.current = stompClient;

        // 메시지 구독: /topic/chat/{roomId}
        subscriptionRef.current = stompClient.subscribe(`/topic/chat/${roomId}`, (msgFrame) => {
          const newMsg: ChatMessage = JSON.parse(msgFrame.body);
          setMessages(prev => {
            const dup = prev.some(
              m =>
                m.sender === newMsg.sender &&
                m.content === newMsg.content &&
                m.timestamp === newMsg.timestamp
            );
            if (dup) return prev;
            return [...prev, newMsg];
          });

          // 마지막 대화 시각 업데이트 (시스템 메시지는 제외)
          if (newMsg.sender !== "SYSTEM") {
            setLastUserMessageTime(new Date(newMsg.timestamp));
          }
        });

        // 첫 연결 시 환영 시스템 메시지 전송 (한 번만)
        if (!systemMessageSentRef.current) {
          systemMessageSentRef.current = true;
          sendSystemMessage("안녕하세요! 😊 무엇을 도와드릴까요?");
        }

        // 1분 후 상담원 부재중 안내 (상담사 응답 없을 경우)
        setTimeout(() => {
          if (!isConnected) {
            sendSystemMessage("⚠️ 현재 상담원이 부재중입니다. 잠시만 기다려 주세요.");
          }
        }, 60000);
      },

      onDisconnect: () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        clientRef.current = null;
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }
      },

      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
    });

    stompClient.activate();

    // 컴포넌트 언마운트 또는 의존성 변경 시 정리
    return () => {
      stompClient.deactivate();
      clientRef.current = null;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [isOpen, roomId, role]);

  // 채팅방 기존 메시지 불러오기
  useEffect(() => {
    if (!isOpen || roomId === null) return;
    if (!role || role === "ADMIN") return;
    fetch(`http://localhost:8080/chat/messages/${roomId}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load chat messages");
        return res.json();
      })
      .then((data: ChatMessage[]) => {
        setMessages(data);
        // 마지막 메시지 시각 설정 (없으면 현재 시각)
        const lastTime = data.length > 0 ? new Date(data[data.length - 1].timestamp) : new Date();
        setLastUserMessageTime(lastTime);
      })
      .catch((err) => console.error("Error loading messages:", err));
  }, [isOpen, roomId, role]);

  // 메시지 전송 시 sender에 사용자 role 사용 (내용과 timestamp 포함)
  // 채팅 메시지 전송 (WebSocket 경로: /app/chat/user/{roomId})
  const sendMessage = () => {
    if (!clientRef.current || !clientRef.current.connected) return;
    if (!roomId || message.trim() === "") return;
    const chatMessage: ChatMessage = {
      roomId,
      sender: role,
      content: message,
      timestamp: new Date().toISOString(),
    };
    try {
      clientRef.current.publish({
        destination: `/app/chat/user/${roomId}`,  // 메시지 전송 경로
        body: JSON.stringify(chatMessage),
      });
      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // 시스템 메시지 전송 (WebSocket 경로: /app/chat/system/{roomId})
  const sendSystemMessage = (content: string) => {
    if (!clientRef.current || !clientRef.current.connected || roomId === null) return;
    const systemMsg: ChatMessage = {
      roomId,
      sender: "SYSTEM",
      content,
      timestamp: new Date().toISOString(),
    };
    try {
      clientRef.current.publish({
        destination: `/app/chat/system/${roomId}`,  // 시스템 메시지 전송 경로
        body: JSON.stringify(systemMsg),
      });
    } catch (err) {
      console.error("Failed to send system message:", err);
    }
  };

  // 3분 후 알림 및 3분 30초 후 종료 시스템 메시지 전송
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUserMessageTime) {
        const now = new Date();
        const diffSec = (now.getTime() - lastUserMessageTime.getTime()) / 1000;
        if (diffSec > 180) {
          // 3분 경과: 종료 예정 안내
          sendSystemMessage("⏳ 대화가 종료될 예정입니다. 계속 상담을 원하시면 메시지를 입력해주세요.");
          setTimeout(() => {
            // 3분 30초 경과: 상담 종료 안내
            sendSystemMessage("🔴 상담이 종료되었습니다. 상담을 원하시면 다시 입력해 주세요.");
          }, 30000);
          // 타이머 초기화하여 중복 전송 방지
          setLastUserMessageTime(null);
        }
      }
    }, 10000); // 10초마다 체크
    return () => clearInterval(interval);
  }, [lastUserMessageTime]);

  // 새로운 메시지가 추가될 때 스크롤을 맨 아래로 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 회원의 경우 닉네임 +'회원', 게스트는 '게스트 N' 형식으로 표시할 이름 생성
  const displayLabel =
    role === "USER"
      ? `${nickname} 회원`
      : role === "GUEST"
        ? `게스트 ${nickname.replace(/\D/g, "")}`
        : "";

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    } catch {
      return "";
    }
  };

  return (
    <>
      {/* 채팅 열기 토글 버튼*/}
      {role !== "ADMIN" && (
        <button
          onClick={toggleChat}
          className="fixed bottom-10 right-10 p-4 bg-blue-600 text-white rounded-full shadow-lg z-50"
        >
          💬
        </button>
      )}

      {/* 채팅창 패널 */}
      {isOpen && roomId !== null && role !== "ADMIN" && (
        <div className="fixed bottom-10 right-40 w-96 h-[600px] bg-white shadow-lg rounded-lg flex flex-col z-50">
          {/* 헤더 영역 */}
          <div className="flex items-center justify-between p-3 bg-blue-500 text-white rounded-t-lg">
            <h1 className="text-lg font-bold">
              고객센터 {displayLabel && `(${displayLabel})`}
            </h1>
          </div>

          {/* 메시지 표시 영역 */}
          <div className="flex-1 overflow-y-auto p-3">
            {messages.map((msg, index) => {
              const isSystem = msg.sender === "SYSTEM";
              const isMine = msg.sender === role && !isSystem;
              // 메시지 정렬 클래스 결정
              const alignmentClass = isSystem ? "justify-center" : isMine ? "justify-end" : "justify-start";
              // 말풍선 스타일 클래스 결정
              const bubbleClass = isSystem
                ? "bg-gray-300 text-black"
                : isMine
                  ? "bg-blue-500 text-white"
                  : "bg-green-500 text-white";
              return (
                <div key={index} className={`mb-2 flex ${alignmentClass}`}>
                  <div className={`px-3 py-2 max-w-[70%] rounded-md ${bubbleClass}`}>
                    {msg.content}
                  </div>

                  <span className="text-xs text-gray-400 mt-1 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="p-3 bg-gray-100 rounded-b-lg">
            <div className="flex">
              <textarea
                ref={textareaRef}
                rows={1}
                className="flex-1 p-2 border rounded-md resize-none focus:outline-none"
                placeholder="메시지를 입력하세요."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                onClick={sendMessage}
                disabled={!isConnected || message.trim() === ""}
                className={`ml-2 px-4 py-2 rounded-md ${isConnected && message.trim() !== ""
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
