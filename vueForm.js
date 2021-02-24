// version 17

window.VueForm = class VueForm {
    /**
     * Create a new Form instance.
     *
     * @param  {object} data
     */
    constructor(formData) {
        this.sendJsonFormData = true;
        this.originalFormData = {...formData};
        this.formData = formData;
        this.vueErrors = new VueErrors(formData);
        this.busy = [];
    }

    /**
     * Fetch all relevant data for the form.
     */
    getFormData() {

        // init
        let formData = null

        // how to send
        if (this.sendJsonFormData === true) {

            // we parse formData to json to handle null and Data objects (middleware needed)
            formData = this.parseFormData();

        } else {

            // we have to rewrite formData to handle null and Date objects
            formData = this.rewriteFormData();
        }

        return formData;
    }

    /*
     * parse form data
     */
    parseFormData() {

        // init object
        let formData = new FormData()
        let json = {}

        // gather info
        for (let property in this.originalFormData) {

            // also add values as stringify to keep null
            if (this.formData[property] instanceof File) {

                // add file
                formData.append(property, this.formData[property])

            // date object in javascript changes date to use timezone
            } else if (this.formData[property] instanceof Date) {

                //
                json[property] = this.parseDateObject(this.formData[property]);

            // add everything else
            } else {

                // add to json
                json[property] = this.formData[property];
            }
        }

        // add normal values and uploads together
        formData.append('json', JSON.stringify(json));

        return formData;
    }

    rewriteFormData() {

        // init object
        let formData = new FormData()

        // gather info
        for (let property in this.originalFormData) {

            // if null dont sent
            if (this.formData[property] === null) {
                continue;
            }
            // if null dont sent
            if (typeof this.formData[property] === 'undefined') {
                continue;
            }

            // init value
            let value = '';

            // if bool
            if (typeof this.formData[property] === "boolean") {

                // set
                value = Number(this.formData[property]);

            // if date
            } else if (this.formData[property] instanceof Date) {

                //
                value = this.parseDateObject(this.formData[property]);

            // if already string
            } else {

                // set
                value = this.formData[property];
            }

            // add to form
            formData.append(property, value);
        }

        return formData;
    }

    /*
     * parse data object
     */
    parseDateObject(date_object)
    {
        // set date (cannot use iso because it changes the time for the timezone)
        let date = date_object.getFullYear() +'-'+ ("0" + (date_object.getMonth() + 1)).slice(-2) +'-'+ ("0" + date_object.getDate()).slice(-2);

        // set time (cannot use iso because it changes the time for the timezone)
        let time = ("0" + date_object.getHours()).slice(-2) +':'+ ("0" + date_object.getMinutes()).slice(-2) +':'+ ("0" + date_object.getSeconds()).slice(-2);

        // combine
        let value = date +' '+ time;

        return value;
    }

    /**
     * Reset the form fields.
     */
    resetFormdata() {

        //
        for (let field in this.originalFormData) {
            this.formData[field] = this.originalFormData[field];
        }
        this.vueErrors.clear();
    }

    /**
     * still used?
     */
    isChanged() {
        return JSON.stringify(this.originalFormData) !== JSON.stringify(this.formData)
    }

    /**
     * if is busy
     */
    isBusy(identifier = null) {

        // no identifier set
        if (!identifier) {
            return this.busy.length ? true : false;
        }

        // identifier set
        return this.busy.includes(identifier);
    }

    /**
     * used on the submit button
     */
    isSaveAvailable() {
        return !this.isBusy() && this.isChanged() && !this.vueErrors.any();
        // !$vm0.vueForm.isBusy() && $vm0.vueForm.isChanged() && !$vm0.vueForm.vueErrors.any();
    }

    /**
     * used on the submit button
     */
    isResetAvailable() {
        return !this.isBusy() && this.isChanged();
        // !$vm0.vueForm.isBusy() && $vm0.vueForm.isChanged() && !$vm0.vueForm.vueErrors.any();
    }

    /**
     * Update current data not the original
     * Data is data not structure
     */
    updateData(data) {

        // check for undefined
        if (typeof data === 'undefined') {
            return;
        }
        // check for null
        if (data === null) {
            return;
        }

        // fill in all data based on original data
        for (let field in this.originalFormData) {

            // check if the key is set in the array
            if (field in data) {
                this.formData[field] = data[field];
            }
        }
    }

    /**
     * This function is special for submit
     * Doenst do anything if there is no data set
     */
    updateDataForSubmit(data) {

        // check for undefined
        if (typeof data === 'undefined') {
            return;
        }
        // check for null
        if (data === null) {
            return;
        }

        // fill the form data
        this.updateData(data);

        // set also the original
        this.setCurrentDataAsOriginal();
    }

    /**
     * Fill current data
     */
    setCurrentDataAsOriginal() {
        this.originalFormData = {...this.formData};
    }

    /**
     * Fill current data and original data
     * Data is data not strcuture
     */
    initData(data) {

        // check for undefined
        if (typeof data === 'undefined') {
            return;
        }
        // check for null
        if (data === null) {
            return;
        }

        // init new object
        let new_formData = {};
        let new_originalFormData = {};

        // keep current fields
        for (let field in this.originalFormData) {
            new_formData[field] = data[field];
            new_originalFormData[field] = data[field];
        }

        // set to original form data
        this.formData = new_formData;
        this.originalFormData = new_originalFormData;
    }

    /**
     * Get
     * .
     * @param  {string} url
     */
    get(url) {
        return this.submit_get('get', url);
    }

    /**
     * Send a POST request to the given URL.
     * .
     * @param  {string} url
     */
    post(url) {
        return this.submit_post('post', url);
    }

    /**
     * Send a PUT request to the given URL.
     * .
     * @param  {string} url
     */
    put(url) {
        return this.submit_post('put', url);
    }

    /**
     * Send a PATCH request to the given URL.
     * .
     * @param  {string} url
     */
    patch(url) {
        // add _method
        // this is a bug in symphony, this must be send with it
        this.formData['_method'] = 'PATCH';
        this.originalFormData['_method'] = 'PATCH';

        // get promise to return
        let promise = this.submit_post('patch', url);

        // unset for next request
        delete this.formData['_method'];
        delete this.originalFormData['_method'];

        return promise;
    }

    /**
     * Send a DELETE request to the given URL.
     * .
     * @param  {string} url
     */
    delete(url) {
        return this.submit_post('delete', url);
    }

    /**
     * Submit the form.
     *
     * @param  {string} requestType
     * @param  {string} url
     */
    submit_post(requestType, url)
    {
        // reset errors if they are still there
        this.vueErrors.clear();

        // set busy
        this.busy.push(requestType +':'+ url);

        // normaly you would add request_type but this is a bug in Laravel
        let temp_type = 'post';

        // build Promise
        return new Promise((resolve, reject) => {

            // build axios
            axios[temp_type](url, this.getFormData(), {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                .then(response => {
                    // delete the element from the busy array
                    this.busy.splice(this.busy.indexOf(requestType +':'+ url),1);

                    // fill the form data
                    this.updateDataForSubmit(response.data.data);

                    resolve(response.data);
                })
                .catch(error => {
                    this.onFail(error.response.data);
                    // delete the element from the busy array
                    this.busy.splice(this.busy.indexOf(requestType +':'+ url),1);

                    reject(error);
                });
        });
    }

    /**
     * Submit the form.
     *
     * @param  {string} requestType
     * @param  {string} url
     */
    submit_get(requestType, url) {

        // reset errors if they are still there
        this.vueErrors.clear();

        // set busy
        this.busy.push(requestType +':'+ url);

        // normaly you would add request_type but this is a bug in Laravel
        let  temp_type = 'get';

        // build Promise
        return new Promise((resolve, reject) => {

            // build axios
            axios[temp_type](url)
                .then(response => {
                    // delete the element from the busy array
                    this.busy.splice(this.busy.indexOf(requestType +':'+ url),1);

                    // fill the form data
                    this.updateDataForSubmit(response.data.data);

                    resolve(response.data);
                })
                .catch(error => {
                    this.onFail(error.response.data);
                    // delete the element from the busy array
                    this.busy.splice(this.busy.indexOf(requestType +':'+ url),1);

                    reject(error);
                });
        });
    }

    /**
     * Handle a failed form submission.
     *
     * @param  {object} errors
     */
    onFail(errors) {
        this.vueErrors.record(errors.errors);
        this.vueErrors.recordGlobalMessage(errors.message);
    }
}
