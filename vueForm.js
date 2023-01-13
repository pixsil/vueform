// version 35 Fixed error response for faulty url
// version 34 Performance update don't, load back new data by redirect
// version 33.1 Changed function name
// version 33 Added redirect = false option
// version 32 Added setting parameter to init
// version 31 Added console warn by no valid url
// version 30 Added nice throttle error
// version 29 Reject was commented out, this is needed for a catch on the vueForm object
// version 28 Made global setting object
// version 27 Fixed reference deep errors
// version 26 Added request header option (for sendCredentials option)
// version 25 (added way to handle file, added debugger, removed hard error)

window.VueForm = class VueForm {
    /**
     * Create a new Form instance.
     *
     * @param formData
     */
    constructor(formData = {}, settings = {}) {
        this.sendJsonFormData = false;
        // set global settings
        if (window.vueFormSettings?.sendJsonFormData) {
            this.sendJsonFormData = window.vueFormSettings.sendJsonFormData;
        }
        // set plugin settings
        if (settings.sendJsonFormData) {
            this.sendJsonFormData = settings.sendJsonFormData;
        }
        this.doNotSendEnptyValues = true;
        this.originalJsonData = JSON.stringify(formData);
        this.originalFormData = JSON.parse(this.originalJsonData);
        this.formData = formData;
        this.vueErrors = new VueErrors(formData);
        this.busy = [];
        this.isBusyStatus = false;
        this.axiosRequestConfig = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };
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
            formData = this.formDataToJson();

        } else {

            // we have to rewrite formData to handle null and Date objects
            formData = this.createFormDataObject();
        }

        return formData;
    }

    /*
     * parse form data
     */
    formDataToJson() {

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

    /*
     * create the formData object
     */
    createFormDataObject() {

        // init object
        let formData = new FormData()

        // gather info
        for (let property in this.originalFormData) {

            // if null dont sent
            if (this.doNotSendEnptyValues === true && this.formData[property] === null) {
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

                // add to form
                formData.append(property, value);

                // if array
            } else if (Array.isArray(this.formData[property])) {

                //
                for (var i = 0; i < this.formData[property].length; i++) {

                    // array gets normally as csv into formData
                    // this breaks by adding your own csv
                    // this functions sends it al single values that php reads as array
                    // add for each array
                    formData.append(property +'[]', this.formData[property][i]);
                }

                // if the whole array is empty add empty string
                if (this.formData[property].length === 0 && this.doNotSendEnptyValues === false) {
                    formData.append(property, '');
                }

                // if is a file
            } else if (this.formData[property] instanceof File) {

                // set
                name = this.formData[property].name;
                value = this.formData[property];

                // add to form
                formData.append(property, value, name);

                // if object
            } else if (typeof this.formData[property] === 'object' && this.formData[property] !== null) {

                //
                for (var key in this.formData[property]) {
                    formData.append(property +'['+ key +']', this.formData[property][key]);
                }

                // if already string
            } else if (this.formData[property] instanceof Date) {

                //
                value = this.parseDateObject(this.formData[property]);

                // add to form
                formData.append(property, value);

                // if the value is null dont send the text null but empty
            } else if (this.formData[property] === null) {

                // add to form
                formData.append(property, '');

                // if already string
            } else {

                // set
                value = this.formData[property];

                // add to form
                formData.append(property, value);
            }
        }

        return formData;
    }

    /*
     * parse data object
     */
    debugFormData(formData) {
        // Display the key/value pairs
        for (var pair of formData.entries()) {
            //console.log(pair[0]+ ': ' + pair[1]);
        }
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
        this.formData = JSON.parse(this.originalJsonData);

        // for (let field in this.originalFormData) {
        //     this.formData[field] = this.originalFormData[field];
        // }
        this.vueErrors.clear();
    }

    /**
     * still used?
     */
    isChanged() {
        return this.originalJsonData !== JSON.stringify(this.formData)
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
     * Update busy
     */
    addBusyUrl(url) {
        this.busy.push(url);

        this.isBusyStatus = this.isBusy();
    }

    /**
     * Update busy
     */
    removeBusyUrl(url) {
        this.busy.splice(this.busy.indexOf(url),1);

        this.isBusyStatus = this.isBusy();
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
     * Doen not do anything if there is no data set
     * Does not change structure only data
     */
    updateDataAndOriginalData(data) {

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

    // deprecated
    updateDataForSubmit(data) {
        this.updateDataAndOriginalData(data)
    }

    checkForRedirect(redirect) {

        // check for undefined
        if (typeof redirect === 'undefined') {
            return;
        }
        // check for null
        if (redirect === null) {
            return;
        }
        // check for false
        if (redirect === false) {
            return;
        }

        window.location.href = redirect;

        return true;
    }

    /**
     * Fill current data
     */
    setCurrentDataAsOriginal() {
        this.originalJsonData = JSON.stringify(this.formData);
        this.originalFormData = JSON.parse(this.originalJsonData);
    }

    /**
     * https://axios-http.com/docs/req_config
     */
    getAxiosRequestConfig() {
        return this.axiosRequestConfig;
    }

    addAxiosRequestConfig(config) {
        this.axiosRequestConfig = Object.assign(this.axiosRequestConfig, config);
    }

    replaceAxiosRequestConfig(config) {
        this.axiosRequestConfig = config;
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
     * Use a general function
     */
    submit(method, url) {
        switch(method) {
            case 'get':
                return this.get(url);
                break;
            case 'post':
                return this.post(url);
                break;
            case 'put':
                return this.put(url);
                break;
            case 'patch':
                return this.patch(url);
                break;
            case 'delete':
                return this.delete(url);
                break;
        }
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
        // add _method
        // this is a bug in symphony, this must be send with it
        this.formData['_method'] = 'DELETE';
        this.originalFormData['_method'] = 'DELETE';

        // get promise to return
        let promise = this.submit_post('delete', url);

        // unset for next request
        delete this.formData['_method'];
        delete this.originalFormData['_method'];

        return promise;
    }

    /**
     * Submit the form.
     *
     * @param  {string} requestType
     * @param  {string} url
     */
    submit_post(requestType, url)
    {
        if (!url) {
            console.error('No valid url in vueForm (POST)')
        }

        // reset errors if they are still there
        this.vueErrors.clear();

        // set busy
        this.addBusyUrl(requestType +':'+ url)

        // normaly you would add request_type but this is a bug in Laravel
        let temp_type = 'post';

        // build Promise
        return new Promise((resolve, reject) => {

            // build axios
            axios[temp_type](url, this.getFormData(), this.getAxiosRequestConfig())
                .then(response => {
                    // delete the element from the busy array
                    this.removeBusyUrl(requestType +':'+ url)

                    // check for redirect
                    if (!this.checkForRedirect(response.data.redirect)) {

                        // if no redirect go on

                        // fill the form data
                        this.updateDataAndOriginalData(response.data.data);

                        resolve(response.data);
                    }
                })
                .catch(error => {
                    if (error?.response) {
                        this.onFail(error.response.data, error.response.status);
                    }
                    // delete the element from the busy array
                    this.removeBusyUrl(requestType +':'+ url)

                    // this is needed to use catch on the vueForm object
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

        if (!url) {
            console.error('No valid url in vueForm (GET)')
        }

        // reset errors if they are still there
        this.vueErrors.clear();

        // set busy
        this.addBusyUrl(requestType +':'+ url)

        // normaly you would add request_type but this is a bug in Laravel
        let  temp_type = 'get';

        // build Promise
        return new Promise((resolve, reject) => {

            // build axios
            axios[temp_type](url, this.getAxiosRequestConfig())
                .then(response => {
                    // delete the element from the busy array
                    this.removeBusyUrl(requestType +':'+ url)

                    // check for redirect
                    if (!this.checkForRedirect(response.data.redirect)) {

                        // if no redirect go on

                        // fill the form data
                        this.updateDataAndOriginalData(response.data.data);

                        resolve(response.data);
                    }
                })
                .catch(error => {
                    if (error?.response) {
                        this.onFail(error.response.data, error.response.status);
                    }
                    // delete the element from the busy array
                    this.removeBusyUrl(requestType +':'+ url)

                    // this is needed to use catch on the vueForm object
                    reject(error);
                });
        });
    }

    /**
     * Handle a failed form submission.
     *
     * @param  {object} errors
     */
    onFail(data, status) {
        this.vueErrors.record(data.errors);

        // by validation errors
        if (status === 422) {
            this.vueErrors.recordGlobalMessage(data.message);
            // by throttle error
        } else if (status === 429) {
            this.vueErrors.recordGlobalMessage(data.message);
            // all other errors, like server errors
        } else {
            this.vueErrors.recordGlobalMessage('An error occurred.');
            this.vueErrors.recordErrorMessage(data.message);
        }
    }
}
