import React from "react";
import {
    Typography,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Button,
    Chip,
} from "@material-tailwind/react";

import { useNavigate, Link } from "react-router-dom";
import {
    TagIcon,
    ClipboardDocumentCheckIcon,
    BoltIcon,
    CheckCircleIcon,
    RocketLaunchIcon,
    AcademicCapIcon,
    QuestionMarkCircleIcon,
    DocumentArrowUpIcon,
    SparklesIcon,
} from "@heroicons/react/24/solid";

import { useLanguage } from "@/context/language-context";
import { LandingNavbar, Footer } from "@/widgets/layout";

export function LandingPage() {
    const { t, language } = useLanguage();
    const navigate = useNavigate();

    const howItWorks = [
        {
            title: t("home.how_it_works.step1.title"),
            desc: t("home.how_it_works.step1.desc"),
            img: "https://cdn.pixabay.com/photo/2015/01/09/11/11/office-594132_1280.jpg",
            icon: DocumentArrowUpIcon,
        },
        {
            title: t("home.how_it_works.step2.title"),
            desc: t("home.how_it_works.step2.desc"),
            img: "https://cdn.pixabay.com/photo/2017/07/20/03/53/homework-2521144_1280.jpg",
            icon: ClipboardDocumentCheckIcon,
        },
        {
            title: t("home.how_it_works.step3.title"),
            desc: t("home.how_it_works.step3.desc"),
            img: "https://cdn.pixabay.com/photo/2015/07/17/22/43/student-849825_1280.jpg",
            icon: SparklesIcon,
        },
    ];

    const benefits = [
        {
            title: t("home.benefits.b1.title"),
            desc: t("home.benefits.b1.desc"),
            icon: QuestionMarkCircleIcon,
        },
        {
            title: t("home.benefits.b2.title"),
            desc: t("home.benefits.b2.desc"),
            icon: AcademicCapIcon,
        },
        {
            title: t("home.benefits.b3.title"),
            desc: t("home.benefits.b3.desc"),
            icon: TagIcon,
        },
        {
            title: t("home.benefits.b4.title"),
            desc: t("home.benefits.b4.desc"),
            icon: BoltIcon,
        },
    ];

    const plans = [
        {
            name: t("home.pricing.plans.free.name"),
            price: t("home.pricing.plans.free.price"),
            color: "blue-gray",
            features: t("home.pricing.plans.free.features"),
            button: t("landing.pricing.cta_free"),
            onClick: () => navigate("/auth/sign-up"),
        },
        {
            name: t("home.pricing.plans.premium.name"),
            price: t("home.pricing.plans.premium.price"),
            color: "amber",
            recommended: true,
            features: t("home.pricing.plans.premium.features"),
            button: t("landing.pricing.cta_pro"),
            onClick: () => navigate("/auth/sign-up"),
        },
        {
            name: t("home.pricing.plans.team.name"),
            price: t("home.pricing.plans.team.price"),
            color: "blue-gray",
            features: t("home.pricing.plans.team.features"),
            button: t("landing.pricing.cta_team"),
            onClick: () => navigate("/dashboard/contact-us"),
        },
    ];

    const faqs = [
        { q: t("home.faq.q1.q"), a: t("home.faq.q1.a") },
        { q: t("home.faq.q2.q"), a: t("home.faq.q2.a") },
        { q: t("home.faq.q3.q"), a: t("home.faq.q3.a") },
        { q: t("home.faq.q4.q"), a: t("home.faq.q4.a") },
        { q: t("home.faq.q5.q"), a: t("home.faq.q5.a") },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-blue-gray-50/50">
            <LandingNavbar />

            <main className="flex-grow container mx-auto px-4 pb-20 pt-10">
                {/* HERO */}
                <section className="relative overflow-hidden rounded-3xl border border-blue-gray-100 bg-white shadow-sm mb-20">
                    <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#60a5fa] to-[#1d4ed8] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                    </div>

                    <div className="relative px-6 py-10 lg:px-10 lg:py-14">
                        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
                            {/* Left: copy */}
                            <div>
                                <div className="mb-4 flex flex-wrap gap-2">
                                    <Chip value={t("home.hero.tags.flashcards")} variant="outlined" color="blue-gray" />
                                    <Chip value={t("home.hero.tags.questions")} variant="outlined" color="blue-gray" />
                                    <Chip value={t("home.hero.tags.progress")} variant="outlined" color="blue-gray" />
                                </div>

                                <Typography variant="h2" color="blue-gray" className="leading-tight text-3xl lg:text-5xl font-black">
                                    {t("home.hero.title_1")}
                                    <br />
                                    <span className="text-blue-gray-700">{t("home.hero.title_2")}</span>
                                </Typography>

                                <Typography variant="lead" className="mt-3 text-blue-gray-500 max-w-xl">
                                    <span className="font-semibold text-blue-gray-700">{t("home.hero.subtitle_prefix")}</span> {t("home.hero.subtitle_mid1")}{" "}
                                    <span className="font-semibold text-blue-gray-700">{t("home.hero.subtitle_flashcards")}</span> {t("home.hero.subtitle_mid2")}{" "}
                                    <span className="font-semibold text-blue-gray-700">{t("home.hero.subtitle_questions")}</span> {t("home.hero.subtitle_suffix")}
                                </Typography>

                                <Typography className="mt-2 text-sm text-blue-gray-400">
                                    {t("home.hero.ideal_for")}
                                </Typography>

                                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                    <Link to="/auth/sign-up">
                                        <Button
                                            size="lg"
                                            color="blue-gray"
                                            className="shadow-md hover:shadow-lg transition-all rounded-xl w-full sm:w-auto"
                                        >
                                            {t("landing.hero.cta_primary")}
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outlined"
                                        size="lg"
                                        color="blue-gray"
                                        className="rounded-xl w-full sm:w-auto"
                                        onClick={() => {
                                            const el = document.getElementById("como-funciona");
                                            el?.scrollIntoView({ behavior: "smooth", block: "start" });
                                        }}
                                    >
                                        {t("home.hero.btn_how_it_works")}
                                    </Button>
                                </div>

                                {/* Ribbon */}
                                <div className="mt-8 inline-flex items-center gap-2 rounded-xl border border-blue-gray-100 bg-blue-gray-50 px-4 py-3">
                                    <BoltIcon className="h-5 w-5 text-blue-gray-700" />
                                    <Typography className="text-sm text-blue-gray-700 font-medium">
                                        {t("home.hero.ribbon")}
                                    </Typography>
                                </div>

                                <div className="mt-8 flex items-center gap-4">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3, 4].map(i => (
                                            <img key={i} src={`/img/avatar${i > 3 ? 1 : i}.png`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="user" />
                                        ))}
                                    </div>
                                    <Typography variant="small" className="text-blue-gray-600 font-medium">
                                        {t("landing.hero.social_proof")}
                                    </Typography>
                                </div>
                            </div>

                            {/* Right: mockup */}
                            <div className="relative">
                                <div className="absolute -inset-6 rounded-3xl bg-blue-gray-50/70 blur-2xl" />
                                <div className="relative rounded-2xl border border-blue-gray-100 bg-white shadow-xl overflow-hidden">
                                    <img
                                        src="/img/anko-hero.png"
                                        alt="Ankard UI"
                                        className="h-[320px] w-full object-cover lg:h-[420px]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                </div>

                                {/* Mini cards flotantes */}
                                <div className="absolute -top-10 -left-8 hidden w-64 rounded-2xl border border-blue-gray-100 bg-white p-4 shadow-xl lg:block transform -translate-x-1/4 hover:-translate-y-1 transition-transform z-10">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg bg-blue-gray-50 p-2">
                                            <QuestionMarkCircleIcon className="h-5 w-5 text-blue-gray-700" />
                                        </div>
                                        <div>
                                            <Typography className="text-sm font-bold text-blue-gray-900">
                                                {t("home.hero.floating_learn.title")}
                                            </Typography>
                                            <Typography className="text-xs text-blue-gray-500 mt-1">
                                                {t("home.hero.floating_learn.desc")}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -bottom-10 -right-8 hidden w-64 rounded-2xl border border-blue-gray-100 bg-white p-4 shadow-xl lg:block transform translate-x-1/4 hover:-translate-y-1 transition-transform z-10">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg bg-blue-gray-50 p-2">
                                            <TagIcon className="h-5 w-5 text-blue-gray-700" />
                                        </div>
                                        <div>
                                            <Typography className="text-sm font-bold text-blue-gray-900">
                                                {t("home.hero.floating_progress.title")}
                                            </Typography>
                                            <Typography className="text-xs text-blue-gray-500 mt-1">
                                                {t("home.hero.floating_progress.desc")}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURES (How it Works) */}
                <section id="como-funciona" className="mb-20 scroll-mt-24">
                    <div className="text-center mb-12">
                        <Typography variant="h2" color="blue-gray" className="mb-4">
                            {t("home.how_it_works.title")}
                        </Typography>
                        <Typography variant="lead" className="text-blue-gray-500 max-w-2xl mx-auto">
                            {t("home.how_it_works.subtitle")}
                        </Typography>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {howItWorks.map((step, idx) => (
                            <Card key={idx} className="border border-blue-gray-50 shadow-sm hover:scale-[1.02] transition-transform duration-300">
                                <CardHeader floated={false} shadow={false} className="m-0 h-48">
                                    <img src={step.img} alt={step.title} className="w-full h-full object-cover" />
                                </CardHeader>
                                <CardBody className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-2 bg-blue-gray-50 rounded-lg">
                                            {React.createElement(step.icon, { className: "h-6 w-6 text-blue-gray-700" })}
                                        </div>
                                        <Typography variant="h5" color="blue-gray">
                                            {step.title}
                                        </Typography>
                                    </div>
                                    <Typography className="text-blue-gray-600">
                                        {step.desc}
                                    </Typography>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* BENEFITS */}
                <section className="bg-blue-gray-900 rounded-3xl p-10 lg:p-16 mb-20 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-blue-gray-700 blur-[100px] opacity-20"></div>
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <Typography variant="h2" color="white" className="mb-6">
                                {t("home.benefits.title")}
                            </Typography>
                            <Typography variant="lead" className="text-white/70 mb-10">
                                {t("home.benefits.subtitle")}
                            </Typography>
                            <Link to="/auth/sign-up">
                                <Button color="white" className="text-blue-gray-900 px-8 py-3 rounded-xl shadow-lg">
                                    {t("landing.benefits.cta")}
                                </Button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {benefits.map((b, idx) => (
                                <div key={idx} className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                                    <div className="p-2 bg-blue-gray-100 rounded-lg w-fit mb-4">
                                        {React.createElement(b.icon, { className: "h-6 w-6 text-blue-gray-700" })}
                                    </div>
                                    <Typography variant="h6" color="white" className="mb-2">
                                        {b.title}
                                    </Typography>
                                    <Typography variant="small" className="text-white/60">
                                        {b.desc}
                                    </Typography>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* PRICING */}
                <section className="mb-20">
                    <div className="text-center mb-12">
                        <Typography variant="h2" color="blue-gray" className="mb-4">
                            {t("home.pricing.title")}
                        </Typography>
                        <Typography variant="lead" className="text-blue-gray-500">
                            {t("home.pricing.subtitle")}
                        </Typography>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan, idx) => (
                            <Card key={idx} className={`border ${plan.recommended ? "border-amber-500 shadow-xl scale-105" : "border-blue-gray-50 shadow-sm"}`}>
                                <CardHeader floated={false} shadow={false} className="p-6 text-center border-b border-blue-gray-50 bg-blue-gray-50/50">
                                    <Typography variant="small" className="uppercase font-bold tracking-widest text-blue-gray-400 mb-2">
                                        {plan.name}
                                    </Typography>
                                    <Typography variant="h3" color="blue-gray" className="font-black">
                                        {plan.price}
                                    </Typography>
                                </CardHeader>
                                <CardBody className="p-6">
                                    <ul className="space-y-4">
                                        {plan.features.map((f, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <CheckCircleIcon className="h-5 w-5 text-blue-gray-400" />
                                                <Typography className="text-blue-gray-600 text-sm">{f}</Typography>
                                            </li>
                                        ))}
                                    </ul>
                                </CardBody>
                                <CardFooter className="p-6 pt-0">
                                    <Button fullWidth color={plan.color} onClick={plan.onClick} className="rounded-xl h-12">
                                        {plan.button}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section className="max-w-4xl mx-auto mb-20 text-center">
                    <Typography variant="h2" color="blue-gray" className="mb-10">
                        {t("home.faq.title")}
                    </Typography>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        {faqs.map((f, idx) => (
                            <Card key={idx} className="border border-blue-gray-50 p-6 shadow-sm">
                                <Typography variant="h6" color="blue-gray" className="mb-2">
                                    {f.q}
                                </Typography>
                                <Typography variant="small" className="text-blue-gray-600">
                                    {f.a}
                                </Typography>
                            </Card>
                        ))}
                    </div>
                    <Link to="/dashboard/faqs">
                        <Button variant="text" color="blue-gray" className="mt-10 px-8 flex items-center gap-2 mx-auto">
                            {t("landing.faq.cta")} <RocketLaunchIcon className="h-4 w-4" />
                        </Button>
                    </Link>
                </section>
            </main>
            <div className="bg-white/50 py-6 border-t border-blue-gray-100">
                <div className="container mx-auto px-4">
                    <Footer />
                </div>
            </div>
        </div >
    );
}

export default LandingPage;
