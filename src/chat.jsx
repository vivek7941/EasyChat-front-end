import "./chat.css";
import React, { useContext, useState, useEffect } from "react";
import { MyContext } from "./myContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
    const { newChat, prevChats, reply } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);

    useEffect(() => {
        
        if (!reply) {
            setLatestReply(null);
            return;
        }

        
        const lastChat = prevChats[prevChats.length - 1];
        if (lastChat?.role !== "assistant") return;

        const words = reply.split(" ");
        let idx = 0;

        const interval = setInterval(() => {
            setLatestReply(words.slice(0, idx + 1).join(" "));
            idx++;
            if (idx >= words.length) clearInterval(interval);
        }, 40);

        return () => clearInterval(interval);
    }, [reply, prevChats]); // Removed unnecessary dependencies

    return (
        <div className="chats">
            {newChat && <h1 className="welcome-text">Ready when you are</h1>}
            
            {prevChats?.map((chat, idx) => {
                const isLast = idx === prevChats.length - 1;
                const isAssistant = chat.role === "assistant";

                return (
                    <div className={chat.role === "user" ? "userDiv" : "gptDiv"} key={idx}>
                        {chat.role === "user" ? (
                            <p className="userMessage">{chat.content}</p>
                        ) : (
                            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                { 
                                  (isLast && isAssistant && latestReply !== null) 
                                  ? latestReply 
                                  : chat.content
                                }
                            </ReactMarkdown>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default Chat;
