import "./sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./myContext.jsx";
import { v4 as uuidv4 } from "uuid"; 
import logo from "./assets/ec-logo.png";

function Sidebar() {
    const { allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats } = useContext(MyContext);

    // Live Render URL
    const API_URL = "https://easychat-4uo9.onrender.com/api/thread";

    const getAllThreads = async () => {
        try {
            const response = await fetch(API_URL); 
            // If the fetch fails, we simply do nothing so no error message appears
            if (!response.ok) return; 

            const res = await response.json();
            
            if (Array.isArray(res)) {
                const filteredData = res.map(thread => ({ 
                    threadId: thread.threadId, 
                    title: thread.title 
                }));
                setAllThreads(filteredData);
            }
        } catch (err) {
            // Error is logged only to console, keeping the UI clean
            console.log("Connecting to server..."); 
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId]);  

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv4()); 
        setPrevChats([]);
    };

    const changeThread = async (newThreadId) => {
        if(newThreadId === currThreadId) return;
        
        setCurrThreadId(newThreadId);
        setPrevChats([]); 
        try {
            const response = await fetch(`${API_URL}/${newThreadId}`);
            if (!response.ok) return;
            const res = await response.json();
            
            setPrevChats(res.messages || res); 
            setNewChat(false); 
            setReply(null); 
        } catch (err) {
            console.log("Error loading thread:", err);
        }
    };

    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(`${API_URL}/${threadId}`, { method: "DELETE" });  
            if (!response.ok) return;
            
            // Remove from UI immediately after deletion
            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));
            
            if (threadId === currThreadId) {
                createNewChat();
            }
        } catch (err) {
            console.log("Delete failed");
        }
    };

    return (
        <section className="sidebar">
            <div className="sidebar-top">
                <button className="new-chat-btn" onClick={createNewChat}>
                    <div className="btn-left">
                        <img src={logo} alt="logo" className="logo" />
                        <span className="new-chat-text">New Chat</span>
                    </div>
                    <i className="fa-solid fa-pen-to-square"></i>
                </button>

                {/* Removed the error div entirely from here */}

                <ul className="history">
                    {allThreads?.map((thread) => (
                        <li key={thread.threadId}
                            onClick={() => changeThread(thread.threadId)}
                            className={thread.threadId === currThreadId ? "highlighted" : ""}
                        >
                            <i className="fa-regular fa-message message-icon"></i>
                            <span className="title-text">{thread.title}</span>
                            <i className="fa-solid fa-trash"
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    deleteThread(thread.threadId);
                                }}
                            ></i>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="sign">
                <p>By Vivek!</p>
            </div>
        </section>
    );
}

export default Sidebar;
