import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Typography,
    Input,
    Spinner,
} from "@material-tailwind/react";
import { MagnifyingGlassIcon, Square2StackIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "@/context/language-context";
import projectService from "@/services/projectService";
import { DeckCard } from "@/widgets/cards/index";
import { FlashcardViewDialog } from "@/widgets/dialogs/index";

export function MyDecks() {
    const { t, language } = useLanguage();
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [flashcardViewDialogOpen, setFlashcardViewDialogOpen] = useState(false);

    useEffect(() => {
        fetchDecks();
    }, []);

    const fetchDecks = async () => {
        try {
            setLoading(true);
            const data = await projectService.getUserDecks();
            const rawDecks = Array.isArray(data) ? data : data?.results || [];

            // Backend already provides flashcards_count, no need to loop
            setDecks(rawDecks);
        } catch (err) {
            console.error("Error fetching user decks:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStudyDeck = (deck) => {
        setSelectedDeck(deck);
        setFlashcardViewDialogOpen(true);
    };

    const filteredDecks = decks.filter((deck) =>
        deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (deck.description && deck.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="mt-8 mb-8 flex flex-col gap-8 max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <Typography variant="h3" className="font-black text-zinc-900 tracking-tight mb-2">
                        {t("project_detail.decks.my_decks")}
                    </Typography>
                    <Typography className="font-medium text-zinc-500 max-w-2xl">
                        {language === "es" ? "Todos tus mazos de estudio en un solo lugar. Crea, estudia y mejora tu aprendizaje." : "All your study decks in one place. Create, study, and improve your learning."}
                    </Typography>
                </div>
                <div className="w-full md:w-80">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <input
                            type="text"
                            placeholder={t("project_detail.decks.search_placeholder") || "Search decks..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium text-zinc-900 placeholder:text-zinc-400"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Spinner className="h-8 w-8 text-indigo-500" />
                </div>
            ) : filteredDecks.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {filteredDecks.map((deck) => (
                        <DeckCard
                            key={deck.id}
                            deck={deck}
                            onEdit={() => { }} // Disabled for now
                            onDelete={() => { }} // Disabled for now
                            onStudy={() => handleStudyDeck(deck)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-zinc-200 text-center">
                    <div className="h-16 w-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-zinc-50/50">
                        <Square2StackIcon className="h-8 w-8 text-zinc-400" />
                    </div>
                    <Typography variant="h6" className="text-zinc-900 font-bold mb-1">
                        {searchTerm ? (language === "es" ? "No se encontraron mazos" : "No decks found") : t("project_detail.decks.empty.title") || "No decks yet"}
                    </Typography>
                    <Typography className="text-zinc-500 max-w-sm mb-6">
                        {searchTerm
                            ? (language === "es" ? "Intenta ajustar tus términos de búsqueda." : "Try adjusting your search terms.")
                            : (language === "es" ? "Comienza creando tu primer mazo o genera uno desde tus documentos." : "Start by creating your first deck or generate one from your documents.")
                        }
                    </Typography>
                </div>
            )}

            <FlashcardViewDialog
                open={flashcardViewDialogOpen}
                onClose={() => {
                    setFlashcardViewDialogOpen(false);
                    setSelectedDeck(null);
                }}
                deckId={selectedDeck?.id}
                deckTitle={selectedDeck?.title}
            />
        </div>
    );
}

export default MyDecks;
