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

export function Home() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

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
    <div className="mt-6">
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
                  src="/img/anko-hero.png"
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
      <section id="como-funciona" className="mt-14">
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
      <section className="mt-14">
        <div className="mx-auto max-w-6xl px-1">
          <div className="text-center mb-8">
            <Typography variant="h3" color="blue-gray" className="mb-2">
              {t("home.benefits.title")}
            </Typography>
            <Typography className="text-blue-gray-500">
              {t("home.benefits.subtitle")}
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.isArray(benefits) && benefits.map((b) => (
              <Card
                key={b.title}
                className="border border-blue-gray-100 shadow-sm rounded-2xl"
              >
                <CardBody className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-blue-gray-50 p-3">
                      {React.createElement(b.icon, { className: "h-6 w-6 text-blue-gray-700" })}
                    </div>
                    <div>
                      <Typography variant="h5" color="blue-gray" className="mb-1">
                        {b.title}
                      </Typography>
                      <Typography className="text-blue-gray-600">{b.desc}</Typography>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PARA QUIÉN ES ================= */}
      <section className="mt-14">
        <div className="mx-auto max-w-6xl px-1">
          <div className="text-center mb-8">
            <Typography variant="h3" color="blue-gray" className="mb-2">
              {t("home.for_who.title")}
            </Typography>
            <Typography className="text-blue-gray-500">
              {t("home.for_who.subtitle")}
            </Typography>
          </div>

          <Carousel
            className="rounded-2xl overflow-hidden h-[400px] shadow-lg"
            navigation={({ setActiveIndex, activeIndex, length }) => (
              <div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
                {new Array(length).fill("").map((_, i) => (
                  <span
                    key={i}
                    className={`block h-1 cursor-pointer rounded-2xl transition-all content-[''] ${activeIndex === i ? "w-8 bg-white" : "w-4 bg-white/50"
                      }`}
                    onClick={() => setActiveIndex(i)}
                  />
                ))}
              </div>
            )}
            transition={{ duration: 0.5, type: "tween" }}
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
                <div className="absolute inset-0 grid h-full w-full place-items-center bg-black/40">
                  <div className="w-3/4 text-center md:w-2/4">
                    <Typography
                      variant="h2"
                      color="white"
                      className="mb-4 text-3xl md:text-4xl lg:text-5xl"
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="lead"
                      color="white"
                      className="mb-12 opacity-80"
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
      <section className="mt-14">
        <div className="mx-auto max-w-6xl px-1">
          <div className="text-center mb-10">
            <Typography variant="h3" color="blue-gray" className="mb-2">
              {t("home.testimonials.title")}
            </Typography>
            <Typography className="text-blue-gray-500">
              {t("home.testimonials.subtitle")}
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                name: t("home.testimonials.t1.name"),
                role: t("home.testimonials.t1.role"),
                img: "/img/avatar1.png",
                quote: t("home.testimonials.t1.quote"),
              },
              {
                name: t("home.testimonials.t2.name"),
                role: t("home.testimonials.t2.role"),
                img: "/img/avatar2.png",
                quote: t("home.testimonials.t2.quote"),
              },
              {
                name: t("home.testimonials.t3.name"),
                role: t("home.testimonials.t3.role"),
                img: "/img/avatar3.png",
                quote: t("home.testimonials.t3.quote"),
              },
            ].map((t, idx) => (
              <Card key={idx} className="rounded-2xl border border-blue-gray-100 shadow-sm">
                <CardBody className="p-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={t.img}
                      alt={t.name}
                      className="h-12 w-12 rounded-full object-cover border border-blue-gray-100"
                    />
                    <div>
                      <Typography className="font-semibold text-blue-gray-800">{t.name}</Typography>
                      <Typography className="text-sm text-blue-gray-500">{t.role}</Typography>
                    </div>
                  </div>
                  <Typography className="mt-4 text-blue-gray-600 italic">
                    &quot;{t.quote}&quot;
                  </Typography>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="mt-14">
        <div className="mx-auto max-w-6xl px-1">
          <div className="text-center mb-10">
            <Typography variant="h3" color="blue-gray" className="mb-2">
              {t("home.faq.title")}
            </Typography>
            <Typography className="text-blue-gray-500">
              {t("home.faq.subtitle")}
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.isArray(faqs) && faqs.map((f) => (
              <Card key={f.q} className="rounded-2xl border border-blue-gray-100 shadow-sm">
                <CardBody className="p-6">
                  <Typography variant="h5" color="blue-gray" className="mb-2">
                    {f.q}
                  </Typography>
                  <Typography className="text-blue-gray-600">{f.a}</Typography>
                </CardBody>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button
              variant="text"
              color="blue-gray"
              className="flex items-center gap-2 mx-auto"
              onClick={() => navigate("/dashboard/faqs")}
            >
              {language === "es" ? "Ver todas las preguntas frecuentes" : "View all FAQs"}
              <RocketLaunchIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ================= CONTACTO ================= */}
      <section className="mt-14">
        <div className="mx-auto max-w-6xl px-1">
          <Card className="overflow-hidden border border-blue-gray-100 shadow-sm rounded-2xl">
            <CardBody className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Image Side */}
                <div className="relative h-64 md:h-auto bg-blue-gray-50">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
                    alt="Contact support"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-blue-gray-900/10 mix-blend-multiply" />
                </div>

                {/* Form Side */}
                <div className="p-8 lg:p-12 bg-white">
                  <div className="mb-6">
                    <Typography variant="h4" color="blue-gray" className="mb-2">
                      {t("home.contact.title")}
                    </Typography>
                    <Typography className="text-blue-gray-500 mb-4">
                      {t("home.contact.subtitle")}
                    </Typography>
                    <Button
                      variant="outlined"
                      color="blue-gray"
                      onClick={() => navigate("/dashboard/contact-us")}
                      className="mb-4"
                    >
                      {language === "es" ? "Ir a la página de contacto" : "Go to Contact Page"}
                    </Button>
                  </div>

                  <form className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Input label={t("home.contact.form.name")} color="blue-gray" />
                      <Input label={t("home.contact.form.phone")} type="tel" color="blue-gray" />
                    </div>
                    <Input label={t("home.contact.form.email")} type="email" required color="blue-gray" />
                    <Textarea label={t("home.contact.form.desc")} required color="blue-gray" rows={4} />

                    <Button color="blue-gray" fullWidth className="mt-2">
                      {t("home.contact.form.button")}
                    </Button>
                  </form>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* ================= CTA FINAL ================= */}
      <section className="mt-14 mb-10">
        <div className="mx-auto max-w-6xl px-1">
          <Card className="rounded-2xl border border-blue-gray-100 shadow-sm overflow-hidden">
            <CardBody className="p-8 lg:p-12">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <Typography variant="h3" color="blue-gray" className="mb-2">
                    {t("home.cta.title")}
                  </Typography>
                  <Typography className="text-blue-gray-500 max-w-2xl">
                    {t("home.cta.subtitle")}
                  </Typography>
                </div>
                <div className="flex gap-3">
                  <Button color="blue-gray" onClick={() => navigate("/dashboard/projects")}>
                    {t("home.cta.btn_create")}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default Home;
