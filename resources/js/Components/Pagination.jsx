import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSFX } from '@/Contexts/SFXContext';

export default function Pagination({ links, currentPage, lastPage }) {
    const { playSFX } = useSFX();

    if (lastPage <= 1) return null;

    const handlePageClick = (url) => {
        playSFX('click');
        if (url) window.location.href = url;
    };

    return (
        <div className="flex items-center justify-center gap-2">
            {/* Previous Button */}
            {links[0]?.url ? (
                <button
                    onClick={() => handlePageClick(links[0].url)}
                    onMouseEnter={() => playSFX('hover')}
                    className="
                        px-4 py-3
                        bg-black/40 backdrop-blur-xl
                        border border-white/20
                        rounded-xl
                        text-white
                        hover:bg-white/10 hover:border-white/30
                        transition-all duration-200
                        shadow-lg hover:shadow-xl
                        font-bold
                        ripple-effect button-press-effect hover-lift
                    "
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            ) : (
                <button
                    disabled
                    className="
                        px-4 py-3
                        bg-black/20
                        border border-white/5
                        rounded-xl
                        text-gray-600
                        cursor-not-allowed
                        shadow-lg
                    "
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            )}

            {/* Page Numbers */}
            <div className="flex items-center gap-2">
                {links.slice(1, -1).map((link, index) => {
                    const pageNum = index + 1;
                    const showPage =
                        pageNum === 1 ||
                        pageNum === lastPage ||
                        (pageNum >= currentPage - 2 && pageNum <= currentPage + 2);

                    if (!showPage) {
                        if (
                            (pageNum === currentPage - 3 && currentPage > 4) ||
                            (pageNum === currentPage + 3 && currentPage < lastPage - 3)
                        ) {
                            return (
                                <span key={index} className="px-3 py-2 text-gray-500">
                                    ...
                                </span>
                            );
                        }
                        return null;
                    }

                    return link.url ? (
                        <button
                            key={index}
                            onClick={() => handlePageClick(link.url)}
                            onMouseEnter={() => playSFX('hover')}
                            className={`
                                min-w-[44px] px-4 py-3 rounded-xl font-bold
                                transition-all duration-200
                                ripple-effect button-press-effect
                                ${link.active
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl shadow-blue-500/50 ring-2 ring-blue-400/50 scale-110 animate-glowPulse'
                                    : 'bg-black/40 backdrop-blur-xl border border-white/20 text-white hover:bg-white/10 hover:border-white/30 hover:scale-105 shadow-lg hover-lift'
                                }
                            `}
                        >
                            {link.label}
                        </button>
                    ) : (
                        <span
                            key={index}
                            className="
                                min-w-[44px] px-4 py-3 
                                bg-gradient-to-r from-blue-500 to-purple-600 
                                text-white rounded-xl shadow-xl shadow-blue-500/50 
                                font-bold
                                ring-2 ring-blue-400/50
                                scale-110
                                animate-glowPulse
                            "
                        >
                            {link.label}
                        </span>
                    );
                })}
            </div>

            {/* Next Button */}
            {links[links.length - 1]?.url ? (
                <button
                    onClick={() => handlePageClick(links[links.length - 1].url)}
                    onMouseEnter={() => playSFX('hover')}
                    className="
                        px-4 py-3
                        bg-black/40 backdrop-blur-xl
                        border border-white/20
                        rounded-xl
                        text-white
                        hover:bg-white/10 hover:border-white/30
                        transition-all duration-200
                        shadow-lg hover:shadow-xl
                        font-bold
                        ripple-effect button-press-effect hover-lift
                    "
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            ) : (
                <button
                    disabled
                    className="
                        px-4 py-3
                        bg-black/20
                        border border-white/5
                        rounded-xl
                        text-gray-600
                        cursor-not-allowed
                        shadow-lg
                    "
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}