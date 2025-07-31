import axios from "axios";
import { store } from "@/Redux/store";

export const BASE_URL = 'https://erp-backend-fy3n.onrender.com'
// export const BASE_URL = 'http://localhost:8000'


axios.interceptors.request.use((config) => {
    const state = store.getState();
    const token = state.auth.token;
    const selectedSessionId = state.session.selectedSessionId;

    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }

    if (selectedSessionId) {
        config.headers["active-session"] = selectedSessionId;
    }

    return config;
}, (error) => Promise.reject(error));


const removeAuthLocalStorage = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("selectedSessionId");
}

// Global Response Interceptor
axios.interceptors.response.use(
    (response) => {
        if (response.data?.error === "Token expired") {
            removeAuthLocalStorage()
            window.location.href = "/login";
        }
        return response;
    },
    (error) => {
        if (error.response?.data?.error === "Token expired") {
            removeAuthLocalStorage()
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export const getSessions = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-session`);
    return response?.data;
};
export const getAllUsers = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-users`);
    return response?.data;
};
export const getSchools = async () => {
    const response = await axios.get(`${BASE_URL}/api/schools/all`);
    return response?.data;
};
export const getActiveSession = async () => {
    const response = await axios.get(`${BASE_URL}/api/active-session`);
    return response?.data;
};
export const addNewSession = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/create-session`, payload);
    return response?.data;
};
export const updateSessionById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-session/${id}`, payload);
    return response?.data;
};
export const deleteSessionById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-session/${id}`);
    return response?.data;
};
export const getClasses = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-classes`);
    return response?.data;
};
export const addNewClass = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/add-class`, payload);
    return response?.data;
};
export const updateClassById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-class/${id}`, payload);
    return response?.data;
};
export const deleteClassById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-class/${id}`);
    return response?.data;
};

export const getSections = async (classId) => {
    const response = await axios.get(`${BASE_URL}/api/sections/class/${classId}`);
    return response?.data;
};
export const addNewSection = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/add-sections`, payload);
    return response?.data;
};
export const updateSectionById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-sections/${id}`, payload);
    return response?.data;
};
export const deleteSectionById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-sections/${id}`);
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
export const addCategory = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/categories`, payload)
    return response?.data;
}
export const deleteCategory = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/categories/${id}`)
    return response?.data;
}
export const updateCategory = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/categories/${id}`, payload)
    return response?.data;
}

export const getReligions = async () => {
    const response = await axios.get(`${BASE_URL}/api/religions`)
    return response?.data;
}
export const addNewReligion = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/religions`, payload)
    return response?.data;
}
export const updateReligionById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/religions/${id}`, payload)
    return response?.data;
}
export const deleteReligionById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/religions/${id}`)
    return response?.data;
}

export const getCastes = async () => {
    const response = await axios.get(`${BASE_URL}/api/castes`)
    return response?.data;
}
export const addNewCaste = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/castes`, payload)
    return response?.data;
}
export const updateCasteById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/castes/${id}`, payload)
    return response?.data;
}
export const deleteCasteById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/castes/${id}`)
    return response?.data;
}

export const getStates = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-states`)
    return response?.data;
}
export const addNewState = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/add-states`, payload)
    return response?.data;
}
export const updateStateById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-states/${id}`, payload)
    return response?.data;
}
export const deleteStateById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-states/${id}`)
    return response?.data;
}
export const deleteCityById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-cities/${id}`)
    return response?.data;
}
export const updateCityById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-cities/${id}`, payload)
    return response?.data;
}
export const addNewCity = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/add-cities`, payload)
    return response?.data;
}
export const getCities = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-cities`)
    return response?.data;
}
export const getAllDocumentUpload = async () => {
    const response = await axios.get(`${BASE_URL}/api/document-uploads`)
    return response?.data;
}
export const addNewDocumentUpload = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/document-uploads`, payload)
    return response?.data;
}
export const updateDocumentUploadById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/document-uploads/${id}`, payload)
    return response?.data;
}
export const deleteDocumentUploadById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/document-uploads/${id}`)
    return response?.data;
}
export const getAllSubjects = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-subject`);
    return response?.data;
};
export const getAllUniqueSubjectCount = async () => {
    const response = await axios.get(`${BASE_URL}/api/subject-count`);
    return response?.data;
};
export const getSubjectByClassId = async (classId) => {
    const response = await axios.get(`${BASE_URL}/api/subject/${classId}`);
    return response?.data;
};
export const addNewSubject = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/create-subject`, payload);
    return response?.data;
};
export const updateSubjectById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-subject/${id}`, payload);
    return response?.data;
};
export const deleteSubjectById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-subject/${id}`);
    return response?.data;
};

