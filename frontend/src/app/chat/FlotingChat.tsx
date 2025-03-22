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
  const [isMinimized, setIsMinimized] = useState(false);

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
  const toggleChat = () => {
    setIsOpen(prev => !prev);
    setIsMinimized(false); // 열 때 최소화 상태 해제
  };

  // 채팅창 최소화 토글
  const toggleMinimize = () => {
    setIsMinimized(prev => !prev);
  };

  // 메시지 입력창 자동 높이 조절
  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
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
          sendSystemMessage("안녕하세요! 😊 DevPrep 고객센터입니다. 무엇을 도와드릴까요?");
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

  // 메시지 전송 (Enter 키)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    } catch {
      return "";
    }
  };

  // 현재 시간에 기반한 인사말
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "좋은 아침입니다";
    if (hour < 18) return "안녕하세요";
    return "좋은 저녁입니다";
  };

  return (
    <>
      {/* 채팅 열기 토글 버튼*/}
      {role !== "ADMIN" && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg z-50 flex items-center justify-center transition-all duration-300 w-14 h-14"
          aria-label="고객센터 채팅 열기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* 채팅창 패널 */}
      {isOpen && roomId !== null && role !== "ADMIN" && (
        <div
          className={`fixed bottom-6 right-6 ${isMinimized ? 'w-80 h-12' : 'w-96 h-[540px]'} bg-white shadow-xl rounded-xl transition-all duration-300 flex flex-col z-50 overflow-hidden`}
          style={{ boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.2), 0 10px 10px -5px rgba(79, 70, 229, 0.1)" }}
        >
          {/* 헤더 영역 */}
          <div
            className={`flex items-center justify-between p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl cursor-pointer`}
            onClick={toggleMinimize}
          >
            <div className="flex items-center">
              <div className="bg-white p-1 rounded-full mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-bold">DevPrep 고객센터</h1>
              </div>
            </div>
            <div className="flex">
              {!isMinimized && (
                <button
                  className="text-white mr-1 hover:bg-white hover:bg-opacity-20 rounded p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMinimize();
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                  </svg>
                </button>
              )}
              <button
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleChat();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* 인사말 영역 */}
              <div className="p-4 border-b border-gray-100 bg-indigo-50">
                <p className="text-sm text-gray-700">{getGreeting()}, <span className="font-medium">{displayLabel}</span>님!</p>
                <p className="text-xs text-gray-500 mt-1">DevPrep 고객센터입니다. 무엇을 도와드릴까요?</p>
              </div>

              {/* 메시지 표시 영역 */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                {messages.map((msg, index) => {
                  const isSystem = msg.sender === "SYSTEM";
                  const isMine = msg.sender === role && !isSystem;
                  const isAdmin = msg.sender === "ADMIN";

                  // 메시지 정렬 클래스 결정
                  const alignmentClass = isSystem
                    ? "justify-center"
                    : isMine
                      ? "justify-end"
                      : "justify-start";

                  // 말풍선 스타일 클래스 결정
                  const bubbleClass = isSystem
                    ? "bg-gray-200 text-gray-700 rounded-lg px-3 py-2 max-w-[85%] text-xs"
                    : isMine
                      ? "bg-indigo-600 text-white rounded-lg rounded-tr-none px-3 py-2 max-w-[85%]"
                      : isAdmin
                        ? "bg-purple-600 text-white rounded-lg rounded-tl-none px-3 py-2 max-w-[85%]"
                        : "bg-white border border-gray-200 text-gray-700 rounded-lg rounded-tl-none px-3 py-2 max-w-[85%]";

                  return (
                    <div key={index} className={`mb-3 flex ${alignmentClass}`}>
                      <div className="flex flex-col">
                        {!isMine && !isSystem && (
                          <span className="text-xs text-gray-500 mb-1 ml-1">
                            {isAdmin ? '상담원' : '시스템'}
                          </span>
                        )}
                        <div className="flex items-end">
                          {!isMine && !isSystem && (
                            <div className="flex-shrink-0 mr-2">
                              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                          <div className={bubbleClass}>
                            {msg.content}
                          </div>
                          {isMine && (
                            <span className="text-xs text-gray-400 ml-2">
                              {formatTime(msg.timestamp)}
                            </span>
                          )}
                        </div>
                        {!isMine && !isSystem && (
                          <span className="text-xs text-gray-400 mt-1 ml-8">
                            {formatTime(msg.timestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* 입력 영역 */}
              <div className="p-3 bg-white border-t border-gray-100">
                <div className="flex">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    className="flex-1 p-3 border border-gray-200 rounded-l-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 text-sm"
                    placeholder="메시지를 입력하세요..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!isConnected || message.trim() === ""}
                    className={`px-4 rounded-r-lg flex items-center justify-center ${isConnected && message.trim() !== ""
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "bg-gray-200 text-gray-400"
                      } transition-colors duration-200`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
                <div className="text-xs text-gray-400 mt-2 flex justify-between items-center">
                  <span>Shift + Enter로 줄바꿈</span>
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span>{isConnected ? '연결됨' : '연결 중...'}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default FloatingChat;