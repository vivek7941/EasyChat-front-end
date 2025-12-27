import "./sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./myContext.jsx";
import { v4 as uuidv4 } from "uuid"; 
import logo from "./assets/ec-logo.png";

function Sidebar() {
    const { allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats } = useContext(MyContext);
    const [error, setError] = useState(""); 

    const API_URL = "https://easychat-4uo9.onrender.com/api/thread";

    const getAllThreads = async () => {
        try {
            setError("");
            const response = await fetch(API_URL); 
            if (!response.ok) throw new Error("Failed to fetch threads.");
            const res = await response.json();
            
            if (Array.isArray(res)) {
                const filteredData = res.map(thread => ({ 
                    threadId: thread.threadId, 
                    title: thread.title 
                }));
                setAllThreads(filteredData);
            }
        } catch (err) {
            // Keep error empty if you don't want to see the text on screen
            setError(""); 
            console.log("Server waking up...");
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
        if(newThreadId === currThreadId) return; // Don't reload if already on this thread
        
        setCurrThreadId(newThreadId);
        setPrevChats([]); 
        try {
            const response = await fetch(`${API_URL}/${newThreadId}`);
            if (!response.ok) throw new Error("Failed to fetch the thread.");
            const res = await response.json();
            
            setPrevChats(res.messages || res); 
            setNewChat(false); 
            setReply(null); 
        } catch (err) {
            console.log(err);
        }
    };

    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(`${API_URL}/${threadId}`, { method: "DELETE" });  
            if (!response.ok) throw new Error("Failed to delete.");
            
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
