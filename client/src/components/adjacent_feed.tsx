import type { AdjacentFeed, AdjacentFeedResponse } from "@rin/api";
import {useEffect, useState} from "react";
import { client } from "../app/runtime";
import {timeago} from "../utils/timeago.ts";
import {Link} from "wouter";
import {useTranslation} from "react-i18next";

export function AdjacentSection({id, setError}: { id: string, setError: (error: string) => void }) {
    const [adjacentFeeds, setAdjacentFeeds] = useState<AdjacentFeedResponse>();

    useEffect(() => {
        client.feed
            .adjacent(id)
            .then(({data, error}) => {
                if (error) {
                    setError(error.value as string);
                } else if (data && typeof data !== "string") {
                    setAdjacentFeeds(data);
                }
            });
    }, [id, setError]);
    return (
        <div className="rounded-md bg-w mt-4 mb-4 lg:m-4 border border-neutral-200/70 shadow-sm shadow-light overflow-hidden grid grid-cols-1 sm:grid-cols-2">
            <AdjacentCard data={adjacentFeeds?.previousFeed} type="previous"/>
            <AdjacentCard data={adjacentFeeds?.nextFeed} type="next"/>
        </div>
    )
}

export function AdjacentCard({data, type}: { data: AdjacentFeed | null | undefined, type: "previous" | "next" }) {
    const direction = type === "previous" ? "text-start" : "text-end"
    const divider = type === "previous" ? "border-b sm:border-b-0 sm:border-r border-neutral-200/70 dark:border-neutral-700" : ""
    const {t} = useTranslation()
    if (!data) {
        return (<div className="w-full p-6">
            <p className={`t-secondary w-full ${direction}`}>
                {type === "previous" ? "Previous" : "Next"}
            </p>
            <h1 className={`text-xl text-gray-700 dark:text-white text-pretty truncate ${direction}`}>
                {t('no_more')}
            </h1>
        </div>);
    }
    return (
        <Link href={`/feed/${data.id}`} target="_blank"
              className={`w-full p-6 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800/50 ${divider}`}>
            <p className={`t-secondary w-full ${direction}`}>
                {type === "previous" ? "Previous" : "Next"}
            </p>
            <h1 className={`text-xl font-bold text-gray-700 dark:text-white text-pretty truncate ${direction}`}>
                {data.title}
            </h1>
            <p className={`space-x-2 ${direction}`}>
                <span className="text-gray-400 text-sm" title={new Date(data.createdAt).toLocaleString()}>
                    {data.createdAt === data.updatedAt ? timeago(data.createdAt) : t('feed_card.published$time', {time: timeago(data.createdAt)})}
                </span>
                {data.createdAt !== data.updatedAt &&
                    <span className="text-gray-400 text-sm" title={new Date(data.updatedAt).toLocaleString()}>
                        {t('feed_card.updated$time', {time: timeago(data.updatedAt)})}
                    </span>
                }
            </p>
        </Link>
    )
}
