import "./sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./myContext.jsx";
import { v4 as uuidv4 } from "uuid"; 
import logo from "./assets/ec-logo.png";

function Sidebar() {
    const { allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats } = useContext(MyContext);
    const [error, setError] = useState(""); 

    // Use your live Render URL
    const API_URL = "https://easychat-4uo9.onrender.com/api/thread";

    const getAllThreads = async () => {
        try {
            setError("");
            // Check if your backend uses /threads or just /
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
            setError("Server is waking up... please wait.");
            console.log(err);
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
        setCurrThreadId(newThreadId);
        setPrevChats([]); // Clear UI immediately for better UX
        try {
            const response = await fetch(`${API_URL}/${newThreadId}`);
            if (!response.ok) throw new Error("Failed to fetch the thread.");
            const res = await response.json();
            
            setPrevChats(res.messages || res); 
            setNewChat(false); 
            setReply(null); 
        } catch (err) {
            setError("Error switching thread.");
            console.log(err);
        }
    };

    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(`${API_URL}/${threadId}`, { method: "DELETE" });  
            if (!response.ok) throw new Error("Failed to delete.");
            
            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));
            if (threadId === currThreadId) createNewChat();
        } catch (err) {
            setError("Delete failed.");
        }
    };

    return (
        <section className="sidebar">
            <button className="new-chat-btn" onClick={createNewChat}>
                <img src={logo} alt="logo" className="logo" />
                <span>New Chat <i className="fa-solid fa-pen-to-square"></i></span>
            </button>

            {error && <div className="error-message">{error}</div>}

            <ul className="history">
                {allThreads?.map((thread, idx) => (
                    <li key={thread.threadId || idx}
                        onClick={() => changeThread(thread.threadId)}
                        className={thread.threadId === currThreadId ? "highlighted" : ""}
                    >
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

            <div className="sign">
                <p>By Vivek!</p>
            </div>
        </section>
    );
}

export default Sidebar;