export const getAllTCRecords = async () => {
    const response = await axios.get(`${BASE_URL}/api/transfer-certificates`);
    return response?.data;
}
export const getLastTCNumber = async () => {
    const response = await axios.get(`${BASE_URL}/api/transfer-certificates/last-tc-number`);
    return response?.data;
}
export const generateTransferCertificate = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/transfer-certificates`, payload);
    return response?.data;
}
export const updateTransferCertificateById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/transfer-certificates/${id}`, payload);
    return response?.data;
}
export const deleteTransferCertificateById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-transfer-certificates/${id}`);
    return response?.data;
}

export const getAllSchoolAccounts = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-schoolAccount`)
    return response?.data;
}
export const addNewSchoolAccount = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/create-schoolAccount`, payload)
    return response?.data;
}
export const updateSchoolAccountById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-schoolAccount/${id}`, payload)
    return response?.data;
}
export const getFeeGroups = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-fee-groups`)
    return response?.data;
}
export const getAllFeeSetting = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-fee-settings`)
    return response?.data;
}
export const updateFeeSetting = async (payload) => {
    const response = await axios.put(`${BASE_URL}/api/add-fee-settings`, payload)
    return response?.data;
}

export const getAllStudents = async () => {
    const response = await axios.get(`${BASE_URL}/api/students/search`)
    return response?.data;
}
export const getTotalStudentsCount = async () => {
    const response = await axios.get(`${BASE_URL}/api/students-total`)
    return response?.data;
}
export const getStudentsData = async () => {
    const response = await axios.get(`${BASE_URL}/api/students`)
    return response?.data;
}
export const getStudentByRegistrationId = async (studentId) => {
    const response = await axios.get(`${BASE_URL}/api/students/search?registration_id=${studentId}`)
    return response?.data;
}

export const assignStudentsRollNo = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/students/roll-number-assigned-Students`, payload)
    return response?.data;
}
export const promoteStudents = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/students/promote`, payload)
    return response?.data;
}
export const getAllBanks = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-banks`)
    return response?.data;
}
export const addNewBank = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/add-banks`, payload)
    return response?.data;
}
export const updateBankById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-banks/${id}`, payload)
    return response?.data;
}
export const deleteBankById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-banks/${id}`)
    return response?.data;
}
export const getAllPettyHeads = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-petty-heads`)
    return response?.data;
}
export const addNewPettyHead = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/add-petty-heads`, payload)
    return response?.data;
}
export const updatePettyHeadById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-petty-heads/${id}`, payload)
    return response?.data;
}
export const deletePettyHeadById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-petty-heads/${id}`)
    return response?.data;
}


export const getAllVehicleTypes = async () => {
    const response = await axios.get(`${BASE_URL}/api/vehicleTypes`)
    return response?.data;
}
export const getAllVehicles = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-vehicles`)
    return response?.data;
}
export const getAllRoutes = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-routes`)
    return response?.data;
}
export const getAllFuelFillings = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-fuel-fillings`)
    return response?.data;
}
export const addNewVehicleType = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/vehicleType`, payload)
    return response?.data;
}
export const addNewVehicle = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/create-vehicles`, payload)
    return response?.data;
}
export const addNewRoute = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/create-routes`, payload)
    return response?.data;
}
export const addNewFuelFilling = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/create-fuel-fillings`, payload)
    return response?.data;
}
export const updateVehicleTypeById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/vehicleType/${id}`, payload)
    return response?.data;
}
export const updateVehicleById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-vehicles/${id}`, payload)
    return response?.data;
}
export const updateRouteById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-routes/${id}`, payload)
    return response?.data;
}
export const updateFuelFillingById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-fuel-fillings/${id}`, payload)
    return response?.data;
}
export const deleteVehicleTypeById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/vehicleType/${id}`)
    return response?.data;
}
export const deleteVehicleById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-vehicles/${id}`)
    return response?.data;
}
export const deleteRouteById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-routes/${id}`)
    return response?.data;
}
export const deleteFuelFillingById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-fuel-fillings/${id}`)
    return response?.data;
}
export const getRoutes = async () => {
    const response = await axios.get(`${BASE_URL}/api/routes`);
    return response?.data;
}
export const getAllStudentVehicles = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-studentVehicle`);
    return response?.data;
}
export const addNewStudentVehicle = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/assign-studentVehicle`, payload);
    return response?.data;
}
export const updateStudentVehicleById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-studentVehicle/${id}`, payload);
    return response?.data;
}
export const deleteStudentVehicleById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/student-vehicle/${id}`);
    return response?.data;
}
export const getAllPickupPoints = async () => {
    const response = await axios.get(`${BASE_URL}/api/pickup-points`);
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
export const addNewFeeConcessionEntry = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/create-concession`, payload)
    return response?.data;
}

export const getAllInstallments = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-installments`)
    return response?.data;
}
export const addNewInstallment = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/add-installments`, payload)
    return response?.data;
}
export const updateInstallmentById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-installments/${id}`, payload)
    return response?.data;
}
export const deleteInstallmentById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-installments/${id}`)
    return response?.data;
}

export const getAllHeads = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-fee-type`)
    return response?.data;
}
export const addNewHead = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/add-fee-type`, payload)
    return response?.data;
}

