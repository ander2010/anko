import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Typography } from "@material-tailwind/react";
import { HeartIcon } from "@heroicons/react/24/solid";
import { useLanguage } from "@/context/language-context";

export function Footer({ brandName, brandLink, routes }) {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="py-2">
      <div className="flex w-full flex-wrap items-center justify-center gap-6 px-2 md:justify-between">
        <Typography variant="small" className="font-normal text-inherit">
          &copy; {year}, {t("footer.made_with")}{" "}
          <HeartIcon className="-mt-0.5 inline-block h-3.5 w-3.5 text-red-600" /> {t("footer.by")}{" "}
          <Link
            to={brandLink}
            className="transition-colors hover:text-blue-500 font-bold"
          >
            {brandName}
          </Link>{" "}
          {t("footer.for_better_web")}
        </Typography>
        <ul className="flex items-center gap-4">
          {routes.map(({ name, path }) => (
            <li key={name}>
              <Link to={path}>
                <Typography
                  variant="small"
                  className="py-0.5 px-1 font-normal text-inherit transition-colors hover:text-blue-500"
                >
                  {t(`footer.links.${name}`)}
                </Typography>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

Footer.defaultProps = {
  brandName: "ANKO Studio",
  brandLink: "/dashboard/home",
  routes: [
    { name: "about", path: "/dashboard/about-us" },
    { name: "contact", path: "/dashboard/contact-us" },
  ],
};

Footer.propTypes = {
  brandName: PropTypes.string,
  brandLink: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
};

Footer.displayName = "/src/widgets/layout/footer.jsx";

export default Footer;
