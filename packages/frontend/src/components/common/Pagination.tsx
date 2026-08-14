// src/components/common/Pagination.tsx
import React from 'react';

interface PaginationMeta {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
}

interface PaginationProps {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
}

export default function Pagination({ meta, onPageChange }: PaginationProps) {
    // Nếu không có data hoặc chỉ có 1 trang thì không hiện thanh phân trang
    if (meta.totalPages <= 1) return null;

    return (
        <div className="p-4 border-t border-gray-800 flex items-center justify-between bg-[#161616]">
            <div className="text-xs text-gray-500">
                Hiển thị <span className="text-gray-300 font-bold">{meta.itemCount}</span> / <span className="text-gray-300 font-bold">{meta.totalItems}</span> kết quả
            </div>

            <div className="flex items-center gap-2">
                {/* Nút Prev */}
                <button
                    onClick={() => onPageChange(Math.max(1, meta.currentPage - 1))}
                    disabled={meta.currentPage === 1}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${meta.currentPage === 1
                            ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                >
                    TRƯỚC
                </button>

                {/* Nút Next */}
                <button
                    onClick={() => onPageChange(Math.min(meta.totalPages, meta.currentPage + 1))}
                    disabled={meta.currentPage === meta.totalPages}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${meta.currentPage === meta.totalPages
                            ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                >
                    SAU
                </button>
            </div>
        </div>
    );
}