export const updateHeadById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-fee-type/${id}`, payload)
    return response?.data;
}

export const deleteHeadById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-fee-type/${id}`)
    return response?.data;
}
export const getAllPaymentMode = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-payment-mode`)
    return response?.data;
}

export const getFeeStructures = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-fee-structure`)
    return response?.data;
}
export const addNewFeeStructure = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/create-fee-structure`, payload)
    return response?.data;
}
export const updateFeeStructureById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-fee-structure/${id}`, payload)
    return response?.data;
}
export const deleteFeeStructureById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-fee-structure/${id}`)
    return response?.data;
}

export const getFeeStructureByFeeGroupId = async (feeGroupId) => {
    const response = await axios.get(`${BASE_URL}/api/get-fee-structure/${feeGroupId}`)
    return response?.data;
}

export const getFeeGroupDataBySectionId = async (sectionId) => {
    const response = await axios.get(`${BASE_URL}/api/fee-group/section/${sectionId}`)
    return response?.data;
}
export const getHeadsByInstallmentName = async (installmentName) => {
    const response = await axios.get(`${BASE_URL}/api/installments/heads/${installmentName}`)
    return response?.data;
}

export const getFeeHistoryByStudentId = async (studentId) => {
    const response = await axios.get(`${BASE_URL}/api/fee-history/${studentId}`)
    return response?.data;
}

export const addNewFeeEntry = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/fee-entries`, payload)
    return response?.data;
}
export const getAllFeeEntries = async () => {
    const response = await axios.get(`${BASE_URL}/api/fee-entries`)
    return response?.data;
}
export const getLimitedFeeEntries = async (limit) => {
    const response = await axios.get(`${BASE_URL}/api/fee-entries-limit?limit=${limit}`)
    return response?.data;
}

export const addNewFixedAmount = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/create-fixed-amounts`, payload)
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
    const response = await axios.put(`${BASE_URL}/api/students/${studentId}`, payload)
    return response?.data;
}
export const deleteStudentById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/students/${id}`)
    return response?.data;
}

export const updateBulkStudents = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/students/bulkUpdate`, payload)
    return response?.data;
}

export const addNewStudent = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/students`, payload)
    return response?.data;
}

export const getItemCategories = async () => {
    const response = await axios.get(`${BASE_URL}/api/itemCategories`)
    return response?.data;
}
export const addNewCategory = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/itemCategory`, payload)
    return response?.data;
}
export const updateCategoryById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/itemCategory/${id}`, payload)
    return response?.data;
}
export const deleteCategoryById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/itemCategory/${id}`)
    return response?.data;
}

export const getAllVendors = async () => {
    const response = await axios.get(`${BASE_URL}/api/vendors`)
    return response?.data;
}

export const addNewVendor = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/vendor`, payload,)
    return response?.data;
}

export const updateVendor = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/vendor/${id}`, payload,)
    return response?.data;
}

export const deleteVendorRecordById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/vendor/${id}`)
    return response?.data;
}

export const getQuotationStocks = async () => {
    const response = await axios.get(`${BASE_URL}/api/quotation-stocks`)
    return response?.data;
}
export const addNewQuotationStock = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/quotation-stock`, payload)
    return response?.data;
}
export const updateQuotationStockById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/quotation-stock/${id}`, payload)
    return response?.data;
}
export const deleteQuotationStockById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/quotation-stock/${id}`)
    return response?.data;
}
export const getAllItems = async () => {
    const response = await axios.get(`${BASE_URL}/api/itemMasters`)
    return response?.data;
}
export const getItemById = async (id) => {
    const response = await axios.get(`${BASE_URL}/api/itemMaster/${id}`)
    return response?.data;
}
export const addNewItem = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/itemMaster`, payload)
    return response?.data;
}

export const updateItemById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/itemMaster/${id}`, payload)
    return response?.data;
}
export const deleteItemById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/itemMaster/${id}`)
    return response?.data;
}

export const getItemsByCategoryId = async (categoryId) => {
    const response = await axios.get(`${BASE_URL}/api/items-by-category/${categoryId}`)
    return response?.data;
}

export const getAllStores = async () => {
    const response = await axios.get(`${BASE_URL}/api/stores`)
    return response?.data;
}
export const addNewStore = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/store`, payload)
    return response?.data;
}
export const deleteStoreById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/store/${id}`)
    return response?.data;
}
export const updateStoreById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/store/${id}`, payload)
    return response?.data;
}

export const getPurchaseOrders = async () => {
    const response = await axios.get(`${BASE_URL}/api/stock-purchase-orders`)
    return response?.data;
}

export const deletePurchaseOrderById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/purchase-orders/${id}`)
    return response?.data;
}

export const getAllDepartments = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-departments`)
    return response?.data;
}
export const getAllDepartmentsCount = async () => {
    const response = await axios.get(`${BASE_URL}/api/count-departments`)
    return response?.data;
}

export const getAllIssuedItems = async () => {
    const response = await axios.get(`${BASE_URL}/api/issued-items`)
    return response?.data;
}

export const addNewIssuedItem = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/issue-item`, payload)
    return response?.data;
}

export const deleteIssuedItemById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/issued-item/${id}`)
    return response?.data;
}

export const addNewStockReceive = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/stock-receive`, payload)
    return response?.data;
}
export const getAllReceivedStocks = async () => {
    const response = await axios.get(`${BASE_URL}/api/stock-receive`,)
    return response?.data;
}

