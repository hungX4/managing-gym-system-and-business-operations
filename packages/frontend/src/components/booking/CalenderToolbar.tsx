interface Props {
    isMobile: boolean;
    daysToRender: Date[];
    onToday: () => void;
    onPrev: () => void;
    onNext: () => void;
}

export default function CalendarToolbar({ isMobile, daysToRender, onToday, onPrev, onNext }: Props) {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-4 shrink-0">
            <div>
                <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider flex items-center justify-between">
                    <span>Lịch Dạy <span className="text-red-600">Của Tôi</span></span>
                    {isMobile && (
                        <button onClick={onToday} className="text-xs bg-red-600 px-3 py-1.5 rounded shadow">Hôm nay</button>
                    )}
                </h1>
                <div className="flex flex-wrap gap-x-3 gap-y-2 mt-2 text-[10px] md:text-xs font-medium uppercase tracking-wider text-gray-400">
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#1a1a1a] border border-gray-700"></span> Trống</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/50"></span> Có lịch</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/50"></span> Xác nhận</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/20 border border-green-500/50"></span> Tập xong</div>
                </div>
            </div>

            <div className="flex items-center justify-between w-full lg:w-auto bg-[#111111] border border-gray-800 rounded-lg shadow px-2 py-1.5 shrink-0">
                <button onClick={onPrev} className="px-3 py-1.5 text-xs md:text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded transition">
                    &lt; {isMobile ? 'Ngày trước' : 'Tuần trước'}
                </button>
                <span className="font-bold text-white text-xs md:text-sm whitespace-nowrap px-2 md:px-4">
                    {isMobile
                        ? daysToRender[0].toLocaleDateString('vi-VN')
                        : `${daysToRender[0].toLocaleDateString('vi-VN')} - ${daysToRender[6].toLocaleDateString('vi-VN')}`
                    }
                </span>
                <button onClick={onNext} className="px-3 py-1.5 text-xs md:text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded transition">
                    {isMobile ? 'Ngày sau' : 'Tuần sau'} &gt;
                </button>
                {!isMobile && (
                    <button onClick={onToday} className="ml-2 px-3 py-1.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded transition shadow">
                        Hôm nay
                    </button>
                )}
            </div>
        </div>
    );
}