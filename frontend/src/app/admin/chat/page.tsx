"use client";

import { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface Message {
    roomId: number;
    sender: string;   // "USER" | "GUEST" | "ADMIN" | "SYSTEM"
    content: string;
    timestamp: string;
}

interface ChatRoom {
    roomId: number;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

const AdminChatDashboard = () => {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState<number | null>(null);

    const clientRef = useRef<Client | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Resize textarea as content changes
    const resizeTextarea = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    useEffect(() => {
        resizeTextarea();
    }, [message]);

    // Connect to WebSocket
    useEffect(() => {
        if (clientRef.current) {
            console.log("WebSocket already connected");
            return;
        }

        const socket = new SockJS("http://localhost:8080/ws/chat");
        const stompClient = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log("Admin WebSocket connected");
                setIsConnected(true);
                clientRef.current = stompClient;

                // Subscribe to all chat rooms if admin
                fetchChatRooms();
            },
            onDisconnect: () => {
                console.log("WebSocket disconnected");
                setIsConnected(false);
                clientRef.current = null;
            },
            onStompError: (frame) => {
                console.error("STOMP error: ", frame);
                setError("WebSocket connection error");
            },
        });

        stompClient.activate();

        return () => {
            if (stompClient.active) {
                stompClient.deactivate();
            }
            clientRef.current = null;
        };
    }, []);

    // Handle delete room button click
    const handleDeleteRoom = (roomId: number) => {
        setRoomToDelete(roomId);
        setShowDeleteConfirm(true);
    };

    // Confirm and execute deletion
    const confirmDeleteRoom = async () => {
        if (!roomToDelete) return;

        try {
            const response = await fetch(`http://localhost:8080/chat/messages/${roomToDelete}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('채팅방 삭제에 실패했습니다.');
            }

            // Update UI after successful deletion
            setChatRooms((prevRooms) => prevRooms.filter(room => room.roomId !== roomToDelete));

            // If the deleted room was the selected room, clear the selection
            if (selectedRoomId === roomToDelete) {
                setSelectedRoomId(null);
                setMessages([]);
            }

            // Close the confirmation modal
            setShowDeleteConfirm(false);
            setRoomToDelete(null);

            // Optionally show a success message
            setError("채팅방이 삭제되었습니다.");
            setTimeout(() => setError(null), 3000);

        } catch (error) {
            console.error("Error deleting chat room:", error);
            setError("채팅방 삭제에 실패했습니다.");
        }
    };

    // Cancel deletion
    const cancelDeleteRoom = () => {
        setShowDeleteConfirm(false);
        setRoomToDelete(null);
    };

    // Fetch all chat rooms
    const fetchChatRooms = async () => {
        setLoading(true);
        try {
            // This endpoint needs to be implemented on the backend
            const response = await fetch("http://localhost:8080/chat/rooms", {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch chat rooms");
            }

            const data = await response.json();
            setChatRooms(data);
        } catch (error) {
            console.error("Error fetching chat rooms:", error);
            setError("채팅방 목록을 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // Subscribe to a specific chat room
    const subscribeToRoom = (roomId: number) => {
        if (!clientRef.current || !clientRef.current.connected) {
            console.warn("WebSocket not connected");
            return;
        }

        // Unsubscribe from previous room if any
        if (selectedRoomId !== null && clientRef.current.active) {
            try {
                clientRef.current.unsubscribe(`/topic/chat/${selectedRoomId}`);
            } catch (error) {
                console.warn("Error unsubscribing:", error);
            }
        }

        // Subscribe to new room
        clientRef.current.subscribe(`/topic/chat/${roomId}`, (messageOutput) => {
            const newMessage = JSON.parse(messageOutput.body);

            // Check if the message already exists in the current messages
            setMessages((prevMessages) => {
                // Only add if the message doesn't already exist
                const messageExists = prevMessages.some(
                    (msg) =>
                        msg.timestamp === newMessage.timestamp &&
                        msg.content === newMessage.content &&
                        msg.sender === newMessage.sender
                );

                if (messageExists) {
                    return prevMessages;
                }

                return [...prevMessages, newMessage];
            });

            // Update chat room list to reflect new message
            setChatRooms((prevRooms) =>
                prevRooms.map((room) =>
                    room.roomId === roomId
                        ? {
                            ...room,
                            lastMessage: newMessage.content,
                            lastMessageTime: newMessage.timestamp,
                            unreadCount: selectedRoomId === roomId ? 0 : room.unreadCount + 1
                        }
                        : room
                )
            );
        });
    };

    // Load messages for selected room
    const loadRoomMessages = async (roomId: number) => {
        try {
            const response = await fetch(`http://localhost:8080/chat/messages/${roomId}`, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch messages");
            }

            const data = await response.json();
            setMessages(data || []);

            // Reset unread count for this room
            setChatRooms((prevRooms) =>
                prevRooms.map((room) =>
                    room.roomId === roomId
                        ? { ...room, unreadCount: 0 }
                        : room
                )
            );

        } catch (error) {
            console.error("Error fetching messages:", error);
            setError("메시지를 불러오는데 실패했습니다.");
        }
    };

    // Select a chat room
    const selectRoom = (roomId: number) => {
        setSelectedRoomId(roomId);
        loadRoomMessages(roomId);
        subscribeToRoom(roomId);
    };

    // Send message as admin
    const sendAdminMessage = () => {
        if (
            !clientRef.current ||
            !clientRef.current.connected ||
            message.trim() === "" ||
            selectedRoomId === null
        ) {
            return;
        }

        const messageObj = {
            roomId: selectedRoomId,
            sender: "ADMIN",
            content: message,
            timestamp: new Date().toISOString().split('.')[0].replace('T', ' '), // Format to match server format
        };

        try {
            clientRef.current.publish({
                destination: `/app/chat/admin/${selectedRoomId}`,
                body: JSON.stringify(messageObj),
            });

            // No need to manually add the message here as it will come back via the subscription
            setMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendAdminMessage();
        }
    };

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Refresh chat rooms periodically
    useEffect(() => {
        const interval = setInterval(() => {
            if (isConnected) {
                fetchChatRooms();
            }
        }, 60000); // every 60 seconds

        return () => clearInterval(interval);
    }, [isConnected]);

    const formatTimestamp = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            return new Intl.DateTimeFormat('default', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            }).format(date);
        } catch (e) {
            return timestamp;
        }
    };

    const getRelativeTime = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffSec = Math.floor(diffMs / 1000);

            if (diffSec < 60) return '방금 전';
            if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
            if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
            return `${Math.floor(diffSec / 86400)}일 전`;
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="flex flex-col h-[80vh] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
            {/* Admin header */}
            {/* <div className="bg-white dark:bg-gray-800 shadow-lg py-4 px-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                        관리자 채팅 시스템
                    </h1>
                </div>
            </div> */}

            {/* Main content area */}
            <div className="flex flex-1 overflow-hidden max-h-[calc(100vh-80px)]">
                {/* Chat rooms sidebar */}
                <div className="w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-lg">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-indigo-600 dark:bg-indigo-700 text-white">
                        <h2 className="text-xl font-bold">고객 상담 목록</h2>
                    </div>

                    {loading && (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-3 text-gray-600 dark:text-gray-300">채팅방 목록을 불러오는 중...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="bg-red-100 dark:bg-red-900 rounded-lg p-4 max-w-xs text-center">
                                <p className="text-red-600 dark:text-red-300">{error}</p>
                                <button
                                    onClick={fetchChatRooms}
                                    className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm transition-all"
                                >
                                    다시 시도
                                </button>
                            </div>
                        </div>
                    )}

                    {!loading && !error && chatRooms.length === 0 && (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">활성화된 채팅방이 없습니다.</p>
                                <p className="mt-2 text-gray-500 dark:text-gray-400">새로고침을 눌러 확인해보세요.</p>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto">
                        {chatRooms.map((room) => (
                            <div
                                key={room.roomId}
                                onClick={() => selectRoom(room.roomId)}
                                className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedRoomId === room.roomId
                                    ? "bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-l-indigo-500"
                                    : ""
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center text-white text-sm mr-3">
                                            {room.roomId > 0 ? "회" : "게"}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-800 dark:text-gray-200">
                                                {room.roomId > 0 ? `회원 ${room.roomId}` : `게스트 ${Math.abs(room.roomId)}`}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate w-48 mt-1">
                                                {room.lastMessage || "대화가 시작되지 않았습니다."}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                            {getRelativeTime(room.lastMessageTime)}
                                        </span>
                                        {/* {room.unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full mt-1">
                                                {room.unreadCount}
                                            </span>
                                        )} */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={fetchChatRooms}
                            className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full font-medium transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            새로고침
                        </button>
                    </div>
                </div>

                {/* Chat view */}
                <div className="w-2/3 flex flex-col bg-gray-50 dark:bg-gray-900">
                    {selectedRoomId ? (
                        <>
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center text-white text-sm mr-3">
                                            {selectedRoomId > 0 ? "회" : "게"}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                                {selectedRoomId > 0
                                                    ? `회원 ${selectedRoomId} 상담`
                                                    : `게스트 ${Math.abs(selectedRoomId)} 상담`}
                                            </h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {isConnected ? "연결됨" : "연결 중..."}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteRoom(selectedRoomId)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-md"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        채팅방 삭제
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900 relative">
                                {/* Background decoration elements */}
                                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-5 pointer-events-none">
                                    <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-blue-300 dark:bg-blue-600 blur-3xl"></div>
                                    <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-indigo-300 dark:bg-indigo-700 blur-3xl"></div>
                                </div>

                                <div className="flex flex-col space-y-4 relative z-10">
                                    {messages.length === 0 && (
                                        <div className="flex items-center justify-center h-40">
                                            <p className="text-gray-500 dark:text-gray-400">대화 내역이 없습니다.</p>
                                        </div>
                                    )}

                                    {messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`max-w-[80%] ${msg.sender === "ADMIN"
                                                ? "self-end ml-auto"
                                                : "self-start"
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                    {msg.sender === "ADMIN"
                                                        ? "상담원"
                                                        : msg.sender === "USER"
                                                            ? "회원"
                                                            : msg.sender === "GUEST"
                                                                ? "게스트"
                                                                : "시스템"}
                                                </span>
                                                <div
                                                    className={`p-3 rounded-lg whitespace-pre-wrap break-words shadow-sm ${msg.sender === "ADMIN"
                                                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-none"
                                                        : msg.sender === "SYSTEM"
                                                            ? "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                                            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none"
                                                        }`}
                                                >
                                                    {msg.content}
                                                </div>
                                                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    {formatTimestamp(msg.timestamp)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
                                <div className="flex items-end bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                                    <textarea
                                        ref={textareaRef}
                                        placeholder="메시지를 입력하세요..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="flex-1 p-2 bg-transparent border-none focus:outline-none resize-none text-gray-800 dark:text-gray-200"
                                        rows={1}
                                        style={{ maxHeight: "120px", minHeight: "24px" }}
                                    />
                                    <button
                                        onClick={sendAdminMessage}
                                        disabled={!isConnected || message.trim() === ""}
                                        className={`p-3 rounded-full ml-2 flex items-center justify-center transition-all ${isConnected && message.trim() !== ""
                                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20"
                                            : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                                            }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900 relative">
                            {/* Background decoration elements */}
                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                                <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-blue-300 dark:bg-blue-600 blur-3xl"></div>
                                <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-indigo-300 dark:bg-indigo-700 blur-3xl"></div>
                            </div>

                            <div className="text-center relative z-10 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl max-w-md">
                                <div className="w-20 h-20 mx-auto bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">채팅방을 선택해주세요</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">왼쪽 목록에서 상담할 채팅방을 선택하세요.</p>
                                <div className="flex justify-center">
                                    <button
                                        onClick={fetchChatRooms}
                                        className="py-2 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full font-medium transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                        </svg>
                                        채팅방 목록 새로고침
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">채팅방 삭제</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            정말로 이 채팅방을 삭제하시겠습니까? 이 작업은 취소할 수 없으며 모든 대화 내역이 영구적으로 삭제됩니다.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelDeleteRoom}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={confirmDeleteRoom}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                삭제 확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminChatDashboard;
