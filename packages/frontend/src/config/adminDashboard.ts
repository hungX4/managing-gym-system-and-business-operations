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
        id: 'TRIAL',
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
            createElement('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
            createElement('circle', { cx: 9, cy: 7, r: 4 }),
            createElement('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
            createElement('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
        )
    },
    {
        id: 'TRIAL',
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
            createElement('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
            createElement('circle', { cx: 9, cy: 7, r: 4 }),
            createElement('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
            createElement('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
        )
    }
]
