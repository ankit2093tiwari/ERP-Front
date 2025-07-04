import { useSelector } from "react-redux";
const useSessionId = () => {
    return useSelector((state) => state.session.selectedSessionId)
}

export default useSessionId;