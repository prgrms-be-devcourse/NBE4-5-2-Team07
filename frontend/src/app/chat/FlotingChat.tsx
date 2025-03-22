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
  const awayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 사용자 정보 조회 – 회원/게스트/관리자 구분
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
    setIsOpen((prev) => !prev);
    setIsMinimized(false); // 열 때 최소화 상태 해제
  };

  // 채팅창 최소화 토글
  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
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

  // WebSocket 연결 설정 및 메시지 구독
  useEffect(() => {
    if (!isOpen || roomId === null || !role || role === "ADMIN") return;
    if (clientRef.current) return; // 이미 연결된 경우 무시

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
          setMessages((prev) => {
            // 중복 수신 방지
            const dup = prev.some(
              (m) =>
                m.sender === newMsg.sender &&
                m.content === newMsg.content &&
                m.timestamp === newMsg.timestamp
            );
            if (dup) return prev;
            return [...prev, newMsg];
          });

          // 마지막 대화 시각 업데이트 및 타이머 관리 (시스템 메시지는 제외)
          if (newMsg.sender !== "SYSTEM") {
            // 새로운 실제 메시지가 도착하면 종료 예정 타이머 취소
            if (endTimerRef.current) {
              clearTimeout(endTimerRef.current);
              endTimerRef.current = null;
            }
            if (newMsg.sender === "ADMIN") {
              // 상담원 응답이 온 경우 부재 알림 타이머 취소
              if (awayTimerRef.current) {
                clearTimeout(awayTimerRef.current);
                awayTimerRef.current = null;
              }
            } else {
              // 사용자가 메시지를 보낸 경우 1분 후 상담원 부재 알림 타이머 설정
              if (awayTimerRef.current) {
                clearTimeout(awayTimerRef.current);
              }
              awayTimerRef.current = setTimeout(() => {
                sendSystemMessage("⚠️ 현재 상담원이 부재중입니다. 잠시만 기다려 주세요.");
              }, 60000);
            }
            setLastUserMessageTime(new Date(newMsg.timestamp));
          }
        });

        // 첫 연결 시 환영 시스템 메시지 전송 (한 번만)
        if (!systemMessageSentRef.current) {
          systemMessageSentRef.current = true;
          sendSystemMessage("안녕하세요! 😊 DevPrep 고객센터입니다. 무엇을 도와드릴까요?");
        }
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

    // 컴포넌트 언마운트 시 정리(clean-up)
    return () => {
      stompClient.deactivate();
      clientRef.current = null;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      // 등록된 타이머 정리
      if (awayTimerRef.current) {
        clearTimeout(awayTimerRef.current);
      }
      if (endTimerRef.current) {
        clearTimeout(endTimerRef.current);
      }
    };
  }, [isOpen, roomId, role]);

  // 채팅방 기존 메시지 불러오기 (채팅창 열 때)
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

  // 메시지 전송 (Enter 키 핸들링)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 채팅 메시지 전송 (사용자 메시지)
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
        destination: `/app/chat/user/${roomId}`,
        body: JSON.stringify(chatMessage),
      });
      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // 시스템 메시지 전송 함수
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
        destination: `/app/chat/system/${roomId}`,
        body: JSON.stringify(systemMsg),
      });
    } catch (err) {
      console.error("Failed to send system message:", err);
    }
  };

  // 3분 무응답 체크: 3분 후 안내 및 3분 30초 후 종료 메시지
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUserMessageTime) {
        const now = new Date();
        const diffSec = (now.getTime() - lastUserMessageTime.getTime()) / 1000;
        if (diffSec > 180) {
          // 3분 경과: 대화 종료 예정 안내
          sendSystemMessage("⏳ 대화가 종료될 예정입니다. 계속 상담을 원하시면 메시지를 입력해주세요.");
          // 3분 30초 경과: 대화 종료 안내 (타이머 등록)
          endTimerRef.current = setTimeout(() => {
            sendSystemMessage("🔴 상담이 종료되었습니다. 상담을 원하시면 다시 입력해 주세요.");
          }, 30000);
          // 타이머 중복 방지를 위해 마지막 대화시각 초기화
          setLastUserMessageTime(null);
        }
      }
    }, 10000); // 10초마다 체크
    return () => clearInterval(interval);
  }, [lastUserMessageTime]);

  // 새로운 메시지 등장 시 스크롤 하단으로 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 회원/게스트 표시 이름 생성
  const displayLabel =
    role === "USER"
      ? `${nickname} 회원`
      : role === "GUEST"
        ? `게스트 ${nickname.replace(/\D/g, "")}`
        : "";

  // 시/분 포맷 (오전/오후 표기 포함)
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

  // 날짜 포맷 (연월일 및 요일 표시)
  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      });
    } catch {
      return "";
    }
  };

  // 날짜 구분자 컴포넌트
  const DateSeparator = ({ date }: { date: string }) => (
    <div className="flex justify-center my-2">
      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">{date}</span>
    </div>
  );

  // 시간대별 인사말 생성
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "좋은 아침입니다";
    if (hour < 18) return "안녕하세요";
    return "좋은 저녁입니다";
  };

  return (
    <>
      {/* 채팅 열기 토글 버튼 (관리자가 아닌 경우에만 표시) */}
      {role !== "ADMIN" && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg z-50 flex items-center justify-center transition-all duration-300 w-12 h-12"
          aria-label="고객센터 채팅 열기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}

      {/* 채팅창 패널 */}
      {isOpen && roomId !== null && role !== "ADMIN" && (
        <div
          className={`fixed bottom-6 right-6 ${isMinimized ? "w-80 h-12" : "w-96 h-[540px]"} 
                      bg-white shadow-xl rounded-xl transition-all duration-300 flex flex-col z-50 overflow-hidden`}
          style={{ boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.2), 0 10px 10px -5px rgba(79, 70, 229, 0.1)" }}
        >
          {/* 헤더 영역 */}
          <div
            className={`flex items-center justify-between p-3 
                        bg-gradient-to-r from-indigo-600 to-purple-600 
                        text-white rounded-t-xl cursor-pointer`}
            onClick={toggleMinimize}
          >
            <div className="flex items-center">
              <div className="bg-white p-1 rounded-full mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 
                      012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h1 className="text-sm font-bold">DevPrep 고객센터</h1>
            </div>
            <div className="flex">
              {/* 최소화 버튼 */}
              {!isMinimized && (
                <button
                  className="text-white mr-1 hover:bg-white hover:bg-opacity-20 rounded p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMinimize();
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M18 12H6"
                    />
                  </svg>
                </button>
              )}
              {/* 닫기 버튼 */}
              <button
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleChat();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* 최소화 상태가 아닐 때만 표시 */}
          {!isMinimized && (
            <>
              {/* 인사말 영역 */}
              <div className="p-4 border-b border-gray-100 bg-indigo-50">
                <p className="text-sm text-gray-700">
                  {getGreeting()}, <span className="font-medium">{displayLabel}</span>님!
                </p>
                <p className="text-xs text-gray-500 mt-1">DevPrep 고객센터입니다. 무엇을 도와드릴까요?</p>
              </div>

              {/* 메시지 표시 영역 */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                {messages.map((msg, index) => {
                  const isSystem = msg.sender === "SYSTEM";
                  const isMine = msg.sender === role && !isSystem;
                  const isAdmin = msg.sender === "ADMIN";

                  // 메시지 정렬 방향 클래스
                  const alignmentClass = isSystem
                    ? "justify-start"
                    : isMine
                      ? "justify-end"
                      : "justify-start";

                  // 말풍선 스타일 클래스
                  const bubbleClass = isSystem
                    ? "bg-gray-100 text-gray-600 text-sm rounded-lg px-3 py-2 max-w-[85%] whitespace-pre-line"
                    : isMine
                      ? "bg-indigo-100 text-indigo-800 text-sm rounded-lg px-3 py-2 max-w-[85%] whitespace-pre-line"
                      : isAdmin
                        ? "bg-slate-100 text-gray-800 text-sm rounded-lg px-3 py-2 max-w-[85%] whitespace-pre-line"
                        : "bg-slate-100 text-gray-800 text-sm rounded-lg px-3 py-2 max-w-[85%] whitespace-pre-line";


                  // 현재 메시지와 이전 메시지의 날짜가 다르면 날짜 구분자 삽입
                  const showDateSeparator =
                    index === 0 ||
                    new Date(msg.timestamp).toDateString() !==
                    new Date(messages[index - 1].timestamp).toDateString();

                  return (
                    <div key={index} className="mb-3">
                      {showDateSeparator && <DateSeparator date={formatDate(msg.timestamp)} />}

                      <div className={`flex ${alignmentClass}`}>
                        <div className={`flex flex-col ${isMine ? 'items-end' : ''}`}>
                          {/* 보낸 사람 레이블 (상담원/시스템) */}
                          {!isMine && !isSystem && (
                            <span className="text-xs text-gray-500 mb-1 ml-1">
                              {isAdmin ? "상담원" : "시스템"}
                            </span>
                          )}

                          <div className="flex items-end">
                            {/* 상담원/시스템 프로필 아이콘 */}
                            {!isMine && (
                              <div className="flex-shrink-0 mr-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSystem ? 'bg-gray-200' : 'bg-purple-100'}`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${isSystem ? 'text-gray-600' : 'text-purple-600'}`} viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                      fillRule="evenodd"
                                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              </div>
                            )}

                            {/* 메시지 내용 말풍선 */}
                            <div className={`${bubbleClass} whitespace-pre-line`}>
                              {msg.content}
                            </div>
                          </div>

                          {/* 메시지 시간 */}
                          <span className={`text-xs text-gray-400 mt-1 ${isMine ? '' : 'ml-8'}`}>
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
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
                      <path
                        strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
                <div className="text-xs text-gray-400 mt-2 flex justify-between items-center">
                  <span>Shift + Enter로 줄바꿈</span>
                  <div className="flex items-center">
                    {/* 연결 상태 표시 (초록불/빨간불) */}
                    <span className={`w-2 h-2 rounded-full mr-1 ${isConnected ? "bg-green-500" : "bg-gray-400"}`} />
                    <span>{isConnected ? "온라인" : "오프라인"}</span>
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