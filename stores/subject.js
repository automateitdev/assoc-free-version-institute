

import { getRequest } from "~/utils/request";


export const useSubjectStore = defineStore('subject', () => {

    let orderFlag = ref(0);
    let subjectData = reactive({
        academicYears: [],
        subjectTypes: [],
        subjects: [],
        classes: [],
        groups: [],
        groupSubjectList: [],
        commonSubjectList: []

    });

    let arsSub = ref([])
    let finalFromData = reactive({
        common: []
    });
    let subs = computed(() => {
        return subjectData.academicYears.map(item => {
            return item.coresubcategory_details.core_subcategory_name + "40"
        });
    });

    let getGroupSubs = computed(() => {
        return subjectData.subjects.filter(item => {
            return formData.compulsorySubjects.includes(item.id)
        });
    });

    let remainingSubjects = reactive({
        data: null,
    });

    const updateRemainingSubjects = () => {
        remainingSubjects.data = [];

        if (formData.compulsorySubjects.length === 0) {
            remainingSubjects.data = [...subjectData.subjects];
        } else {
            remainingSubjects.data = subjectData.subjects.filter(subject =>
                !formData.compulsorySubjects.some(compSubject => compSubject.id === subject.id)
            );
        }
    };

    let formData = reactive({
        year: null,
        class: null,
        compulsorySubjects: [],
        groups: [],
        subjects: [],
        groupSubjectList: [],
        ars: [],
        selectedSubjects: [], // Selected subjects for the group
    });


    const fetchSubjectData = async () => {
        try {

            const { data } = await axios.get("subject-configs");

            subjectData.academicYears = data.academicYears;
            subjectData.subjectTypes = data.subjectType;
            subjectData.subjects = data.subjects;
            subjectData.commonSubjectList = data.subjects;
            arsSub.value = data.subjects;
            subjectData.classes = data.instituteClassMap;
            subjectData.commonTypes = subjectData.subjectTypes.filter(item => {
                return item.id === 1 || item.id === 3 || item.id === 4;
            });
            subjectData.groupTypes = subjectData.subjectTypes.filter(item => {
                return item.id === 2 || item.id === 3
            });

            updateRemainingSubjects();
            // console.log(subjectData.commonTypes);
            // console.log(data);
        } catch (error) {

        } finally {

        }
    }


    async function fetchGroupByClass(id) {
        try {

            const { data: { groups } } = await getRequest(`class-details-map/show/${id}`);
            subjectData.groups = groups;
            //    console.log(subjectData.groups);


        } catch (error) {

        } finally {

        }
    }

    watch(() => formData.compulsorySubjects, () => {
        updateRemainingSubjects();
    });

    return {

        fetchSubjectData, subjectData, formData, fetchGroupByClass, subs, getGroupSubs, finalFromData, orderFlag, arsSub, remainingSubjects
    };
}
);