export const getAllIGalleryImages = async () => {
    const response = await axios.get(`${BASE_URL}/api/images`)
    return response?.data;
}
export const addNewGalleryImage = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/images`, payload)
    return response?.data;
}
export const updateGalleryImageRecordById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/images/${id}`, payload)
    return response?.data;
}
export const deleteGalleryImageRecordById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/images/${id}`)
    return response?.data;
}

export const getAllNotices = async () => {
    const response = await axios.get(`${BASE_URL}/api/notices`)
    return response?.data;
}

export const addNewNotice = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/notices`, payload)
    return response?.data;
}
export const updateNoticeById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/notices/${id}`, payload)
    return response?.data;
}
export const deleteNoticeById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/notices/${id}`)
    return response?.data;
}

export const getAllCheckupTypes = async () => {
    const response = await axios.get(`${BASE_URL}/api/checkup-types`);
    return response?.data;
}
export const addNewCheckupType = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/checkup-types`, payload);
    return response?.data;
}
export const updateCheckupTypeById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/checkup-types/${id}`, payload);
    return response?.data;
}
export const deleteCheckupTypeById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/checkup-types/${id}`);
    return response?.data;
}


export const addNewDoctorProfile = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/doctors`, payload)
    return response?.data;
}

export const updateDoctorProfileById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/doctors/${id}`, payload)
    return response?.data;
}

export const getAllDoctors = async () => {
    const response = await axios.get(`${BASE_URL}/api/doctors`)
    return response?.data;
}
export const deleteDoctorProfileById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/doctors/${id}`)
    return response?.data;
}
export const getAllRoutineCheckups = async () => {
    const response = await axios.get(`${BASE_URL}/api/routine-checkups`)
    return response?.data;
}
export const addNewRoutineCheckup = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/routine-checkups`, payload)
    return response?.data;
}
export const deleteRoutineCheckupById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/routine-checkups/${id}`)
    return response?.data;
}
export const updateRoutineCheckupById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/routine-checkups/${id}`, payload)
    return response?.data;
}

export const getAllGalleryGroups = async () => {
    const response = await axios.get(`${BASE_URL}/api/galleryGroups`)
    return response?.data;
}
export const addNewGalleryGroup = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/galleryGroups`, payload)
    return response?.data;
}
export const updateGalleryGroupById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/galleryGroups/${id}`, payload)
    return response?.data;
}
export const deleteGalleryGroupById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/galleryGroups/${id}`)
    return response?.data;
}
export const getAllDesignations = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-designations`)
    return response?.data;
}

export const addNewDesignation = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/create-designations`, payload)
    return response?.data;
}
export const deleteDesignationById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-designations/${id}`)
    return response?.data;
}
export const updateDesignationById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-designations/${id}`, payload)
    return response?.data;
}


export const getAllAllowances = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-allowances`)
    return response?.data;
}
export const addnewAllowance = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/create-allowance`, payload)
    return response?.data;
}
export const updateAllowanceById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-allowance/${id}`, payload)
    return response?.data;
}
export const deleteAllowanceById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-allowance/${id}`)
    return response?.data;
}


export const getAllLoans = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-loans`)
    return response?.data;
}
export const addNewLoan = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/create-loan`, payload)
    return response?.data;
}
export const updateLoanById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-loan/${id}`, payload)
    return response?.data;
}
export const deleteLoanById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-loan/${id}`)
    return response?.data;
}

export const getAllAppoinmentNatures = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-nature`)
    return response?.data;
}
export const addNewAppoinmentNature = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/create-nature`, payload)
    return response?.data;
}
export const updateAppoinmentNatureById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-nature/${id}`, payload)
    return response?.data;
}
export const deleteAppoinmentNatureById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-nature/${id}`)
    return response?.data;
}
export const addNewDepartment = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/create-departments`, payload)
    return response?.data;
}
export const updateDepartmentById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-departments/${id}`, payload)
    return response?.data;
}
export const deleteDepartmentById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-departments/${id}`)
    return response?.data;
}

export const getAllGrades = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-grade`)
    return response?.data;
}
export const addNewGrade = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/create-grade`, payload)
    return response?.data;
}
export const updateGradeById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-grade/${id}`, payload)
    return response?.data;
}
export const deleteGradeById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-grade/${id}`)
    return response?.data;
}

export const getAllLeaves = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-leave`)
    return response?.data;
}
export const addNewLeave = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/create-leave`, payload)
    return response?.data;
}
export const updateLeaveById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-leave/${id}`, payload)
    return response?.data;
}
export const deleteLeaveById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-leave/${id}`)
    return response?.data;
}

export const getAllHolydays = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-holiday`)
    return response?.data;
}
export const addNewHoliday = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/create-holiday`, payload)
    return response?.data;
}
export const updateHolidayById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-holiday/${id}`, payload)
    return response?.data;
}
export const deleteHolidayById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-holiday/${id}`)
    return response?.data;
}

export const getAllEmployee = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-employee`)
    return response?.data;
}


export const addNewEmployee = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/create-employee`, payload)
    return response?.data;
}

export const deleteEmployeeById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/delete-employee/${id}`,)
    return response?.data;
}

export const updateEmployeeById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/update-employee/${id}`, payload)
    return response?.data;
}

export const addNewReturnItem = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/return-item`, payload)
    return response?.data;
}

export const addWriteOffEntry = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/write-off-item`, payload)
    return response?.data;
}
export const getAllWriteOffItems = async () => {
    const response = await axios.get(`${BASE_URL}/api/write-off-items`)
    return response?.data;
}

export const createFacultyAttendance = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/faculty-attendance`, payload)
    return response?.data;
}


