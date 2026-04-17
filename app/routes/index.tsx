import { redirect } from 'react-router'

export function loader() {
  throw redirect('/workflows')
}

export default function Page() {
  return null
}
