import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export interface TableOfContent {
    index: number
    text: string
    marginLeft: number
    element: HTMLElement
}

const getHeaderScrollOffset = () => {
    const rawValue = getComputedStyle(document.documentElement)
        .getPropertyValue('--header-scroll-offset')
        .trim()
    const offset = Number.parseFloat(rawValue)
    return Number.isFinite(offset) ? offset : 0
}

const useTableOfContents = (selector: string) => {
    const intersectingListRef = useRef<boolean[]>([]) // isIntersecting array
    const [tableOfContents, setTableOfContents] = useState<TableOfContent[]>([])
    const [activeIndex, setActiveIndex] = useState(0)
    const { t } = useTranslation()
    const io = useRef<IntersectionObserver | null>(null);
    const [ref, setRef] = useState("-1")
    const lastRef = useRef("")

    useEffect(() => {
        if (lastRef.current === ref) return
        const content = document.querySelector(selector)
        if (!content) return
        const intersectingList = intersectingListRef.current
        const headers = content.querySelectorAll<HTMLElement>(
            'h1, h2, h3, h4, h5, h6'
        ) // all headers

        // set TableOfContents
        const tocData = Array.from(headers).map<TableOfContent>((header, i) => ({
            index: i,
            text: header.textContent || '',
            marginLeft: (Number(header.tagName.charAt(1)) - 1) * 10,
            element: header, // have to down little bit
        }))
        setTableOfContents(tocData)

        // create IntersectionObserver
        if (io.current) io.current.disconnect()
        io.current = new IntersectionObserver(
            (entries) => {
                // save isIntersecting info to array using data-id
                entries.forEach(({ target, isIntersecting }) => {
                    const idx = Number((target as HTMLElement).dataset.id || 0)
                    intersectingList[idx] = isIntersecting
                })
                // get activeIndex
                const currentIndex = intersectingList.findIndex((item) => item)
                let activeIndex = currentIndex - 1
                if (currentIndex === -1) {
                    activeIndex = intersectingList.length - 1
                } else if (currentIndex === 0) {
                    activeIndex = 0
                }
                setActiveIndex(activeIndex)
            },
            { rootMargin: "-20% 0px 10000px 0px", threshold: 0 }
        )
        intersectingList.length = 0 // reset array
        headers.forEach((header, i) => {
            if (header.getAttribute('data-id') !== null) return
            header.setAttribute('data-id', i.toString()) // set data-id
            intersectingList.push(false) // increase array length
            io.current!.observe(header) // register to observe
        })
        lastRef.current = ref
        return () => {
            if (io.current) io.current.disconnect()
        }
    }, [ref])

    const cleanup = (newId: string) => {
        if (lastRef.current === newId) return
        setRef(newId)
        if (io.current) io.current.disconnect()
    }

    return {
        TOC: () => (<div className='rounded-md bg-w border border-neutral-200/70 shadow-sm shadow-light py-5 px-4'>
            <h2 className="text-[15px] font-semibold text-center text-gray-700 dark:text-neutral-100">{t("index.title")}</h2>
            <ul className="mt-3 max-h-[calc(100vh-8rem)] overflow-auto text-[14px] leading-relaxed space-y-2" style={{ scrollbarWidth: "none" }}>
                {tableOfContents.length === 0 && <li className="text-[13px] text-gray-400 dark:text-neutral-500">{t("index.empty.title")}</li>}
                {tableOfContents.map((item) => (
                    <li
                        key={`toc$${item.index}`}
                        className={`cursor-pointer transition-colors ${activeIndex === item.index ? "font-medium text-theme" : item.marginLeft === 0 ? "font-medium text-gray-700 hover:text-gray-800 dark:text-neutral-200 dark:hover:text-neutral-50" : "text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200"}`}
                        style={{ marginLeft: item.marginLeft }}
                        onClick={() => {
                            const top = item.element.getBoundingClientRect().top + window.scrollY - getHeaderScrollOffset()
                            window.scrollTo({
                                top: Math.max(top, 0),
                                behavior: 'smooth'
                            })
                        }}
                    >
                        {item.text}
                    </li>
                ))}
            </ul>
        </div>), cleanup
    }
}

export default useTableOfContents