export const getAdvertisementTypes = async () => {
    const response = await axios.get(`${BASE_URL}/api/advertisings`)
    return response?.data;
}
export const addNewAdvertisementType = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/advertisings`, payload)
    return response?.data;
}
export const deleteAdvertisingTypeById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/advertisings/${id}`)
    return response?.data;
}
export const updateAdvertisingTypeById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/advertisings/${id}`, payload)
    return response?.data;
}

export const getAdvertisements = async () => {
    const response = await axios.get(`${BASE_URL}/api/advertisements`)
    return response?.data;
}

export const addNewAdvertisement = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/advertisements`, payload)
    return response?.data;
}

export const updateAdvertisementById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/advertisements/${id}`, payload)
    return response?.data;
}

export const deleteAdvertisementById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/advertisements/${id}`)
    return response?.data;
}

export const getAllTeachers = async () => {
    const response = await axios.get(`${BASE_URL}/api/teachers`)
    return response?.data;
}

export const getDailyDiaryRecords = async () => {
    const response = await axios.get(`${BASE_URL}/api/dailyDairy`)
    return response?.data;
}

export const addDailyDiaryRecord = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/dailyDairy`, payload)
    return response?.data;
}

export const deleteDailyDiaryRecord = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/dailyDairy/${id}`)
    return response?.data;
}

export const updateDailyDiaryRecord = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/dailyDairy/${id}`, payload)
    return response?.data;
}

export const getAllPublishers = async () => {
    const response = await axios.get(`${BASE_URL}/api/publishers`)
    return response?.data;
}

export const addNewPublisher = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/publishers`, payload)
    return response?.data;
}

export const updatePublisherById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/publishers/${id}`, payload)
    return response?.data;
}

export const deletePublisherById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/publishers/${id}`)
    return response?.data;
}

export const getAllRacks = async () => {
    const response = await axios.get(`${BASE_URL}/api/racks`)
    return response?.data;
}
export const getAllShelves = async () => {
    const response = await axios.get(`${BASE_URL}/api/shelves`)
    return response?.data;
}
export const getShelfByRackId = async (id) => {
    const response = await axios.get(`${BASE_URL}/api/shelves/${id}`)
    return response?.data;
}
export const addNewRack = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/racks`, payload)
    return response?.data;
}
export const addNewShelf = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/shelves`, payload)
    return response?.data;
}
export const updateRackById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/racks/${id}`, payload)
    return response?.data;
}
export const updateShelfById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/shelves/${id}`, payload)
    return response?.data;
}
export const deleteRackById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/racks/${id}`)
    return response?.data;
}
export const deleteShelfById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/shelves/${id}`)
    return response?.data;
}

export const getLibraryGroups = async () => {
    const response = await axios.get(`${BASE_URL}/api/libraryGroup`)
    return response?.data;
}
export const addNewLibraryGroup = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/libraryGroup`, payload)
    return response?.data;
}
export const updateLibraryGroupById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/libraryGroup/${id}`, payload)
    return response?.data;
}
export const deleteLibraryGroupById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/libraryGroup/${id}`)
    return response?.data;
}
export const getLibraryVendors = async () => {
    const response = await axios.get(`${BASE_URL}/api/library-vendor`)
    return response?.data;
}
export const addNewLibraryVendor = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/library-vendor`, payload)
    return response?.data;
}

export const updateLibraryVendorById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/library-vendor/${id}`, payload)
    return response?.data;
}
export const deleteLibraryVendorById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/library-vendor/${id}`)
    return response?.data;
}

export const getFineMaster = async () => {
    const response = await axios.get(`${BASE_URL}/api/fine-master`)
    return response?.data;
}
export const updateFineMaster = async (payload) => {
    const response = await axios.put(`${BASE_URL}/api/fine-master`, payload)
    return response?.data;
}
export const getBookCategories = async () => {
    const response = await axios.get(`${BASE_URL}/api/bookCategories`)
    return response?.data;
}
export const addNewBookCategory = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/bookCategory`, payload)
    return response?.data;
}
export const updateBookCategoryById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/bookCategory/${id}`, payload)
    return response?.data;
}
export const deleteBookCategoryById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/bookCategory/${id}`)
    return response?.data;
}

export const addNewBookEntry = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/book-entry`, payload)
    return response?.data;
}

export const getAllBooks = async () => {
    const response = await axios.get(`${BASE_URL}/api/book-entry`)
    return response?.data;
}
export const getAllBooksCount = async () => {
    const response = await axios.get(`${BASE_URL}/api/book-entry-count`)
    return response?.data;
}

export const addNewBookSuggestion = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/book-suggestions`, payload)
    return response?.data;
}

export const getAllBookSuggestions = async () => {
    const response = await axios.get(`${BASE_URL}/api/book-suggestions`,)
    return response?.data;
}

export const deleteBookSuggestionById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/book-suggestions/${id}`,)
    return response?.data;
}

