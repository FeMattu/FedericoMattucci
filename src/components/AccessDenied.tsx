import { signIn } from "next-auth/react"
import CustomLink from "./CustomLink"

export default function AccessDenied() {
  return (
    <>
      <h1>Access Denied</h1>
      <p>
        <CustomLink
          href="/api/auth/signin"
          onClick={(e) => {
            e.preventDefault()
            signIn()
          }}
        >
          You must be signed in to view this page
        </CustomLink>
      </p>
    </>
  )
}
