import { create } from "zustand"
import { axiosInstance } from "../lib/axios.js"
import toast from "react-hot-toast"

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,

    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");

            set({ authUser: res.data })
        } catch (error) {
            console.log("Error in checkAuth:", error);
            set({authUser:null})

        } finally {
            set({isCheckingAuth:false})
        }
    },

    signup: async ( data ) => {
        set({ isSigningUp: true })
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            toast.success("Account created sucessfully")
            set({ authUser: res.data })

        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set ({ isSigningUp: false })
        }
    }

}))