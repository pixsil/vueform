// version 10

window.VueErrors = class VueErrors {
    /**
     * Create a new Errors instance.
     */
    constructor(data) {
        this.fields = {};
        this.global_message = null;
        this.error_message = null;

        for (let field in data) {
            this.fields[field] = null;
        }

        this.errors = {...this.fields};
    }

    /**
     * Determine if an errors exists for the given field.
     *
     * @param {string} field
     */
    has(field) {
        return Array.isArray(this.errors[field]);
    }

    /**
     * Determine if we have any errors.
     */
    any() {
        return Object.values(this.errors).filter(value => value != null).length ? true : false;
    }

    /**
     * Retrieve the error message for a field.
     *
     * @param {string} field
     */
    get(field) {
        if (!Array.isArray(this.errors[field])) {
            return null;
        }

        return this.errors[field][0];
    }

    /**
     * Set an error
     *
     * @param {string} field
     */
    set(field, error) {

        //
        if (this.errors[field] === null) {
            this.errors[field] = [];
        }

        this.errors[field].push(error);
    }

    /**
     * Record the new errors.
     *
     * @param {object} errors
     */
    record(errors) {
        this.errors = Object.assign(this.errors, errors);
    }

    /**
     * Record the new errors.
     *
     * @param {object} errors
     */
    recordGlobalMessage(message) {
        this.global_message = message;
    }

    /**
     * Record the new errors.
     *
     * @param {object} errors
     */
    recordErrorMessage(message) {
        this.error_message = message;
    }

    /**
     * Specially for vue-bootstrap state
     */
    state(field) {
        if (Array.isArray(this.errors[field])) {
            return false;
        }

        return null;
    }

    /**
     * Clear one or all error fields.
     *
     * @param {string|null} field
     */
    clear(field) {
        if (field) {
            this.errors[field] = null;

            return;
        }

        // reset global message
        this.global_message = '';
        this.error_message = '';

        // reset errors
        this.errors = {...this.fields};
    }
}
