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

import { useNavigate } from "react-router-dom";
import {
  TagIcon,
  ClipboardDocumentCheckIcon,
  BoltIcon,
  CheckCircleIcon,
  StarIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  QuestionMarkCircleIcon,
  DocumentArrowUpIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

export function Home() {
  const navigate = useNavigate();

  // ✅ Cómo funciona (3 pasos, con foco en preguntas/flashcards)
  const howItWorks = [
    {
      title: "1. Crea un proyecto y sube tus documentos",
      desc: "Organiza tu contenido por proyectos y temas. Empieza con tus PDFs o apuntes y construye tu base de estudio.",
      img: "https://cdn.pixabay.com/photo/2015/01/09/11/11/office-594132_1280.jpg",
      icon: DocumentArrowUpIcon,
    },
    {
      title: "2. Define reglas de preguntas",
      desc: "Elige tipos de preguntas (selección múltiple, V/F), cantidad por tema y lógica de puntuación para practicar con intención.",
      img: "https://cdn.pixabay.com/photo/2017/07/20/03/53/homework-2521144_1280.jpg",
      icon: ClipboardDocumentCheckIcon,
    },
    {
      title: "3. Practica con flashcards y mejora",
      desc: "Genera sets de preguntas tipo flashcard, simula exámenes y revisa resultados para enfocarte donde realmente fallas.",
      img: "https://cdn.pixabay.com/photo/2015/07/17/22/43/student-849825_1280.jpg",
      icon: SparklesIcon,
    },
  ];

  // ✅ Beneficios
  const benefits = [
    {
      title: "Aprendizaje activo (preguntas)",
      desc: "Leer no garantiza entender. Con preguntas descubres lo que de verdad dominas.",
      icon: QuestionMarkCircleIcon,
    },
    {
      title: "Flashcards que aceleran tu memoria",
      desc: "Convierte contenido en práctica rápida y repetible para retener mejor.",
      icon: AcademicCapIcon,
    },
    {
      title: "Enfoque por temas y progreso real",
      desc: "Mide avances por tema y estudia donde más lo necesitas, sin perder tiempo.",
      icon: TagIcon,
    },
    {
      title: "Simulación para exámenes",
      desc: "Practica como en el examen real: ritmo, puntuación y resultados claros.",
      icon: BoltIcon,
    },
  ];

  // ✅ Para quién es
  const forWho = [
    { title: "Estudiantes", desc: "Parciales, finales, boards y materias difíciles." },
    { title: "Autodidactas", desc: "Aprende por proyectos y convierte teoría en práctica." },
    { title: "Certificaciones", desc: "Practica por tópicos y mide progreso de verdad." },
    { title: "Educadores", desc: "Crea material de práctica y bancos de preguntas (opcional)." },
  ];

  // ✅ Pricing
  const plans = [
    {
      name: "Gratis",
      price: "$0",
      color: "blue-gray",
      features: [
        "1–2 proyectos de estudio",
        "Preguntas básicas (Selección múltiple, V/F)",
        "Límite diario de práctica",
        "Resultados simples (% correcto)",
        "Progreso básico",
      ],
      button: "Empezar gratis",
      onClick: () => navigate("/dashboard/projects"),
    },
    {
      name: "Premium",
      price: "$15 / mes",
      color: "amber",
      recommended: true,
      features: [
        "Todo lo de Gratis +",
        "Proyectos ilimitados",
        "Práctica sin límites",
        "Repetición inteligente (refuerza lo que fallas)",
        "Favoritos + temporizador",
        "Sin anuncios",
      ],
      button: "Pasar a Premium",
      onClick: () => navigate("/dashboard/billing"),
    },
    {
      name: "Pro Team",
      price: "$25 / mes",
      color: "blue",
      features: [
        "Todo lo de Premium +",
        "Compartir sets y proyectos (público/privado)",
        "Importación avanzada (PDF, Word)",
        "Analítica avanzada",
        "Exportar resultados (PDF/Excel)",
      ],
      button: "Elegir Pro",
      onClick: () => navigate("/dashboard/billing"),
    },
  ];

  // ✅ FAQ
  const faqs = [
    {
      q: "¿Qué es Anko Studio?",
      a: "Es una plataforma de estudio que convierte contenido en preguntas y flashcards para practicar y medir tu progreso.",
    },
    {
      q: "¿Anko Studio sirve para certificaciones?",
      a: "Sí. Puedes estudiar por temas, practicar con sets de preguntas y ver tu avance para enfocarte donde te falta.",
    },
    {
      q: "¿Qué tipos de preguntas soporta?",
      a: "Puedes empezar con selección múltiple y verdadero/falso. Luego puedes añadir más tipos según tu roadmap.",
    },
    {
      q: "¿Puedo usarlo gratis?",
      a: "Sí. El plan Gratis tiene límites de proyectos y práctica diaria. Premium desbloquea práctica ilimitada.",
    },
    {
      q: "¿Esto es solo para estudiantes?",
      a: "No. También funciona para autodidactas y profesionales que estudian para exámenes o certificaciones.",
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
                <Chip value="Flashcards" variant="outlined" color="blue-gray" />
                <Chip value="Preguntas" variant="outlined" color="blue-gray" />
                <Chip value="Progreso real" variant="outlined" color="blue-gray" />
              </div>

              <Typography variant="h2" color="blue-gray" className="leading-tight">
                Aprende con preguntas.
                <br />
                Domina con práctica.
              </Typography>

              <Typography variant="lead" className="mt-3 text-blue-gray-500 max-w-xl">
                <span className="font-semibold text-blue-gray-700">Anko Studio</span> convierte tus documentos en{" "}
                <span className="font-semibold text-blue-gray-700">flashcards</span> y{" "}
                <span className="font-semibold text-blue-gray-700">cuestionarios</span> para que practiques de verdad,
                midas tu progreso y mejores cada día.
              </Typography>

              <Typography className="mt-2 text-sm text-blue-gray-400">
                Ideal para estudiantes, autodidactas y certificaciones.
              </Typography>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  color="blue-gray"
                  className="shadow-sm"
                  onClick={() => navigate("/dashboard/projects")}
                >
                  Crear mi primer proyecto
                </Button>
                <Button
                  variant="outlined"
                  color="blue-gray"
                  onClick={() => {
                    const el = document.getElementById("como-funciona");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  Ver cómo funciona
                </Button>
              </div>

              {/* Ribbon */}
              <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-blue-gray-100 bg-blue-gray-50 px-4 py-3">
                <BoltIcon className="h-5 w-5 text-blue-gray-700" />
                <Typography className="text-sm text-blue-gray-700">
                  Proyecto → Reglas → Preguntas → Progreso
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
                      Aprende respondiendo
                    </Typography>
                    <Typography className="text-xs text-blue-gray-500">
                      Preguntas + flashcards = retención real.
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
                      Progreso por tema
                    </Typography>
                    <Typography className="text-xs text-blue-gray-500">
                      Enfócate donde más fallas.
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
              Cómo funciona
            </Typography>
            <Typography className="text-blue-gray-500">
              Crea tu sistema de estudio en minutos: contenido → reglas → práctica → resultados.
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
              Menos lectura pasiva. Más aprendizaje real.
            </Typography>
            <Typography className="text-blue-gray-500">
              Diseñado para que aprendas respondiendo, practicando y mejorando.
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {benefits.map((b) => (
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
              Hecho para aprender en serio
            </Typography>
            <Typography className="text-blue-gray-500">
              Para estudiar mejor, practicar con preguntas y avanzar con claridad.
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {forWho.map((item) => (
              <Card key={item.title} className="border border-blue-gray-100 shadow-sm rounded-2xl">
                <CardBody className="p-6">
                  <Typography variant="h5" color="blue-gray" className="mb-1">
                    {item.title}
                  </Typography>
                  <Typography className="text-blue-gray-600 text-sm">{item.desc}</Typography>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section className="mt-14">
        <div className="mx-auto max-w-6xl px-1">
          <div className="text-center mb-10">
            <Typography variant="h3" color="blue-gray" className="mb-2">
              Planes simples, aprendizaje sin fricción
            </Typography>
            <Typography className="text-blue-gray-500">
              Empieza gratis y sube de nivel cuando tu estudio lo pida.
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 items-stretch">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={[
                  "relative rounded-2xl border shadow-sm",
                  plan.recommended
                    ? "border-amber-500 shadow-xl md:-translate-y-2"
                    : "border-blue-gray-100",
                ].join(" ")}
              >
                {plan.recommended && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Chip value="Más popular" color="amber" className="rounded-full" />
                  </div>
                )}

                <CardHeader
                  floated={false}
                  shadow={false}
                  className="m-0 rounded-t-2xl border-b border-blue-gray-100 bg-blue-gray-50 p-6 text-center"
                >
                  <Typography variant="small" className="uppercase tracking-wider text-blue-gray-500">
                    {plan.name}
                  </Typography>
                  <Typography variant="h3" color="blue-gray" className="mt-2">
                    {plan.price}
                  </Typography>
                </CardHeader>

                <CardBody className="p-6">
                  <ul className="flex flex-col gap-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className="mt-0.5 rounded-full border border-blue-gray-200 bg-blue-gray-50 p-1">
                          <CheckCircleIcon className="h-4 w-4 text-blue-gray-700" />
                        </span>
                        <Typography className="text-sm text-blue-gray-700">
                          {feature}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </CardBody>

                <CardFooter className="p-6 pt-0">
                  <Button
                    size="lg"
                    fullWidth
                    color={plan.color}
                    variant={plan.name === "Gratis" ? "outlined" : "gradient"}
                    onClick={plan.onClick}
                    className={plan.recommended ? "shadow-md" : ""}
                  >
                    {plan.button}
                  </Button>

                  {plan.name === "Premium" && (
                    <Typography className="mt-3 text-xs text-blue-gray-400 text-center">
                      Recomendado para estudiar en serio y practicar sin límites.
                    </Typography>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIOS ================= */}
      <section className="mt-14">
        <div className="mx-auto max-w-6xl px-1">
          <div className="text-center mb-10">
            <Typography variant="h3" color="blue-gray" className="mb-2">
              Lo que dicen quienes estudian con Anko Studio
            </Typography>
            <Typography className="text-blue-gray-500">
              Opiniones centradas en lo importante: práctica, enfoque y resultados.
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                name: "María S.",
                role: "Estudiante de Medicina",
                img: "/img/avatar1.png",
                quote:
                  "Antes leía y creía que entendía. Con las preguntas tipo flashcard vi en qué fallaba y mejoré más rápido.",
              },
              {
                name: "Carlos D.",
                role: "Preparación de certificaciones",
                img: "/img/avatar2.png",
                quote:
                  "Me gusta que puedo estudiar por temas y medir el progreso. Es como tener un sistema de práctica siempre listo.",
              },
              {
                name: "Elena R.",
                role: "Docente",
                img: "/img/avatar3.png",
                quote:
                  "Crear sets de preguntas para mis alumnos ahora es mucho más ordenado. La práctica guiada es lo que más ayuda.",
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
              Preguntas frecuentes
            </Typography>
            <Typography className="text-blue-gray-500">
              Respuestas claras para empezar sin dudas.
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {faqs.map((f) => (
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
                    Empieza hoy. Estudia con preguntas y mejora más rápido.
                  </Typography>
                  <Typography className="text-blue-gray-500 max-w-2xl">
                    Crea tu primer proyecto, define reglas de práctica y comienza a dominar tus temas con flashcards y simulación.
                  </Typography>
                </div>
                <div className="flex gap-3">
                  <Button color="blue-gray" onClick={() => navigate("/dashboard/projects")}>
                    Crear mi primer proyecto
                  </Button>
                  <Button variant="outlined" color="blue-gray" onClick={() => navigate("/dashboard/billing")}>
                    Ver planes
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