export const getAllIssuedBooks = async () => {
    const response = await axios.get(`${BASE_URL}/api/issued-books`,)
    return response?.data;
}
export const addNewIssuedBook = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/issue-book`, payload)
    return response?.data;
}
export const deleteIssuedBook = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/issue-book/${id}`)
    return response?.data;
}
export const returnIssueBookById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/return-book/${id}`, payload)
    return response?.data;
}
export const getAllReturnedBooks = async () => {
    const response = await axios.get(`${BASE_URL}/api/return-book`)
    return response?.data;
}
export const getAllThoughts = async () => {
    const response = await axios.get(`${BASE_URL}/api/thoughts`)
    return response?.data;
}
export const addNewThought = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/thoughts`, payload)
    return response?.data;
}
export const updateThoughtById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/thoughts/${id}`, payload)
    return response?.data;
}
export const deleteThoughtById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/thoughts/${id}`)
    return response?.data;
}

export const createStudentsAttendance = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/students/takeAttendance`, payload);
    return response?.data;
}
export const getStudentsByClassAndSectionAndDateRange = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/attendance/monthly-report`, payload)
    return response?.data;
}

export const getAllExamGrades = async () => {
    const response = await axios.get(`${BASE_URL}/api/examGrade`);
    return response?.data;
}
export const getAllExamTypes = async () => {
    const response = await axios.get(`${BASE_URL}/api/examTypes`);
    return response?.data;
}
export const addNewExamGrade = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/examGrade`, payload);
    return response?.data;
}
export const addNewExamType = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/examType`, payload);
    return response?.data;
}
export const updateExamGradeById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/examGrade/${id}`, payload);
    return response?.data;
}
export const updateExamTypeById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/examType/${id}`, payload);
    return response?.data;
}
export const deleteExamGradeById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/examGrade/${id}`);
    return response?.data;
}
export const deleteExamTypeById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/examType/${id}`);
    return response?.data;
}
export const addNewExamMaster = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/exam-master`, payload);
    return response?.data;
}
export const getAllExamMasters = async () => {
    const response = await axios.get(`${BASE_URL}/api/exam-master`);
    return response?.data;
}
export const getExamMasterById = async (id) => {
    const response = await axios.get(`${BASE_URL}/api/exam-master/${id}`);
    return response?.data;
}
export const getExamMasterByClassId = async (id) => {
    const response = await axios.get(`${BASE_URL}/api/exam-master-byClass/${id}`);
    return response?.data;
}
export const updateExamMasterById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/exam-master/${id}`, payload);
    return response?.data;
}
export const deleteExamMasterById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/exam-master/${id}`);
    return response?.data;
}

export const addExamMarksEntry = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/marks-entry`, payload);
    return response?.data;
}

export const getExamsTimeTable = async (filterBy) => {
    const response = await axios.get(`${BASE_URL}/api/exam-master-timetable`, {
        params: filterBy
    });
    return response?.data;
}
export const getClassTecherAllotments = async () => {
    const response = await axios.get(`${BASE_URL}/api/classteacherallotment`);
    return response?.data;
}

export const addNewClassTeacherAllotment = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/classteacherallotment`, payload);
    return response?.data;
}
export const deleteClassTeacherAllotmentById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/classteacherallotment/${id}`);
    return response?.data;
}
export const getAllSubjectCategories = async () => {
    const response = await axios.get(`${BASE_URL}/api/subject-categories`);
    return response?.data;
}
export const getAllSubjectSubCategories = async () => {
    const response = await axios.get(`${BASE_URL}/api/subject-subcategories`);
    return response?.data;
}
export const getAllRemarks = async () => {
    const response = await axios.get(`${BASE_URL}/api/remark-master`);
    return response?.data;
}
export const addNewSubjectCategory = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/subject-categories`, payload);
    return response?.data;
}
export const addNewSubjectSubCategory = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/subject-subcategories`, payload);
    return response?.data;
}
export const addNewRemark = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/remark-master`, payload);
    return response?.data;
}
export const deleteSubjectCategoryById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/subject-categories/${id}`);
    return response?.data;
}
export const deleteSubjectSubCategoryById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/subject-subcategories/${id}`);
    return response?.data;
}
export const deleteRemarkById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/remark-master/${id}`);
    return response?.data;
}
export const updateSubjectCategoryById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/subject-categories/${id}`, payload);
    return response?.data;
}
export const updateSubjectSubCategoryById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/subject-subcategories/${id}`, payload);
    return response?.data;
}
export const updateRemarkById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/remark-master/${id}`, payload);
    return response?.data;
}

export const getStudentReport = async (filterBy) => {
    const response = await axios.get(`${BASE_URL}/api/student-report`, {
        params: filterBy
    });
    return response?.data;
}

export const getAllExpenses = async () => {
    const response = await axios.get(`${BASE_URL}/api/expense-entry`);
    return response?.data;
}
export const addNewExpense = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/expense-entry`, payload);
    return response?.data;
}
export const updateExpenseById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/expense-entry/${id}`, payload);
    return response?.data;
}
export const deleteExpenseById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/expense-entry/${id}`);
    return response?.data;
}
export const getMailInRecords = async () => {
    const response = await axios.get(`${BASE_URL}/api/mail-in`);
    return response?.data;
}
export const addNewMailInRecord = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/mail-in`, payload);
    return response?.data;
}
export const updateMailInRecordById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/mail-in/${id}`, payload);
    return response?.data;
}
export const deleteMailInRecordById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/mail-in/${id}`);
    return response?.data;
}
export const getMailOutRecords = async () => {
    const response = await axios.get(`${BASE_URL}/api/mail-out`);
    return response?.data;
}
export const addNewMailOutRecord = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/mail-out`, payload);
    return response?.data;
}
export const updateMailOutRecordById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/mail-out/${id}`, payload);
    return response?.data;
}
export const deleteMailOutRecordById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/mail-out/${id}`);
    return response?.data;
}

