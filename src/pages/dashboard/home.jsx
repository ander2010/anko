import React from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Carousel,
  List,
  ListItem,
  ListItemPrefix,
  Chip
} from "@material-tailwind/react";
import { StatisticsCard } from "@/widgets/cards";
import { useProjects } from "@/context/projects-context";
import { useNavigate } from "react-router-dom";
import {
  FolderIcon,
  TagIcon,
  ClipboardDocumentCheckIcon,
  BoltIcon,
  CheckCircleIcon,
  StarIcon,
  RocketLaunchIcon,
  AcademicCapIcon
} from "@heroicons/react/24/solid";

export function Home() {
  const { projects, topics, rules, batteries } = useProjects();
  const navigate = useNavigate();

  const statsData = [
    {
      color: "blue",
      icon: FolderIcon,
      title: "Projects Created",
      value: projects.length,
      footer: {
        label: "Manage Projects",
        path: "/dashboard/projects"
      },
    },
    {
      color: "green",
      icon: TagIcon,
      title: "Total Topics",
      value: topics.length,
      footer: {
        label: "View All Topics",
        path: "/dashboard/topics"
      },
    },
    {
      color: "amber",
      icon: ClipboardDocumentCheckIcon,
      title: "Rules Configured",
      value: rules.length,
      footer: {
        label: "View All Rules",
        path: "/dashboard/rules"
      },
    },
    {
      color: "purple",
      icon: BoltIcon,
      title: "Batteries Generated",
      value: batteries.length,
      footer: {
        label: "View All Batteries",
        path: "/dashboard/batteries"
      },
    },
  ];

  const howItWorks = [
    {
      title: "1. Create Projects & Topics",
      desc: "Organize your study material into projects and topics. Structure your knowledge base efficiently.",
      img: "https://cdn.pixabay.com/photo/2015/01/09/11/11/office-594132_1280.jpg",
      color: "blue"
    },
    {
      title: "2. Configure Exam Rules",
      desc: "Set flexible rules for your exams. Define question types, difficulty, and scoring logic.",
      img: "https://cdn.pixabay.com/photo/2017/07/20/03/53/homework-2521144_1280.jpg",
      color: "orange"
    },
    {
      title: "3. Generate & Simulate",
      desc: "Generate question batteries and take exams in the simulator. Track progress and improve.",
      img: "https://cdn.pixabay.com/photo/2015/07/17/22/43/student-849825_1280.jpg",
      color: "green"
    },
  ];

  const plans = [
    {
      name: "Basic / FREE",
      price: "Free",
      icon: AcademicCapIcon,
      color: "blue-gray",
      features: [
        "1-2 Study Projects",
        "Basic Tests (Multiple Choice, T/F)",
        "20-30 Questions per day",
        "Simple Results (% Correct)",
        "Basic Daily Progress"
      ],
      button: "Current Plan"
    },
    {
      name: "Premium",
      price: "$15 / month",
      icon: StarIcon,
      color: "amber",
      recommended: true,
      features: [
        "Everything in Free +",
        "Unlimited Projects & Tests",
        "Advanced Questions (Open, Match)",
        "Smart Study (Repeat failed)",
        "No Daily Limits & No Ads",
        "Favorites & Exam Timer"
      ],
      button: "Upgrade to Premium"
    },
    {
      name: "PRO Team",
      price: "$25 / month",
      icon: RocketLaunchIcon,
      color: "purple",
      features: [
        "Everything in Premium +",
        "Share Public/Private Tests",
        "Import Content (PDF, Word)",
        "AI Generation & Summaries",
        "Advanced Analysis & Ranking",
        "Export Results (PDF, Excel)"
      ],
      button: "Go PRO"
    }
  ];

  return (
    <div className="mt-12">
      {/* 1. Welcome Header */}
      <div className="mb-10 text-center md:text-left">
        <Typography variant="h2" color="blue-gray" className="mb-2">
          Welcome to ANKO Studio
        </Typography>
        <Typography variant="lead" className="text-blue-gray-500 whitespace-nowrap">
          Your extensive platform for exam management, study simulation, and content mastery.
        </Typography>
      </div>

      {/* 2. Stats Grid */}
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {statsData.map(({ color, icon, title, value, footer }) => (
          <StatisticsCard
            key={title}
            color={color}
            title={title}
            value={value}
            icon={React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })}
            footer={
              <Typography
                className="font-normal text-blue-gray-600 hover:text-blue-500 cursor-pointer flex items-center justify-end text-sm"
                onClick={() => navigate(footer.path)}
              >
                {footer.label} &rarr;
              </Typography>
            }
          />
        ))}
      </div>

      {/* 3. How It Works Section */}
      <div className="mb-16">
        <Typography variant="h4" color="blue-gray" className="mb-6 text-center">
          How It Works
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {howItWorks.map((item) => (
            <Card key={item.title} className="hover:shadow-lg transition-shadow border border-blue-gray-50">
              <CardHeader color={item.color} className="relative h-48">
                <img src={item.img} alt={item.title} className="h-full w-full object-cover" />
              </CardHeader>
              <CardBody>
                <Typography variant="h5" color="blue-gray" className="mb-2">
                  {item.title}
                </Typography>
                <Typography>
                  {item.desc}
                </Typography>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. Pricing Plans */}
      <div className="mb-8">
        <div className="text-center mb-10">
          <Typography variant="h3" color="blue-gray" className="mb-2">
            Choose Your Plan
          </Typography>
          <Typography className="text-blue-gray-500">
            Unlock your full potential with our flexible pricing options.
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <Card key={plan.name} className={`border ${plan.recommended ? 'border-amber-500 shadow-xl scale-105 z-10' : 'border-blue-gray-100'}`}>
              {plan.recommended && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Chip value="Most Popular" color="amber" className="rounded-full" />
                </div>
              )}
              <CardHeader
                color={plan.color}
                floated={false}
                shadow={false}
                className="m-0 mb-4 rounded-none border-b border-white/10 pb-4 text-center p-6"
              >
                <Typography variant="small" color="white" className="font-normal uppercase opacity-75">
                  {plan.name}
                </Typography>
                <Typography variant="h3" color="white" className="mt-2 flex justify-center gap-1">
                  {plan.price}
                  {plan.price !== "Free" && <span className="self-end text-lg font-normal"></span>}
                </Typography>
              </CardHeader>
              <CardBody className="p-4">
                <ul className="flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span className="rounded-full border border-white/20 bg-white/20 p-1">
                        <CheckCircleIcon strokeWidth={2} className={`h-4 w-4 text-${plan.color === 'blue-gray' ? 'gray' : plan.color}-500`} />
                      </span>
                      <Typography className="font-normal text-sm">{feature}</Typography>
                    </li>
                  ))}
                </ul>
              </CardBody>
              <CardFooter className="pt-0 p-4">
                <Button
                  size="lg"
                  fullWidth={true}
                  color={plan.color}
                  variant={plan.price === "Free" ? "outlined" : "gradient"}
                >
                  {plan.button}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      {/* 5. Testimonials Section */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <Typography variant="h3" color="blue-gray" className="mb-2">
            What Our Users Say
          </Typography>
          <Typography className="text-blue-gray-500">
            Join thousands of students and educators achieving their goals.
          </Typography>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah M.",
              role: "Medical Student",
              img: "/img/avatar1.png",
              quote: "ANKO Studio completely changed how I prepare for my boards. The simulation mode is a lifesaver!"
            },
            {
              name: "James D.",
              role: "High School Teacher",
              img: "/img/avatar2.png",
              quote: "Creating batteries for my class takes minutes now. The automated grading saves me hours every week."
            },
            {
              name: "Dr. Elena R.",
              role: "University Professor",
              img: "/img/avatar3.png",
              quote: "The ability to import content and generate questions with AI is phenomenal. Highly recommended."
            }
          ].map((testimonial, idx) => (
            <Card key={idx} className="shadow-lg border border-blue-gray-50">
              <CardBody className="p-6 text-center">
                <img
                  src={testimonial.img}
                  alt={testimonial.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-md"
                />
                <Typography variant="h5" color="blue-gray" className="mb-1">
                  {testimonial.name}
                </Typography>
                <Typography className="font-normal text-blue-gray-400 text-sm mb-4">
                  {testimonial.role}
                </Typography>
                <Typography className="text-blue-gray-600 italic">
                  &quot;{testimonial.quote}&quot;
                </Typography>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* 6. Contact Us Section */}
      <div className="mb-8">
        <Card className="overflow-hidden border border-blue-gray-100 shadow-sm">
          <CardBody className="p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Typography variant="h3" color="blue-gray" className="mb-2">
                  Get in Touch
                </Typography>
                <Typography className="text-blue-gray-500 mb-8 max-w-lg">
                  Have questions about our enterprise plans or need support? Fill out the form and our team will get back to you within 24 hours.
                </Typography>

                <div className="flex flex-col gap-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <ClipboardDocumentCheckIcon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <Typography variant="h6" color="blue-gray">
                        Sales & Enterprise
                      </Typography>
                      <Typography className="text-blue-gray-500 text-sm">
                        For large organizations and schools
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <BoltIcon className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <Typography variant="h6" color="blue-gray">
                        Technical Support
                      </Typography>
                      <Typography className="text-blue-gray-500 text-sm">
                        Help with platform features
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              <form className="flex flex-col gap-4 bg-gray-50 p-6 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-blue-gray-700">Name (Optional)</label>
                    <input type="text" className="w-full px-3 py-2 border border-blue-gray-200 rounded-lg bg-white focus:outline-blue-500" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-blue-gray-700">Phone (Optional)</label>
                    <input type="tel" className="w-full px-3 py-2 border border-blue-gray-200 rounded-lg bg-white focus:outline-blue-500" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-blue-gray-700">Email Address <span className="text-red-500">*</span></label>
                  <input type="email" required className="w-full px-3 py-2 border border-blue-gray-200 rounded-lg bg-white focus:outline-blue-500" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-blue-gray-700">Reason for Contact <span className="text-red-500">*</span></label>
                  <textarea required rows={4} className="w-full px-3 py-2 border border-blue-gray-200 rounded-lg bg-white focus:outline-blue-500" placeholder="Tell us how we can help..." />
                </div>
                <Button fullWidth color="blue" className="mt-2">
                  Send Message
                </Button>
              </form>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Home;
