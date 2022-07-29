<template>
    <div>
        <!-- show an overlay on top of the diff when doing the request -->
        <div show-overlay="vueForm.isBusy()" class="loading-overlay">

            <!-- first name field -->
            <div v-if="vueForm.vueErrors.global_message && !vueForm.vueErrors.any()" class="mt-3 alert alert-warning" role="alert">
                {{ vueForm.vueErrors.global_message }}
            </div>

            <!-- first name field -->
            <label for="first_name">First name:</label><br>
            <input type="text" id="first_name" v-model="vueForm.formData.first_name"><br>
            <!-- first name error -->
            <span class="error" v-show="vueForm.vueErrors.has('first_name')">
                {{ vueForm.vueErrors.get('first_name') }}
            </span>
            
            <!-- last name field -->
            <label for="last_name">Last name:</label><br>
            <input type="text" id="last_name" vueForm.formData.first_name><br><br>
            
            <!-- if using pix-validation component easy validation error rendering -->
            <!-- see the documentation -->
            <pix-validate :vue-form="vueForm" field="last_name"></pix-validate>

            <!-- show an message if the form is changed -->
            <div v-if="vueForm.isChanged()">Dont forget to save your changes!</div>

            <!-- first name error -->
            <button @click="submit()" :disabled="!vueForm.isSaveAvailable()">Submit</button>
            <button @click="resetFormdata()" :disabled="!vueForm.isResetAvailable()">Reset</button>
            
        </div>
    </div>
</template>

<script>
export default {
    props: {
    },

    components: {
    },

    data() {
        return {
            vueForm: new VueForm({
                'name': null,
                'last_name': null,
            })
        }
    },

    methods: {
        submit() {
            this.vueForm.post('/user/edit').
                then(response => this.onSuccess())
        },
        onSuccess() {
            // reset the form back to normal
            this.vueForm.resetFormdata()
        }
    },

    mounted() {
    },
}
</script>
