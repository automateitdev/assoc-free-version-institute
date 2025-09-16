export function getUniqueValues(arr) {
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

export default function getCombinationPivot(clsMap, group, shift, section) {
    return clsMap.find(({ id }) => id == id)?.class_details.find(({ group_id, shift_id, section_id }) => group_id == group && shift_id == shift && section_id == section)?.pivot.id || null;
}

export const rowParPageArraySort = (arr, total) => {
    let getArray = [];
    arr.forEach((rpo) => {
        getArray.push(rpo);
    });
    getArray.push(total);
    getArray.sort(function (a, b) {
        return a - b;
    });
    return getArray;
};

export const ucFirst = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const dateFormate = (dateString) => {
    // Create a Date object from the string
    var date = new Date(dateString);

    // Extract year, month, and day components
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed, so add 1
    var day = date.getDate().toString().padStart(2, '0');

    // Form the formatted date string in the desired format (e.g., "YYYY-MM-DD")
    var formattedDate = year + '-' + month + '-' + day;
    return formattedDate;
};


export function classShiftSection(clsMap){
    let temp = [];
    clsMap.map((item) => {
        let t = [];
        item.class_details.map((i) => {
            t.push({
                shift: i.shifts,
                section: i.sections,
                group: i.groups,
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
                section: i.section.id,
                group: i.group.id
            });
        });
    });

    return abc;

}

// dd-M-yy to laravel format
export function formatMultipleDates(dates) {
    // console.log(dates);
    if (!dates || !Array.isArray(dates) || dates.length === 0) {
        return [];
    }

    return dates
        .map((date) => {
            const parsedDate = new Date(date);

            if (isNaN(parsedDate.getTime())) {
                // Handle invalid date, e.g., log an error
                // console.error(`Invalid date: ${date}`);
                return ''; // Or any other fallback value
            }

            const formattedDate = parsedDate.toLocaleDateString('en-CA', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit'
            });

            return formattedDate;
        })
}



export function formatSingleDate(date) {

    if (!date) {
        return null;
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
        // Handle invalid date, e.g., log an error
        console.error(`Invalid date: ${date}`);
        return null; // Or any other fallback value
    }

    const formattedDate = parsedDate.toLocaleDateString('en-CA', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit'
    });

    return formattedDate;
}


export const StudentService = {

    getStudentsSmall() {
        return Promise.resolve(this.getData().slice(0, 10));
    },

    getStudentsMedium() {
        return Promise.resolve(this.getData().slice(0, 50));
    },

    getStudentsLarge() {
        return Promise.resolve(this.getData().slice(0, 200));
    },

    getStudentsXLarge() {
        return Promise.resolve(this.getData());
    },

    getStudents(params) {
        const queryParams = params
            ? Object.keys(params)
                .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
                .join('&')
            : '';
        return postRequest(`student-list?${queryParams}`, {add});
    }
};

export function formatDateToDdMYY(dateString) {
    if (!dateString) {
        return null;
    }

    const parsedDate = new Date(dateString);

    if (isNaN(parsedDate.getTime())) {
        // Handle invalid date, e.g., log an error
        console.error(`Invalid date: ${dateString}`);
        return null; // Or any other fallback value
    }

    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(parsedDate);

    const day = parts.find(part => part.type === 'day').value;
    const month = parts.find(part => part.type === 'month').value;
    const year = parts.find(part => part.type === 'year').value;

    return `${day}-${month}-${year}`;
}

