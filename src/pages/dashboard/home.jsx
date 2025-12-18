import React from "react";
import {
  Typography,
} from "@material-tailwind/react";
import { StatisticsCard } from "@/widgets/cards";
import { useProjects } from "@/context/projects-context";
import { useNavigate } from "react-router-dom";
import {
  FolderIcon,
  TagIcon,
  ClipboardDocumentCheckIcon,
  BoltIcon
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

  return (
    <div className="mt-12">
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
                className="font-normal text-blue-gray-600 hover:text-blue-500 cursor-pointer flex items-center justify-end"
                onClick={() => navigate(footer.path)}
              >
                <strong className={`text-${color}-500`}>&rarr;</strong>
                &nbsp;{footer.label}
              </Typography>
            }
          />
        ))}
      </div>

      <div className="mt-8">
        <Typography variant="h6" color="blue-gray" className="mb-4">
          Welcome to Anko Dashboard
        </Typography>
        <Typography variant="small" className="text-blue-gray-500 max-w-2xl">
          Here you can track your entire content ecosystem. Use the sidebar or the cards above to navigate to specific global views of your Topics, Rules, and Question Batteries. To create content, go to <strong>Projects</strong>.
        </Typography>
      </div>
    </div>
  );
}

export default Home;
