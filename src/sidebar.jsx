import "./sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./myContext.jsx";
import { v1 as uuidv1 } from "uuid";
import logo from "./assets/ec-logo.png";

function Sidebar() {
    const { allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats } = useContext(MyContext);
    const [error, setError] = useState(""); 

    const API_URL = "https://easychat-4uo9.onrender.com";
 

    const getAllThreads = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error("Failed to fetch threads.");
            const res = await response.json();
            const filteredData = res.map(thread => ({ threadId: thread.threadId, title: thread.title }));
            setAllThreads(filteredData);
        } catch (err) {
            setError("Error fetching threads. Please try again.");
            console.log(err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, []);  // Running once on mount to fetch all threads

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1()); // Creates a new thread ID
        setPrevChats([]); // Clear previous chats
    };

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);
        setPrevChats([]); 

        try {
            const response = await fetch(`${API_URL}/${newThreadId}`);
            if (!response.ok) throw new Error("Failed to fetch the thread.");
            const res = await response.json();
            setPrevChats(res); // Set the previous chats for the selected thread
            setNewChat(false); 
            setReply(null); 
        } catch (err) {
            setError("Error switching thread. Please try again.");
            console.log(err);
        }
    };

    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(`${API_URL}/${threadId}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete thread.");
            const res = await response.json();
            console.log(res);

            // Updated threads re-render
            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

            // Reset to a new chat if the current thread is deleted
            if (threadId === currThreadId) {
                createNewChat();
            }
        } catch (err) {
            setError("Error deleting thread. Please try again.");
            console.log(err);
        }
    };

    return (
        <section className="sidebar">
            <button onClick={createNewChat}>
                <img src={logo} alt="easyChat logo" className="logo" />
                <span><i className="fa-solid fa-pen-to-square"></i></span>
            </button>

            {/* Display error message */}
            {error && <div className="error">{error}</div>}

            <ul className="history">
                {
                    allThreads?.map((thread, idx) => (
                        <li key={idx}
                            onClick={() => changeThread(thread.threadId)}
                            className={thread.threadId === currThreadId ? "highlighted" : ""}
                        >
                            {thread.title}
                            <i className="fa-solid fa-trash"
                                onClick={(e) => {
                                    e.stopPropagation(); // Stop event bubbling to prevent triggering changeThread
                                    deleteThread(thread.threadId);
                                }}
                            ></i>
                        </li>
                    ))
                }
            </ul>

            <div className="sign">
                <p>By Vivek!</p>
            </div>
        </section>
    );
}

export default Sidebar;

