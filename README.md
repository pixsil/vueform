# vueform for Laravel

## Features

* The form is made so it can handle files by default
* Send your forms easy with ajax
* No need to use old html forms
* Supports POST, PUT, DELETE, PATCH and UPDATE
* Support for sending data as object whats making sending null and bolean values possible
* Functions to make buttons or form unavailable when the form is busy or has an error
* Uses Laravel backend validation so no need to add frontend validation anymore

## Donate

Find this project useful? You can support me on Patreon

https://www.patreon.com/pixsil

## Installation

Add this to your app.js
```bash
require('./tools/vue-form/vue-form.js');
require('./tools/vue-form/vue-error.js');
```

## Usage
You can use the vueform object inside your data object in the Vue component. You need to give the object field that should be posted. Only the fields by init will be send by the post. There are several functions to change these initial fields later on.
```javascript
data() {
    return {
        vueForm: new VueForm(
            {
                'name': null,
                'age': null,
            },
        )
    }
}
```

You can send your form like this. You can also use delete, patch, put or even get (see info for get below).

```javascript
    methods: {
        submit() {
            this.vueForm.post('/register')
                .then(response => this.onSuccess())
        },
        onSuccess() {
            // do something on success
        },
    },
```

### Form

There are several functions you can use to block different parts of the form by different states. For example the function 'isSaveAvailable()' gives 'true' if the form is not doing a request, got at least one value changes and does not have unsolved validation errors.

***isSaveAvailable()***

True if:
- Not doing a request
- No validation errors
- At least one value has changes (handy if it is an edit form)

```vue
<button @click="submit()" :disabled="vueForm.isSaveAvailable()">Submit</button>
```

***isBusy()***

True if the form is doing a request. The form can handle multiple requests at once.

```vue
<div v-if="vueForm.isBusy()">Wait a second please.</div>
```

***isResetAvailable()***

This function is mostly used for on the reset button. It is the same function as 'isSaveAvailable()' only without checkin on validation errors. 

True if:
- Not doing a request
- At least one value has changes (handy if it is an edit form)

```vue
<button @click="submit()" :disabled="vueForm.isResetAvailable()">Reset</button>
```

If you also like to check if the field 

***isResetAvailable()***

This function is mostly used for on the reset button. It is the same function as 'isSaveAvailable()' only without checkin on validation errors.

True if:
- Not doing a request
- At least one value has changes (handy if it is an edit form)

```vue
<button @click="resetFormdata()" :disabled="vueForm.isResetAvailable()">Reset</button>
```

The function 'isChanged()' gives true if one of the values is different from the original values.

```vue
<div v-if="vueForm.isChanged()">Dont forget to save your changes!</div>
```

### Validation

All the fields are validated by Laravel validation. If there is an error in one of the fields it will store the error in the vueError object. You can use the folloing functions.

Check if we have errors:
```vue
vueForm.vueErrors.any()
```

Get an error:
```vue
vueForm.vueErrors.get(field)
```

Clear one or more errors
```vue
// clear one error
vueForm.vueErrors.clear(field)

// clear all erros
vueForm.vueErrors.clear()

// gives true if there are errors
vueForm.vueErrors.has()
```

### Data

By init the form saves all the form data to an array of orgiginal data to check whether the data is changed.

Whit the following functions you can change the data, the original data or both of them.

With 'updateData()' there can be updated multiple values at once. This can be handy if the data must be updateded after a request.

```vue
vueForm.updateData({
    'name': 'John',
    'age': 18,
})
```

Init data changes the original and the current data.

```vue
vueForm.initData({
    'name': 'John',
    'age': 18,
})
```

If you would like to set the current data as original, it can be done with vueForm.setCurrentDataAsOriginal();

```vue
vueForm.setCurrentDataAsOriginal();
```

The function 'resetFormdata()' resets the formdata with the original formData. It also removes all the validation errors.

```vue
<button @click="resetFormdata()" :disabled="vueForm.isResetAvailable()">Reset</button>
```

## Aditional knowlage

### Data transformation

The form automatcly filters undifined and null values. Data objects will be convert to date stings (without any timezone issues)

### Populate after request

You can automatlicly populate the form after an request by giving an data object back.

In your Laravel controller:
```php
    return [
        'data' => [
            'field' => 'Fill with this value',
        ]
    ];
```

It is also postible to use the get() function to the form to always laod a form before sending.

### Global message

If you would like to render the Laravel http message as global error message you can do something like this:

```vue
<div v-if="vueForm.vueErrors.global_message" class="alert alert-warning" role="alert">
     {{ vueForm.vueErrors.global_message }}
</div>
```

### Send a Json

When using booleans and null values you need to send the post data as Json object. This is a feature of the vueFrom class that can be activate by giving true as second initialze parameter.

```javascript
// by init
data() {
    return {
        vueForm: new VueForm(
            {
                'name': null,
                'age': null,
            },
            true, // <-----
        )
    }
}

// after init
vueForm.sendJsonFormData = true;
```

The middleware inside this repo can handle the translation bback to a normal request.

```php
\App\Http\Middleware\ParseFormData::class,
```

It is important to add this middleware above the trimStrings middleware.


### Full example
- not here yet