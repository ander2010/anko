import React, { useState, useEffect, useRef } from "react";
import { XMarkIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import {
    IconButton,
    Typography,
    Select,
    Option,
    Input,
    Spinner,
    Button,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Checkbox,
    Chip,
} from "@material-tailwind/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import { useLanguage } from "@/context/language-context";
import projectService from "@/services/projectService";

export function ChatPanel() {
    const [controller, dispatch] = useMaterialTailwindController();
    const { openConfigurator } = controller;
    const { t, language } = useLanguage();

    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [documents, setDocuments] = useState([]);
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [sessionId, setSessionId] = useState(crypto.randomUUID());
    const [messages, setMessages] = useState([]);
    const [activeHistoryIndex, setActiveHistoryIndex] = useState(null);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const scrollRef = useRef(null);

    const isContextReady = selectedProject && selectedDocs.length > 0;

    const handleNewChat = () => {
        setMessages([]);
        setSessionId(crypto.randomUUID());
        setActiveHistoryIndex(null);
        console.log("[ChatPanel] New session created:", sessionId);
    };

    const handleSwitchSession = async (index) => {
        if (historyLoading) return;
        setHistoryLoading(true);
        setActiveHistoryIndex(index);

        try {
            const data = await projectService.getChatSessionMessages(index);
            if (data && data.messages) {
                // Backend sends messages in DESC order (newest first by ID)
                // We need to reverse to get chronological order (oldest first)
                // Then for each message: question comes first, then answer
                const reversedMessages = [...data.messages].reverse();
                const mappedMessages = [];

                reversedMessages.forEach(m => {
                    // Add user question first
                    if (m.question) {
                        mappedMessages.push({
                            role: "user",
                            text: m.question,
                            timestamp: m.created_at
                        });
                    }
                    // Then add AI answer
                    if (m.answer) {
                        mappedMessages.push({
                            role: "ai",
                            text: m.answer,
                            timestamp: m.created_at
                        });
                    }
                });

                setMessages(mappedMessages);
                setSessionId(data.selected_session_id || String(data.selected_session_pk));
            }
        } catch (err) {
            console.error("Error switching session:", err);
            setMessages([{
                role: "ai",
                text: (language === "es" ? "No se pudo cargar la sesión histórica." : "Failed to load history session.")
            }]);
        } finally {
            setHistoryLoading(false);
        }
    };

    // Load Projects on mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await projectService.getProjects();
                const list = Array.isArray(data) ? data : data?.results || [];
                setProjects(list);
                // Don't auto-select if we want to enforce intentional selection
                // if (list.length > 0) setSelectedProject(list[0].id);
            } catch (err) {
                console.error("Error fetching projects:", err);
            }
        };
        fetchProjects();
    }, []);

    // Load Documents when project changes
    useEffect(() => {
        if (selectedProject) {
            const fetchDocs = async () => {
                try {
                    const data = await projectService.getProjectDocuments(selectedProject);
                    const list = Array.isArray(data) ? data : data?.results || [];
                    setDocuments(list);
                    setSelectedDocs([]); // Reset selection
                } catch (err) {
                    console.error("Error fetching documents:", err);
                }
            };
            fetchDocs();
        } else {
            setDocuments([]);
            setSelectedDocs([]);
        }
    }, [selectedProject]);

    // Debug logging
    useEffect(() => {
        console.log("[ChatPanel] Projects List:", projects);
        console.log("[ChatPanel] Active Selection:", selectedProject);
    }, [projects, selectedProject]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading || !isContextReady) return;

        const userMsg = { role: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const payload = {
                question: input,
                context: selectedDocs,
                session_id: sessionId || "chat-panel-session",
            };

            const response = await projectService.askProject(payload);

            let aiText = t("chat.ai_error");
            if (response.ok) {
                if (response.transport === "ws") {
                    aiText = response.final?.answer || response.final?.text || "Respuesta recibida";
                } else {
                    aiText = response.http?.response_json?.answer || response.http?.response_json?.text || "Respuesta recibida";
                }
            } else {
                aiText = t("chat.ai_error") + ": " + (response.ws_error || "Error");
            }

            setMessages((prev) => [...prev, { role: "ai", text: aiText }]);
        } catch (err) {
            setMessages((prev) => [...prev, { role: "ai", text: t("chat.conn_error") }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <aside
            className={`fixed top-0 right-0 z-50 h-screen w-[400px] bg-white shadow-2xl transition-transform duration-500 ease-in-out flex flex-col border-l border-zinc-100 ${openConfigurator ? "translate-x-0" : "translate-x-full"
                }`}
        >
            {/* Refined Professional Header - White/Gray Theme */}
            <div className="flex flex-col bg-white border-b border-zinc-100 flex-none ring-1 ring-zinc-50">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                            <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <Typography variant="h6" className="font-bold leading-tight text-zinc-900">
                                {t("chat.title")}
                            </Typography>
                            <div className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                <Typography variant="small" className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                                    AI Assistant Online
                                </Typography>
                            </div>
                        </div>
                    </div>
                    <IconButton
                        variant="text"
                        color="blue-gray"
                        size="sm"
                        className="hover:bg-zinc-100 rounded-full"
                        onClick={() => setOpenConfigurator(dispatch, false)}
                    >
                        <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-zinc-500" />
                    </IconButton>
                </div>

                {/* Session Management Toolbar */}
                <div className="px-6 py-2 border-t border-zinc-50 bg-zinc-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleNewChat}
                            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-tight text-indigo-600 hover:text-indigo-800 transition-colors py-1 px-2 rounded-lg hover:bg-indigo-50"
                        >
                            <span className="text-base font-normal">+</span>
                            {language === "es" ? "Nuevo" : "New"}
                        </button>

                        <div className="flex items-center gap-1 border-l border-zinc-200 pl-4">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <button
                                    key={num}
                                    disabled={historyLoading}
                                    onClick={() => handleSwitchSession(num)}
                                    className={`h-6 w-6 rounded-md text-[10px] font-bold transition-all flex items-center justify-center ${activeHistoryIndex === num
                                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                                        : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                                        } ${historyLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {historyLoading && activeHistoryIndex === num ? (
                                        <Spinner className="h-2 w-2 text-white" />
                                    ) : num}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Context Selectors - Refined */}
            <div className="p-5 space-y-4 border-b border-zinc-100 bg-zinc-50/50 flex-none">
                <div className="space-y-1.5">
                    <Typography variant="small" className="font-black text-zinc-900 uppercase tracking-tighter text-[10px] ml-1">
                        {t("chat.select_project")}
                    </Typography>
                    <Menu>
                        <MenuHandler>
                            <Button
                                variant="outlined"
                                className={`flex items-center gap-2 w-full justify-between px-4 h-11 font-medium normal-case rounded-xl transition-all border ${selectedProject ? "border-indigo-200 bg-indigo-50/30 text-indigo-700 shadow-sm shadow-indigo-500/5" : "border-zinc-200 bg-white text-zinc-500"
                                    }`}
                            >
                                <span className="truncate text-xs">
                                    {selectedProject
                                        ? (projects.find(p => String(p.id) === String(selectedProject))?.title || projects.find(p => String(p.id) === String(selectedProject))?.name || "Proyecto Seleccionado")
                                        : (language === "es" ? "Haz clic para seleccionar..." : "Click to select...")}
                                </span>
                                <ChevronDownIcon className="h-4 w-4 opacity-50" />
                            </Button>
                        </MenuHandler>
                        <MenuList className="max-h-72 overflow-y-auto rounded-xl border-zinc-100 shadow-2xl p-2 min-w-[350px] z-[99999]">
                            {projects.length === 0 ? (
                                <div className="p-4 text-center text-xs text-zinc-500 italic">
                                    {language === "es" ? "Cargando proyectos..." : "Loading projects..."}
                                </div>
                            ) : (
                                projects.map((p) => (
                                    <MenuItem
                                        key={String(p.id)}
                                        className={`rounded-lg mb-1 flex items-center justify-between p-3 ${String(selectedProject) === String(p.id) ? "bg-indigo-50 text-indigo-700 font-bold" : "text-zinc-700 hover:bg-zinc-50"}`}
                                        onClick={() => {
                                            const newId = String(p.id);
                                            console.log("[ChatPanel] User clicked project:", newId);
                                            setSelectedProject(newId);
                                        }}
                                    >
                                        <div className="flex flex-col gap-0.5 max-w-[280px]">
                                            <Typography variant="small" className="font-bold truncate">
                                                {p.title || p.name}
                                            </Typography>

                                        </div>
                                        {String(selectedProject) === String(p.id) && (
                                            <div className="h-2 w-2 rounded-full bg-indigo-600 shadow-sm shadow-indigo-200" />
                                        )}
                                    </MenuItem>
                                ))
                            )}
                        </MenuList>
                    </Menu>
                </div>

                <div className="space-y-1.5">
                    <Typography variant="small" className="font-black text-zinc-900 uppercase tracking-tighter text-[10px] ml-1">
                        {t("chat.context_docs")}
                    </Typography>
                    <Menu dismiss={{ itemPress: false }}>
                        <MenuHandler>
                            <Button
                                variant="outlined"
                                disabled={!selectedProject}
                                className={`flex items-center gap-2 w-full justify-between px-4 h-11 font-medium normal-case rounded-xl transition-all border ${selectedDocs.length > 0 ? "border-indigo-200 bg-indigo-50/30 text-indigo-700" : "border-zinc-200 bg-white text-zinc-500"
                                    }`}
                            >
                                <span className="truncate text-xs">
                                    {!selectedProject
                                        ? t("chat.select_project_first")
                                        : (selectedDocs.length === 0
                                            ? t("chat.select_docs")
                                            : t("chat.docs_selected").replace("{count}", selectedDocs.length))}
                                </span>
                                <ChevronDownIcon className="h-4 w-4 opacity-50" />
                            </Button>
                        </MenuHandler>
                        <MenuList className="max-h-72 overflow-y-auto rounded-xl border-zinc-100 shadow-xl p-2 min-w-[350px]">
                            {documents.length === 0 ? (
                                <div className="p-4 text-center text-xs text-zinc-500 italic">
                                    {t("chat.no_docs")}
                                </div>
                            ) : (
                                documents.map((d) => (
                                    <MenuItem key={d.id} className="p-0 hover:bg-zinc-50 rounded-lg">
                                        <label
                                            htmlFor={`doc-${d.id}`}
                                            className="flex cursor-pointer items-center gap-3 p-3 w-full"
                                        >
                                            <Checkbox
                                                id={`doc-${d.id}`}
                                                ripple={false}
                                                color="indigo"
                                                className="h-4 w-4 rounded border-zinc-300"
                                                containerProps={{ className: "p-0" }}
                                                checked={selectedDocs.includes(String(d.id))}
                                                onChange={() => {
                                                    const idStr = String(d.id);
                                                    setSelectedDocs((prev) =>
                                                        prev.includes(idStr)
                                                            ? prev.filter((id) => id !== idStr)
                                                            : [...prev, idStr]
                                                    );
                                                }}
                                            />
                                            <Typography variant="small" className="font-medium text-zinc-700 truncate text-[13px]">
                                                {d.name || d.title || d.filename || t("chat.no_name")}
                                            </Typography>
                                        </label>
                                    </MenuItem>
                                ))
                            )}
                        </MenuList>
                    </Menu>
                </div>

                {/* Selected Documents Chips */}
                {selectedDocs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedDocs.map((docId) => {
                            const doc = documents.find((d) => String(d.id) === docId);
                            if (!doc) return null;
                            return (
                                <Chip
                                    key={docId}
                                    value={doc.name || doc.title || doc.filename || t("chat.no_name")}
                                    size="sm"
                                    variant="ghost"
                                    color="indigo"
                                    onClose={() =>
                                        setSelectedDocs((prev) => prev.filter((id) => id !== docId))
                                    }
                                    className="rounded-lg normal-case font-bold text-[10px] bg-indigo-50 border-indigo-100"
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Chat History - Professional Bubbles */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/30"
            >
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className={`p-4 rounded-3xl mb-4 ${isContextReady ? "bg-indigo-50 text-indigo-400" : "bg-red-50 text-red-400"}`}>
                            <ChatBubbleLeftRightIcon className="h-10 w-10" />
                        </div>
                        <Typography variant="h6" className="text-zinc-900 font-bold mb-2">
                            {isContextReady ? t("chat.help_text") : t("chat.no_docs_title")}
                        </Typography>
                        <Typography variant="small" className="text-zinc-500 max-w-[200px] leading-relaxed">
                            {isContextReady
                                ? (language === "es" ? "Haz una pregunta sobre el contenido seleccionado." : "Ask a question about the selected content.")
                                : t("chat.missing_context")}
                        </Typography>
                    </div>
                )}

                {messages.map((msg, idx) => {
                    // Format timestamp if available
                    let formattedTime = "";
                    if (msg.timestamp) {
                        try {
                            const date = new Date(msg.timestamp);
                            const now = new Date();
                            const isToday = date.toDateString() === now.toDateString();

                            if (isToday) {
                                formattedTime = date.toLocaleTimeString(language === "es" ? "es-ES" : "en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                });
                            } else {
                                formattedTime = date.toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                });
                            }
                        } catch (e) {
                            console.error("Error formatting timestamp:", e);
                        }
                    }

                    return (
                        <div
                            key={idx}
                            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                        >
                            <div
                                className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.role === "user"
                                    ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none"
                                    : "bg-white text-zinc-800 border border-zinc-100 rounded-tl-none"
                                    }`}
                            >
                                {msg.text}
                            </div>
                            <div className="flex items-center gap-2 mt-1 px-1">
                                {formattedTime && (
                                    <Typography className="text-[9px] font-medium text-zinc-400">
                                        {formattedTime}
                                    </Typography>
                                )}
                            </div>
                        </div>
                    );
                })}

                {loading && (
                    <div className="flex justify-start items-start gap-2">
                        <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-zinc-100 rounded-tl-none flex items-center gap-3">
                            <Spinner className="h-3 w-3 text-indigo-500" />
                            <Typography variant="small" className="text-zinc-500 text-[12px] font-medium animate-pulse">
                                {t("chat.loading")}
                            </Typography>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer / Input - Refined with Glassmorphism */}
            <div className="p-5 bg-white border-t border-zinc-100 relative shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] flex-none">
                {!isContextReady && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center transition-all duration-500">
                        <div className="bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-full border border-red-100 animate-bounce">
                            {t("chat.no_docs_title")}
                        </div>
                    </div>
                )}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="relative flex w-full group"
                >
                    <input
                        type="text"
                        placeholder={t("chat.input_placeholder")}
                        disabled={!isContextReady || loading}
                        className={`w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3.5 pl-5 pr-14 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${(!isContextReady || loading) ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-100/50"}`}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <IconButton
                        size="sm"
                        color="indigo"
                        variant="gradient"
                        className={`!absolute right-1.5 top-1.5 rounded-xl h-9 w-9 shadow-lg shadow-indigo-500/20 transition-transform active:scale-95 ${(!input.trim() || loading || !isContextReady) ? "grayscale opacity-50" : "hover:scale-105"}`}
                        disabled={!input.trim() || loading || !isContextReady}
                        onClick={handleSend}
                    >
                        <PaperAirplaneIcon className="h-4 w-4" />
                    </IconButton>
                </form>
            </div>
        </aside>
    );
}

ChatPanel.displayName = "/src/widgets/layout/chat-panel.jsx";

export default ChatPanel;
