import axios from "axios";
const TOKEN = "6DJdQZJIv6WpChtccQOceQui2qYoKDWWJik2qTX3";
axios.defaults.headers.common["Authorization"] = `Bearer ${TOKEN}`;

export const BASE_URL = 'http://localhost:8000'
// const BASE_URL = 'https://erp-backend-fy3n.onrender.com'

export const getClasses = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-classes`);
    return response?.data;
};

export const getSections = async (classId) => {
    const response = await axios.get(`${BASE_URL}/api/sections/class/${classId}`);
    return response?.data;
};

export const getAllSections = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-sections`);
    return response?.data;
};

export const getCategories = async () => {
    const response = await axios.get(`${BASE_URL}/api/categories`)
    return response?.data;
}

export const getReligions = async () => {
    const response = await axios.get(`${BASE_URL}/api/religions`)
    return response?.data;
}

export const getCastes = async () => {
    const response = await axios.get(`${BASE_URL}/api/castes`)
    return response?.data;
}

export const getStates = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-states`)
    return response?.data;
}

export const getFeeGroups = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-fee-groups`)
    return response?.data;
}

export const addNewFeeGroup = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/add-fee-groups`, payload)
    return response?.data;
}
export const deleteFeeGroupById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-fee-groups/${id}`)
    return response?.data;
}
export const updateFeeGroupById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-fee-groups/${id}`, payload)
    return response?.data;
}
export const getAllPaymentMode = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-payment-mode`)
    return response?.data;
}

export const getFeeHistoryByStudentId = async (studentId) => {
    const response = await axios.get(`${BASE_URL}/api/fee-history/${studentId}`)
    return response?.data;
}

export const deleteFeeEntryById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/fee-entries/${id}`)
    return response?.data;
}

export const getStudentsByClassAndSection = async (classId, sectionId) => {
    const response = await axios.get(`${BASE_URL}/api/students/search?class_name=${classId}&section_name=${sectionId}`)
    return response?.data;
}

export const updateStudent = async (studentId, payload) => {
    const response = await axios.put(`${BASE_URL}/api/students/${studentId}`, payload, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    })
    return response?.data;
}
export const updateBulkStudents = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/students/bulkUpdate`, payload)
    return response?.data;
}

export const addNewStudent = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/students`, payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${TOKEN}`,
        }
    })
    return response?.data;
}