import React from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Input,
  Textarea,
  Carousel,
} from "@material-tailwind/react";

import { useNavigate } from "react-router-dom";
import {
  TagIcon,
  ClipboardDocumentCheckIcon,
  BoltIcon,
  StarIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  QuestionMarkCircleIcon,
  DocumentArrowUpIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

import { useLanguage } from "@/context/language-context";
import supportService from "@/services/supportService";

export function Home() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await supportService.sendSupportRequest({
        ...formData,
        source: "dashboard_home",
      });
      setStatus({
        type: "success",
        message: t("contact_page.success_message"),
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setStatus({
        type: "error",
        message: t("contact_page.error_message"),
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cómo funciona (3 pasos, con foco en preguntas/flashcards)
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

  // ✅ Beneficios
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

  // ✅ Para quién es
  const forWho = [
    {
      title: t("home.for_who.w1.title"),
      desc: t("home.for_who.w1.desc"),
      img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    },
    {
      title: t("home.for_who.w2.title"),
      desc: t("home.for_who.w2.desc"),
      img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    },
    {
      title: t("home.for_who.w3.title"),
      desc: t("home.for_who.w3.desc"),
      img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    },
    {
      title: t("home.for_who.w4.title"),
      desc: t("home.for_who.w4.desc"),
      img: "https://images.unsplash.com/photo-1544531585-9847b68c8c86?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    },
  ];

  // ✅ Pricing

  // ✅ FAQ
  const faqs = [
    {
      q: t("home.faq.q1.q"),
      a: t("home.faq.q1.a"),
    },
    {
      q: t("home.faq.q2.q"),
      a: t("home.faq.q2.a"),
    },
    {
      q: t("home.faq.q3.q"),
      a: t("home.faq.q3.a"),
    },
    {
      q: t("home.faq.q4.q"),
      a: t("home.faq.q4.a"),
    },
    {
      q: t("home.faq.q5.q"),
      a: t("home.faq.q5.a"),
    },
  ];

  return (
    <div className="mt-6 space-y-24">
      {/* ================= HERO (premium) ================= */}
      <section className="relative overflow-hidden rounded-2xl border border-blue-gray-100 bg-white">
        {/* Fondo suave tipo SaaS */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full blur-3xl opacity-40 bg-blue-gray-100" />
          <div className="absolute -bottom-48 -left-48 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-40 bg-blue-100" />
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

              <Typography variant="h2" color="blue-gray" className="leading-tight">
                {t("home.hero.title_1")}
                <br />
                {t("home.hero.title_2")}
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
                <Button
                  color="blue-gray"
                  className="shadow-sm"
                  onClick={() => navigate("/dashboard/projects")}
                >
                  {t("home.hero.btn_create")}
                </Button>
                <Button
                  variant="outlined"
                  color="blue-gray"
                  onClick={() => {
                    const el = document.getElementById("como-funciona");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  {t("home.hero.btn_how_it_works")}
                </Button>
              </div>

              {/* Ribbon */}
              <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-blue-gray-100 bg-blue-gray-50 px-4 py-3">
                <BoltIcon className="h-5 w-5 text-blue-gray-700" />
                <Typography className="text-sm text-blue-gray-700">
                  {t("home.hero.ribbon")}
                </Typography>
              </div>
            </div>

            {/* Right: mockup */}
            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl bg-blue-gray-50/70 blur-2xl" />
              <div className="relative rounded-2xl border border-blue-gray-100 bg-white shadow-xl">
                {/* Usa tu mockup aquí */}
                <img
                  src="/img/anko-hero.jpg"
                  alt="Anko Studio UI"
                  className="h-[320px] w-full rounded-2xl object-cover lg:h-[380px]"
                />
              </div>

              {/* Mini cards flotantes (detalle premium) */}
              <div className="absolute -bottom-6 -left-4 hidden w-56 rounded-2xl border border-blue-gray-100 bg-white p-4 shadow-lg lg:block">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-gray-50 p-2">
                    <QuestionMarkCircleIcon className="h-5 w-5 text-blue-gray-700" />
                  </div>
                  <div>
                    <Typography className="text-sm font-semibold text-blue-gray-800">
                      {t("home.hero.floating_learn.title")}
                    </Typography>
                    <Typography className="text-xs text-blue-gray-500">
                      {t("home.hero.floating_learn.desc")}
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-4 hidden w-56 rounded-2xl border border-blue-gray-100 bg-white p-4 shadow-lg lg:block">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-gray-50 p-2">
                    <TagIcon className="h-5 w-5 text-blue-gray-700" />
                  </div>
                  <div>
                    <Typography className="text-sm font-semibold text-blue-gray-800">
                      {t("home.hero.floating_progress.title")}
                    </Typography>
                    <Typography className="text-xs text-blue-gray-500">
                      {t("home.hero.floating_progress.desc")}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-10 border-t border-blue-gray-100" />
        </div>
      </section>

      {/* ================= CÓMO FUNCIONA ================= */}
      <section id="como-funciona">
        <div className="mx-auto max-w-6xl px-1">
          <div className="text-center mb-8">
            <Typography variant="h3" color="blue-gray" className="mb-2">
              {t("home.how_it_works.title")}
            </Typography>
            <Typography className="text-blue-gray-500">
              {t("home.how_it_works.subtitle")}
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {howItWorks.map((item) => (
              <Card
                key={item.title}
                className="group border border-blue-gray-100 shadow-sm hover:shadow-lg transition-shadow rounded-2xl overflow-hidden"
              >
                <CardHeader floated={false} shadow={false} className="m-0 h-44">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </CardHeader>
                <CardBody className="p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-xl bg-blue-gray-50 p-2">
                      {React.createElement(item.icon, { className: "h-5 w-5 text-blue-gray-700" })}
                    </div>
                    <Typography variant="h5" color="blue-gray">
                      {item.title}
                    </Typography>
                  </div>
                  <Typography className="text-blue-gray-600">{item.desc}</Typography>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BENEFICIOS ================= */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <Typography variant="h2" className="text-3xl lg:text-5xl font-bold tracking-tight text-zinc-900">
              {t("home.benefits.title")}
            </Typography>
            <Typography className="text-zinc-500 font-medium text-lg max-w-2xl mx-auto">
              {t("home.benefits.subtitle")}
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.isArray(benefits) && benefits.map((b) => (
              <div key={b.title} className="p-8 rounded-[2rem] bg-zinc-50 border border-zinc-100 hover:bg-white hover:shadow-premium transition-all duration-300 group">
                <div className="mb-6 h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-zinc-900 group-hover:scale-110 transition-transform">
                  {React.createElement(b.icon, { className: "h-7 w-7" })}
                </div>
                <Typography variant="h5" className="font-bold text-zinc-900 mb-2 tracking-tight">
                  {b.title}
                </Typography>
                <Typography className="text-zinc-500 font-medium leading-relaxed text-sm">
                  {b.desc}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PARA QUIÉN ES ================= */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto">
          <Carousel
            className="rounded-[3rem] overflow-hidden h-[500px] shadow-2xl border border-zinc-200"
            navigation={({ setActiveIndex, activeIndex, length }) => (
              <div className="absolute bottom-8 left-2/4 z-50 flex -translate-x-2/4 gap-3">
                {new Array(length).fill("").map((_, i) => (
                  <span
                    key={i}
                    className={`block h-1.5 cursor-pointer rounded-full transition-all content-[''] ${activeIndex === i ? "w-10 bg-white" : "w-4 bg-white/40"
                      }`}
                    onClick={() => setActiveIndex(i)}
                  />
                ))}
              </div>
            )}
            transition={{ duration: 0.7, type: "tween" }}
            autoplay={true}
            loop={true}
          >
            {Array.isArray(forWho) && forWho.map((item, idx) => (
              <div key={idx} className="relative h-full w-full">
                <img
                  src={item.img}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-900/40 to-transparent flex flex-col justify-end p-12 lg:p-20">
                  <div className="max-w-2xl space-y-4">
                    <Typography
                      variant="h2"
                      className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight"
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="lead"
                      className="text-white/80 font-medium text-lg lg:text-xl"
                    >
                      {item.desc}
                    </Typography>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* ================= TESTIMONIOS ================= */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <Typography variant="h2" className="text-3xl lg:text-5xl font-bold tracking-tight text-zinc-900">
              {t("home.testimonials.title")}
            </Typography>
            <Typography className="text-zinc-500 font-medium text-lg max-w-2xl mx-auto">
              {t("home.testimonials.subtitle")}
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                name: t("home.testimonials.t1.name"),
                role: t("home.testimonials.t1.role"),
                img: "https://i.pravatar.cc/150?u=a",
                quote: t("home.testimonials.t1.quote"),
              },
              {
                name: t("home.testimonials.t2.name"),
                role: t("home.testimonials.t2.role"),
                img: "https://i.pravatar.cc/150?u=b",
                quote: t("home.testimonials.t2.quote"),
              },
              {
                name: t("home.testimonials.t3.name"),
                role: t("home.testimonials.t3.role"),
                img: "https://i.pravatar.cc/150?u=c",
                quote: t("home.testimonials.t3.quote"),
              },
            ].map((t, idx) => (
              <div key={idx} className="p-8 rounded-[2.5rem] bg-white border border-zinc-200/60 shadow-premium flex flex-col">
                <div className="flex-1">
                  <div className="flex gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map(star => (
                      <StarIcon key={star} className="h-4 w-4 text-amber-400" />
                    ))}
                  </div>
                  <Typography className="text-zinc-700 font-medium text-lg leading-relaxed italic mb-8">
                    &quot;{t.quote}&quot;
                  </Typography>
                </div>
                <div className="flex items-center gap-4 pt-6 border-t border-zinc-100">
                  <img
                    src={t.img}
                    alt={t.name}
                    className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <div>
                    <Typography className="font-bold text-zinc-900 tracking-tight">{t.name}</Typography>
                    <Typography className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{t.role}</Typography>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <Typography variant="h2" className="text-3xl lg:text-5xl font-bold tracking-tight text-zinc-900">
              {t("home.faq.title")}
            </Typography>
            <Typography className="text-zinc-500 font-medium text-lg">
              {t("home.faq.subtitle")}
            </Typography>
          </div>

          <div className="space-y-4">
            {Array.isArray(faqs) && faqs.map((f) => (
              <div key={f.q} className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 hover:bg-white hover:border-zinc-200 transition-all group">
                <Typography variant="h5" className="font-bold text-zinc-900 mb-3 tracking-tight flex items-center gap-3">
                  <QuestionMarkCircleIcon className="h-5 w-5 text-indigo-500" />
                  {f.q}
                </Typography>
                <Typography className="text-zinc-500 font-medium pl-8 leading-relaxed">
                  {f.a}
                </Typography>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              variant="outline"
              color="zinc"
              className="rounded-xl border-zinc-200 hover:bg-zinc-50 normal-case text-sm font-bold shadow-sm transition-all"
              onClick={() => navigate("/dashboard/faqs")}
            >
              {language === "es" ? "Ver todas las preguntas" : "View all FAQs"}
              <RocketLaunchIcon className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ================= CONTACTO ================= */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto">
          <Card className="overflow-hidden border border-zinc-200/60 shadow-2xl rounded-[3rem]">
            <CardBody className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Image Side */}
                <div className="relative h-64 md:h-auto bg-zinc-900">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80"
                    alt="Contact support"
                    className="absolute inset-0 h-full w-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/40 to-black/80 flex flex-col justify-end p-12">
                    <Typography variant="h3" className="text-white font-extrabold text-3xl mb-4">
                      {language === "es" ? "¿Necesitas ayuda?" : "Need help?"}
                    </Typography>
                    <Typography className="text-white/70 font-medium text-lg leading-snug">
                      {language === "es"
                        ? "Nuestro equipo está listo para ayudarte a maximizar tu productividad."
                        : "Our team is ready to help you maximize your productivity."}
                    </Typography>
                  </div>
                </div>

                {/* Form Side */}
                <div className="p-8 lg:p-16 bg-white">
                  <div className="mb-10">
                    <Typography variant="h3" className="font-bold text-zinc-900 mb-3 tracking-tight">
                      {t("home.contact.title")}
                    </Typography>
                    <Typography className="text-zinc-500 font-medium mb-6">
                      {t("home.contact.subtitle")}
                    </Typography>
                  </div>

                  {status.message && (
                    <div className={`p-4 mb-8 rounded-xl font-bold text-sm ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                      {status.message}
                    </div>
                  )}

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <Input
                        label={t("home.contact.form.name")}
                        className="!border-zinc-200 focus:!border-indigo-600 !bg-zinc-50/50 rounded-xl"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        labelProps={{ className: "hidden" }}
                        placeholder={t("home.contact.form.name")}
                      />
                      <Input
                        label={t("home.contact.form.phone")}
                        type="tel"
                        className="!border-zinc-200 focus:!border-indigo-600 !bg-zinc-50/50 rounded-xl"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        labelProps={{ className: "hidden" }}
                        placeholder={t("home.contact.form.phone")}
                      />
                    </div>
                    <Input
                      label={t("home.contact.form.email")}
                      type="email"
                      required
                      className="!border-zinc-200 focus:!border-indigo-600 !bg-zinc-50/50 rounded-xl"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      labelProps={{ className: "hidden" }}
                      placeholder={t("home.contact.form.email")}
                    />
                    <Textarea
                      label={t("home.contact.form.desc")}
                      required
                      className="!border-zinc-200 focus:!border-indigo-600 !bg-zinc-50/50 rounded-xl"
                      rows={4}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      labelProps={{ className: "hidden" }}
                      placeholder={t("home.contact.form.desc")}
                    />

                    <Button
                      className="py-4 bg-zinc-900 hover:bg-black rounded-xl shadow-xl shadow-zinc-200 flex items-center justify-center gap-3 normal-case text-sm font-bold transition-all hover:-translate-y-1"
                      fullWidth
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (language === "es" ? "Enviando..." : "Sending...") : t("home.contact.form.button")}
                      {!loading && <BoltIcon className="h-4 w-4 text-indigo-400" />}
                    </Button>
                  </form>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* ================= CTA FINAL ================= */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[3rem] bg-indigo-600 p-12 lg:p-20 overflow-hidden shadow-2xl shadow-indigo-200">
            {/* Decorative circles */}
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center lg:justify-between gap-12 text-center lg:text-left">
              <div className="space-y-6 max-w-2xl">
                <Typography variant="h2" className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight">
                  {t("home.cta.title")}
                </Typography>
                <Typography variant="lead" className="text-indigo-100 font-medium text-lg lg:text-xl">
                  {t("home.cta.subtitle")}
                </Typography>
              </div>
              <Button
                size="lg"
                className="rounded-2xl bg-white text-indigo-600 hover:bg-zinc-50 px-12 py-5 normal-case text-lg font-bold shadow-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                onClick={() => navigate("/dashboard/projects")}
              >
                {t("home.cta.btn_create")}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
