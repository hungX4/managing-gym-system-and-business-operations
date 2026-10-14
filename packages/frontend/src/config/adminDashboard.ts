import { Role } from "@gym/shared"
import { createElement, type ReactNode } from "react"

export type ADMIN_DASHBOARD = {
    id: string
    path: string
    label: string
    role: Role
    icon: ReactNode
}

export const ADMIN_DASHBOARD: ADMIN_DASHBOARD[] = [
    {
        id: 'THONGKE',
        path: '/admin',
        label: 'Thống kê',
        role: Role.ADMIN,
        icon: createElement(
            'svg',
            {
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: 2,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                className: 'w-5 h-5'
            },
            createElement('line', { x1: 18, y1: 20, x2: 18, y2: 10 }),
            createElement('line', { x1: 12, y1: 20, x2: 12, y2: 4 }),
            createElement('line', { x1: 6, y1: 20, x2: 6, y2: 14 })
        )
    },
    {
        id: 'TRIAL',
        path: '/admin/trial',
        label: 'Khách quan tâm',
        role: Role.ADMIN,
        icon: createElement(
            'svg',
            {
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: 2,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                className: 'w-5 h-5'
            },
            createElement('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
            createElement('circle', { cx: 9, cy: 7, r: 4 }),
            createElement('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
            createElement('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
        )
    },
    {
        id: 'SALARY',
        path: '/admin/salary',
        label: 'Chốt lương',
        role: Role.ADMIN,
        icon: createElement(
            'svg',
            {
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: 2,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                className: 'w-5 h-5'
            },
            createElement('rect', { width: 20, height: 12, x: 2, y: 6, rx: 2 }),
            createElement('circle', { cx: 12, cy: 12, r: 2 }),
            createElement('path', { d: 'M6 12h.01M18 12h.01' })
        )
    },
    {
        id: 'CONFIG',
        path: '/admin/salaryconfig',
        label: 'Cấu hình lương',
        role: Role.ADMIN,
        icon: createElement(
            'svg',
            {
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: 2,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                className: 'w-5 h-5'
            },
            createElement('line', { x1: 21, x2: 14, y1: 4, y2: 4 }),
            createElement('line', { x1: 10, x2: 3, y1: 4, y2: 4 }),
            createElement('line', { x1: 21, x2: 12, y1: 12, y2: 12 }),
            createElement('line', { x1: 8, x2: 3, y1: 12, y2: 12 }),
            createElement('line', { x1: 21, x2: 16, y1: 20, y2: 20 }),
            createElement('line', { x1: 12, x2: 3, y1: 20, y2: 20 }),
            createElement('line', { x1: 14, x2: 14, y1: 2, y2: 6 }),
            createElement('line', { x1: 8, x2: 8, y1: 10, y2: 14 }),
            createElement('line', { x1: 16, x2: 16, y1: 18, y2: 22 })
        )
    },
    {
        id: 'PACKAGE',
        path: '/admin/package',
        label: 'Thêm gói tập',
        role: Role.ADMIN,
        icon: createElement(
            'svg',
            {
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: 2,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                className: 'w-5 h-5'
            },
            createElement('path', { d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' }),
            createElement('polyline', { points: '3.29 7 12 12 20.71 7' }),
            createElement('line', { x1: 12, x2: 12, y1: 22, y2: 12 })
        )
    }
]
