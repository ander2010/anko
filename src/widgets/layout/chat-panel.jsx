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
} from "@material-tailwind/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import projectService from "@/services/projectService";

export function ChatPanel() {
    const [controller, dispatch] = useMaterialTailwindController();
    const { openConfigurator } = controller;

    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [documents, setDocuments] = useState([]);
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    // Load Projects on mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await projectService.getProjects();
                const list = Array.isArray(data) ? data : data?.results || [];
                setProjects(list);
                if (list.length > 0) setSelectedProject(list[0].id);
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
        }
    }, [selectedProject]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const payload = {
                question: input,
                context: selectedDocs.length > 0 ? selectedDocs : ["test"],
                session_id: "chat-panel-session", // Ideally unique per session
            };

            const response = await projectService.askProject(payload);

            let aiText = "Lo siento, no pude obtener una respuesta.";
            if (response.ok) {
                if (response.transport === "ws") {
                    aiText = response.final?.answer || response.final?.text || "Respuesta recibida por WebSocket";
                } else {
                    aiText = response.http?.response_json?.answer || response.http?.response_json?.text || "Respuesta recibida por HTTP";
                }
            } else {
                aiText = "Error: " + (response.ws_error || "Desconocido");
            }

            setMessages((prev) => [...prev, { role: "ai", text: aiText }]);
        } catch (err) {
            setMessages((prev) => [...prev, { role: "ai", text: "Error de conexión." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <aside
            className={`fixed top-0 right-0 z-50 h-screen w-96 bg-white shadow-2xl transition-transform duration-300 flex flex-col ${openConfigurator ? "translate-x-0" : "translate-x-96"
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-blue-gray-50">
                <div className="flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-500" />
                    <Typography variant="h5" color="blue-gray">
                        IA Chat
                    </Typography>
                </div>
                <IconButton
                    variant="text"
                    color="blue-gray"
                    onClick={() => setOpenConfigurator(dispatch, false)}
                >
                    <XMarkIcon strokeWidth={2.5} className="h-5 w-5" />
                </IconButton>
            </div>

            {/* Selectors */}
            <div className="p-4 space-y-4 border-b border-blue-gray-50 bg-blue-gray-50/20">
                <div className="flex flex-col gap-2">
                    <Typography variant="small" color="blue-gray" className="font-bold">
                        Seleccionar Proyecto
                    </Typography>
                    <div className="w-full">
                        <Select
                            label="Proyecto"
                            value={selectedProject}
                            onChange={(val) => setSelectedProject(val)}
                        >
                            {projects.map((p) => (
                                <Option key={p.id} value={p.id}>
                                    {p.title || p.name}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Typography variant="small" color="blue-gray" className="font-bold">
                        Contexto (Documentos)
                    </Typography>
                    <div className="w-full">
                        <Menu dismiss={{ itemPress: false }}>
                            <MenuHandler>
                                <Button
                                    variant="outlined"
                                    color="blue-gray"
                                    className="flex items-center gap-2 w-full justify-between px-3 py-2.5 font-normal normal-case border-blue-gray-200"
                                >
                                    <span className="truncate">
                                        {selectedDocs.length === 0
                                            ? "Seleccionar documentos"
                                            : `${selectedDocs.length} seleccionado(s)`}
                                    </span>
                                    <ChevronDownIcon className="h-4 w-4" />
                                </Button>
                            </MenuHandler>
                            <MenuList className="max-h-72 overflow-y-auto">
                                {documents.length === 0 ? (
                                    <div className="p-2 text-center text-sm text-blue-gray-500">
                                        No hay documentos
                                    </div>
                                ) : (
                                    documents.map((d) => (
                                        <MenuItem key={d.id} className="p-0">
                                            <label
                                                htmlFor={`doc-${d.id}`}
                                                className="flex cursor-pointer items-center gap-2 p-2 w-full"
                                            >
                                                <Checkbox
                                                    id={`doc-${d.id}`}
                                                    ripple={false}
                                                    className="hover:before:opacity-0"
                                                    containerProps={{
                                                        className: "p-0",
                                                    }}
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
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="font-normal truncate"
                                                >
                                                    {d.name || d.title || d.filename || "Sin nombre"}
                                                </Typography>
                                            </label>
                                        </MenuItem>
                                    ))
                                )}
                            </MenuList>
                        </Menu>
                    </div>
                </div>
            </div>

            {/* Chat History */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
            >
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                        <ChatBubbleLeftRightIcon className="h-12 w-12 mb-2" />
                        <Typography variant="small">
                            Selecciona un documento y haz una pregunta.
                        </Typography>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                            }`}
                    >
                        <div
                            className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${msg.role === "user"
                                ? "bg-blue-500 text-white rounded-tr-none"
                                : "bg-white text-blue-gray-900 shadow-sm border border-blue-gray-50 rounded-tl-none"
                                }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-blue-gray-50 rounded-tl-none">
                            <Spinner className="h-4 w-4" />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer / Input */}
            <div className="p-4 bg-white border-t border-blue-gray-50">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="relative flex w-full"
                >
                    <Input
                        type="text"
                        label="Escribe tu pregunta..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        containerProps={{
                            className: "min-w-0",
                        }}
                    />
                    <IconButton
                        size="sm"
                        color={input.trim() ? "blue" : "blue-gray"}
                        variant="text"
                        className="!absolute right-1 top-1 rounded"
                        disabled={!input.trim() || loading}
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
