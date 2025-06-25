import axios from "axios";

export const BASE_URL = 'https://erp-backend-fy3n.onrender.com'
// export const BASE_URL = 'http://localhost:8000'
axios.interceptors.response.use(
    (response) => {
        if (response.data?.error === "Token expired") {
            localStorage.removeItem("authToken");
            sessionStorage.removeItem("authToken");
            window.location.href = "/login"; // or "/"
        }
        return response;
    },
    (error) => {
        if (error.response?.data?.error === "Token expired") {
            localStorage.removeItem("authToken");
            sessionStorage.removeItem("authToken");
            window.location.href = "/login"; // or "/"
        }
        return Promise.reject(error);
    }
);

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
export const deleteReligionById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/religions/${id}`)
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
export const getAllSubjetcs = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-subject`);
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

export const getFeeGroups = async () => {
    const response = await axios.get(`${BASE_URL}/api/all-fee-groups`)
    return response?.data;
}

export const getAllStudents = async () => {
    const response = await axios.get(`${BASE_URL}/api/students/search`)
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

export const getAllIGalleryImages = async () => {
    const response = await axios.get(`${BASE_URL}/api/images`)
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

export const updateNoticeById = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/api/notices/${id}`, payload)
    return response?.data;
}

export const deleteNoticeById = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/notices/${id}`)
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

export const getAdvertisementTypes = async () => {
    const response = await axios.get(`${BASE_URL}/api/advertisings`)
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