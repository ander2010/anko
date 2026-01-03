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
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardBody>
                    <div className="mb-6 flex flex-col justify-between gap-8 md:flex-row md:items-center">
                        <div>
                            <Typography variant="h6" color="blue-gray">
                                {t("project_detail.decks.my_decks")}
                            </Typography>
                            <Typography variant="small" className="font-normal text-blue-gray-600">
                                {language === "es" ? "Todos tus mazos de estudio en un solo lugar" : "All your study decks in one place"}
                            </Typography>
                        </div>
                        <div className="w-full shrink-0 md:w-72">
                            <Input
                                label={t("project_detail.decks.search_placeholder")}
                                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Spinner className="h-8 w-8" />
                        </div>
                    ) : filteredDecks.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredDecks.map((deck) => (
                                <DeckCard
                                    key={deck.id}
                                    deck={deck}
                                    onEdit={() => { }} // Disabled for now or redirect to project
                                    onDelete={() => { }} // Disabled for now or redirect to project
                                    onStudy={() => handleStudyDeck(deck)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-blue-gray-400">
                            <Square2StackIcon className="h-16 w-16 mb-4" />
                            <Typography variant="h6">
                                {searchTerm ? (language === "es" ? "No se encontraron mazos para tu búsqueda" : "No decks found for your search") : t("project_detail.decks.empty.title")}
                            </Typography>
                        </div>
                    )}
                </CardBody>
            </Card>

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