export const getAllAddressBooks = async () => {
    const response = await axios.get(`${BASE_URL}/api/address-book`)
    return response?.data;
}
export const addNewAddressbook = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/address-book`, payload)
    return response?.data;
}
export const updateAddressBookById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/address-book/${id}`, payload)
    return response?.data;
}
export const deleteAddressBookById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/address-book/${id}`)
    return response?.data;
}


export const addNewGatePass = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/gate-pass`, payload)
    return response?.data;
}
export const deleteGatePassById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/gate-pass/${id}`,)
    return response?.data;
}
export const getAllGatePasses = async () => {
    const response = await axios.get(`${BASE_URL}/api/gate-pass`)
    return response?.data;
}

export const getAllDepositAmounts = async () => {
    const response = await axios.get(`${BASE_URL}/api/deposit-amount`);
    return response?.data;
}
export const addNewDepositAmount = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/deposit-amount`, payload);
    return response?.data;
}
export const deleteDepositAmountById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/deposit-amount/${id}`);
    return response?.data;
}
export const getAllDailyTransactions = async () => {
    const response = await axios.get(`${BASE_URL}/api/daily-transaction`);
    return response?.data;
}
export const addNewDailyTransaction = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/daily-transaction`, payload);
    return response?.data;
}
export const deleteDailyTransactionById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/daily-transaction/${id}`);
    return response?.data;
}

export const getYoutubeVideoGroups = async () => {
    const response = await axios.get(`${BASE_URL}/api/youtube-videogroups`);
    return response?.data;
}
export const addNewYoutubeVideoGroup = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/youtube-videogroup`, payload);
    return response?.data;
}
export const updateYoutubeVideoGroupById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/youtube-videogroup/${id}`, payload);
    return response?.data;
}
export const deleteYoutubeVideoGroupById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/youtube-videogroup/${id}`);
    return response?.data;
}
export const getAllYoutubeVideos = async () => {
    const response = await axios.get(`${BASE_URL}/api/youtube-videos`);
    return response?.data;
}
export const addNewYoutubeVideo = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/youtube-video`, payload);
    return response?.data;
}
export const deleteYoutubeVideoById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/youtube-video/${id}`);
    return response?.data;
}
export const updateYoutubeVideoById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/youtube-video/${id}`, payload);
    return response?.data;
}
export const getAllSyllabus = async () => {
    const response = await axios.get(`${BASE_URL}/api/syllabus`);
    return response?.data;
}
export const uploadSyllabus = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/syllabus`, payload);
    return response?.data;
}
export const updateSyllabusById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/syllabus/${id}`, payload);
    return response?.data;
}
export const deleteSyllabusById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/syllabus/${id}`);
    return response?.data;
}

export const getAllHomeWork = async () => {
    const response = await axios.get(`${BASE_URL}/api/homework`);
    return response?.data;
}
export const addNewHomeWork = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/homework`, payload);
    return response?.data;
}
export const deleteHomeWorkById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/homework/${id}`);
    return response?.data;
}
export const updateHomeworkById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/homework/${id}`, payload);
    return response?.data;
}

export const getAlltimeTables = async () => {
    const response = await axios.get(`${BASE_URL}/api/timetable`);
    return response?.data;
}
export const addNewTimeTable = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/timetable`, payload);
    return response?.data;
}
export const updateTimeTableById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/timetable/${id}`, payload);
    return response?.data;
}
export const deleteTimeTableById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/timetable/${id}`);
    return response?.data;
}

export const getAllStudentEvaluations = async (classId, sectionId, evalDate) => {
    const response = await axios.get(`${BASE_URL}/api/student-evaluation?classId=${classId}&sectionId=${sectionId}&evalDate=${evalDate}`);
    return response?.data;
}
export const addNewStudentEvaluation = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/student-evaluation`, payload);
    return response?.data;
}
export const deleteStudentEvaluationById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/student-evaluation/${id}`);
    return response?.data;
}
export const getAllVisitorEntries = async () => {
    const response = await axios.get(`${BASE_URL}/api/visitor-entries`);
    return response?.data;
}
export const addNewVisitorEntry = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/visitor-entry`, payload);
    return response?.data;
}
export const deleteVisitorEntryById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/visitor-entry/${id}`);
    return response?.data;
}
export const updateVisitorEntryById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/visitor-entry/${id}`, payload);
    return response?.data;
}
export const getAllCopyChecks = async () => {
    const response = await axios.get(`${BASE_URL}/api/copy-check`);
    return response?.data;
}
export const addNewCopyCheck = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/copy-check`, payload);
    return response?.data;
}

