// renamed to intertia
// version 4 - with filename version 4

import { useForm } from '@inertiajs/vue3'

export function useExtendedForm(data) {
    // Create the form instance from useForm
    const form = useForm(data);

    const originalJsonData = JSON.stringify(data);

    // Add custom methods or properties to the form
    // form.isChanged = function () {
    //     console.log(983280932803280);
    // };

    // Custom method to get only the form data
    form.getCurrentData = function() {
        // Create a copy of the current form data (only the keys that exist in the original form data)
        const formDataKeys = Object.keys(data);
        const currentData = {};

        formDataKeys.forEach((key) => {
            currentData[key] = this[key];
        });

        return currentData;
    };

    form.isChanged = function() {
        return this.originalJsonData !== JSON.stringify(this.getCurrentData());
    };

    form.resetFormdata = function() {
        const savedData = JSON.parse(this.originalJsonData);

        // Loop over each field and update the form values
        Object.keys(savedData).forEach((key) => {
            this[key] = savedData[key];
        });
    }


    /**
     * Fill current data
     */
    form.setCurrentDataAsOriginal = function() {
        this.originalJsonData = JSON.stringify(this.getCurrentData());
    };

    return form;
}
