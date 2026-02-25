import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    Typography,
    Tabs,
    TabsHeader,
    TabsBody,
    Tab,
    TabPanel,
    Spinner,
    IconButton
} from "@material-tailwind/react";
import { XMarkIcon, RectangleGroupIcon, BoltIcon, Square3Stack3DIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "@/context/language-context";
import projectService from "@/services/projectService";
import { TopicCard, BatteryCard, DeckCard } from "@/widgets/cards";

export function DocumentRelatedDialog({
    open,
    onClose,
    documentId,
    isOwner,
    onSimulateBattery,
    onStudyDeck,
    onLearnDeck,
    onDeleteBattery,
    onUpdateBatteryVisibility,
    onEditDeck,
    onDeleteDeck,
    onUpdateDeckVisibility,
    onAddCardsToDeck
}) {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState("topics");

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (!open || !documentId) return;
            setLoading(true);
            try {
                const response = await projectService.getDocumentRelatedLearning(documentId);
                if (isMounted) {
                    setData(response);
                }
            } catch (error) {
                console.error("Failed to load related data", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [open, documentId]);

    const handleClose = () => {
        setActiveTab("topics");
        onClose();
    };

    if (!open) return null;

    const tabs = [
        {
            label: language === "es" ? "Temas" : "Topics",
            value: "topics",
            icon: RectangleGroupIcon,
            count: data?.counts?.topics || 0,
            items: data?.topics || []
        },
        {
            label: language === "es" ? "Baterías" : "Batteries",
            value: "batteries",
            icon: BoltIcon,
            count: data?.counts?.batteries || 0,
            items: data?.batteries || []
        },
        {
            label: language === "es" ? "Mazos" : "Decks",
            value: "decks",
            icon: Square3Stack3DIcon,
            count: data?.counts?.decks || 0,
            items: data?.decks || []
        },
    ];

    return (
        <Dialog open={open} handler={handleClose} size="xl" className="bg-white/90 backdrop-blur-xl border border-zinc-200 shadow-2xl overflow-hidden rounded-3xl h-[85vh] flex flex-col">
            <DialogHeader className="flex-col items-start gap-4 p-6 bg-zinc-50 border-b border-zinc-200 shrink-0">
                <div className="flex items-center justify-between w-full">
                    <div>
                        <Typography variant="h4" color="blue-gray" className="font-bold tracking-tight text-zinc-900">
                            {language === "es" ? "Elementos Relacionados" : "Related Items"}
                        </Typography>
                        {data?.document && (
                            <Typography variant="small" className="text-zinc-500 font-medium mt-1 truncate max-w-[80%]">
                                {data.document.filename}
                            </Typography>
                        )}
                    </div>
                    <IconButton variant="text" color="blue-gray" onClick={handleClose} className="rounded-full shrink-0">
                        <XMarkIcon className="h-5 w-5" />
                    </IconButton>
                </div>

                <Tabs value={activeTab} className="w-full">
                    <TabsHeader
                        className="bg-transparent border-b border-zinc-200 rounded-none p-0 w-full justify-start h-auto"
                        indicatorProps={{
                            className: "bg-transparent border-b-2 border-indigo-600 shadow-none rounded-none w-full",
                        }}
                    >
                        {tabs.map(({ label, value, icon: Icon, count }) => (
                            <Tab
                                key={value}
                                value={value}
                                onClick={() => setActiveTab(value)}
                                className={`py-3 px-4 font-bold text-sm tracking-wide transition-colors whitespace-nowrap ${activeTab === value ? "text-indigo-600" : "text-zinc-500 hover:text-zinc-800"
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    {label}
                                    <span className="ml-1.5 flex items-center justify-center px-2 py-0.5 rounded-full bg-zinc-100 text-[10px] font-black text-zinc-600 border border-zinc-200">
                                        {count}
                                    </span>
                                </div>
                            </Tab>
                        ))}
                    </TabsHeader>
                </Tabs>
            </DialogHeader>
            <DialogBody className="p-0 overflow-hidden flex flex-col flex-1 bg-zinc-50/50">
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                        <Spinner className="h-8 w-8 text-indigo-500 mb-4" />
                        <Typography color="blue-gray" className="font-medium">
                            {language === "es" ? "Cargando elementos..." : "Loading items..."}
                        </Typography>
                    </div>
                ) : data ? (
                    <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                        {tabs.map(({ value, items }) => (
                            <div key={value} className={activeTab === value ? "block" : "hidden"}>
                                {items.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                                        <div className="bg-zinc-100 p-4 rounded-full mb-4">
                                            <RectangleGroupIcon className="w-8 h-8 text-zinc-400" />
                                        </div>
                                        <Typography variant="h6" className="text-zinc-600 mb-2">
                                            {language === "es" ? "No se encontraron resultados" : "No results found"}
                                        </Typography>
                                        <Typography variant="small" className="text-zinc-400 max-w-sm">
                                            {language === "es" ? `No hay ${value} relacionados con este documento.` : `There are no related ${value} for this document.`}
                                        </Typography>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {value === "topics" && items.map(topic => (
                                            <TopicCard key={topic.id} topic={topic} />
                                        ))}
                                        {value === "batteries" && items.map(battery => (
                                            <BatteryCard
                                                key={battery.id}
                                                battery={battery}
                                                onSimulate={onSimulateBattery}
                                                onUpdateVisibility={isOwner ? onUpdateBatteryVisibility : null}
                                                onDelete={isOwner ? onDeleteBattery : null}
                                            />
                                        ))}
                                        {value === "decks" && items.map(deck => (
                                            <DeckCard
                                                key={deck.id}
                                                deck={deck}
                                                onEdit={onEditDeck}
                                                onDelete={onDeleteDeck}
                                                onUpdateVisibility={onUpdateDeckVisibility}
                                                onStudy={onStudyDeck}
                                                onLearn={onLearnDeck}
                                                onAddCards={onAddCardsToDeck}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                        <Typography className="text-zinc-400">
                            {language === "es" ? "No se pudo cargar la información." : "Could not load information."}
                        </Typography>
                    </div>
                )}
            </DialogBody>
        </Dialog>
    );
}

DocumentRelatedDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    documentId: PropTypes.number,
    isOwner: PropTypes.bool,
    onSimulateBattery: PropTypes.func,
    onStudyDeck: PropTypes.func,
    onLearnDeck: PropTypes.func,
    onDeleteBattery: PropTypes.func,
    onUpdateBatteryVisibility: PropTypes.func,
    onEditDeck: PropTypes.func,
    onDeleteDeck: PropTypes.func,
    onUpdateDeckVisibility: PropTypes.func,
    onAddCardsToDeck: PropTypes.func,
};

export default DocumentRelatedDialog;