export const getAllAppointments = async () => {
    const response = await axios.get(`${BASE_URL}/api/appointments`);
    return response?.data;
}
export const addNewAppointment = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/appointment`, payload);
    return response?.data;
}
export const deleteAppointmentById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/appointment/${id}`);
    return response?.data;
}

export const getAllSliderImages = async () => {
    const response = await axios.get(`${BASE_URL}/api/slider-images`);
    return response?.data;
}
export const addNewSliderImage = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/slider-image`, payload);
    return response?.data;
}
export const deleteSliderImageById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/slider-image/${id}`);
    return response?.data;
}
export const updateSliderImageById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/slider-image/${id}`, payload);
    return response?.data;
}

export const getAllMainMenus = async () => {
    const response = await axios.get(`${BASE_URL}/api/main-menus`);
    return response?.data;
}
export const addNewMainMenu = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/main-menu`, payload);
    return response?.data;
}
export const deleteMainMenuById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/main-menu/${id}`);
    return response?.data;
}
export const updateMainMenuById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/main-menu/${id}`, payload);
    return response?.data;
}

export const getSubMenuById = async (id) => {
    const response = await axios.get(`${BASE_URL}/api/sub-menu/${id}`);
    return response?.data;
}
export const getAllSubMenus = async () => {
    const response = await axios.get(`${BASE_URL}/api/sub-menus`);
    return response?.data;
}
export const addNewSubMenu = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/sub-menu`, payload);
    return response?.data;
}
export const deleteSubMenuById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/sub-menu/${id}`);
    return response?.data;
}
export const updateSubMenuById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/sub-menu/${id}`, payload);
    return response?.data;
}

export const getSubMenusByMainMenuId = async (id) => {
    const response = await axios.get(`${BASE_URL}/api/sub-menus/${id}`);
    return response?.data;
}
export const getAllLastSubMenus = async (id) => {
    const response = await axios.get(`${BASE_URL}/api/last-submenus`);
    return response?.data;
}
export const addNewLastSubMenu = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/last-submenu`, payload);
    return response?.data;
}
export const deleteLastSubMenuById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/last-submenu/${id}`);
    return response?.data;
}
export const updateLastSubMenuById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/last-submenu/${id}`, payload);
    return response?.data;
}
export const getAllPublicationImages = async (id) => {
    const response = await axios.get(`${BASE_URL}/api/publication-images`);
    return response?.data;
}
export const addNewPublicationImage = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/publication-image`, payload);
    return response?.data;
}
export const deletePublicationImageById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/publication-image/${id}`);
    return response?.data;
}
export const updatePublicationImageById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/publication-image/${id}`, payload);
    return response?.data;
}
export const getAllTemplates = async () => {
    const response = await axios.get(`${BASE_URL}/api/page-templates`);
    return response?.data;
}
export const addNewTemplate = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/page-templates`, payload);
    return response?.data;
}
export const addNewPage = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/add-page`, payload);
    return response?.data;
}
export const getPageById = async (pageId) => {
    const response = await axios.get(`${BASE_URL}/api/pages/${pageId}`);
    return response?.data;
}
export const getAllPages = async () => {
    const response = await axios.get(`${BASE_URL}/api/pages`);
    return response?.data;
}
export const deletePageById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/pages/${id}`);
    return response?.data;
}

export const getAllFitIndiaGroups = async () => {
    const response = await axios.get(`${BASE_URL}/api/fit-india-groups`)
    return response?.data;
}
export const addNewFitIndiaGroup = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/fit-india-group`, payload)
    return response?.data;
}
export const updateFitIndiaGroupById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/fit-india-group/${id}`, payload)
    return response?.data;
}
export const deleteFitIndiaGroupById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/fit-india-group/${id}`)
    return response?.data;
}

export const getAllFitIndiaImages = async () => {
    const response = await axios.get(`${BASE_URL}/api/fitindia-images`)
    return response?.data;
}
export const addNewFitIndiaImage = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/fitindia-image`, payload)
    return response?.data;
}
export const updateFitIndiaImageById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/fitindia-image/${id}`, payload)
    return response?.data;
}
export const deleteFitIndiaImageById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/fitindia-image/${id}`)
    return response?.data;
}

export const getContactDetails = async () => {
    const response = await axios.get(`${BASE_URL}/api/contact-details`)
    return response?.data;
}
export const updateContactDetail = async (payload) => {
    const response = await axios.put(`${BASE_URL}/api/contact-details`, payload)
    return response?.data;
}
export const getAllComplaints = async () => {
    const response = await axios.get(`${BASE_URL}/api/complaints`,)
    return response?.data;
}
export const addNewComplaint = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/complaints`, payload)
    return response?.data;
}
export const deleteComplaintById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/complaints/${id}`)
    return response?.data;
}
export const updateComplaintById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/complaints/${id}`, payload)
    return response?.data;
}
export const getAllImportantSMS = async () => {
    const response = await axios.get(`${BASE_URL}/api/important-sms`)
    return response?.data;
}
export const addNewImportantSMS = async (payload) => {
    const response = await axios.post(`${BASE_URL}/api/important-sms`, payload)
    return response?.data;
}
export const updateSMSById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/important-sms/${id}`, payload)
    return response?.data;
}
export const deleteSMSById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/important-sms/${id}`)
    return response?.data;
}