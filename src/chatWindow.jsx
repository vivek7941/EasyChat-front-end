import "./chatWindow.css";
import Chat from "./chat.jsx";
import { MyContext } from "./myContext.jsx";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";

function ChatWindow() {
    const {
        prompt,
        setPrompt,
        reply,
        setReply,
        currThreadId,
        setPrevChats,
        setNewChat
    } = useContext(MyContext);

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const getReply = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setNewChat(false);

        try {
                const response = await fetch("https://easychat-4uo9.onrender.com/api/thread", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                message: prompt,
                threadId: currThreadId
                })
            });

            const res = await response.json();
            setReply(res.reply);
        } catch (err) {
            console.error(err);
        }

        setLoading(false);
    };

    useEffect(() => {
        if (prompt && reply) {
            setPrevChats(prev => [
                ...prev,
                { role: "user", content: prompt },
                { role: "assistant", content: reply }
            ]);
        }
        setPrompt("");
    }, [reply]);

    const handleProfileClick = () => {
        setIsOpen(prev => !prev);
    };

    return (
        <div className="chatWindow">
            <div className="navbar">
                <span>EasyChat !</span>

                <div className="userIconDiv" onClick={handleProfileClick}>
                    <span className="userIcon">
                        <i className="fa-solid fa-user"></i>
                    </span>

                    {isOpen && (
                        <div className="dropDown">
                            <div className="dropDownItem">
                                <i className="fa-solid fa-gear"></i> Settings
                            </div>
                            <div className="dropDownItem">
                                <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan
                            </div>
                            <div className="dropDownItem">
                                <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Chat />

            <ScaleLoader color="#fff" loading={loading} />

            <div className="chatInput">
                <div className="inputBox">
                    <input
                        placeholder="Ask anything"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && getReply()}
                    />
                    <div id="submit" onClick={getReply}>
                        <i className="fa-solid fa-paper-plane"></i>
                    </div>
                </div>

                <p className="info">
                    EasyChat is a private AI interface powered by the Gemini API.
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;
