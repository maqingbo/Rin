import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { HashTag } from "./hashtag";
import { useEffect, useRef } from "react";
import { drawBlurhashToCanvas } from "../utils/blurhash";
import { parseImageUrlMetadata } from "../utils/image-upload";
import { useImageLoadState } from "../utils/use-image-load-state";
import { type FeedCardVariant, normalizeFeedCardVariant } from "./feed-card-options";
import { useSiteConfig } from "../hooks/useSiteConfig";

function formatDate(d: string | Date) {
    const dt = new Date(d);
    const p = (n: number) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
}

function FeedCardImage({ src, variant }: { src: string; variant: FeedCardVariant }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { src: cleanSrc, blurhash, width, height } = parseImageUrlMetadata(src);
    const { failed, imageRef, loaded, onError, onLoad } = useImageLoadState(cleanSrc);
    const aspectRatio = width && height ? `${width} / ${height}` : "16 / 9";
    const imageFrameClass =
        variant === "editorial"
            ? "relative flex max-h-80 w-full flex-row items-center overflow-hidden rounded-[20px]"
            : "relative mb-2 flex max-h-80 w-full flex-row items-center overflow-hidden rounded-md";

    useEffect(() => {
        if (!blurhash || !canvasRef.current) {
            return;
        }
        try {
            drawBlurhashToCanvas(canvasRef.current, blurhash);
        } catch (error) {
            console.error("Failed to render blurhash", error);
        }
    }, [blurhash]);

    return (
        <div
            className={imageFrameClass}
            style={{ aspectRatio: aspectRatio || '16 / 9' }}
        >
            {blurhash && !loaded ? (
                <canvas
                    ref={canvasRef}
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full scale-110 object-cover blur-sm"
                />
            ) : null}
            <img
                ref={imageRef}
                src={cleanSrc}
                alt=""
                width={width}
                height={height}
                onLoad={onLoad}
                onError={onError}
                className={`absolute inset-0 h-full w-full object-cover object-center hover:scale-105 translation duration-300 ${blurhash && (!loaded || failed) ? "opacity-0" : "opacity-100"
                    }`}
            />
        </div>
    );
}

const FEED_CARD_STYLES: Record<
    FeedCardVariant,
    {
        card: string;
        imageWrap: string;
        meta: string;
        summary: string;
        title: string;
    }
> = {
    default: {
        card: "my-3 inline-block w-full break-inside-avoid rounded-md bg-w px-8 py-6 duration-300 border border-neutral-200/70 shadow-sm shadow-light",
        imageWrap: "",
        meta: "text-gray-400 text-sm text-center",
        summary: "text-pretty overflow-hidden text-gray-600 dark:text-neutral-400 text-base leading-[1.9]",
        title: "text-lg font-medium text-gray-700 dark:text-neutral-100 text-pretty overflow-hidden text-center",
    },
    editorial: {
        card: "my-3 inline-block w-full break-inside-avoid overflow-hidden rounded-[28px] border border-black/10 bg-w p-3 shadow-[0_24px_60px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_28px_70px_rgba(15,23,42,0.12)] dark:border-white/10",
        imageWrap: "mb-3 overflow-hidden rounded-[22px] border border-black/5 dark:border-white/10",
        meta: "text-[12px] font-medium uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400",
        summary: "line-clamp-5 text-pretty text-[15px] leading-7 text-neutral-600 dark:text-neutral-300",
        title: "text-2xl font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white text-pretty overflow-hidden",
    },
};

export type FeedCardProps = {
    id: string;
    avatar?: string;
    draft?: number;
    listed?: number;
    top?: number;
    title: string;
    summary: string;
    hashtags?: { id: number, name: string }[];
    createdAt: Date;
    updatedAt: Date;
    preview?: boolean;
    variant?: FeedCardVariant;
};

export function FeedCard({ id, title, avatar, draft, listed, top, summary, hashtags, createdAt, updatedAt, preview = false, variant }: FeedCardProps) {
    const { t } = useTranslation();
    const siteConfig = useSiteConfig();
    const safeHashtags = Array.isArray(hashtags) ? hashtags : [];
    const activeVariant = normalizeFeedCardVariant(variant ?? siteConfig.feedCardVariant);
    const styles = FEED_CARD_STYLES[activeVariant];
    const body = (
        <div className={styles.card}>
            {avatar && activeVariant === "editorial" ? (
                <div className={styles.imageWrap}>
                    <FeedCardImage src={avatar} variant={activeVariant} />
                </div>
            ) : null}
            <div className={activeVariant === "editorial" ? "px-2 pb-2" : ""}>
                <h1 className={styles.title}>{title}</h1>
                <div className={`mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 ${styles.meta}`}>
                    <span className="flex items-center gap-1" title={new Date(createdAt).toLocaleString()}>
                        <i className="ri-calendar-line" />
                        {formatDate(createdAt)}
                    </span>
                    {createdAt !== updatedAt &&
                        <span className="flex items-center gap-1" title={new Date(updatedAt).toLocaleString()}>
                            <i className="ri-history-line" />
                            {t('feed_card.updated$time', { time: formatDate(updatedAt) })}
                        </span>
                    }
                    {draft === 1 && <span>{t("draft")}</span>}
                    {listed === 0 && <span>{t("unlisted")}</span>}
                    {top === 1 && <span className="text-theme">{t('article.top.title')}</span>}
                    {activeVariant === "default" && safeHashtags.map(({ name }, index) => (
                        <span key={`tag$${index}`} className="flex items-center gap-1">
                            <span className="text-gray-300 dark:text-neutral-600">|</span>
                            <i className="ri-folder-line" />
                            {name}
                        </span>
                    ))}
                </div>
                {activeVariant === "editorial" && safeHashtags.length > 0 &&
                    <div className="mt-2 flex flex-row flex-wrap justify-center gap-2 max-w-3xl">
                        {safeHashtags.map(({ name }, index) => (
                            <HashTag key={index} name={name} />
                        ))}
                    </div>
                }
                <p className={`mt-5 whitespace-pre-line ${styles.summary} ${activeVariant === "editorial" ? "mt-4 max-w-3xl" : ""}`}>{summary}</p>
            </div>
        </div>
    );

    return preview ? body : <Link href={`/feed/${id}`} target="_blank" className="block w-full">{body}</Link>;
}
