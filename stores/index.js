import axios from 'axios';
// const $axios = axios().provide.axios;

export const useGlobalStore = defineStore(
    'global',
    () => {
        let globalLoader = ref(false);
        const token = useCookie();
        const coreCategories = ref([]);
        const coreSubCategories = ref([]);
        const data = reactive({
            products: []
        });

        const studentEnrollment = reactive({});
        const getClassMap = computed(() => {
            let temp = [];


            classSetup?.classDetailsMap.map((item) => {
                let obj = { class: null, items: [] };
                item.class_details.map((v, i) => {
                    if (i == 0) {
                        obj.class = v.class_name;
                    }
                    obj.items.push(v);
                });

                temp.push({
                    cls: item,
                    obj
                });
            });
            console.log(temp);
            return temp;
        });
        const classSetup = reactive({
            shifts: [],
            sections: [],
            groups: [],
            classDetailsMap: [],
            classes: []
        });
        const authUser = reactive({
            user: null,
            authorization: {
                token: null
            }
        });
        const isLoading = ref(false);
        const isAuthenticated = ref(false);
        const authError = reactive({
            email: null,
            password: null
        });

        // async function getRequest(url, params = {}) {
        //     return $axios.get(url, params);
        // }
        // async function postRequest(url, params = {}) {
        //     return $axios.get(url, params);
        // }
        const getProducts = computed(() => data.products);

        const fetchCoreCategories = async () => {
            const res = await axios.get('core-category');
            coreCategories.value = res.data.corecategories;
        };
        async function getSubcategoryByCategory(item) {
            coreSubCategories.value = null;
            const response = await axios.get(`core-subcategories/${item.value.id}`);
            coreSubCategories.value = response.data.payload.data;

            console.log(coreSubCategories.value);
        }
        const fetchClassSetupData = async () => {
            try {
                const { data } = await axios.get('class-details-map');
                classSetup.classes = data.payload.data.classes;
                classSetup.shifts = data.payload.data.shifts;
                classSetup.sections = data.payload.data.sections;
                classSetup.groups = data.payload.data.groups;
                classSetup.classDetailsMap = data.payload.data.classDetailsMap;
            } catch (error) { 
                console.log(error);
            }
        };

        async function store(id, name) {
            try {
                const response = await $axios.post(
                    'core-subcategories/store',
                    {
                        core_category_id: id,
                        core_subcategory_name: name
                    },
                    { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
                );

                console.log(authUser.authorization.token);
            } catch (error) {
                console.log(error);
            }
        }

        async function fetchStudentEnrollmentData() {
            let { data } = await axios.get('student-enrollment');
            studentEnrollment.academicSession = data.payload.data.academicSession;
            studentEnrollment.academicYears = data.payload.data.academicYears;
            studentEnrollment.category = data.payload.data.category;
            studentEnrollment.instituteClassMap = data.payload.data.instituteClassMap;

            studentEnrollment.classes = studentEnrollment.instituteClassMap.map((item) => {
                return { classId: item.class_id, className: item.class_name };
            });
        }

        function getUniqueValues(arr) {
            const uniqueSet = new Set();

            const uniqueArray = arr.filter((item) => {
                const stringifiedItem = JSON.stringify(item);
                const isUnique = !uniqueSet.has(stringifiedItem);

                if (isUnique) {
                    uniqueSet.add(stringifiedItem);
                }

                return isUnique;
            });

            return uniqueArray;
        }

        let classShiftSectionData = reactive({});

        async function fetchStudentListData() {
            let temp = [];
            let { data } = await axios.get('student-enrollment');
            classShiftSectionData.years = data.payload.data.academicYears;
            classShiftSectionData.classMap = data.payload.data.instituteClassMap;

            data.payload.data.instituteClassMap.map((item) => {
                let t = [];
                item.class_details.map((i) => {
                    t.push({
                        shift: i.shifts,
                        section: i.sections
                    });
                });

                temp.push({
                    id: item.id,
                    class: item.class_id,
                    class_name: item.class_name,
                    class_details: t
                });
            });

            let abc = [];
            temp.map((cls) => {
                let h = '';
                getUniqueValues(cls.class_details).forEach((i) => {
                    h = `${cls.class_name}-${i.shift.core_subcategory_name}-${i.section.core_subcategory_name}`;
                    abc.push({
                        id: cls.id,
                        combination: h,
                        shift: i.shift.id,
                        section: i.section.id
                    });
                });
            });

            classShiftSectionData.classes = abc;
        }

        async function updateStudentBasicInfo(formData) {
            try {
                const response = await axios.post('/student-update/basic-info-store', formData);
                const { message } = response.data.payload.data;
                // if (response.data.payload.data.status == 'success') {
                return { success: true, message: message, error: null };
                // }
            } catch (error) {
                if (error.response) {
                    const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
                    const formattedErrors = errors.map(err => `${err.message}`).join('\n');
                    return { success: false, error: formattedErrors };
                } else {
                    return { success: false, error: "An error occurred during login." };
                }
            }
        }


        let FeeState = reactive({
            feeStartupData: {
                feeHead: [],
                feeSubHead: [],
                waiver: [],
                fund: [],
                ledger: [],
                accountCategory: [],
                accountGroup: [],
            },
        });

        async function fetchFeeStartups() {
            try {
                let { data } = await axios.get('/fees-management/startup');
                FeeState.feeStartupData.feeHead = data.payload.data.feeHead;
                FeeState.feeStartupData.feeSubHead = data.payload.data.feeSubhead;
                FeeState.feeStartupData.waiver = data.payload.data.waiver;
                FeeState.feeStartupData.fund = data.payload.data.fund;
                FeeState.feeStartupData.ledger = data.payload.data.ledger;
                FeeState.feeStartupData.accountCategory = data.payload.data.accountCategory;
                FeeState.feeStartupData.accountGroup = data.payload.data.accountGroup;
            } catch (error) {
                console.error('Error fetching fee startups:', error);
            }
        }

        // /fees-management/mapping

        let feeMapState = reactive({
            feemaps: {
                feeMapping: [],
                fineMapping: [],
                opsMapping: [],
            },
        });

        async function fetchFeeMaps() {
            try {
                let { data } = await axios.get('fees-management/mapping');
                feeMapState.feemaps.feeMapping = data.payload.data.feeMapping
                feeMapState.feemaps.fineMapping = data.payload.data.fineMapping
                feeMapState.feemaps.opsMapping = data.payload.data.opsMapping
            } catch (error) {
                console.error('Error fetching fee startups:', error);
            }
        }

        return {
            token,
            getSubcategoryByCategory,
            coreSubCategories,
            getClassMap,
            fetchCoreCategories,
            coreCategories,
            fetchClassSetupData,
            classSetup,
            getProducts,
            authError,
            isAuthenticated,
            fetchStudentEnrollmentData,
            studentEnrollment,
            fetchStudentListData,
            updateStudentBasicInfo,

            feeStartupData: FeeState.feeStartupData,
            fetchFeeStartups,

            feemaps: feeMapState.feemaps,
            fetchFeeMaps,

            classShiftSectionData,
            globalLoader
        };
    }
);
