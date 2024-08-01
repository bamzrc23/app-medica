export function objectToFormdata(objeto) {
    const formData = new FormData();
    for (const key in objeto) {
        if (Object.hasOwnProperty.call(objeto, key)) {
            formData.append(key, objeto[key]);
        }
    }
    return formData;
}

