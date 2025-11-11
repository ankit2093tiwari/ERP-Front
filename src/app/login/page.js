"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useSelector } from "react-redux"


const Page = () => {
    const router = useRouter()
    const { token, user } = useSelector(state => state?.auth)

    const removeAuthLocalStorage = () => {
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
        localStorage.removeItem("selectedSessionId");
    }
    useEffect(() => {
        if (token && user) {
            router.replace('/')
        }
        else {
            removeAuthLocalStorage()
        }
    }, [user, router, token])
    return (
        <>
            <div>Login Page</div>
        </>
    )
}

export default Page