import { useTranslation } from 'react-i18next'
import { Button } from '../components/button'
import { Helmet } from 'react-helmet'
import { useSiteConfig } from "../hooks/useSiteConfig";
import { siteName } from '../utils/constants'

export function ErrorPage({error}: {error?: string}) {
    const { t } = useTranslation()
    const siteConfig = useSiteConfig();
    return (
        <>
            <Helmet>
                <title>{`${t('error.title')} - ${siteConfig.name}`}</title>
                <meta property="og:site_name" content={siteName} />
                <meta property="og:title" content={t('error.title')} />
                <meta property="og:image" content={siteConfig.avatar} />
            </Helmet>
            <div className="w-full flex flex-row justify-center ani-show">
                    <div className="flex flex-col wauto rounded-md bg-w m-2 p-5 items-center justify-center space-y-2 border border-neutral-200/70 shadow-sm shadow-light">
                    <h1 className="text-xl font-bold t-primary">{error}</h1>
                    <Button
                        title={t("index.back")}
                        onClick={() => (window.location.href = "/")}
                    />
                </div>
            </div>
        </>
    );
}
