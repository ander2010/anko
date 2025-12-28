import React from "react";
import {
    Typography,
    Card,
    CardBody,
    Avatar,
} from "@material-tailwind/react";
import { useLanguage } from "@/context/language-context";
import { HeartIcon, RocketLaunchIcon, ChartBarIcon } from "@heroicons/react/24/solid";

export function AboutUs() {
    const { t } = useLanguage();

    return (
        <div className="mt-12 flex flex-col gap-12 max-w-5xl mx-auto">
            <div className="text-center">
                <Typography variant="h2" color="blue-gray" className="mb-2">
                    {t("about_us.title")}
                </Typography>
                <Typography variant="lead" className="text-blue-gray-600 font-normal">
                    {t("about_us.subtitle")}
                </Typography>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <Card className="relative bg-white ring-1 ring-gray-900/5 rounded-2xl">
                        <CardBody className="p-8">
                            <Typography variant="h4" color="blue-gray" className="mb-4">
                                {t("about_us.mission_title")}
                            </Typography>
                            <Typography className="text-blue-gray-600 leading-relaxed">
                                {t("about_us.mission_text")}
                            </Typography>
                        </CardBody>
                    </Card>
                </div>
                <div>
                    <Typography variant="h4" color="blue-gray" className="mb-4">
                        {t("about_us.story_title")}
                    </Typography>
                    <Typography className="text-blue-gray-600 leading-relaxed mb-6">
                        {t("about_us.story_text")}
                    </Typography>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <HeartIcon className="h-5 w-5 text-red-500" />
                            <Typography className="text-blue-gray-700 font-medium">{t("about_us.values.v1")}</Typography>
                        </div>
                        <div className="flex items-center gap-3">
                            <ChartBarIcon className="h-5 w-5 text-blue-500" />
                            <Typography className="text-blue-gray-700 font-medium">{t("about_us.values.v2")}</Typography>
                        </div>
                        <div className="flex items-center gap-3">
                            <RocketLaunchIcon className="h-5 w-5 text-amber-500" />
                            <Typography className="text-blue-gray-700 font-medium">{t("about_us.values.v3")}</Typography>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="border border-blue-gray-50 shadow-sm bg-blue-gray-50/20">
                <CardBody className="p-10 text-center">
                    <RocketLaunchIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <Typography variant="h3" color="blue-gray" className="mb-2">
                        Join the ANKO Revolution
                    </Typography>
                    <Typography className="text-blue-gray-600 max-w-2xl mx-auto">
                        Discover a smarter way to master your content. Whether you're a student or a pro, we're here to help you reach your goals.
                    </Typography>
                </CardBody>
            </Card>
        </div>
    );
}

export default AboutUs;
