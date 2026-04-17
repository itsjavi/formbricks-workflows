import type { Route } from './+types/index'
import { ComponentExample } from '@/components/component-example'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ]
}

export default function Page() {
  return <ComponentExample />
}
